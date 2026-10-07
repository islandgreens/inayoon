# Cloudflare Worker setup: the cheer counter

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

## 6. Switch the button on (already done in site v7)

Send Claude the Worker address, or do it yourself: open `data/content.js`, find the line `const api = "";` and put the address between the quotes, with no slash at the end. Upload the file to GitHub. The cheer button appears on the home page once the page can reach the Worker.

## Good to know

- **Only your site can send cheers.** The Worker accepts them from `https://islandgreens.github.io` only. When you get a custom domain, add it to the `ALLOWED_ORIGINS` list at the top of `worker.js` and deploy again.
- **The cap is 10 cheers per visitor per hour.** Change `CHEERS_PER_HOUR` at the top of `worker.js` to adjust it.
- **No visitor addresses are stored.** The Worker keeps only a scrambled marker that changes every hour and is deleted soon after.
- **"This week" resets every Monday** (UTC), so each tournament starts from zero. The all-time total never resets.
- **Free plan room:** the database allows 100,000 writes a day and each cheer uses three, so about 33,000 cheers a day before Cloudflare pauses it until midnight UTC. If that ever happens the button hides itself and the rest of the site is unaffected.
- **To reset the numbers,** open the `inayoon` database, select **Console** and run `DELETE FROM counters;`
- This folder is published along with the site. That is fine: it contains no passwords or keys.
