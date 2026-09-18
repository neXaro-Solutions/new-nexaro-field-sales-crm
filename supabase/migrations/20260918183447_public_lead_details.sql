-- Match the existing production intake schema on fresh installations.
-- Additive and idempotent; does not modify existing customer records or policies.
alter table public.public_leads
  add column if not exists sumup_provider text,
  add column if not exists sumup_volume text,
  add column if not exists sumup_transactions text,
  add column if not exists sumup_goal text,
  add column if not exists vape_supplier text,
  add column if not exists vape_quantity text,
  add column if not exists vape_products text,
  add column if not exists vape_goal text;
