// Ina Yoon fan page: Cloudflare Worker (v14).
// Runs the cheer counter and serves her live tournament line.
//
//   GET  /cheers or /api/cheers   this week's and all-time cheer counts
//   POST /cheers or /api/cheers   add a cheer (from the site's own addresses only)
//   GET  /live   or /api/live     her current line, same shape as the old data/live.json
//
// The /api/ paths are reached through the route yoonshine.com/api/* (and www), so the page can
// call them on its own address. The old /cheers path on workers.dev keeps working.
//
// Needs one binding: a D1 database with the variable name DB.
// The Worker creates its own tables the first time it runs.

// Sites allowed to send cheers. The first one is also the fallback in the CORS header.
const ALLOWED_ORIGINS = [
  "https://yoonshine.com",
  "https://www.yoonshine.com",
];
const CHEERS_PER_HOUR = 10; // per visitor

let saltCache = null;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const allowed = ALLOWED_ORIGINS.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const path = url.pathname.replace(/^\/api(?=\/)/, ""); // /api/cheers -> /cheers, /api/live -> /live
    if (path === "/") return json({ ok: true, service: "ina yoon fan page", database: Boolean(env.DB) }, 200, cors);
    if (path !== "/cheers" && path !== "/live") return json({ error: "Not found" }, 404, cors);
    if (!env.DB) return json({ error: "The D1 binding named DB is missing." }, 500, cors);

    const run = async () => {
      if (path === "/live") {
        if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, cors);
        return liveLine(env.DB, cors);
      }
      if (request.method === "GET") return json(await counts(env.DB), 200, cors);
      if (request.method === "POST") {
        if (!allowed) return json({ error: "This site is not allowed to send cheers." }, 403, cors);
        return cheer(request, env.DB, cors);
      }
      return json({ error: "Method not allowed" }, 405, cors);
    };
    try {
      return await run();
    } catch (err) {
      if (!/no such table/i.test(String(err && err.message))) return json({ error: "Something went wrong." }, 500, cors);
      await setup(env.DB); // first run: create the tables, then try once more
      try { return await run(); } catch { return json({ error: "Something went wrong." }, 500, cors); }
    }
  },
};

function json(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function setup(db) {
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS counters (k TEXT PRIMARY KEY, n INTEGER NOT NULL DEFAULT 0)"),
    db.prepare("CREATE TABLE IF NOT EXISTS limits (k TEXT PRIMARY KEY, n INTEGER NOT NULL DEFAULT 0, exp INTEGER NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS live (k TEXT PRIMARY KEY, v TEXT NOT NULL, checked INTEGER NOT NULL)"),
  ]);
}

// Week label such as "2026-W41". Weeks start Monday 06:00 Eastern time (daylight saving handled),
// so a late Sunday final round in Hawaii or on the West Coast still counts toward its own week.
const EASTERN_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" });
export function weekKey(ms) {
  const [y, m, dd] = EASTERN_DAY.format(new Date(ms - 6 * 3600000)).split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, dd));
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  const thursday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day + 3));
  const jan4 = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round((thursday - jan4) / 604800000 - 3 / 7 + ((jan4.getUTCDay() + 6) % 7) / 7);
  return `${thursday.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

async function counts(db) {
  const wk = "week:" + weekKey(Date.now());
  const { results } = await db.prepare("SELECT k, n FROM counters WHERE k IN ('total', ?)").bind(wk).all();
  const get = (k) => (results.find((r) => r.k === k) || { n: 0 }).n;
  return { week: get(wk), total: get("total") };
}

async function salt(db) {
  if (saltCache) return saltCache;
  let row = await db.prepare("SELECT v FROM meta WHERE k = 'salt'").first();
  if (!row) {
    const fresh = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
    await db.prepare("INSERT OR IGNORE INTO meta (k, v) VALUES ('salt', ?)").bind(fresh).run();
    row = await db.prepare("SELECT v FROM meta WHERE k = 'salt'").first();
  }
  saltCache = row.v;
  return saltCache;
}

// The visitor's address is never stored. Only a one-way scramble of it, which changes every hour.
async function visitorKey(db, ip, hour) {
  const data = new TextEncoder().encode(`${await salt(db)}|${ip}|${hour}`);
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
  return [...hash.slice(0, 16)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function cheer(request, db, cors) {
  const now = Date.now();
  const hour = Math.floor(now / 3600000);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const key = await visitorKey(db, ip, hour);

  const seen = await db.prepare("SELECT n FROM limits WHERE k = ?").bind(key).first();
  const used = seen ? seen.n : 0;
  if (used >= CHEERS_PER_HOUR) return json({ ...(await counts(db)), left: 0, limited: true }, 429, cors);

  const wk = "week:" + weekKey(now);
  await db.batch([
    db.prepare("INSERT INTO limits (k, n, exp) VALUES (?, 1, ?) ON CONFLICT(k) DO UPDATE SET n = n + 1").bind(key, (hour + 2) * 3600000),
    db.prepare("INSERT INTO counters (k, n) VALUES ('total', 1) ON CONFLICT(k) DO UPDATE SET n = n + 1"),
    db.prepare("INSERT INTO counters (k, n) VALUES (?, 1) ON CONFLICT(k) DO UPDATE SET n = n + 1").bind(wk),
  ]);
  if (Math.random() < 0.02) await db.prepare("DELETE FROM limits WHERE exp < ?").bind(now).run(); // tidy old rows now and then
  return json({ ...(await counts(db)), left: CHEERS_PER_HOUR - used - 1 }, 200, cors);
}

// ---------------------------------------------------------------------------------------------
// Live line. The functions from ATHLETE down to buildLive are copied unchanged from
// scripts/update-live.mjs (the GitHub score job), so both produce the same result from the same data.
// ---------------------------------------------------------------------------------------------
const ATHLETE = "5259423";
const UA = { "User-Agent": "ina-yoon-fan-page (personal, low frequency)" };
const DAY = 86400000;

async function getJson(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} for ${url}`);
  return r.json();
}
const ymd = (d) => d.toISOString().slice(0, 10);

export function pickEvents(calendar, now) {
  // ESPN end dates are the start of the final day, so allow 36 hours after.
  const items = (calendar || [])
    .map((c) => ({ id: String(c.id), name: c.label, start: new Date(c.startDate), end: new Date(c.endDate) }))
    .filter((c) => !isNaN(c.start) && !isNaN(c.end))
    .sort((a, b) => a.start - b.start);
  const current = items.find((c) => now >= c.start.getTime() - DAY && now <= c.end.getTime() + 1.5 * DAY) || null;
  const next = items.find((c) => c.start.getTime() > now && (!current || c.id !== current.id)) || null;
  return { current, next };
}

function lineOf(ev) {
  const c = ev.competitions?.[0]?.competitors?.[0] || {};
  const s = c.status || {};
  const type = s.type || {};
  const pos = s.position?.displayName;
  return {
    type, s,
    event: {
      id: String(ev.id), name: ev.name,
      start: String(ev.date || "").slice(0, 10), end: String(ev.endDate || "").slice(0, 10),
      course: ev.courses?.[0]?.name || "",
      numberOfRounds: ev.tournament?.numberOfRounds || null,
    },
    rounds: (c.linescores?.items || []).map((l) => l.value).filter((v) => typeof v === "number" && v > 0),
    total: c.score?.value ?? null,
    toPar: c.score?.displayValue ?? "",
    position: pos && pos !== "-" ? pos : (type.shortDetail || ""),
  };
}

// ESPN's athlete overview does not move during a round (seen Oct 4, 2026: still "Scheduled, thru 0"
// forty minutes after she teed off). The per-competitor "core" endpoints are live, so they win when present.
const parsePar = (d) => (d === "E" ? 0 : Number.parseInt(d, 10));
const fmtPar = (n) => (n === 0 ? "E" : n > 0 ? `+${n}` : String(n));

export function applyCore(out, core) {
  const st = core?.status;
  const items = (core?.lines?.items || []).filter((i) => typeof i.value === "number" && i.value > 0);
  if (!st || !st.type) return out;
  const state = st.type.state || out.state;
  const period = st.period ?? out.round;
  out.state = state;
  out.round = period;
  out.thru = st.thru ?? out.thru;
  if (st.teeTime) out.teeTime = new Date(st.teeTime).toISOString();
  const pos = st.position?.displayName;
  if (pos && pos !== "-") out.position = pos;
  if (items.length) {
    const pars = items.map((i) => parsePar(i.displayValue));
    if (pars.every((n) => Number.isFinite(n))) out.toPar = fmtPar(pars.reduce((a, b) => a + b, 0));
    out.total = items.reduce((a, i) => a + i.value, 0);
    const live = state === "in" ? items.find((i) => i.period === period) : null;
    out.rounds = items.filter((i) => i !== live).map((i) => i.value);
    out.today = live ? live.displayValue : "";
  }
  if (st.type.name === "STATUS_CUT") { out.statusText = "missed the cut"; out.state = "post"; }
  if (st.type.completed === true || st.type.name === "STATUS_FINISH") out.state = "post";
  return out;
}

export function buildLive(overview, picked, nowIso, core) {
  const stats = [...(overview?.recentTournaments?.[0]?.eventsStats || [])].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  const { current, next } = picked;
  const entry = current ? stats.find((e) => String(e.id) === current.id) : null;
  const shown = entry || (current ? null : stats[0]) || null;
  const out = {
    updated: nowIso, state: "none", event: null, position: "", toPar: "", total: null,
    round: null, thru: null, teeTime: null, rounds: [], statusText: "",
    next: next ? { name: next.name, start: ymd(next.start), end: ymd(next.end), startTime: next.start.toISOString() } : null,
    last: null,
  };
  // Her most recent earlier event, so the results table can show its final line.
  const prev = stats.find((e) => !shown || String(e.id) !== String(shown.id));
  if (prev) { const p = lineOf(prev); out.last = { id: p.event.id, name: p.event.name, position: p.position, toPar: p.toPar, rounds: p.rounds }; }
  if (!shown) { if (current) out.away = current.name; return out; } // not in this week's field
  const L = lineOf(shown);
  const { type, s } = L;
  out.event = L.event;
  out.state = entry ? (type.state || "pre") : "post";
  out.rounds = L.rounds; out.total = L.total; out.toPar = L.toPar; out.position = L.position;
  out.round = s.period ?? null;
  out.thru = s.thru ?? null;
  out.teeTime = s.teeTime ? new Date(s.teeTime).toISOString() : null;
  if (type.name === "STATUS_CUT") { out.statusText = "missed the cut"; out.state = "post"; }
  // A finished round reads as "pre" until the next tee time; once the event is over, call it final.
  if (entry && current && type.state !== "in" && Date.parse(nowIso) > current.end.getTime() + 1.25 * DAY) out.state = "post";
  if (type.completed === true || type.name === "STATUS_FINISH") out.state = "post";
  if (entry && core) applyCore(out, core);
  return out;
}

// How often to ask ESPN: about once a minute around her events, every 15 minutes otherwise.
// However many people have the page open, ESPN sees at most one refresh per window.
const FRESH_EVENT = 60 * 1000;
const FRESH_IDLE = 15 * 60 * 1000;

export function busyAt(line, now) {
  if (!line) return false;
  if (line.state === "in") return true;
  const ev = line.event;
  if (ev && ev.start && now >= Date.parse(ev.start) - DAY && now <= Date.parse(ev.end || ev.start) + 1.5 * DAY) return true;
  const n = line.next && (line.next.startTime || line.next.start);
  return Boolean(n && now >= Date.parse(n) - DAY && now <= Date.parse(n) + 4.5 * DAY);
}

async function fetchLine(now) {
  const nowDate = new Date(now);
  const [board, overview] = await Promise.all([
    getJson(`https://site.api.espn.com/apis/site/v2/sports/golf/lpga/scoreboard?dates=${ymd(nowDate).replaceAll("-", "")}`),
    getJson(`https://site.web.api.espn.com/apis/common/v3/sports/golf/lpga/athletes/${ATHLETE}/overview`),
  ]);
  const picked = pickEvents(board?.leagues?.[0]?.calendar, now);
  let core = null;
  if (picked.current) {
    const base = `https://sports.core.api.espn.com/v2/sports/golf/leagues/lpga/events/${picked.current.id}/competitions/${picked.current.id}/competitors/${ATHLETE}`;
    try {
      const [status, lines] = await Promise.all([getJson(`${base}/status`), getJson(`${base}/linescores`)]);
      core = { status, lines };
    } catch { /* not in this field, or core endpoints down: overview only, as the score job does */ }
  }
  return buildLive(overview, picked, nowDate.toISOString(), core);
}

async function liveLine(db, cors) {
  const now = Date.now();
  const row = await db.prepare("SELECT v, checked FROM live WHERE k = 'line'").first();
  const stored = row ? JSON.parse(row.v) : null;
  const send = (line) => json(line, 200, cors);
  if (row && now - row.checked < (busyAt(stored, now) ? FRESH_EVENT : FRESH_IDLE)) return send(stored);
  if (row) {
    // Claim this refresh so visitors arriving at the same moment do not all call ESPN.
    const claim = await db.prepare("UPDATE live SET checked = ? WHERE k = 'line' AND checked = ?").bind(now, row.checked).run();
    if (!claim.meta || !claim.meta.changes) return send(stored);
  }
  let fresh;
  try {
    fresh = await fetchLine(now);
  } catch {
    // ESPN unreachable: keep showing the last good line (and try again after the next window).
    return stored ? send(stored) : json({ error: "Live data is not available right now." }, 503, cors);
  }
  // "updated" means the score last changed, as before: keep the old line if nothing else differs.
  const strip = (o) => JSON.stringify({ ...o, updated: "" });
  const line = stored && strip(stored) === strip(fresh) ? stored : fresh;
  await db.prepare("INSERT INTO live (k, v, checked) VALUES ('line', ?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v, checked = excluded.checked")
    .bind(JSON.stringify(line), now).run();
  return send(line);
}
