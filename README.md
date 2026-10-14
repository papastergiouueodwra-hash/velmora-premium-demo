# VELMORA — ELåiVA premium e-shop concept

A responsive, single-page storefront in Greek. The brand, catalogue, prices and review quotes are fictional and intended for demonstration.

## Storefront features
- Responsive premium storefront and category filters
- Product detail modals, demo shopping bag and quantity controls
- Guided scent consultant demo
- Demo checkout with no real payment processing
- Demo orders saved to Neon PostgreSQL for CRM administration

## VELMORA CRM
- Private dashboard at `/admin.html`
- Admin login using a server-side password and signed, HttpOnly session cookie
- Orders list, search, status management and demo order totals
- Vercel serverless API routes under `/api`
- Database schema in `neon-schema.sql`
- Database credentials are used only by server-side API routes and must never be added to client-side code.

## Connect Neon to Vercel
1. Create a Neon project at https://console.neon.tech/.
2. Open the Neon project and choose **Connect**. Select the correct branch, database and role. Copy the **pooled** connection string (host normally includes `-pooler`).
3. Open the Vercel project for this repository, then **Settings → Environment Variables**. Add:
   - `DATABASE_URL` — the pooled Neon PostgreSQL connection string
   - `VELMORA_ADMIN_PASSWORD` — a strong, unique CRM login password
   - `VELMORA_SESSION_SECRET` — a long random secret of at least 32 random bytes
4. Keep these values private. Never commit them to GitHub or put them in `index.html`.
5. In the Neon SQL Editor, run the complete contents of `neon-schema.sql`.
6. Save the environment variables and redeploy the Vercel project.

Neon recommends a pooled connection for ordinary serverless request traffic. See https://neon.com/docs/get-started/connect-neon and https://vercel.com/marketplace/neon/neon.

## Test the CRM
1. Open `/admin.html` on the deployed Vercel site and log in with `VELMORA_ADMIN_PASSWORD`.
2. Place a demo order through the storefront.
3. Confirm that it appears in the CRM and test changing its status.
4. Confirm the order confirmation clearly says that no payment or shipment occurred.

## Important limitations
- This is a demo store. There is no real payment processing, fulfillment, shipping, or transactional email.
- Prices and totals are recorded for demonstration only and should not be treated as verified commerce records.
- Before public launch, add rate limiting/bot protection, privacy notice/retention procedures and appropriate production security review.
- Do not present fictional reviews, products or prices as real customer information.
- Replace demo images with properly licensed, product-specific photos before commercial use.

## Deploy on Vercel
The project is a static HTML storefront plus Vercel Node.js API routes. Import `papastergiouueodwra-hash/velmora-premium-demo` from GitHub, use the default Vercel settings, configure the environment variables above, and deploy.

Demo concept by ELåiVA.
