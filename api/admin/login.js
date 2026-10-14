const { json, setSession, sameOrigin, safeEqual } = require('../../lib/auth');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }
  if (!sameOrigin(req)) return json(res, 403, { error: 'Invalid origin' });
  const password = process.env.VELMORA_ADMIN_PASSWORD;
  const secret = process.env.VELMORA_SESSION_SECRET;
  if (!password || !secret) return json(res, 503, { error: 'Ρύθμισε τα στοιχεία σύνδεσης του CRM στο Vercel.' });
  if (!safeEqual(req.body && req.body.password, password)) {
    return json(res, 401, { error: 'Λάθος κωδικός πρόσβασης.' });
  }
  setSession(res);
  return json(res, 200, { ok: true });
};
