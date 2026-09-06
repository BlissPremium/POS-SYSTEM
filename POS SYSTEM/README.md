# Cleaning Co. Sales — POS (Netlify edition)

What changed from your original file: the app used to read/write everything
straight to the browser's `localStorage`, so every device had its own private
copy of the data. It now talks to a small serverless function
(`netlify/functions/data.mjs`) that stores the same data in **Netlify Blobs**
— a key/value store that ships with every Netlify site, no external database
or account needed. That means every device/browser that opens your site now
sees the same catalog, orders, expenses and brand settings. (It still keeps a
local copy in `localStorage` as an offline fallback if the network request
fails, but the server copy is now the source of truth.)

## Folder layout

```
netlify.toml               ← tells Netlify where the site and functions live
package.json                ← declares the one dependency the function needs
public/index.html           ← your app (only the storage functions changed)
netlify/functions/data.mjs  ← the serverless API the app now talks to
```

## Deploy it

Drag-and-drop deploy on netlify.com will **not** work here, because it
skips `npm install` and doesn't pick up the `netlify/functions` folder.
Use one of these instead:

**Option A — Netlify CLI (fastest for a one-off site)**
1. `npm install -g netlify-cli` (if you don't have it)
2. From this project folder: `npm install`
3. `netlify deploy --prod`
   (first run will ask you to log in and either link or create a site)

**Option B — Git-based deploy (recommended if you'll keep updating it)**
1. Push this folder to a GitHub/GitLab/Bitbucket repo.
2. In the Netlify dashboard: **Add new site → Import an existing project**,
   pick the repo.
3. Build settings: build command can be left blank, publish directory
   `public`, functions directory `netlify/functions` (netlify.toml already
   sets these, so the defaults it detects should be correct).
4. Deploy.

## Optional: lock it down with a passcode

Right now, anyone who has your site's URL can read and write the POS data
through `/api/data`, since there's no login screen. If this matters to you
(e.g. the site isn't just on a private/obscure URL), set an environment
variable in **Site settings → Environment variables**:

- `POS_SECRET` = any password you choose

Then add this one line inside both `Of` and `_l` in `index.html`'s fetch
calls: a header `"x-pos-secret": "your-password-here"`. I left this off by
default to keep the diff small — say the word and I'll wire it in for you
(ideally with an actual passcode prompt screen rather than a hardcoded
value).

## Notes / limitations

- This is a **single shared store**, not per-user accounts — it matches how
  your original app worked (one shop, one set of data), just synced across
  devices instead of trapped on one PC.
- The "Save backup file" / "Load a backup" features in Settings still work
  exactly as before — they're a good habit to keep even with server storage.
- Netlify Blobs has generous free-tier limits for data this size (orders,
  catalog, expenses as JSON) — you're very unlikely to hit them for a small
  business POS.
