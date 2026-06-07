# ORKXTRA web — improved build

This folder is a hardened, more reliable copy of the `ott-player` web app + its `web-player/server.js`
backend. Run it exactly like the original:

```powershell
node web-player/server.js --port=4173
# then open http://127.0.0.1:4173/ott-player/
```

No `npm install` needed (Node 22 built-ins only). All changes are in `web-player/server.js`,
`ott-player/app.js`, `ott-player/index.html`, `ott-player/styles.css`, and `.env`.

## Security (server.js + .env)
- **SSRF guard** on `/api/fetch`, `/api/image`, `/proxy`: every URL is DNS-resolved and blocked if it
  hits loopback / link-local / RFC1918 / CGNAT / reserved ranges, and **re-validated on each redirect hop**
  (`safeFetch`, `assertPublicUrl`, `isPrivateAddr`). Set `ALLOW_PRIVATE_REMOTE=1` only for trusted LAN portals.
- **Request body cap** (`MAX_BODY_BYTES`, 1 MB default) — stops trivial OOM DoS.
- **Per-IP rate limiting** on `/api/*` and `/proxy` (`RATE_LIMIT_MAX`/min) + **concurrent-stream cap** on `/proxy`.
- **Upstream timeouts** on all portal/proxy fetches (`FETCH_TIMEOUT_MS`).
- **CORS tightened**: removed wildcard `Access-Control-Allow-Origin: *`; same-origin by default, optional
  allowlist via `ALLOWED_ORIGINS`. `X-Content-Type-Options: nosniff` on JSON.
- **Session cookie** `Secure` set on every non-localhost host (no longer trusts spoofable `x-forwarded-proto`).
- **Secrets removed** from `.env` (placeholders). Rotate any real keys you add.
- **Crash hardening**: every async route is awaited so a route rejection can't take down the process,
  plus `unhandledRejection`/`uncaughtException` safety nets.

## Reliability (server.js)
- **Stalker token cache** (`stalkerAuth`) per (endpoint, mac) with TTL + **refresh-on-401** (`runWithAuth`) —
  no more re-handshaking on every call; recovers from mid-session token expiry.
- **Transient retry/backoff** in `stalkerRequest` (network errors / 5xx).
- **Endpoint-fallback fix**: a wrong legacy endpoint's auth-shaped error no longer aborts login;
  401 is only returned if every endpoint genuinely rejects auth.
- **Resilient pagination**: a single failed page returns partial results (`truncated:true`) instead of
  dropping the whole category.
- **Logo disk cache** for `/api/image` (`IMAGE_CACHE_TTL_MS`, 7 days) — avoids re-hitting flaky portals.
- **EPG fail-vs-empty**: real failures return `ok:false`/502; genuinely-empty guides return `ok:true,empty:true`; short cache.
- **Friendly error messages** (`friendlyPortalError`) instead of raw `Portal HTTP 5xx` / HTML fragments.

## Player & client (app.js / index.html / styles.css)
- **Self-healing playback**: on stall/decode error, MAC channels **re-resolve a fresh `create_link`**
  (tokens expire) via `forceRelink`; escalates to an **alternate transport** (HLS↔mpegts) then native;
  retry budget re-arms after sustained progress; persistent "Reconnecting n/4" status.
- **Keyboard shortcuts**: Space/K play-pause, ←/→ seek, ↑/↓ volume, F fullscreen, M mute, P PiP,
  Z aspect, N/B next-prev, `/` focus search.
- **Aspect-ratio toggle** (fit / fill / stretch), persisted.
- **Format detection** extended (mp4/m4v/webm/mkv → native; flv → mpegts.js).
- **Resume playback** for VOD (stores position, offers resume), **next-episode autoplay** for series.
- **State schema versioning** + migration ladder (no more silent data loss on shape changes).
- **Parental PIN** lock for adult-flagged content + **Settings** dialog + **Export/Import backup** (JSON).
- **A11y**: `aria-current` on active nav; keyboard-reachable controls kept visible on mobile.

## Tested with `A0:BB:3E:DC:5E:99 @ http://me.mdmfista.com:80/c/`
- Server: **27,188 items** (26,433 live / 496 movies / 259 series, 1,412 groups) loaded; cached response 0.21 s;
  SSRF blocks verified (169.254.169.254, loopback, RFC1918 → 400); body cap → 413; token cache works.
- Client: real live playback verified (live football on `CA| TSN3 FHD`), hotkeys, aspect, settings,
  schema, persistence.

## Known follow-ups (from the review, not yet done)
- Client-side bulk import of very large catalogs (27K+) is heavy in-browser — needs **chunked IndexedDB
  writes + list virtualization + search indexing** (the biggest remaining scale item).
- Full **EPG guide grid**, **subtitles pipeline**, **TV D-pad** navigation, **server-side profile sync**,
  **DVR/recording**, **i18n/RTL**, and a module/build/test toolchain.

## Premium UI — Phase 1 + hero + profile page (this pass)
- **Design-token system** in `:root`: tonal surface ladder (`--surface-1..4`), 6-rung elevation ladder
  (`--elev-1..5` + `--elev-glow` + `--glass-edge`), 4/8px spacing scale, 1.2 modular type scale,
  radii, weights, motion durations + easing curves, safe-area insets. Old token names kept for back-compat.
- **Self-hosted Inter** (`fonts/inter-var.woff2`, preloaded, `@font-face`) — previously fell back to Segoe UI.
- **Global polish**: `-webkit-font-smoothing`, `::selection`, slim custom scrollbars, tactile hover/active
  (`--press`) on all action buttons, one shape-aware focus halo, favicon (SVG) + theme-color + viewport-fit.
- **Cinematic sliding hero** (`#homeHero`): auto-rotating spotlight of movies & series at the top of Home.
  Uses real portal cover art when present, else a generated palette backdrop; layered scrims; Play / + My Stuff;
  dot indicators + arrows + swipe; 6.5s autoplay with pause-on-hover/focus and `prefers-reduced-motion` respect.
  Lazily loads one VOD category if none are loaded yet so the banner is never empty.
- **Netflix-style profile page**: rounded-square avatars with bold initials + per-profile gradient,
  spring hover + brightness, blue "current" ring, dashed "+" Add tile, staggered entrance animation,
  and a Manage/edit mode that dims avatars and reveals a glassy Remove affordance.
- Verified live: hero spotlighted real movies (e.g. "Frankenstein 4K (2025)") with rotation; Inter loaded;
  profile page + manage mode render correctly; no console errors.

Remaining premium items (from the 9-dimension review, not yet done): migrate existing components onto the
elevation/spacing/radii tokens, skeleton-shimmer loaders, custom player progress bar + semantic status chip,
2:3 portrait VOD posters + grain artwork, Lucide icon set, mobile bottom tab bar, TV 10-foot tier.

## Phase 2 premium pass + Netflix billboard (this pass)
- **Phase 2 implemented:** depth/elevation + glass on raised surfaces, tabular numerals, staggered row reveal,
  animated dialogs; shimmer **skeleton loaders**; **custom player seek bar** (gradient fill + buffered underlay +
  grow-on-hover/touch/focus thumb) + **semantic status chip** (LIVE pulse / buffering spinner / issue); **2:3
  portrait VOD posters** + landscape live + SVG-grain generated artwork; **mobile bottom tab bar** + **TV 1600px+ tier**.
- **Netflix-style full-bleed billboard hero:** the home hero is now edge-to-edge and ~84vh tall, pulled up
  behind a **transparent header that turns solid on scroll** (`body.hero-mode` + `.is-scrolled`); bottom-left
  title + 3-line **synopsis** + **Play / More Info / My Stuff** buttons; right-edge **quality badge**; channel
  **logo chip + red "Live TV" kicker** on live slides; **pause control** + dot indicators; the first row peeks below.
- **Live included** in the spotlight (balanced movie/live/series interleave; live pulled from IndexedDB).
- **Adversarial-review fixes applied:** hero autoplay no longer runs during playback (H2); seek thumb usable on
  touch+keyboard (H1); skeletons now portrait (M1) with correct intrinsic size (M2); dots use `aria-current` not
  broken `role=tab` (M5); hero pause control for WCAG 2.2.2 (M6); TV focus ring broadened, dead `.tv-focus`
  removed (M7); `buildHeroSpotlight` no longer re-scans IndexedDB on every render (M8); category tiles get
  `data-kind` (M3); duplicate focus outline removed (M4).
- Verified live (1280px + mobile): billboard renders for movie (real art) and live (generated) slides, header
  transparent→solid on scroll, portrait poster wall, mobile tab bar, no console errors.
