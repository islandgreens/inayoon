# Cloudflare Worker setup: the cheer counter

This is already set up and running (Worker `inayoon-api`, database `inayoon`). Keep this guide for updating the code, for the commands at the bottom, or for rebuilding from scratch.

Since v14 the same Worker also serves her live tournament line at `/api/live`, through two routes on the site's own address: `yoonshine.com/api/*` and `www.yoonshine.com/api/*` (Settings, Domains & Routes, Add, Route). It asks ESPN for fresh data at most about once a minute around her events and every 15 minutes otherwise, however many people have the page open, and keeps the last good line in the database if ESPN is unavailable.

About 10 minutes, all in the Cloudflare dashboard. Nothing to install. Button and menu names follow Cloudflare's help pages as of October 2026 (https://developers.cloudflare.com/d1/get-started/); if a label has moved, look for the nearest match.

You will create two things: a small database that holds the count, and a Worker (a script Cloudflare runs for you) that the fan page talks to.

## 1. Create the database

1. In the Cloudflare dashboard, go to the **D1 SQL database** page (under Storage and Databases).
2. Select **Create Database**.
3. Name it `inayoon`. Leave the location as it is.
4. Select **Create**.

You do not need to create any tables. The Worker does that itself the first time it runs.

## 2. Create the Worker

1. Go to the **Workers & Pages** page.
2. Select **Create application**.
3. Select **Start with Hello World!**, then **Get started**.
4. Name it `inayoon-api`.
5. Select **Deploy**.

## 3. Connect the database to the Worker

1. On **Workers & Pages**, select the `inayoon-api` Worker.
2. Open the **Bindings** tab and select **Add binding**.
3. Select **D1 database**, then **Add binding**.
4. In **Variable name**, type `DB` (capital letters, exactly).
5. Choose the `inayoon` database from the list.
6. Select **Add binding**.

## 4. Put in the code

1. Still on the `inayoon-api` Worker, select the **Edit code** icon (it looks like `</>`).
2. Delete everything in `worker.js` and paste in the whole contents of the `worker.js` file that sits next to this guide.
3. Select **Deploy** (or **Save**; if you only see Save, open the **Deployments** tab afterwards, pick the newest version and select **Deploy version**).

## 5. Check it works

Your Worker's address is shown on its page and looks like `https://inayoon-api.SOMETHING.workers.dev`.

1. Open that address in a browser. You should see: `{"ok":true,"service":"ina yoon fan page","database":true}`
   - If it says `"database":false`, step 3 was missed or the variable name is not exactly `DB`.
2. Add `/cheers` to the end of the address. You should see: `{"week":0,"total":0}`
3. After adding the routes: `https://yoonshine.com/api/cheers` shows the same counts, and `https://yoonshine.com/api/live` shows her line (it starts with `{"updated":`).

## 6. Switch the button on (already done in site v7)

The Worker address goes in `data/content.js`, on the line `const api = "...";`, with no slash at the end. The cheer bar appears on the home page once the page can reach the Worker.

## Good to know

- **Only your site can send cheers.** The Worker accepts them from `https://yoonshine.com` and `https://www.yoonshine.com` only (the `ALLOWED_ORIGINS` list at the top of `worker.js`). Anyone can read the counts.
- **The cap is 10 cheers per visitor per hour,** counted in clock hours (UTC, which lines up with Eastern hours). People on one internet connection share one allowance. When a visitor runs out, the page greys out the button, shows "Voice gone!" and says when it reopens. Change `CHEERS_PER_HOUR` at the top of `worker.js` to adjust it.
- **No visitor addresses are stored.** The Worker keeps only a scrambled marker that changes every hour and is deleted soon after.
- **"This week" resets every Monday at 6 AM Eastern** (daylight saving handled), so each tournament starts from zero and a late Sunday finish on the West Coast or in Hawaii still counts toward its own week. The all-time total never resets.
- **To update the code later,** repeat step 4 with the new `worker.js`. The database and binding stay as they are, and the counts carry over.
- **Free plan room:** the database allows 100,000 writes a day and each cheer uses three, so about 33,000 cheers a day before Cloudflare pauses it until midnight UTC. If that ever happens the button hides itself and the rest of the site is unaffected.
- **To reset the numbers,** open the `inayoon` database, select **Console** and run `DELETE FROM counters;`
- **The live line** is kept in a table called `live`. To force a fresh read from ESPN on the next visit, run `DELETE FROM live;` in the Console.
- **To clear everyone's hourly limit** (for example after testing), run `DELETE FROM limits;` in the same Console.
- This folder is published along with the site. That is fine: it contains no passwords or keys.
