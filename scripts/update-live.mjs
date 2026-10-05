// Refreshes data/live.json with Ina Yoon's line from the current LPGA event.
// Run by .github/workflows/live-score.yml. Needs Node 20 or newer (the workflow uses 24), no packages.
//
// Data comes from ESPN's JSON endpoints. They are unofficial and undocumented,
// so every step is defensive: on any failure the existing file is left alone.
import { readFile, writeFile } from "node:fs/promises";

const ATHLETE = "5259423";
const OUT = new URL("../data/live.json", import.meta.url);
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
    next: next ? { name: next.name, start: ymd(next.start), end: ymd(next.end) } : null,
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

async function main() {
  const now = new Date();
  const board = await getJson(`https://site.api.espn.com/apis/site/v2/sports/golf/lpga/scoreboard?dates=${ymd(now).replaceAll("-", "")}`);
  const picked = pickEvents(board?.leagues?.[0]?.calendar, now.getTime());
  const overview = await getJson(`https://site.web.api.espn.com/apis/common/v3/sports/golf/lpga/athletes/${ATHLETE}/overview`);
  let core = null;
  if (picked.current) {
    const base = `https://sports.core.api.espn.com/v2/sports/golf/leagues/lpga/events/${picked.current.id}/competitions/${picked.current.id}/competitors/${ATHLETE}`;
    try { core = { status: await getJson(`${base}/status`), lines: await getJson(`${base}/linescores`) }; }
    catch (e) { console.log("Core endpoints unavailable, using overview only:", e.message); }
  }
  const live = buildLive(overview, picked, now.toISOString(), core);

  let old = null;
  try { old = JSON.parse(await readFile(OUT, "utf8")); } catch {}
  const strip = (o) => JSON.stringify({ ...o, updated: "" });
  if (old && strip(old) === strip(live)) { console.log("No change."); return; }
  await writeFile(OUT, JSON.stringify(live, null, 2) + "\n");
  console.log("Updated:", live.event?.name || "no event", live.position, live.toPar, live.state);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())) {
  main().catch((e) => { console.error("Live update skipped:", e.message); process.exit(0); });
}
