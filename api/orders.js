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

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return json(res, 503, { error: 'Το CRM δεν έχει συνδεθεί ακόμη με τη βάση δεδομένων.' });
  }

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

    // This is a demo checkout. Amounts are recorded for CRM demonstration only;
    // no payment is collected and no shipment is created.
    const subtotal = Math.round(items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0) * 100) / 100;
    const shippingCost = shipping === 'pickup' ? 0 : 3;
    const total = Math.round((subtotal + shippingCost) * 100) / 100;
    const orderNumber = 'VM-DEMO-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const record = {
      order_number: orderNumber,
      customer_first_name: firstName,
      customer_last_name: lastName,
      email, phone, address, city, postal_code: postal,
      shipping_method: shipping,
      payment_method: payment,
      items, subtotal, shipping_cost: shippingCost, total,
      status: 'new',
      is_demo: true
    };

    const endpoint = supabaseUrl.replace(/\/$/, '') + '/rest/v1/orders';
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: 'Bearer ' + supabaseKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(record)
    });
    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error('VELMORA order insert failed:', upstream.status, detail.slice(0, 300));
      return json(res, 502, { error: 'Δεν ήταν δυνατή η αποθήκευση της παραγγελίας. Δοκίμασε ξανά.' });
    }
    return json(res, 201, { ok: true, orderNumber, total, shippingCost });
  } catch (error) {
    console.error('VELMORA order API error:', error && error.message);
    return json(res, 500, { error: 'Παρουσιάστηκε σφάλμα. Δοκίμασε ξανά.' });
  }
};
