const { json, clearSession, sameOrigin } = require('../../lib/auth');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }
  if (!sameOrigin(req)) return json(res, 403, { error: 'Invalid origin' });
  clearSession(res);
  return json(res, 200, { ok: true });
};
