const crypto = require('crypto');

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function sign(value) {
  return crypto.createHmac('sha256', process.env.VELMORA_SESSION_SECRET || '')
    .update(value).digest('hex');
}

function isAdmin(req) {
  const secret = process.env.VELMORA_SESSION_SECRET;
  if (!secret) return false;
  const cookies = String(req.headers.cookie || '').split(';').map(v => v.trim());
  const raw = cookies.find(v => v.startsWith('velmora_admin='));
  if (!raw) return false;
  const token = decodeURIComponent(raw.slice('velmora_admin='.length));
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const expiry = Number(parts[0]);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;
  return safeEqual(parts[1], sign(parts[0]));
}

function setSession(res) {
  const expiry = String(Date.now() + 8 * 60 * 60 * 1000);
  const token = expiry + '.' + sign(expiry);
  res.setHeader('Set-Cookie', 'velmora_admin=' + encodeURIComponent(token) + '; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=28800');
}

function clearSession(res) {
  res.setHeader('Set-Cookie', 'velmora_admin=; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=0');
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
    return parsed.host === host;
  } catch (_) {
    return false;
  }
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

module.exports = { isAdmin, setSession, clearSession, sameOrigin, json, safeEqual };
