# VELMORA — ELåiVA premium e-shop concept

A responsive, single-page storefront concept in Greek. The brand, products, prices and review quotes are fictional and intended only for demonstration.

## Storefront features
- Responsive premium storefront and category filters
- Product detail modals, demo shopping bag and quantity controls
- Interactive scent consultant demo with guided preference, use-case and budget questions
- Product recommendations ranked from the current demo catalogue and availability
- Demo checkout with no real payment processing
- Demo orders are stored in the connected Supabase database for CRM administration

## VELMORA CRM
- Private dashboard at `/admin.html`
- Admin login using a server-side password and signed, HttpOnly session cookie
- Orders list, search, status management and demo order totals
- Serverless API routes under `/api`
- Database schema in `supabase-schema.sql`
- Supabase secret key is used only in server-side Vercel functions; it must never be added to `index.html` or any client-side JavaScript
- The orders table has Row Level Security enabled and no public access policies. The API uses a server-only database secret.

## Setup the database
1. Create a Supabase project.
2. Open **SQL Editor** in Supabase.
3. Run the complete contents of `supabase-schema.sql`.
4. In **Project Settings → API Keys**, copy the project URL and a server-only secret key. Prefer the new `sb_secret_...` key if available. Never use that secret key in browser code or share it in chat.

## Connect Vercel environment variables
Open the Vercel project for this repository, then **Settings → Environment Variables**. Add these values for Production (and Preview if you want to test preview deployments):

- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_SECRET_KEY` — the server-only Supabase secret key (or use `SUPABASE_SERVICE_ROLE_KEY` if the project only has the legacy service-role key)
- `VELMORA_ADMIN_PASSWORD` — a strong, unique CRM login password
- `VELMORA_SESSION_SECRET` — a long random secret used to sign admin sessions (at least 32 random bytes)

Save the variables and redeploy the Vercel project. Do not commit any real keys or passwords to GitHub.

## Test the CRM
1. Open `/admin.html` on the deployed Vercel site and log in with `VELMORA_ADMIN_PASSWORD`.
2. Place a demo order through the storefront.
3. Confirm that it appears in the CRM and test changing its status.
4. Confirm the order confirmation clearly says that no payment or shipment occurred.

## Important limitations
- This is still a demo store. There is no real payment processing, fulfillment, shipping, or transactional email.
- Order totals and item prices are recorded for demonstration and are not a source of truth for a real commerce operation.
- The public demo-order endpoint should be protected with rate limiting/bot protection before being exposed to substantial public traffic.
- Do not present the fictional reviews, products or prices as real customer information.
- Replace demo images with properly licensed, product-specific photos before any commercial use.

## Deploy on Vercel
The project is a static HTML storefront plus Vercel Node.js API routes. Import `papastergiouueodwra-hash/velmora-premium-demo` from GitHub, use the default Vercel settings, configure the environment variables above, and deploy.

Demo concept by ELåiVA.
