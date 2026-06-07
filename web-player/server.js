#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const crypto = require("node:crypto");
const net = require("node:net");
const dnsp = require("node:dns/promises");
const { Readable } = require("node:stream");
const { URL } = require("node:url");
const { DatabaseSync } = require("node:sqlite");

const root = path.resolve(__dirname, "..");
loadEnvFile(path.join(root, ".env"));
const portArg = process.argv.find((arg) => arg.startsWith("--port="));
const port = Number(portArg?.split("=")[1] || process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const dataDir = path.resolve(process.env.ORKXTRA_DATA_DIR || path.join(__dirname, "data"));
fs.mkdirSync(dataDir, { recursive: true });
const accountDb = openAccountDatabase(path.resolve(process.env.ORKXTRA_DB_PATH || path.join(dataDir, "orkxtra.sqlite")));
bootstrapAdminAccount(accountDb);
const SESSION_COOKIE = "orkxtra_session";
const SESSION_TTL_MS = Math.max(60 * 60 * 1000, Number(process.env.SESSION_TTL_MS || 30 * 24 * 60 * 60 * 1000));
const STRIPE_API_BASE = "https://api.stripe.com/v1";
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "";
const portalVersionCache = new Map();
const macResponseCache = new Map();
const CAPY_API_BASE = "https://capy.ai/api/v1";
const CAPY_MODEL = process.env.CAPY_MODEL || "gpt-5.4";
const CAPY_WAIT_MS = Math.max(5000, Number(process.env.CAPY_WAIT_MS || 45000));
const MAX_PORTAL_CATEGORY_PAGES = Math.max(1, Number(process.env.MAX_PORTAL_CATEGORY_PAGES || 750));
const MAC_CHANNEL_CACHE_MS = Math.max(0, Number(process.env.MAC_CHANNEL_CACHE_MS || 5 * 60 * 1000));
const MAC_CATEGORY_CACHE_MS = Math.max(0, Number(process.env.MAC_CATEGORY_CACHE_MS || 10 * 60 * 1000));
const MAC_SERIES_CACHE_MS = Math.max(0, Number(process.env.MAC_SERIES_CACHE_MS || 10 * 60 * 1000));
const MAC_STREAM_CACHE_MS = Math.max(0, Number(process.env.MAC_STREAM_CACHE_MS || 30 * 1000));
const ADULT_LABEL_PATTERN = /(?:\b(?:adult|adults|xxx|18\s*plus|18\s*only|erotic|erotica|porn|porno|playboy|brazzers|hustler|penthouse|redlight|naughty|onlyfans|babes|sexy|nude|nudity)\b|\b18\s*\+|\[adult\])/i;
const ADULT_FALSE_POSITIVE_PATTERN = /\badult\s+swim\b/i;
let capyProjectCache = null;

// ---------------------------------------------------------------------------
// Hardening & reliability additions (ORKXTRA improved build)
// ---------------------------------------------------------------------------
const MAX_BODY_BYTES = Math.max(64 * 1024, Number(process.env.MAX_BODY_BYTES || 1024 * 1024));
const FETCH_TIMEOUT_MS = Math.max(3000, Number(process.env.FETCH_TIMEOUT_MS || 12000));
// Set ALLOW_PRIVATE_REMOTE=1 only for trusted LAN portals (disables SSRF host blocking).
const ALLOW_PRIVATE_REMOTE = /^(1|true|yes)$/i.test(process.env.ALLOW_PRIVATE_REMOTE || "");
const ALLOWED_ORIGINS = String(process.env.ALLOWED_ORIGINS || "")
  .split(",").map((s) => s.trim().replace(/\/+$/, "")).filter(Boolean);
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = Math.max(60, Number(process.env.RATE_LIMIT_MAX || 900));
const PROXY_MAX_CONCURRENT = Math.max(2, Number(process.env.PROXY_MAX_CONCURRENT || 12));
const STALKER_TOKEN_TTL_MS = Math.max(15000, Number(process.env.STALKER_TOKEN_TTL_MS || 50000));
const IMAGE_CACHE_TTL_MS = Math.max(60000, Number(process.env.IMAGE_CACHE_TTL_MS || 7 * 24 * 60 * 60 * 1000));
const EPG_CACHE_MS = Math.max(0, Number(process.env.EPG_CACHE_MS || 60 * 1000));
const rateBuckets = new Map();
const stalkerTokenCache = new Map();
let proxyActive = 0;
const imageCacheDir = path.join(dataDir, "imgcache");
try { fs.mkdirSync(imageCacheDir, { recursive: true }); } catch (_) { /* best effort */ }

function clientIp(req) {
  const fwd = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return fwd || req.socket?.remoteAddress || "unknown";
}

function isLocalHostReq(req) {
  const host = String(req.headers.host || "").split(":")[0].toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
}

function rateLimited(req) {
  const ip = clientIp(req);
  const now = Date.now();
  let bucket = rateBuckets.get(ip);
  if (!bucket || bucket.reset <= now) { bucket = { count: 0, reset: now + RATE_LIMIT_WINDOW_MS }; rateBuckets.set(ip, bucket); }
  bucket.count += 1;
  if (rateBuckets.size > 5000) { for (const [k, v] of rateBuckets) if (v.reset <= now) rateBuckets.delete(k); }
  return bucket.count > RATE_LIMIT_MAX;
}

function corsOrigin(req) {
  const origin = String(req.headers.origin || "").replace(/\/+$/, "");
  if (!origin) return "";
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (process.env.APP_URL && origin === process.env.APP_URL.replace(/\/+$/, "")) return origin;
  if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(origin)) return origin;
  return "";
}

function corsHeaders(req) {
  const allow = corsOrigin(req);
  return allow ? { "Access-Control-Allow-Origin": allow, "Vary": "Origin" } : {};
}

// Block requests that resolve to loopback / link-local / private / reserved ranges (SSRF).
function isPrivateAddr(ip) {
  if (!ip) return true;
  if (net.isIPv4(ip)) {
    const p = ip.split(".").map(Number);
    if (p[0] === 10 || p[0] === 127 || p[0] === 0) return true;
    if (p[0] === 169 && p[1] === 254) return true;            // link-local
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true; // private
    if (p[0] === 192 && p[1] === 168) return true;             // private
    if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return true; // CGNAT
    if (p[0] >= 224) return true;                               // multicast/reserved
    return false;
  }
  const v = String(ip).toLowerCase().replace(/^\[|\]$/g, "");
  if (v === "::1" || v === "::") return true;
  if (v.startsWith("fe80") || v.startsWith("fc") || v.startsWith("fd")) return true; // link-local + ULA
  if (v.startsWith("::ffff:")) return isPrivateAddr(v.slice(7));                      // IPv4-mapped
  return false;
}

async function assertPublicUrl(target) {
  if (!isSafeRemote(target)) { const e = new Error("Invalid remote URL"); e.statusCode = 400; throw e; }
  if (ALLOW_PRIVATE_REMOTE) return new URL(target);
  const parsed = new URL(target);
  const host = parsed.hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host)) {
    if (isPrivateAddr(host)) { const e = new Error("Blocked non-public address"); e.statusCode = 400; throw e; }
    return parsed;
  }
  if (/^localhost$|\.localhost$|\.local$|\.internal$|\.lan$/i.test(host)) { const e = new Error("Blocked internal host"); e.statusCode = 400; throw e; }
  let addrs = [];
  try { addrs = await dnsp.lookup(host, { all: true }); } catch (_) { const e = new Error("DNS resolution failed"); e.statusCode = 502; throw e; }
  if (!addrs.length || addrs.some((a) => isPrivateAddr(a.address))) { const e = new Error("Blocked non-public address"); e.statusCode = 400; throw e; }
  return parsed;
}

// SSRF-safe fetch: validates every hop (manual redirects) and applies a timeout.
async function safeFetch(target, options = {}) {
  let current = String(target);
  const maxHops = 5;
  for (let hop = 0; hop <= maxHops; hop += 1) {
    await assertPublicUrl(current);
    const controller = new AbortController();
    const external = options.signal;
    if (external) {
      if (external.aborted) controller.abort();
      else external.addEventListener("abort", () => controller.abort(), { once: true });
    }
    const timer = setTimeout(() => controller.abort(), options.timeoutMs || FETCH_TIMEOUT_MS);
    let response;
    try {
      response = await fetch(current, { ...options, redirect: "manual", signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
      current = new URL(response.headers.get("location"), current).href;
      continue;
    }
    return response;
  }
  const e = new Error("Too many redirects");
  e.statusCode = 502;
  throw e;
}

// Cache the Stalker handshake+profile token per (endpoint, mac) and refresh on auth failure.
async function stalkerAuth(endpoint, client, force = false) {
  const key = `${endpoint}${client.mac}`;
  const hit = stalkerTokenCache.get(key);
  if (!force && hit && hit.expires > Date.now()) return hit.token;
  const token = await stalkerHandshake(endpoint, client);
  await stalkerProfile(endpoint, client, token);
  stalkerTokenCache.set(key, { token, expires: Date.now() + STALKER_TOKEN_TTL_MS });
  return token;
}

async function runWithAuth(endpoint, client, fn) {
  let token = await stalkerAuth(endpoint, client);
  try {
    return await fn(token);
  } catch (error) {
    const msg = String(error?.message || "");
    if (!isPortalAuthError(error) && !/HTTP 40[13]/.test(msg)) throw error;
    stalkerTokenCache.delete(`${endpoint}${client.mac}`);
    token = await stalkerAuth(endpoint, client, true);
    return await fn(token);
  }
}

// Map raw portal/network errors to short, actionable messages (raw logged server-side).
function friendlyPortalError(error) {
  const msg = String(error?.message || "");
  if (!msg) return "The IPTV portal could not be reached.";
  if (/blocked|disabled|unauthorized|not valid|device auto add|old firmware/i.test(msg)) {
    return "This portal rejected the MAC address — the account may be blocked, expired, or not authorized for this device.";
  }
  if (/handshake/i.test(msg)) return "The portal did not complete login. Double-check the portal URL and MAC address.";
  if (/HTTP 4\d\d/.test(msg)) return "The portal refused the request. Verify the portal URL and that the account is active.";
  if (/HTTP 5\d\d/.test(msg)) return "The portal is having server problems right now. Please try again shortly.";
  if (/timeout|aborted|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|fetch failed|network|DNS/i.test(msg)) {
    return "Could not reach the portal (network or timeout). Check the URL and your connection.";
  }
  if (/empty response|returned:|unexpected/i.test(msg)) return "The portal returned an unexpected response.";
  if (/Blocked (non-public|internal)/i.test(msg)) return "That address is not allowed.";
  return msg;
}

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || `${host}:${port}`}`);
    if (req.method === "OPTIONS") return sendCorsPreflight(req, res);
    if ((url.pathname.startsWith("/api/") || url.pathname === "/proxy") && rateLimited(req)) {
      return sendJson(res, { error: "Too many requests. Slow down and try again." }, 429);
    }
    // NOTE: every async route is awaited so its rejection is caught here (prevents process crash).
    if (url.pathname === "/api/health") return sendJson(res, {
      ok: true,
      accountStore: "sqlite",
      stripeConfigured: stripeConfigured()
    });
    if (url.pathname === "/api/auth/signup") return await accountSignup(req, res);
    if (url.pathname === "/api/auth/login") return await accountLogin(req, res);
    if (url.pathname === "/api/auth/logout") return accountLogout(req, res);
    if (url.pathname === "/api/account/me") return accountMe(req, res);
    if (url.pathname === "/api/account/profile-slots/sync") return await syncProfileSlots(req, res);
    if (url.pathname === "/api/account/profile-slots/register") return await registerProfileSlot(req, res);
    if (url.pathname === "/api/account/profile-slots/remove") return await removeProfileSlot(req, res);
    if (url.pathname === "/api/billing/checkout") return await createStripeCheckout(req, res);
    if (url.pathname === "/api/billing/portal") return await createStripePortal(req, res);
    if (url.pathname === "/api/billing/webhook") return await stripeWebhook(req, res);
    if (url.pathname === "/api/fetch") return await fetchText(url, req, res);
    if (url.pathname === "/api/image") return await fetchPortalImage(url, req, res);
    if (url.pathname === "/api/mac/channels") return await fetchMacChannels(req, res);
    if (url.pathname === "/api/mac/category") return await fetchMacCategory(req, res);
    if (url.pathname === "/api/mac/series") return await fetchMacSeries(req, res);
    if (url.pathname === "/api/mac/stream") return await fetchMacStream(req, res);
    if (url.pathname === "/api/mac/epg") return await fetchMacEpg(req, res);
    if (url.pathname === "/api/capy/chat") return await capyChat(req, res);
    if (url.pathname === "/api/capy/messages") return await capyMessages(url, req, res);
    if (url.pathname === "/proxy") return await proxyStream(url, req, res);
    return await serveStatic(url, res);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (!res.headersSent) sendJson(res, { error: friendlyPortalError(error) }, status);
    else if (!res.writableEnded) res.end();
  }
});

// Last-resort safety net: never let one bad request take down the single-process server.
process.on("unhandledRejection", (reason) => console.error("[unhandledRejection]", reason?.message || reason));
process.on("uncaughtException", (error) => console.error("[uncaughtException]", error?.message || error));

server.listen(port, host, () => {
  console.log(`ORKXTRA OTT Player: http://${host}:${port}/ott-player/`);
});

async function serveStatic(url, res) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") {
    res.writeHead(302, { Location: "/ott-player/" });
    res.end();
    return;
  }
  if (pathname.endsWith("/")) pathname += "index.html";
  const relative = pathname.replace(/^\/+/, "");
  const fullPath = path.resolve(root, relative);
  if (!fullPath.startsWith(root)) return notFound(res);
  try {
    const stat = await fsp.stat(fullPath);
    if (!stat.isFile()) return notFound(res);
    res.writeHead(200, {
      "Content-Type": mime[path.extname(fullPath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    fs.createReadStream(fullPath).pipe(res);
  } catch (error) {
    notFound(res);
  }
}

function openAccountDatabase(filename) {
  const db = new DatabaseSync(filename);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      stripe_customer_id TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS subscriptions (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      stripe_subscription_id TEXT NOT NULL DEFAULT '',
      stripe_customer_id TEXT NOT NULL DEFAULT '',
      price_id TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'inactive',
      current_period_end INTEGER NOT NULL DEFAULT 0,
      cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS profile_slots (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      profile_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, profile_id)
    );
    CREATE TABLE IF NOT EXISTS stripe_events (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
  `);
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());
  return db;
}

function bootstrapAdminAccount(db) {
  const email = normalizeEmail(process.env.ORKXTRA_ADMIN_EMAIL || "admin@gmail.com");
  const password = String(process.env.ORKXTRA_ADMIN_PASSWORD || "admin@gmail.com");
  const name = String(process.env.ORKXTRA_ADMIN_NAME || "ORKXTRA Admin").trim();
  let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    const id = crypto.randomUUID();
    const salt = crypto.randomBytes(18).toString("hex");
    const now = Date.now();
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, password_salt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, email, passwordHash(password, salt), salt, now, now);
    user = userById(id);
  }
  db.prepare(`
    INSERT INTO subscriptions (
      user_id, stripe_subscription_id, stripe_customer_id, price_id, status,
      current_period_end, cancel_at_period_end, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      price_id = excluded.price_id,
      status = excluded.status,
      current_period_end = excluded.current_period_end,
      cancel_at_period_end = excluded.cancel_at_period_end,
      updated_at = excluded.updated_at
  `).run(
    user.id,
    "local-admin-pro",
    user.stripe_customer_id || "",
    "local-admin-pro",
    "active",
    Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60,
    0,
    Date.now()
  );
}

async function accountSignup(req, res) {
  if (req.method !== "POST") return sendJson(res, { error: "POST required" }, 405);
  const body = await readJsonBody(req);
  const name = String(body.name || "").trim().slice(0, 80);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  if (name.length < 2) return sendJson(res, { error: "Enter your name." }, 400);
  if (!isValidEmail(email)) return sendJson(res, { error: "Enter a valid email address." }, 400);
  if (password.length < 8) return sendJson(res, { error: "Use at least 8 characters for your password." }, 400);
  const existing = accountDb.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return sendJson(res, { error: "An account already exists for this email." }, 409);
  const id = crypto.randomUUID();
  const salt = crypto.randomBytes(18).toString("hex");
  const now = Date.now();
  accountDb.prepare(`
    INSERT INTO users (id, name, email, password_hash, password_salt, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, email, passwordHash(password, salt), salt, now, now);
  const token = createSession(id);
  return sendJson(res, accountResponse(userById(id)), 201, {
    "Set-Cookie": sessionCookie(token, req)
  });
}

async function accountLogin(req, res) {
  if (req.method !== "POST") return sendJson(res, { error: "POST required" }, 405);
  const body = await readJsonBody(req);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const user = accountDb.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !passwordMatches(password, user.password_salt, user.password_hash)) {
    return sendJson(res, { error: "Email or password is incorrect." }, 401);
  }
  const token = createSession(user.id);
  return sendJson(res, accountResponse(user), 200, {
    "Set-Cookie": sessionCookie(token, req)
  });
}

function accountLogout(req, res) {
  if (req.method !== "POST") return sendJson(res, { error: "POST required" }, 405);
  const token = sessionToken(req);
  if (token) accountDb.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId(token));
  return sendJson(res, { ok: true }, 200, {
    "Set-Cookie": expiredSessionCookie(req)
  });
}

function accountMe(req, res) {
  if (req.method !== "GET") return sendJson(res, { error: "GET required" }, 405);
  return sendJson(res, accountResponse(authenticatedUser(req)));
}

async function syncProfileSlots(req, res) {
  if (req.method !== "POST") return sendJson(res, { error: "POST required" }, 405);
  const user = requireUser(req, res);
  if (!user) return;
  const body = await readJsonBody(req);
  const ids = unique((Array.isArray(body.profileIds) ? body.profileIds : [])
    .map((value) => String(value || "").trim())
    .filter(Boolean))
    .slice(0, 100);
  const allowed = ids.slice(0, entitlementsForUser(user.id).maxProfiles);
  const allowedSet = new Set(allowed);
  const existing = accountDb.prepare("SELECT profile_id FROM profile_slots WHERE user_id = ?").all(user.id);
  existing.forEach((row) => {
    if (!allowedSet.has(row.profile_id)) {
      accountDb.prepare("DELETE FROM profile_slots WHERE user_id = ? AND profile_id = ?").run(user.id, row.profile_id);
    }
  });
  const now = Date.now();
  allowed.forEach((profileId) => {
    accountDb.prepare("INSERT OR IGNORE INTO profile_slots (user_id, profile_id, created_at) VALUES (?, ?, ?)").run(user.id, profileId, now);
  });
  return sendJson(res, {
    ...accountResponse(user),
    blockedProfileIds: ids.filter((profileId) => !allowedSet.has(profileId))
  });
}

async function registerProfileSlot(req, res) {
  if (req.method !== "POST") return sendJson(res, { error: "POST required" }, 405);
  const user = requireUser(req, res);
  if (!user) return;
  const body = await readJsonBody(req);
  const profileId = String(body.profileId || "").trim();
  if (!profileId) return sendJson(res, { error: "Profile ID is required." }, 400);
  const existing = accountDb.prepare("SELECT profile_id FROM profile_slots WHERE user_id = ? AND profile_id = ?").get(user.id, profileId);
  if (existing) return sendJson(res, accountResponse(user));
  const entitlements = entitlementsForUser(user.id);
  const current = profileSlotCount(user.id);
  if (current >= entitlements.maxProfiles) {
    return sendJson(res, {
      error: "Free includes one saved IPTV profile. Upgrade to Pro to add multiple logins.",
      code: "PRO_REQUIRED",
      account: accountResponse(user)
    }, 402);
  }
  accountDb.prepare("INSERT INTO profile_slots (user_id, profile_id, created_at) VALUES (?, ?, ?)").run(user.id, profileId, Date.now());
  return sendJson(res, accountResponse(user), 201);
}

async function removeProfileSlot(req, res) {
  if (req.method !== "POST") return sendJson(res, { error: "POST required" }, 405);
  const user = requireUser(req, res);
  if (!user) return;
  const body = await readJsonBody(req);
  const profileId = String(body.profileId || "").trim();
  if (profileId) accountDb.prepare("DELETE FROM profile_slots WHERE user_id = ? AND profile_id = ?").run(user.id, profileId);
  return sendJson(res, accountResponse(user));
}

async function createStripeCheckout(req, res) {
  if (req.method !== "POST") return sendJson(res, { error: "POST required" }, 405);
  const user = requireUser(req, res);
  if (!user) return;
  if (!stripeConfigured()) return stripeSetupRequired(res);
  const origin = requestOrigin(req);
  const fields = {
    mode: "subscription",
    "line_items[0][price]": STRIPE_PRICE_ID,
    "line_items[0][quantity]": "1",
    success_url: `${origin}/ott-player/?billing=success`,
    cancel_url: `${origin}/ott-player/?billing=cancelled`,
    client_reference_id: user.id,
    allow_promotion_codes: "true",
    "metadata[user_id]": user.id,
    "subscription_data[metadata][user_id]": user.id
  };
  if (user.stripe_customer_id) fields.customer = user.stripe_customer_id;
  else fields.customer_email = user.email;
  const session = await stripeRequest("/checkout/sessions", { method: "POST", fields });
  return sendJson(res, { url: session.url });
}

async function createStripePortal(req, res) {
  if (req.method !== "POST") return sendJson(res, { error: "POST required" }, 405);
  const user = requireUser(req, res);
  if (!user) return;
  if (!stripeConfigured()) return stripeSetupRequired(res);
  if (!user.stripe_customer_id) return sendJson(res, { error: "Upgrade to Pro before opening billing management." }, 400);
  const session = await stripeRequest("/billing_portal/sessions", {
    method: "POST",
    fields: {
      customer: user.stripe_customer_id,
      return_url: `${requestOrigin(req)}/ott-player/`
    }
  });
  return sendJson(res, { url: session.url });
}

async function stripeWebhook(req, res) {
  if (req.method !== "POST") return sendJson(res, { error: "POST required" }, 405);
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return sendJson(res, { error: "STRIPE_WEBHOOK_SECRET is not configured." }, 503);
  const raw = await readRawBody(req);
  const signature = String(req.headers["stripe-signature"] || "");
  if (!verifyStripeSignature(raw, signature, secret)) return sendJson(res, { error: "Invalid Stripe signature." }, 400);
  const event = JSON.parse(raw.toString("utf8"));
  if (!event?.id || !event?.type) return sendJson(res, { error: "Invalid Stripe event." }, 400);
  if (accountDb.prepare("SELECT id FROM stripe_events WHERE id = ?").get(event.id)) return sendJson(res, { received: true });
  await applyStripeEvent(event);
  accountDb.prepare("INSERT INTO stripe_events (id, created_at) VALUES (?, ?)").run(event.id, Date.now());
  return sendJson(res, { received: true });
}

async function applyStripeEvent(event) {
  const object = event.data?.object || {};
  if (event.type === "checkout.session.completed") {
    const userId = String(object.metadata?.user_id || object.client_reference_id || "");
    const user = userId ? userById(userId) : null;
    if (user && object.customer) {
      accountDb.prepare("UPDATE users SET stripe_customer_id = ?, updated_at = ? WHERE id = ?")
        .run(String(object.customer), Date.now(), user.id);
    }
    if (object.subscription) await syncStripeSubscription(String(object.subscription), userId);
    return;
  }
  if (event.type === "customer.subscription.created"
    || event.type === "customer.subscription.updated"
    || event.type === "customer.subscription.deleted") {
    upsertSubscription(object);
  }
}

async function syncStripeSubscription(subscriptionId, userId = "") {
  const subscription = await stripeRequest(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
  if (userId && !subscription.metadata?.user_id) subscription.metadata = { ...subscription.metadata, user_id: userId };
  upsertSubscription(subscription);
}

function upsertSubscription(subscription) {
  const customerId = String(subscription.customer || "");
  const userId = String(subscription.metadata?.user_id || userByStripeCustomer(customerId)?.id || "");
  if (!userId) return;
  const item = subscription.items?.data?.[0];
  accountDb.prepare(`
    INSERT INTO subscriptions (
      user_id, stripe_subscription_id, stripe_customer_id, price_id, status,
      current_period_end, cancel_at_period_end, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      stripe_subscription_id = excluded.stripe_subscription_id,
      stripe_customer_id = excluded.stripe_customer_id,
      price_id = excluded.price_id,
      status = excluded.status,
      current_period_end = excluded.current_period_end,
      cancel_at_period_end = excluded.cancel_at_period_end,
      updated_at = excluded.updated_at
  `).run(
    userId,
    String(subscription.id || ""),
    customerId,
    String(item?.price?.id || ""),
    String(subscription.status || "inactive"),
    Number(subscription.current_period_end || 0),
    subscription.cancel_at_period_end ? 1 : 0,
    Date.now()
  );
  if (customerId) {
    accountDb.prepare("UPDATE users SET stripe_customer_id = ?, updated_at = ? WHERE id = ?")
      .run(customerId, Date.now(), userId);
  }
}

function accountResponse(user) {
  if (!user) {
    return {
      authenticated: false,
      plan: "free",
      entitlements: freeEntitlements(),
      billing: { stripeConfigured: stripeConfigured(), priceId: STRIPE_PRICE_ID }
    };
  }
  const subscription = subscriptionForUser(user.id);
  const entitlements = entitlementsForUser(user.id);
  return {
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    plan: entitlements.plan,
    entitlements,
    profileSlots: {
      used: profileSlotCount(user.id),
      limit: entitlements.maxProfiles
    },
    subscription: subscription ? {
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end)
    } : null,
    billing: {
      stripeConfigured: stripeConfigured(),
      priceId: STRIPE_PRICE_ID,
      canManage: Boolean(user.stripe_customer_id)
    }
  };
}

function entitlementsForUser(userId) {
  const subscription = subscriptionForUser(userId);
  const pro = Boolean(subscription && ["active", "trialing"].includes(subscription.status));
  return pro ? {
    plan: "pro",
    maxProfiles: 25,
    multipleProfiles: true
  } : freeEntitlements();
}

function freeEntitlements() {
  return {
    plan: "free",
    maxProfiles: 1,
    multipleProfiles: false
  };
}

function subscriptionForUser(userId) {
  return accountDb.prepare("SELECT * FROM subscriptions WHERE user_id = ?").get(userId);
}

function profileSlotCount(userId) {
  return Number(accountDb.prepare("SELECT COUNT(*) AS count FROM profile_slots WHERE user_id = ?").get(userId)?.count || 0);
}

function authenticatedUser(req) {
  const token = sessionToken(req);
  if (!token) return null;
  const session = accountDb.prepare(`
    SELECT users.* FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.id = ? AND sessions.expires_at > ?
  `).get(sessionId(token), Date.now());
  return session || null;
}

function requireUser(req, res) {
  const user = authenticatedUser(req);
  if (!user) sendJson(res, { error: "Log in to continue.", code: "AUTH_REQUIRED" }, 401);
  return user;
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const now = Date.now();
  accountDb.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
  accountDb.prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .run(sessionId(token), userId, now + SESSION_TTL_MS, now);
  return token;
}

function sessionToken(req) {
  return parseCookies(req.headers.cookie || "")[SESSION_COOKIE] || "";
}

function sessionId(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function sessionCookie(token, req) {
  // Secure on every non-localhost host (don't trust spoofable x-forwarded-proto).
  const secure = isLocalHostReq(req) ? "" : "; Secure";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${secure}`;
}

function expiredSessionCookie(req) {
  const secure = isLocalHostReq(req) ? "" : "; Secure";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

function parseCookies(value) {
  return String(value || "").split(";").reduce((cookies, item) => {
    const separator = item.indexOf("=");
    if (separator < 0) return cookies;
    cookies[item.slice(0, separator).trim()] = decodeURIComponent(item.slice(separator + 1).trim());
    return cookies;
  }, {});
}

function passwordHash(password, salt) {
  return crypto.scryptSync(String(password), String(salt), 64).toString("hex");
}

function passwordMatches(password, salt, expected) {
  try {
    const actual = Buffer.from(passwordHash(password, salt), "hex");
    const saved = Buffer.from(String(expected), "hex");
    return actual.length === saved.length && crypto.timingSafeEqual(actual, saved);
  } catch {
    return false;
  }
}

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function userById(id) {
  return accountDb.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

function userByStripeCustomer(customerId) {
  if (!customerId) return null;
  return accountDb.prepare("SELECT * FROM users WHERE stripe_customer_id = ?").get(customerId);
}

function stripeConfigured() {
  // Treat placeholder / example values as "not configured" so the app degrades
  // gracefully (shows a setup hint) instead of failing on a bogus Stripe API call.
  const real = (value, prefix) =>
    typeof value === "string" &&
    value.startsWith(prefix) &&
    value.length > prefix.length + 6 &&
    !/replace|your[_-]?key|example|changeme|xxxx|\*\*\*|placeholder/i.test(value);
  return real(process.env.STRIPE_SECRET_KEY, "sk_") && real(STRIPE_PRICE_ID, "price_");
}

function stripeSetupRequired(res) {
  return sendJson(res, {
    error: "Stripe is not configured on this local server. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to .env, then restart.",
    code: "STRIPE_NOT_CONFIGURED"
  }, 503);
}

async function stripeRequest(pathname, options = {}) {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not configured.");
  const body = options.fields ? new URLSearchParams(options.fields).toString() : undefined;
  const response = await fetch(`${STRIPE_API_BASE}${pathname}`, {
    method: options.method || "GET",
    headers: {
      "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });
  const text = await response.text();
  const data = parseJsonMaybe(text) || {};
  if (!response.ok) throw new Error(data.error?.message || `Stripe HTTP ${response.status}`);
  return data;
}

function verifyStripeSignature(raw, signature, secret) {
  const parts = String(signature || "").split(",").map((item) => item.trim());
  const timestamp = parts.find((item) => item.startsWith("t="))?.slice(2);
  const signatures = parts.filter((item) => item.startsWith("v1=")).map((item) => item.slice(3));
  if (!timestamp || !signatures.length || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${raw.toString("utf8")}`).digest("hex");
  return signatures.some((value) => {
    try {
      const actual = Buffer.from(value, "hex");
      const saved = Buffer.from(expected, "hex");
      return actual.length === saved.length && crypto.timingSafeEqual(actual, saved);
    } catch {
      return false;
    }
  });
}

function requestOrigin(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, "");
  const protocol = String(req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  return `${protocol}://${req.headers.host || `${host}:${port}`}`;
}

async function fetchText(url, req, res) {
  const target = url.searchParams.get("url");
  let response;
  try {
    response = await safeFetch(target, { headers: upstreamHeaders(req) });
  } catch (error) {
    return sendJson(res, { error: friendlyPortalError(error) }, Number(error?.statusCode) || 502);
  }
  const text = await response.text();
  res.writeHead(response.status, {
    ...corsHeaders(req),
    "Content-Type": response.headers.get("content-type") || "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(text);
}

async function fetchPortalImage(url, req, res) {
  const target = url.searchParams.get("url");
  if (!isSafeRemote(target)) return sendJson(res, { error: "Invalid image URL" }, 400);

  // Serve from on-disk cache when fresh (logos rarely change; avoids re-hitting flaky portals).
  const cacheFile = path.join(imageCacheDir, crypto.createHash("sha1").update(target).digest("hex"));
  try {
    const stat = fs.statSync(cacheFile);
    if (Date.now() - stat.mtimeMs < IMAGE_CACHE_TTL_MS) {
      let type = "image/png";
      try { type = fs.readFileSync(`${cacheFile}.type`, "utf8") || type; } catch (_) { /* default */ }
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "public, max-age=604800, immutable" });
      fs.createReadStream(cacheFile).pipe(res);
      return;
    }
  } catch (_) { /* cache miss */ }

  const portal = url.searchParams.get("portal") || "";
  const mac = normalizeMac(url.searchParams.get("mac") || "");
  const client = isSafeRemote(portal) && mac
    ? {
      portal,
      mac,
      model: "MAG254",
      timezone: "UTC",
      userAgent: defaultMacUserAgent("MAG254")
    }
    : null;

  let response;
  try {
    response = await safeFetch(target, {
      headers: client ? macHeaders(client) : upstreamHeaders(req)
    });
  } catch (error) {
    return sendJson(res, { error: `Image proxy failed: ${error.message}` }, Number(error?.statusCode) || 502);
  }

  const type = response.headers.get("content-type") || "image/png";
  if (response.ok && response.body) {
    let buf = null;
    try { buf = Buffer.from(await response.arrayBuffer()); } catch (_) { buf = null; }
    if (buf) {
      try { fs.writeFileSync(cacheFile, buf); fs.writeFileSync(`${cacheFile}.type`, type); } catch (_) { /* best effort */ }
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "public, max-age=604800, immutable" });
      res.end(buf);
      return;
    }
  }

  res.writeHead(response.status, {
    "Content-Type": type,
    "Cache-Control": "no-store"
  });
  if (!response.body) {
    res.end();
    return;
  }
  Readable.fromWeb(response.body).pipe(res);
}

async function fetchMacChannels(req, res) {
  if (req.method !== "POST") return sendJson(res, { error: "POST required" }, 405);
  const account = await readJsonBody(req);
  if (!isSafeRemote(account.portal)) return sendJson(res, { error: "Invalid portal address" }, 400);

  const mac = normalizeMac(account.mac);
  if (!mac) return sendJson(res, { error: "Invalid MAC address" }, 400);

  const client = await macClientFromAccount({ ...account, mac });
  const responseCacheKey = memoryCacheKey(["channels", account.portal, mac, client.model, client.timezone]);
  const cached = getMemoryCache(responseCacheKey);
  if (cached) return sendJson(res, { ...cached, cached: true });

  let lastError = null;
  let authError = null;
  for (const endpoint of stalkerEndpoints(account.portal)) {
    try {
      return await runWithAuth(endpoint, client, async (token) => {
        const channels = await stalkerChannelList(endpoint, client, token);
        const [vodCategories, seriesCategories] = await Promise.all([
          stalkerMediaCategories(endpoint, client, token, "vod").catch(() => []),
          stalkerMediaCategories(endpoint, client, token, "series").catch(() => [])
        ]);
        channels.push(
          ...vodCategories.map((category) => stalkerCategoryPlaceholder(category, endpoint, "movie", "vod")),
          ...seriesCategories.map((category) => stalkerCategoryPlaceholder(category, endpoint, "series", "series"))
        );
        const payload = { endpoint, channels };
        setMemoryCache(responseCacheKey, payload, MAC_CHANNEL_CACHE_MS);
        return sendJson(res, payload);
      });
    } catch (error) {
      console.error(`[mac/channels] ${endpoint}: ${error.message}`);
      if (isPortalAuthError(error)) authError = error;
      lastError = error;
    }
  }

  if (authError) return sendJson(res, { error: friendlyPortalError(authError) }, 401);
  sendJson(res, { error: friendlyPortalError(lastError) || "MAC portal did not return channels" }, 502);
}

async function fetchMacCategory(req, res) {
  if (req.method !== "POST") return sendJson(res, { error: "POST required" }, 405);
  const body = await readJsonBody(req);
  if (!isSafeRemote(body.portal)) return sendJson(res, { error: "Invalid portal address" }, 400);

  const mac = normalizeMac(body.mac);
  if (!mac) return sendJson(res, { error: "Invalid MAC address" }, 400);

  const portalType = stalkerPortalMediaType(body.mediaType || body.type);
  if (portalType !== "vod" && portalType !== "series") {
    return sendJson(res, { error: "Unsupported MAC catalog type" }, 400);
  }

  const categoryId = String(body.categoryId || body.category || "").trim();
  if (!categoryId || categoryId === "*") return sendJson(res, { error: "Category is required" }, 400);

  const client = await macClientFromAccount({ ...body, mac });
  const endpoints = unique([
    isSafeRemote(body.endpoint) ? body.endpoint : "",
    ...stalkerEndpoints(body.portal)
  ].filter(Boolean));
  const responseCacheKey = memoryCacheKey([
    "category",
    body.portal,
    mac,
    portalType,
    categoryId,
    body.endpoint || "",
    body.categoryTitle || body.group || ""
  ]);
  const cached = getMemoryCache(responseCacheKey);
  if (cached) return sendJson(res, { ...cached, cached: true });

  let lastError = null;
  let authError = null;
  for (const endpoint of endpoints) {
    try {
      return await runWithAuth(endpoint, client, async (token) => {
        const result = await stalkerMediaRowsForCategory(endpoint, client, token, portalType, categoryId, {
          maxPages: body.maxPages
        });
        const itemType = portalType === "vod" ? "movie" : "series";
        const categoryTitle = body.categoryTitle || body.group || "Portal Catalog";
        const channels = result.rows.map((row) => stalkerMediaItem(row, endpoint, categoryTitle, itemType, portalType, client));
        const payload = {
          endpoint,
          type: itemType,
          mediaType: portalType,
          categoryId,
          total: result.total || channels.length,
          truncated: result.truncated,
          channels
        };
        setMemoryCache(responseCacheKey, payload, MAC_CATEGORY_CACHE_MS);
        return sendJson(res, payload);
      });
    } catch (error) {
      console.error(`[mac/category] ${endpoint}: ${error.message}`);
      if (isPortalAuthError(error)) authError = error;
      lastError = error;
    }
  }

  if (authError) return sendJson(res, { error: friendlyPortalError(authError) }, 401);
  sendJson(res, { error: friendlyPortalError(lastError) || "MAC portal did not return catalog rows" }, 502);
}

async function fetchMacSeries(req, res) {
  if (req.method !== "POST") return sendJson(res, { error: "POST required" }, 405);
  const body = await readJsonBody(req);
  if (!isSafeRemote(body.portal)) return sendJson(res, { error: "Invalid portal address" }, 400);

  const mac = normalizeMac(body.mac);
  if (!mac) return sendJson(res, { error: "Invalid MAC address" }, 400);

  const seriesId = String(body.providerId || body.seriesId || body.id || "").trim().split(":")[0];
  if (!seriesId) return sendJson(res, { error: "Series id is required" }, 400);

  const client = await macClientFromAccount({ ...body, mac });
  const endpoints = unique([
    isSafeRemote(body.endpoint) ? body.endpoint : "",
    ...stalkerEndpoints(body.portal)
  ].filter(Boolean));
  const responseCacheKey = memoryCacheKey(["series", body.portal, mac, seriesId, body.endpoint || ""]);
  const cached = getMemoryCache(responseCacheKey);
  if (cached) return sendJson(res, { ...cached, cached: true });

  let lastError = null;
  let authError = null;
  for (const endpoint of endpoints) {
    try {
      return await runWithAuth(endpoint, client, async (token) => {
        const seasons = await stalkerSeriesSeasons(endpoint, client, token, seriesId);
        const episodes = stalkerSeriesEpisodes(seasons, endpoint, body.title || "Series", client);
        if (!episodes.length) throw new Error("Portal returned no episodes for this series");
        const payload = { endpoint, seriesId, episodes };
        setMemoryCache(responseCacheKey, payload, MAC_SERIES_CACHE_MS);
        return sendJson(res, payload);
      });
    } catch (error) {
      console.error(`[mac/series] ${endpoint}: ${error.message}`);
      if (isPortalAuthError(error)) authError = error;
      lastError = error;
    }
  }

  if (authError) return sendJson(res, { error: friendlyPortalError(authError) }, 401);
  sendJson(res, { error: friendlyPortalError(lastError) || "MAC portal did not return series episodes" }, 502);
}

async function fetchMacStream(req, res) {
  if (req.method !== "POST") return sendJson(res, { error: "POST required" }, 405);
  const body = await readJsonBody(req);
  if (!isSafeRemote(body.portal)) return sendJson(res, { error: "Invalid portal address" }, 400);

  const mac = normalizeMac(body.mac);
  if (!mac) return sendJson(res, { error: "Invalid MAC address" }, 400);

  const mediaType = stalkerPortalMediaType(body.mediaType || body.type);
  const command = String(body.command || stalkerCommandFromUrl(body.url) || "").trim();
  if (!command && !isSafeRemote(body.url)) return sendJson(res, { error: "Missing stream command" }, 400);

  const client = await macClientFromAccount({ ...body, mac });
  const endpoints = unique([
    isSafeRemote(body.endpoint) ? body.endpoint : "",
    ...stalkerEndpoints(body.portal)
  ].filter(Boolean));
  const responseCacheKey = memoryCacheKey([
    "stream",
    body.portal,
    mac,
    mediaType,
    command,
    body.seriesEpisode || "",
    body.endpoint || "",
    body.providerId || ""
  ]);
  const cached = body.forceRelink ? null : getMemoryCache(responseCacheKey);
  if (cached) return sendJson(res, { ...cached, cached: true });

  let lastError = null;
  let authError = null;
  for (const endpoint of endpoints) {
    try {
      return await runWithAuth(endpoint, client, async (token) => {
        const directCandidates = body.forceRelink ? [] : unique([
          extractStreamUrl(body.url, endpoint),
          extractStreamUrl(command, endpoint)
        ]).filter(isUsableDirectStreamUrl);
        for (const directUrl of directCandidates) {
          if (!(await probeStreamUrl(directUrl, client))) continue;
          const payload = {
            endpoint,
            url: directUrl,
            format: inferStreamFormat(directUrl, command)
          };
          setMemoryCache(responseCacheKey, payload, MAC_STREAM_CACHE_MS);
          return sendJson(res, payload);
        }

        const link = command
          ? await stalkerCreateLink(endpoint, client, token, command, mediaType, body.seriesEpisode)
          : { cmd: body.url, url: body.url };
        const streamUrl = extractStreamUrl(link?.cmd || link?.url || body.url || "", endpoint);
        if (isUsableDirectStreamUrl(streamUrl) && await probeStreamUrl(streamUrl, client)) {
          const payload = {
            endpoint,
            url: streamUrl,
            format: inferStreamFormat(streamUrl, link?.cmd || command)
          };
          setMemoryCache(responseCacheKey, payload, MAC_STREAM_CACHE_MS);
          return sendJson(res, payload);
        }

        const fresh = await freshChannelStreamUrl(endpoint, client, token, body, command, directCandidates);
        if (fresh?.url) {
          if (await probeStreamUrl(fresh.url, client)) {
            const payload = {
              endpoint,
              url: fresh.url,
              format: inferStreamFormat(fresh.url, fresh.command || command)
            };
            setMemoryCache(responseCacheKey, payload, MAC_STREAM_CACHE_MS);
            return sendJson(res, payload);
          }
        }

        throw new Error("Portal did not return a playable stream URL");
      });
    } catch (error) {
      console.error(`[mac/stream] ${endpoint}: ${error.message}`);
      if (isPortalAuthError(error)) authError = error;
      lastError = error;
    }
  }

  if (authError) return sendJson(res, { error: friendlyPortalError(authError) }, 401);
  sendJson(res, { error: friendlyPortalError(lastError) || "MAC portal did not return a stream link" }, 502);
}

async function fetchMacEpg(req, res) {
  if (req.method !== "POST") return sendJson(res, { error: "POST required" }, 405);
  const body = await readJsonBody(req);
  if (!isSafeRemote(body.portal)) return sendJson(res, { error: "Invalid portal address" }, 400);

  const mac = normalizeMac(body.mac);
  if (!mac) return sendJson(res, { error: "Invalid MAC address" }, 400);

  const channelCandidates = unique([
    body.channelId,
    body.providerId,
    body.epgId,
    body.id
  ].map((value) => String(value || "").trim()).filter(Boolean));
  if (!channelCandidates.length) return sendJson(res, { error: "Channel id is required" }, 400);

  const client = await macClientFromAccount({ ...body, mac });
  const endpoints = unique([
    isSafeRemote(body.endpoint) ? body.endpoint : "",
    ...stalkerEndpoints(body.portal)
  ].filter(Boolean));

  const responseCacheKey = memoryCacheKey(["epg", body.portal, mac, channelCandidates.join(",")]);
  const cached = getMemoryCache(responseCacheKey);
  if (cached) return sendJson(res, { ...cached, cached: true });

  let lastError = null;
  let authError = null;
  let reachedPortal = false;
  for (const endpoint of endpoints) {
    try {
      const result = await runWithAuth(endpoint, client, async (token) => {
        reachedPortal = true;
        for (const channelId of channelCandidates) {
          const programs = await stalkerShortEpg(endpoint, client, token, channelId).catch((error) => {
            lastError = error;
            return [];
          });
          if (programs.length) return { endpoint, channelId, programs };
        }
        return null;
      });
      if (result) {
        setMemoryCache(responseCacheKey, result, EPG_CACHE_MS);
        return sendJson(res, result);
      }
    } catch (error) {
      console.error(`[mac/epg] ${endpoint}: ${error.message}`);
      if (isPortalAuthError(error)) authError = error;
      lastError = error;
    }
  }

  if (authError) return sendJson(res, { error: friendlyPortalError(authError) }, 401);
  // Distinguish a genuine empty guide (portal reachable, no programs) from a real failure.
  if (reachedPortal && !lastError) {
    return sendJson(res, { ok: true, programs: [], empty: true });
  }
  sendJson(res, {
    ok: false,
    programs: [],
    error: friendlyPortalError(lastError) || "Portal did not return EPG for this channel"
  }, 502);
}

async function capyChat(req, res) {
  if (req.method !== "POST") return sendJson(res, { error: "POST required" }, 405);
  const body = await readJsonBody(req);
  const message = String(body.message || "").trim();
  if (!message) return sendJson(res, { error: "Message required" }, 400);

  const knownIds = Array.isArray(body.knownIds) ? body.knownIds.map(String) : [];
  let threadId = String(body.threadId || "").trim();
  if (threadId) {
    await capyRequest(`/threads/${encodeURIComponent(threadId)}/message`, {
      method: "POST",
      body: capyThreadMessageBody(message)
    });
  } else {
    const projectId = await resolveCapyProjectId(String(body.projectId || "").trim());
    const thread = await capyRequest("/threads", {
      method: "POST",
      body: {
        projectId,
        prompt: capyAssistantPrompt(message),
        model: CAPY_MODEL,
        speed: "fast",
        reasoning: { mode: "low" }
      }
    });
    threadId = thread.id;
  }

  const result = await waitForCapyReply(threadId, knownIds, CAPY_WAIT_MS);
  sendJson(res, { threadId, ...result });
}

async function capyMessages(url, req, res) {
  if (req.method !== "GET") return sendJson(res, { error: "GET required" }, 405);
  const threadId = String(url.searchParams.get("threadId") || "").trim();
  if (!threadId) return sendJson(res, { error: "Thread ID required" }, 400);
  const [messages, thread] = await Promise.all([
    listCapyMessages(threadId),
    getCapyThread(threadId).catch(() => null)
  ]);
  sendJson(res, {
    threadId,
    messages,
    status: thread?.runState || thread?.status || "",
    blockedOn: thread?.blockedOn || []
  });
}

async function proxyStream(url, req, res) {
  const target = url.searchParams.get("url");
  if (!isSafeRemote(target)) return sendJson(res, { error: "Invalid remote URL" }, 400);
  if (proxyActive >= PROXY_MAX_CONCURRENT) return sendJson(res, { error: "Too many concurrent streams. Try again shortly." }, 429);

  proxyActive += 1;
  let released = false;
  const release = () => { if (!released) { released = true; proxyActive = Math.max(0, proxyActive - 1); } };

  const controller = new AbortController();
  res.on("close", () => { controller.abort(); release(); });

  let response;
  try {
    response = await safeFetch(target, {
      headers: upstreamHeaders(req),
      signal: controller.signal
    });
  } catch (error) {
    release();
    if (res.destroyed || controller.signal.aborted) return;
    return sendJson(res, { error: `Stream proxy failed: ${friendlyPortalError(error)}` }, Number(error?.statusCode) || 502);
  }

  const contentType = response.headers.get("content-type") || "";
  const isPlaylist = /mpegurl|m3u8/i.test(contentType) || /\.m3u8($|\?)/i.test(new URL(target).pathname);

  if (isPlaylist) {
    let text;
    try {
      text = await response.text();
    } catch (error) {
      if (res.destroyed || controller.signal.aborted) return;
      return sendJson(res, { error: `Playlist proxy failed: ${error.message}` }, 502);
    }
    const rewritten = rewritePlaylist(text, target, `http://${req.headers.host || `${host}:${port}`}`);
    res.writeHead(response.status, {
      ...corsHeaders(req),
      "Access-Control-Allow-Headers": "Range, Content-Type",
      "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res.end(rewritten);
    return;
  }

  const headers = {
    ...corsHeaders(req),
    "Access-Control-Allow-Headers": "Range, Content-Type",
    "Content-Type": contentType || "application/octet-stream",
    "Cache-Control": cacheControlForMedia(target, response)
  };
  const length = response.headers.get("content-length");
  const ranges = response.headers.get("accept-ranges");
  const contentRange = response.headers.get("content-range");
  const etag = response.headers.get("etag");
  const lastModified = response.headers.get("last-modified");
  if (length) headers["Content-Length"] = length;
  if (ranges) headers["Accept-Ranges"] = ranges;
  else headers["Accept-Ranges"] = "bytes";
  if (contentRange) headers["Content-Range"] = contentRange;
  if (etag) headers.ETag = etag;
  if (lastModified) headers["Last-Modified"] = lastModified;
  res.writeHead(response.status, headers);
  if (!response.body) {
    res.end();
    return;
  }

  const stream = Readable.fromWeb(response.body);
  stream.on("error", () => {
    if (!res.destroyed) res.destroy();
  });
  res.on("close", () => {
    if (!stream.destroyed) stream.destroy();
  });
  stream.pipe(res);
}

async function stalkerHandshake(endpoint, client) {
  const data = await stalkerRequest(endpoint, {
    type: "stb",
    action: "handshake",
    token: "",
    JsHttpRequest: "1-xml"
  }, client);
  const token = data?.token || data?.js?.token;
  if (!token) throw new Error("Portal handshake did not return a token");
  return token;
}

async function stalkerProfile(endpoint, client, token) {
  const profile = await stalkerRequest(endpoint, {
    type: "stb",
    action: "get_profile",
    hd: "1",
    ver: client.firmware || defaultMacFirmware(client.portalVersion),
    num_banks: "2",
    sn: client.serialNumber,
    stb_type: client.model,
    client_type: "STB",
    image_version: "218",
    video_out: "hdmi",
    device_id: client.deviceId,
    device_id2: client.deviceId2,
    signature: "",
    auth_second_step: "0",
    hw_version: "1.7-BD-00",
    not_valid_token: "0",
    metrics: "{}",
    hw_version_2: "",
    timestamp: "",
    api_signature: "262",
    prehash: "",
    JsHttpRequest: "1-xml"
  }, client, token);
  if (profile?.status === 1 && profile?.msg) {
    throw new Error(stripHtml(profile.msg));
  }
  return profile;
}

async function stalkerChannelList(endpoint, client, token) {
  const genreMap = await stalkerGenreMap(endpoint, client, token).catch(() => new Map());
  const data = await stalkerRequest(endpoint, {
    type: "itv",
    action: "get_all_channels",
    force_ch_link_check: "",
    JsHttpRequest: "1-xml"
  }, client, token);

  const rows = portalRows(data);
  const channels = [];
  const seen = new Set();
  for (const row of rows) {
    pushStalkerChannel(channels, seen, row, endpoint, genreMap, client);
  }

  const adultGenres = Array.from(genreMap.values()).filter((genre) => genre.adult);
  for (const genre of adultGenres) {
    const genreRows = await stalkerOrderedRowsForGenre(endpoint, client, token, genre.id).catch(() => []);
    for (const row of genreRows) {
      pushStalkerChannel(channels, seen, row, endpoint, genreMap, client, genre);
    }
  }
  if (!channels.length) throw new Error("Portal returned no playable channel commands");
  return channels;
}

async function stalkerMediaCategories(endpoint, client, token, mediaType) {
  const portalType = stalkerPortalMediaType(mediaType);
  const data = await stalkerRequest(endpoint, {
    type: portalType,
    action: "get_categories",
    JsHttpRequest: "1-xml"
  }, client, token);
  return portalRows(data)
    .map((row) => {
      const id = String(row.id || row.category_id || row.genre_id || "").trim();
      const title = stripHtml(row.title || row.name || row.category_title || row.category || "").trim();
      if (!id || id === "*" || !title || cleanPortalText(title) === "all") return null;
      return {
        id,
        title,
        adult: isAdultPortalRow(row, title, title)
      };
    })
    .filter(Boolean);
}

function stalkerCategoryPlaceholder(category, endpoint, type, mediaType) {
  return {
    id: `${mediaType}-category-${category.id}`,
    title: category.title,
    group: category.title,
    categoryId: category.id,
    type,
    mediaType,
    catalogOnly: true,
    adult: Boolean(category.adult),
    quality: "Catalog",
    endpoint
  };
}

async function stalkerMediaRowsForCategory(endpoint, client, token, mediaType, categoryId, options = {}) {
  const rows = [];
  const seen = new Set();
  const requestedMaxPages = Number(options.maxPages || 0);
  const maxPages = requestedMaxPages > 0
    ? Math.min(MAX_PORTAL_CATEGORY_PAGES, requestedMaxPages)
    : MAX_PORTAL_CATEGORY_PAGES;
  let total = 0;
  let truncated = false;

  for (let page = 1; page <= maxPages; page += 1) {
    let data;
    try {
      data = await stalkerRequest(endpoint, {
        type: stalkerPortalMediaType(mediaType),
        action: "get_ordered_list",
        category: categoryId,
        genre: categoryId,
        fav: "0",
        sortby: "added",
        p: String(page),
        JsHttpRequest: "1-xml"
      }, client, token);
    } catch (error) {
      // Don't discard a whole category because one page hiccuped — return what we have.
      if (rows.length) { truncated = true; console.error(`[category ${categoryId}] page ${page} failed, returning ${rows.length} partial: ${error.message}`); break; }
      throw error;
    }
    const pageRows = portalRows(data);
    if (!pageRows.length) break;
    for (const row of pageRows) {
      const key = String(row.id || row.video_id || row.movie_id || row.name || row.title || JSON.stringify(row));
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(row);
    }
    total = Number(data?.total_items || data?.total || data?.count || total || 0);
    if (total && rows.length >= total) break;
  }

  if (total && rows.length < total) truncated = true;
  return { rows, total, truncated };
}

function stalkerMediaItem(row, endpoint, fallbackGroup, type, mediaType, client = null) {
  const title = stripHtml(row.name || row.title || row.o_name || row.original_name || `${type === "movie" ? "Movie" : "Series"} item`).trim();
  const group = stripHtml(row.category_title || row.genre_title || row.category || fallbackGroup || "Portal Catalog").trim();
  const command = row.cmd || row.mc_cmd || row.url || "";
  let streamUrl = extractStreamUrl(command, endpoint);
  if (isStalkerPlaceholderUrl(streamUrl)) streamUrl = "";
  const id = String(row.id || row.video_id || row.movie_id || row.series_id || row.ch_id || `${mediaType}-${title}`);
  const poster = stalkerArtwork(row, endpoint);
  const description = stripHtml(row.description || row.descr || row.plot || "");
  return {
    id,
    title,
    group,
    categoryId: String(row.category_id || row.genre_id || row.tv_genre_id || "").trim(),
    providerId: id,
    type,
    mediaType,
    adult: isAdultPortalRow(row, title, group),
    quality: row.hd === "1" || row.hd === 1 ? "HD" : inferMediaQuality(`${title} ${group} ${row.hd || ""}`),
    epgId: row.xmltv_id || row.tvg_id || id || title,
    url: streamUrl,
    command,
    endpoint,
    logo: portalImageProxyUrl(poster, client),
    description,
    format: inferStreamFormat(streamUrl, command)
  };
}

async function stalkerSeriesSeasons(endpoint, client, token, seriesId) {
  const data = await stalkerRequest(endpoint, {
    type: "series",
    action: "get_ordered_list",
    movie_id: seriesId,
    JsHttpRequest: "1-xml"
  }, client, token);
  return portalRows(data);
}

function stalkerSeriesEpisodes(seasons, endpoint, seriesTitle, client = null) {
  const episodes = [];
  seasons.forEach((season, seasonIndex) => {
    const seasonTitle = stripHtml(season.name || season.title || `Season ${seasonIndex + 1}`).trim();
    const command = season.cmd || season.mc_cmd || season.url || "";
    const poster = stalkerArtwork(season, endpoint);
    const logo = portalImageProxyUrl(poster, client);
    const description = stripHtml(season.description || season.descr || season.plot || "");
    const numbers = stalkerEpisodeNumbers(season.series);
    if (numbers.length) {
      numbers.forEach((episodeNumber) => {
        episodes.push({
          id: `${season.id || seasonIndex + 1}:${episodeNumber}`,
          title: `${seriesTitle} - ${seasonTitle} E${episodeNumber}`,
          group: seasonTitle,
          providerId: String(season.id || seasonIndex + 1),
          type: "series",
          mediaType: "series",
          command,
          seriesEpisode: String(episodeNumber),
          endpoint,
          logo,
          description,
          quality: inferMediaQuality(`${seriesTitle} ${seasonTitle}`)
        });
      });
      return;
    }

    const episodeNumber = Number(season.series_number || season.episode_num || season.episode || 0);
    if (!command) return;
    episodes.push({
      id: String(season.id || `${seasonIndex + 1}:${episodeNumber || 1}`),
      title: stripHtml(season.name || season.title || `${seriesTitle} - Episode ${episodeNumber || seasonIndex + 1}`).trim(),
      group: seasonTitle,
      providerId: String(season.id || seasonIndex + 1),
      type: "series",
      mediaType: "series",
      command,
      seriesEpisode: episodeNumber ? String(episodeNumber) : "",
      endpoint,
      logo,
      description,
      quality: inferMediaQuality(`${seriesTitle} ${seasonTitle}`)
    });
  });
  return episodes.sort((a, b) => {
    const seasonSort = String(a.group).localeCompare(String(b.group), undefined, { numeric: true });
    return seasonSort || Number(a.seriesEpisode || 0) - Number(b.seriesEpisode || 0);
  });
}

function stalkerEpisodeNumbers(value) {
  const values = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? Object.values(value)
      : String(value || "").split(",");
  return values
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);
}

function pushStalkerChannel(channels, seen, row, endpoint, genreMap, client = null, forcedGenre = null) {
  const command = row.cmd || row.mc_cmd || row.url || "";
  let streamUrl = extractStreamUrl(command, endpoint);
  if (isStalkerPlaceholderUrl(streamUrl)) streamUrl = "";
  if (!streamUrl && !command) return;
  const genreId = String(row.tv_genre_id || row.genre_id || row.category_id || row.group_id || forcedGenre?.id || "").trim();
  const genre = forcedGenre || genreMap.get(genreId);
  const title = row.name || row.title || `Channel ${channels.length + 1}`;
  const group = row.tv_genre_title
    || row.genre_title
    || genre?.title
    || row.category_title
    || row.category
    || row.group
    || "MAC Portal";
  const id = String(row.id || row.ch_id || row.number || `${genreId || "channel"}-${channels.length + 1}`);
  const key = `${id}|${command || streamUrl || title}`;
  if (seen.has(key)) return;
  seen.add(key);
  channels.push({
    id,
    title,
    type: "live",
    mediaType: "itv",
    group,
    categoryId: genreId,
    adult: Boolean(genre?.adult || isAdultPortalRow(row, title, group)),
    quality: row.hd === "1" || row.hd === 1 ? "HD" : "",
    epgId: row.xmltv_id || row.tvg_id || row.id || row.name,
    url: streamUrl,
    command,
    endpoint,
    logo: portalImageProxyUrl(stalkerArtwork(row, endpoint), client),
    format: inferStreamFormat(streamUrl, command)
  });
}

async function stalkerOrderedRowsForGenre(endpoint, client, token, genreId) {
  const rows = [];
  for (let page = 1; page <= 200; page += 1) {
    const data = await stalkerRequest(endpoint, {
      type: "itv",
      action: "get_ordered_list",
      genre: genreId,
      force_ch_link_check: "",
      fav: "0",
      sortby: "number",
      hd: "0",
      p: String(page),
      JsHttpRequest: "1-xml"
    }, client, token);
    const pageRows = portalRows(data);
    if (!pageRows.length) break;
    rows.push(...pageRows);
    const total = Number(data?.total_items || data?.total || data?.count || 0);
    if (total && rows.length >= total) break;
  }
  return rows;
}

async function stalkerGenreMap(endpoint, client, token) {
  const data = await stalkerRequest(endpoint, {
    type: "itv",
    action: "get_genres",
    JsHttpRequest: "1-xml"
  }, client, token);
  const rows = portalRows(data);
  const map = new Map();
  for (const row of rows) {
    const id = String(row.id || row.genre_id || row.category_id || "").trim();
    const title = stripHtml(row.title || row.name || row.genre_title || row.category || "").trim();
    if (!id || !title) continue;
    map.set(id, {
      id,
      title,
      adult: row.censored === "1" || row.censored === 1 || row.is_adult === "1" || row.is_adult === 1 || isAdultLabel(title)
    });
  }
  return map;
}

async function stalkerCreateLink(endpoint, client, token, command, mediaType = "itv", seriesEpisode = "") {
  return stalkerRequest(endpoint, {
    type: seriesEpisode ? "vod" : stalkerPortalMediaType(mediaType),
    action: "create_link",
    cmd: command,
    series: String(seriesEpisode || ""),
    forced_storage: "false",
    disable_ad: "0",
    download: "0",
    JsHttpRequest: "1-xml"
  }, client, token);
}

async function stalkerShortEpg(endpoint, client, token, channelId) {
  const id = String(channelId || "").trim();
  if (!id) return [];

  const attempts = [
    {
      type: "itv",
      action: "get_short_epg",
      ch_id: id,
      size: "12",
      JsHttpRequest: "1-xml"
    },
    {
      type: "itv",
      action: "get_epg_info",
      ch_id: id,
      period: "6",
      JsHttpRequest: "1-xml"
    }
  ];

  for (const params of attempts) {
    const data = await stalkerRequest(endpoint, params, client, token);
    const programs = normalizeStalkerPrograms(portalEpgRows(data));
    if (programs.length) return programs;
  }
  return [];
}

async function freshChannelStreamUrl(endpoint, client, token, body, command, directCandidates = []) {
  const wantedStream = streamIdFromUrl(body.url) || streamIdFromUrl(command) || directCandidates.map(streamIdFromUrl).find(Boolean);
  const wantedId = String(body.providerId || body.channelId || body.epgId || "").trim();
  const wantedTitle = normalizeText(body.title || "");
  if (!wantedStream && !wantedId && !wantedTitle) return null;

  const channels = await stalkerChannelList(endpoint, client, token);
  const match = channels.find((channel) => {
    const channelStream = streamIdFromUrl(channel.url) || streamIdFromUrl(channel.command);
    if (wantedStream && channelStream === wantedStream) return true;
    if (wantedId && String(channel.id || channel.epgId || "") === wantedId) return true;
    return wantedTitle && normalizeText(channel.title) === wantedTitle;
  });
  if (!match) return null;
  const url = extractStreamUrl(match.url || match.command, endpoint);
  return isUsableDirectStreamUrl(url) ? { url, command: match.command } : null;
}

async function stalkerRequest(endpoint, params, client, token = "") {
  const requestUrl = new URL(endpoint);
  Object.entries(params).forEach(([key, value]) => requestUrl.searchParams.set(key, value || ""));
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await safeFetch(requestUrl.href, { headers: macHeaders(client, token) });
      const text = await response.text();
      if (!response.ok) {
        if (response.status >= 500 && attempt < 2) { lastError = new Error(`Portal HTTP ${response.status}`); await sleep(250 * (attempt + 1)); continue; }
        throw new Error(`Portal HTTP ${response.status}`);
      }
      const payload = parsePortalJson(text);
      const data = payload?.js ?? payload;
      if (!data) throw new Error("Portal returned an empty response");
      return data;
    } catch (error) {
      lastError = error;
      const transient = /aborted|ECONNRESET|ETIMEDOUT|EAI_AGAIN|fetch failed|network|socket hang up/i.test(String(error?.message || ""));
      if (transient && attempt < 2) { await sleep(250 * (attempt + 1)); continue; }
      throw error;
    }
  }
  throw lastError || new Error("Portal request failed");
}

function parsePortalJson(text) {
  const cleaned = text.trim().replace(/^\/\*.*?\*\//s, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error(`Portal returned: ${cleaned.slice(0, 120)}`);
  }
}

function macHeaders(client, token = "") {
  const headers = {
    "User-Agent": client.userAgent,
    "X-User-Agent": `Model: ${client.model}; Link: Ethernet`,
    "Accept": "*/*",
    "Referer": client.portal,
    "Cookie": `mac=${client.mac}; stb_lang=en; timezone=${encodeURIComponent(client.timezone)}`
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function stalkerEndpoints(portal) {
  const input = new URL(portal);
  const pathName = input.pathname.replace(/\/+$/, "");
  const rootPath = pathName
    .replace(/\/c$/i, "")
    .replace(/\/portal\.php$/i, "")
    .replace(/\/server\/load\.php$/i, "");
  const base = `${input.origin}${rootPath}`;
  return unique([
    pathName.endsWith("/portal.php") ? `${input.origin}${pathName}` : "",
    pathName.endsWith("/server/load.php") ? `${input.origin}${pathName}` : "",
    `${base}/portal.php`,
    `${base}/server/load.php`,
    `${input.origin}/portal.php`,
    `${input.origin}/server/load.php`,
    `${input.origin}/stalker_portal/server/load.php`
  ].filter(Boolean));
}

function extractStreamUrl(command, endpoint) {
  const value = String(command || "").trim()
    .replace(/^ffmpeg\s+/i, "")
    .replace(/^ffrt\s+/i, "")
    .replace(/^auto\s+/i, "");
  const match = value.match(/https?:\/\/[^\s"']+/i);
  if (match) return normalizePortalStreamUrl(match[0], endpoint);
  if (value.startsWith("/")) return normalizePortalStreamUrl(value, endpoint);
  return "";
}

function normalizePortalStreamUrl(value, endpoint) {
  const portal = new URL(endpoint);
  const stream = new URL(value, portal.origin);
  if (["localhost", "127.0.0.1", "::1"].includes(stream.hostname)) {
    stream.protocol = portal.protocol;
    stream.host = portal.host;
  }
  return stream.href;
}

function stalkerArtwork(row, endpoint) {
  const value = row.logo
    || row.icon
    || row.stream_icon
    || row.tv_logo
    || row.tvg_logo
    || row.tvgLogo
    || row.image
    || row.img
    || row.thumbnail
    || row.picture
    || row.poster
    || row.screenshot_uri
    || row.cover
    || row.pic
    || "";
  return normalizeArtworkUrl(value, endpoint);
}

function normalizeArtworkUrl(value, endpoint) {
  const raw = String(value || "").trim();
  if (!raw || /^null$/i.test(raw)) return "";
  if (/^data:image\//i.test(raw)) return raw;
  try {
    const portal = new URL(endpoint);
    if (/^https?:\/\//i.test(raw)) return new URL(raw).href;
    if (raw.startsWith("//")) return `${portal.protocol}${raw}`;
    if (raw.startsWith("/")) return new URL(raw, portal.origin).href;
    return new URL(raw, portalAssetBase(endpoint)).href;
  } catch (error) {
    return "";
  }
}

function portalAssetBase(endpoint) {
  const url = new URL(endpoint);
  url.pathname = url.pathname
    .replace(/\/server\/load\.php$/i, "/")
    .replace(/\/portal\.php$/i, "/")
    .replace(/\/+$/, "/");
  url.search = "";
  url.hash = "";
  return url.href;
}

function portalImageProxyUrl(value, client) {
  if (!value || /^data:image\//i.test(value) || !client?.portal || !client?.mac) return value || "";
  return `/api/image?url=${encodeURIComponent(value)}&portal=${encodeURIComponent(client.portal)}&mac=${encodeURIComponent(client.mac)}`;
}

async function macClientFromAccount(account) {
  return {
    portal: account.portal,
    mac: normalizeMac(account.mac),
    serialNumber: account.serialNumber || "",
    deviceId: account.deviceId || "",
    deviceId2: account.deviceId2 || "",
    firmware: account.firmware || "",
    model: account.model || "MAG254",
    timezone: account.timezone || "UTC",
    userAgent: account.userAgent || defaultMacUserAgent(account.model || "MAG254"),
    portalVersion: await detectPortalVersion(account.portal)
  };
}

function stalkerCommandFromUrl(value = "") {
  if (!isSafeRemote(value)) return "";
  try {
    const parsed = new URL(value);
    if (/\/ch\/[^/]+_?$/i.test(parsed.pathname)) {
      return `ffmpeg http://localhost${parsed.pathname}`;
    }
  } catch (error) {
    return "";
  }
  return "";
}

function isStalkerPlaceholderUrl(value = "") {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return /\/ch\/[^/]+_?$/i.test(parsed.pathname);
  } catch (error) {
    return false;
  }
}

function isUsableDirectStreamUrl(value = "") {
  if (!isSafeRemote(value) || isStalkerPlaceholderUrl(value)) return false;
  try {
    const parsed = new URL(value);
    const hasEmptyStream = parsed.searchParams.has("stream") && !parsed.searchParams.get("stream");
    return !hasEmptyStream;
  } catch (error) {
    return false;
  }
}

async function probeStreamUrl(value, client) {
  if (!isUsableDirectStreamUrl(value)) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(value, {
      method: "GET",
      headers: mediaProbeHeaders(client),
      redirect: "follow",
      signal: controller.signal
    });
    response.body?.cancel?.().catch(() => null);
    if (!response.ok) return false;
    const contentType = response.headers.get("content-type") || "";
    return !/text\/html|application\/json|text\/plain/i.test(contentType);
  } catch (error) {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function mediaProbeHeaders(client) {
  return {
    "User-Agent": client.userAgent || defaultMacUserAgent(client.model || "MAG254"),
    "Cookie": `mac=${client.mac}; stb_lang=en; timezone=${encodeURIComponent(client.timezone || "UTC")}`,
    "Accept": "*/*",
    "Accept-Encoding": "identity",
    "Range": "bytes=0-188000"
  };
}

function streamIdFromUrl(value = "") {
  const url = extractStreamUrl(value, "http://placeholder.local/portal.php") || String(value || "");
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("stream") || "";
  } catch (error) {
    const match = url.match(/[?&]stream=([^&]+)/i);
    return match ? decodeURIComponent(match[1]) : "";
  }
}

function normalizeText(value = "") {
  return String(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function cleanPortalText(value = "") {
  return String(value || "").toLowerCase().replace(/[^a-z0-9+]+/g, " ").replace(/\s+/g, " ").trim();
}

function stalkerPortalMediaType(value = "") {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "movie" || normalized === "movies" || normalized === "vod") return "vod";
  if (normalized === "series" || normalized === "show" || normalized === "shows") return "series";
  return "itv";
}

function inferMediaQuality(value = "") {
  if (/4k|uhd/i.test(value)) return "4K";
  if (/fhd|1080/i.test(value)) return "FHD";
  if (/hd|720/i.test(value)) return "HD";
  return "SD";
}

function portalRows(data) {
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.channels)) return data.channels;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;
  return [];
}

function portalEpgRows(data) {
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.epg)) return data.epg;
  if (Array.isArray(data?.programs)) return data.programs;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;
  if (data?.data && typeof data.data === "object") return Object.values(data.data);
  if (data?.epg && typeof data.epg === "object") return Object.values(data.epg);
  return [];
}

function normalizeStalkerPrograms(rows) {
  const programs = [];
  for (const row of rows) {
    const program = normalizeStalkerProgram(row, programs[programs.length - 1]);
    if (program) programs.push(program);
  }
  return programs
    .sort((a, b) => a.start - b.start)
    .map((program, index, list) => ({
      ...program,
      end: program.end || list[index + 1]?.start || program.start + 30 * 60 * 1000
    }));
}

function normalizeStalkerProgram(row, previous = null) {
  if (!row || typeof row !== "object") return null;
  const title = stripHtml(row.name || row.title || row.program || row.pr_name || row.epg_name || "Program").trim();
  const description = stripHtml(row.descr || row.description || row.desc || row.info || "").trim();
  const start = portalProgramTime(
    row.start_timestamp || row.start_ts || row.t_start_timestamp || row.time_start || row.start || row.t_start || row.t_time || row.time,
    Date.now(),
    previous?.start || 0
  );
  let end = portalProgramTime(
    row.stop_timestamp || row.end_timestamp || row.stop_ts || row.t_stop_timestamp || row.time_end || row.end || row.t_end || row.t_time_to || row.time_to,
    Date.now(),
    start
  );
  const duration = Number(row.duration || row.dur || row.length || 0);
  if (!end && Number.isFinite(duration) && duration > 0) {
    end = start + duration * (duration > 1000 ? 1 : 60 * 1000);
  }
  if (!title || !start) return null;
  return {
    id: String(row.id || row.epg_id || `${start}-${title}`),
    title,
    description,
    start,
    end: end > start ? end : start + 30 * 60 * 1000
  };
}

function portalProgramTime(value, now = Date.now(), previousStart = 0) {
  if (value == null || value === "") return 0;
  const text = String(value).trim();
  if (/^\d+$/.test(text)) {
    const number = Number(text);
    if (!Number.isFinite(number) || number <= 0) return 0;
    return number > 100000000000 ? number : number * 1000;
  }
  const parsed = Date.parse(text.replace(" ", "T"));
  if (Number.isFinite(parsed)) return parsed;
  const time = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!time) return 0;
  const base = new Date(now);
  const date = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    Number(time[1]),
    Number(time[2]),
    Number(time[3] || 0),
    0
  );
  let ms = date.getTime();
  if (previousStart && ms <= previousStart - 12 * 60 * 60 * 1000) ms += 24 * 60 * 60 * 1000;
  return ms;
}

function isAdultPortalRow(row, title = "", group = "") {
  return row.censored === "1"
    || row.censored === 1
    || row.is_adult === "1"
    || row.is_adult === 1
    || isAdultLabel(`${title} ${group}`);
}

function isAdultLabel(value = "") {
  const text = String(value || "");
  if (!ADULT_LABEL_PATTERN.test(text)) return false;
  const withoutKnownFalsePositive = text.replace(ADULT_FALSE_POSITIVE_PATTERN, " ");
  return ADULT_LABEL_PATTERN.test(withoutKnownFalsePositive);
}

function inferStreamFormat(url = "", command = "") {
  const value = `${url} ${command}`.toLowerCase();
  if (/\.m3u8(?:$|[?#])|mpegurl/.test(value)) return "hls";
  if (/\.flv(?:$|[?#])|type=flv/.test(value)) return "flv";
  if (/\.m2ts(?:$|[?#])|\.ts(?:$|[?#])|extension=ts|video\/mp2t|\/live\/play\//.test(value)) return "mpegts";
  return "";
}

function defaultMacUserAgent(model) {
  return `Mozilla/5.0 (QtEmbedded; U; Linux; ${model}; en) AppleWebKit/533.3 (KHTML, like Gecko) MAG200 stbapp ver: 4 rev: 2721 Mobile Safari/533.3`;
}

function defaultMacFirmware(portalVersion = "5.7.0") {
  return `ImageDescription: 0.2.18-r23-254; ImageDate: Thu Sep 13 11:31:16 EEST 2018; PORTAL version: ${portalVersion}; API Version: JS API version: 343; STB API version: 146; Player Engine version: 0x58c`;
}

async function detectPortalVersion(portal) {
  const portalUrl = new URL(portal);
  const basePath = portalUrl.pathname.replace(/\/+$/, "").replace(/\/c$/i, "");
  const versionUrl = `${portalUrl.origin}${basePath}/c/version.js`;
  if (portalVersionCache.has(versionUrl)) return portalVersionCache.get(versionUrl);
  let version = "5.7.0";
  try {
    const response = await safeFetch(versionUrl, { timeoutMs: 6000 });
    const text = await response.text();
    const match = text.match(/ver\s*=\s*['"]([^'"]+)['"]/i);
    if (match) version = match[1];
  } catch (error) {
    version = "5.7.0";
  }
  portalVersionCache.set(versionUrl, version);
  return version;
}

function isPortalAuthError(error) {
  return /unauthorized|device auto add|old firmware|not valid|blocked|disabled/i.test(error?.message || "");
}

function capyAssistantPrompt(message) {
  return [
    "You are a compact ChatGPT-style assistant embedded in an IPTV web player.",
    "Answer directly in chat. Do not create tasks, pull requests, branches, files, or code changes unless the user explicitly asks for a coding task.",
    "",
    `User: ${message}`
  ].join("\n");
}

function capyThreadMessageBody(message) {
  return {
    message: capyAssistantPrompt(message),
    model: CAPY_MODEL,
    speed: "fast",
    reasoning: { mode: "low" }
  };
}

async function resolveCapyProjectId(requestedProjectId = "") {
  if (requestedProjectId) return requestedProjectId;
  if (process.env.CAPY_PROJECT_ID) return process.env.CAPY_PROJECT_ID;
  if (capyProjectCache?.id && Date.now() - capyProjectCache.at < 5 * 60 * 1000) {
    return capyProjectCache.id;
  }
  const data = await capyRequest("/projects?limit=1");
  const project = Array.isArray(data?.items) ? data.items[0] : null;
  if (!project?.id) throw new Error("Capy API token has no available projects");
  capyProjectCache = { id: project.id, at: Date.now() };
  return project.id;
}

async function waitForCapyReply(threadId, knownIds, maxWaitMs) {
  const known = new Set(knownIds);
  const started = Date.now();
  let messages = [];
  let thread = null;
  let reply = null;

  while (Date.now() - started < maxWaitMs) {
    [messages, thread] = await Promise.all([
      listCapyMessages(threadId),
      getCapyThread(threadId).catch(() => null)
    ]);
    reply = newestAssistantMessage(messages, known);
    if (reply) break;
    if (thread?.runState === "blocked" || thread?.runState === "ready") break;
    await sleep(2500);
  }

  return {
    messages,
    reply,
    status: thread?.runState || thread?.status || "",
    blockedOn: thread?.blockedOn || []
  };
}

async function listCapyMessages(threadId) {
  const data = await capyRequest(`/threads/${encodeURIComponent(threadId)}/messages?limit=100`);
  const messages = Array.isArray(data?.items) ? data.items : [];
  return messages
    .map((message) => ({
      id: String(message.id || ""),
      source: message.source === "user" ? "user" : "assistant",
      content: String(message.content || ""),
      createdAt: message.createdAt || new Date().toISOString()
    }))
    .filter((message) => message.id && message.content)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

async function getCapyThread(threadId) {
  return capyRequest(`/threads/${encodeURIComponent(threadId)}`);
}

function newestAssistantMessage(messages, known) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.source === "assistant" && !known.has(message.id)) return message;
  }
  return null;
}

async function capyRequest(pathname, options = {}) {
  const token = process.env.CAPY_API_KEY;
  if (!token) throw new Error("CAPY_API_KEY is not configured on the local server");
  const response = await fetch(`${CAPY_API_BASE}${pathname}`, {
    method: options.method || "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    redirect: "follow"
  });
  const text = await response.text();
  const data = parseJsonMaybe(text);
  if (!response.ok) {
    throw new Error(capyErrorMessage(data, text, response.status));
  }
  return data;
}

function capyErrorMessage(data, text, status) {
  return data?.error?.message || data?.message || text.trim().slice(0, 140) || `Capy HTTP ${status}`;
}

function parseJsonMaybe(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripHtml(value = "") {
  return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeMac(value = "") {
  const raw = String(value).replace(/[^a-f0-9]/gi, "").toUpperCase();
  if (raw.length !== 12) return "";
  return raw.match(/.{2}/g).join(":");
}

async function readJsonBody(req) {
  const text = (await readRawBody(req)).toString("utf8");
  return text ? JSON.parse(text) : {};
}

async function readRawBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) {
      const e = new Error("Request body too large");
      e.statusCode = 413;
      throw e;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function rewritePlaylist(text, baseUrl, origin) {
  return text.split(/\r?\n/).map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return line;
    if (trimmed.startsWith("#")) {
      return line.replace(/URI="([^"]+)"/g, (_, uri) => `URI="${proxyUrl(uri, baseUrl, origin)}"`);
    }
    return proxyUrl(trimmed, baseUrl, origin);
  }).join("\n");
}

function proxyUrl(value, baseUrl, origin) {
  const resolved = new URL(value, baseUrl).href;
  return `${origin}/proxy?url=${encodeURIComponent(resolved)}`;
}

function upstreamHeaders(req) {
  const headers = {
    "User-Agent": req.headers["user-agent"] || "SFVIP-Web-Player/1.0",
    "Accept": req.headers.accept || "*/*",
    "Accept-Encoding": "identity"
  };
  if (req.headers.range) headers.Range = req.headers.range;
  return headers;
}

function cacheControlForMedia(target, response) {
  const upstream = response.headers.get("cache-control");
  if (upstream && !/no-store/i.test(upstream)) return upstream;
  return /\.(m4s|ts|m2ts|aac|mp4)(?:$|[?#])/i.test(new URL(target).pathname)
    ? "public, max-age=30"
    : "no-store";
}

function unique(values) {
  return Array.from(new Set(values));
}

function isSafeRemote(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function memoryCacheKey(parts) {
  return parts.map((value) => String(value || "").trim()).join("\u001f");
}

function getMemoryCache(key) {
  const hit = macResponseCache.get(key);
  if (!hit) return null;
  if (hit.expires <= Date.now()) {
    macResponseCache.delete(key);
    return null;
  }
  return hit.value;
}

function setMemoryCache(key, value, ttlMs) {
  if (!key || !ttlMs) return;
  macResponseCache.set(key, { value, expires: Date.now() + ttlMs });
  pruneMemoryCache();
}

function pruneMemoryCache() {
  if (macResponseCache.size < 500) return;
  const now = Date.now();
  for (const [key, value] of macResponseCache) {
    if (value.expires <= now || macResponseCache.size > 420) macResponseCache.delete(key);
  }
}

function sendJson(res, body, status = 200, headers = {}) {
  // Same-origin app: no wildcard ACAO. Cross-origin allowed only via corsHeaders(req) on specific routes.
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers
  });
  res.end(JSON.stringify(body));
}

function sendCorsPreflight(req, res) {
  const allow = corsOrigin(req);
  res.writeHead(204, {
    ...(allow ? { "Access-Control-Allow-Origin": allow, "Vary": "Origin", "Access-Control-Allow-Credentials": "true" } : {}),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Range, Content-Type, Authorization",
    "Access-Control-Max-Age": "600"
  });
  res.end();
}

function notFound(res) {
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
}

function loadEnvFile(filename) {
  try {
    const text = fs.readFileSync(filename, "utf8");
    text.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const separator = trimmed.indexOf("=");
      if (separator < 1) return;
      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    });
  } catch {
    // Local configuration is optional until Stripe Checkout is enabled.
  }
}
