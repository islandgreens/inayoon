// Ina Yoon fan page: Cloudflare Worker.
// Today it runs the cheer counter. Later it can also serve live scores and the fan map.
//
// Needs one binding: a D1 database with the variable name DB.
// The Worker creates its own tables the first time it runs.

// Sites allowed to use this Worker. Add your custom domain here when you have one.
const ALLOWED_ORIGINS = [
  "https://islandgreens.github.io",
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
    if (url.pathname === "/") return json({ ok: true, service: "ina yoon fan page", database: Boolean(env.DB) }, 200, cors);
    if (url.pathname !== "/cheers") return json({ error: "Not found" }, 404, cors);
    if (!env.DB) return json({ error: "The D1 binding named DB is missing." }, 500, cors);

    const run = async () => {
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
  ]);
}

// ISO week in UTC, for example "2026-W41". A tournament (Thursday to Sunday) always sits inside one week.
export function weekKey(ms) {
  const d = new Date(ms);
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
