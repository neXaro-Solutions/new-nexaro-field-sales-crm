-- neXaro Solutions · public QR lead intake
-- Run this migration in the Supabase SQL editor.

create table if not exists public.public_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null default 'QR-Code Flyer',
  first_name text not null,
  last_name text not null,
  company text,
  position text,
  email text not null,
  phone text,
  industry text,
  city text,
  interest jsonb not null default '[]'::jsonb,
  requirement text,
  message text,
  consent boolean not null default false,
  status text not null default 'neu'
);

alter table public.public_leads enable row level security;

revoke all on table public.public_leads from anon, authenticated;
grant insert on table public.public_leads to anon;
grant select, insert, update, delete on table public.public_leads to authenticated;

drop policy if exists public_create_leads on public.public_leads;
create policy public_create_leads
  on public.public_leads
  for insert
  to anon
  with check (consent = true);

-- Internal CRM users can manage the table through their authenticated role.
drop policy if exists authenticated_manage_leads on public.public_leads;
create policy authenticated_manage_leads
  on public.public_leads
  for all
  to authenticated
  using (true)
  with check (true);

create index if not exists public_leads_created_at_idx on public.public_leads (created_at desc);
create index if not exists public_leads_email_idx on public.public_leads (lower(email));
