const { neon } = require('@neondatabase/serverless');
const { json, isAdmin, sameOrigin } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return json(res, 405, { error: 'Method not allowed' });
  }
  if (!sameOrigin(req)) return json(res, 403, { error: 'Invalid origin' });
  if (!isAdmin(req)) return json(res, 401, { error: 'Χρειάζεται σύνδεση διαχειριστή.' });
  const id = String(req.body && req.body.id || '');
  const status = String(req.body && req.body.status || '');
  if (!/^[0-9a-f-]{36}$/i.test(id) || !['new', 'processing', 'completed', 'cancelled'].includes(status)) {
    return json(res, 400, { error: 'Μη έγκυρη παραγγελία ή κατάσταση.' });
  }
  if (!process.env.DATABASE_URL) return json(res, 503, { error: 'Δεν έχει ρυθμιστεί η σύνδεση με τη βάση Neon.' });
  try {
    const sql = neon(process.env.DATABASE_URL);
    const updated = await sql`UPDATE orders SET status = ${status} WHERE id = ${id}::uuid RETURNING id`;
    if (!updated.length) return json(res, 404, { error: 'Δεν βρέθηκε η παραγγελία.' });
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('VELMORA Neon order update failed:', error && error.message);
    return json(res, 500, { error: 'Δεν ήταν δυνατή η ενημέρωση της παραγγελίας.' });
  }
};
