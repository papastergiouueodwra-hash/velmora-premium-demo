const { json, isAdmin, sameOrigin } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return json(res, 405, { error: 'Method not allowed' });
  }
  if (!sameOrigin(req)) return json(res, 403, { error: 'Invalid origin' });
  if (!isAdmin(req)) return json(res, 401, { error: 'Χρειάζεται σύνδεση διαχειριστή.' });
  const id = String(req.body && req.body.id || '');
  const status = String(req.body && req.body.status || '');
  if (!/^[0-9a-f-]{36}$/i.test(id) || !['new','processing','completed','cancelled'].includes(status)) {
    return json(res, 400, { error: 'Μη έγκυρη παραγγελία ή κατάσταση.' });
  }
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return json(res, 503, { error: 'Δεν έχει ρυθμιστεί η βάση δεδομένων.' });
  try {
    const url = supabaseUrl.replace(/\/$/, '') + '/rest/v1/orders?id=eq.' + encodeURIComponent(id);
    const upstream = await fetch(url, {
      method: 'PATCH',
      headers: {
        apikey: supabaseKey,
        Authorization: 'Bearer ' + supabaseKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ status })
    });
    if (!upstream.ok) {
      console.error('VELMORA order update failed:', upstream.status, (await upstream.text()).slice(0, 300));
      return json(res, 502, { error: 'Δεν ήταν δυνατή η ενημέρωση της παραγγελίας.' });
    }
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('VELMORA order update error:', error && error.message);
    return json(res, 500, { error: 'Παρουσιάστηκε σφάλμα κατά την ενημέρωση.' });
  }
};
