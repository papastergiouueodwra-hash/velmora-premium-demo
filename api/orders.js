const { neon } = require('@neondatabase/serverless');
const { json, sameOrigin } = require('../lib/auth');

function clean(value, max = 300) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }
  if (!sameOrigin(req)) return json(res, 403, { error: 'Invalid origin' });
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return json(res, 503, { error: 'Το CRM δεν έχει συνδεθεί ακόμη με τη βάση Neon.' });

  try {
    const body = req.body || {};
    const firstName = clean(body.firstName, 80);
    const lastName = clean(body.lastName, 80);
    const email = clean(body.email, 254).toLowerCase();
    const phone = clean(body.phone, 40);
    const address = clean(body.address, 200);
    const city = clean(body.city, 100);
    const postal = clean(body.postal, 20);
    const shipping = body.shipping === 'pickup' ? 'pickup' : 'standard';
    const payment = body.payment === 'cod' ? 'cod' : 'card';
    const items = Array.isArray(body.items) ? body.items.slice(0, 50).map(item => ({
      id: Number(item.id),
      name: clean(item.name, 120),
      quantity: Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1))),
      unit_price: Math.max(0, Math.min(10000, Number(item.unit_price) || 0))
    })) : [];

    if (!firstName || !lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !phone || !address || !city || !postal || !items.length ||
        items.some(item => !item.name || !Number.isFinite(item.unit_price))) {
      return json(res, 400, { error: 'Έλεγξε τα στοιχεία της παραγγελίας και προσπάθησε ξανά.' });
    }

    // Demo only: amounts are calculated server-side; no payment or shipment is initiated.
    const subtotal = Math.round(items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0) * 100) / 100;
    const shippingCost = shipping === 'pickup' ? 0 : 3;
    const total = Math.round((subtotal + shippingCost) * 100) / 100;
    const orderNumber = 'VM-DEMO-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const sql = neon(connectionString);
    await sql`INSERT INTO orders
      (order_number, customer_first_name, customer_last_name, email, phone, address, city, postal_code,
       shipping_method, payment_method, items, subtotal, shipping_cost, total, status, is_demo)
      VALUES (${orderNumber}, ${firstName}, ${lastName}, ${email}, ${phone}, ${address}, ${city}, ${postal},
       ${shipping}, ${payment}, ${JSON.stringify(items)}::jsonb, ${subtotal}, ${shippingCost}, ${total}, 'new', TRUE)`;
    return json(res, 201, { ok: true, orderNumber, total, shippingCost });
  } catch (error) {
    console.error('VELMORA Neon order insert failed:', error && error.message);
    return json(res, 500, { error: 'Δεν ήταν δυνατή η αποθήκευση της παραγγελίας. Δοκίμασε ξανά.' });
  }
};
