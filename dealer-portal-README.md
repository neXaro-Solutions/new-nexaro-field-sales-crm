# neXaro B2B Dealer Portal

This repository's main CRM remains internal. Dealer users must never authenticate into the internal CRM.

The dealer portal is a separate application using the Supabase project `neXaro B2B CRM` as its backend.

## Architecture
- Internal CRM: dealer administration only.
- Dealer portal: separate URL/application and separate authentication flow.
- Supabase Auth: dealer login.
- `public.dealers`: dealer profile and 15–25% margin.
- `public.vape_products`: central product data; EK is backend-only.
- `public.orders` / `public.order_items`: dealer orders.
- Row Level Security: dealer sees only their own profile/orders and active products.

## Dealer lifecycle
1. Create dealer in internal CRM.
2. Set individual Vape margin (15–25%).
3. Activate dealer.
4. Sync dealer record to Supabase through the protected `sync-dealer` Edge Function.
5. Provision/invite the Supabase Auth user separately; never store passwords in CRM or GitHub.
6. Dealer signs into the separate portal only.

The existing internal CRM dashboard must remain the default entry point.