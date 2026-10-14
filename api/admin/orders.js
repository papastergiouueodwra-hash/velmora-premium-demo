const { neon } = require('@neondatabase/serverless');
const { json, isAdmin } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'Method not allowed' });
  }
  if (!isAdmin(req)) return json(res, 401, { error: 'Χρειάζεται σύνδεση διαχειριστή.' });
  if (!process.env.DATABASE_URL) return json(res, 503, { error: 'Δεν έχει ρυθμιστεί η σύνδεση με τη βάση Neon.' });
  try {
    const sql = neon(process.env.DATABASE_URL);
    const orders = await sql`SELECT id, order_number, customer_first_name, customer_last_name, email, phone,
      address, city, postal_code, shipping_method, payment_method, items, subtotal, shipping_cost, total,
      status, is_demo, created_at FROM orders ORDER BY created_at DESC LIMIT 500`;
    return json(res, 200, { orders });
  } catch (error) {
    console.error('VELMORA Neon orders read failed:', error && error.message);
    return json(res, 500, { error: 'Δεν ήταν δυνατή η φόρτωση των παραγγελιών.' });
  }
};
