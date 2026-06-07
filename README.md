# ORKXTRA 1.0

Netflix-style IPTV / OTT web player — **Live TV, Movies & Series** from your own
**MAC (Stalker)**, **Xtream Codes**, or **M3U** portals. One self-contained Node
server, **zero npm dependencies**.

## Requirements
- **Node.js 22.5 or newer** (uses the built-in `node:sqlite`). Check with `node --version`.
- A modern browser (Chrome / Edge / Brave / Firefox).

## Run it
From this folder:

```bash
node web-player/server.js --port=4173
```

…or `npm start`, or on **Windows** just double-click **`start.bat`** (macOS/Linux: `./start.sh`).

Then open: **http://127.0.0.1:4173/**

It opens in **Demo mode** — pick a profile, or add your own IPTV login
(MAC portal, Xtream, or M3U) to load your channels.

**To stop it:** double-click **`stop.bat`** (macOS/Linux: `./stop.sh`), or just press
`Ctrl+C` in the server window. The stop script only ends the ORKXTRA server, not other apps.

## Optional config (`.env`)
The app runs fine with **no config**. To enable extras, copy the template and edit it:

```bash
cp .env.example .env        # Windows:  copy .env.example .env
```

- `STRIPE_*` — only needed for the "Upgrade to Pro" checkout (instructions are in the file).
- `ORKXTRA_ADMIN_*` — seeds an admin login on first run.
- `APP_URL` — public origin (used for Stripe return URLs).

> **Never commit `.env`.** It's already in `.gitignore`. Keep secret keys out of source control.

## What's inside
```
ott-player/      the ORKXTRA app — the UI you publish        ->  served at /ott-player/
web-player/
  server.js      one file: serves everything, proxies portals, handles accounts
  vendor/        playback libraries (hls.js / mpegts.js)
.env.example     config template
start.bat / .sh  convenience launchers
```

Opening `/` redirects to `/ott-player/`. A SQLite DB and an image cache are created
automatically under `web-player/data/` on first run (gitignored).

## Notes
- **Bring your own IPTV portal/credentials** — none are bundled.
- Credentials stay local (your browser + the local SQLite DB); nothing is sent anywhere
  except your own portal.
- If you ever see a `node:sqlite` error on older Node, run with the flag:
  `node --experimental-sqlite web-player/server.js --port=4173`.
