const { json, isAdmin } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'Method not allowed' });
  }
  if (!isAdmin(req)) return json(res, 401, { error: 'Χρειάζεται σύνδεση διαχειριστή.' });
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return json(res, 503, { error: 'Δεν έχει ρυθμιστεί η βάση δεδομένων.' });
  try {
    const url = supabaseUrl.replace(/\/$/, '') + '/rest/v1/orders?select=*&order=created_at.desc&limit=500';
    const upstream = await fetch(url, { headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey } });
    if (!upstream.ok) {
      console.error('VELMORA orders fetch failed:', upstream.status, (await upstream.text()).slice(0, 300));
      return json(res, 502, { error: 'Δεν ήταν δυνατή η φόρτωση των παραγγελιών.' });
    }
    return json(res, 200, { orders: await upstream.json() });
  } catch (error) {
    console.error('VELMORA orders read error:', error && error.message);
    return json(res, 500, { error: 'Παρουσιάστηκε σφάλμα κατά τη φόρτωση.' });
  }
};
