-- ImpoTech A-to-Z Site Control: canonical settings bridge + RLS hardening
-- Expected site_settings schema: key text PK, value jsonb, updated_at timestamptz
-- Run in Supabase SQL Editor AFTER the existing Admin migrations.

-- SECURITY DEFINER avoids admin_users RLS recursion and uses a fixed search path.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid()
      and coalesce(role, 'admin') in ('admin', 'owner')
  );
$$;

-- Public website reads public settings. Writes must be authenticated Admin only.
alter table public.site_settings enable row level security;
drop policy if exists "public read settings" on public.site_settings;
drop policy if exists "site_settings_public_read" on public.site_settings;
drop policy if exists "site_settings_anon_insert" on public.site_settings;
drop policy if exists "site_settings_anon_update" on public.site_settings;
drop policy if exists "admin all settings" on public.site_settings;
drop policy if exists "admin all site_settings" on public.site_settings;
create policy "site_settings_public_read_v2"
  on public.site_settings for select to anon, authenticated using (true);
create policy "site_settings_admin_insert_v2"
  on public.site_settings for insert to authenticated with check (public.is_admin());
create policy "site_settings_admin_update_v2"
  on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "site_settings_admin_delete_v2"
  on public.site_settings for delete to authenticated using (public.is_admin());

-- Remove policies that granted all authenticated users access to private tables.
-- Rebuild access: public may read active customer-facing FAQ/policy/campaign data;
-- only Admin accounts may manage or read operational/private records.

alter table public.returns enable row level security;
drop policy if exists returns_all_authenticated on public.returns;
drop policy if exists returns_admin_all_v2 on public.returns;
create policy returns_admin_all_v2 on public.returns for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.warranties enable row level security;
drop policy if exists warranties_all_authenticated on public.warranties;
drop policy if exists warranties_admin_all_v2 on public.warranties;
create policy warranties_admin_all_v2 on public.warranties for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.campaigns enable row level security;
drop policy if exists campaigns_all_authenticated on public.campaigns;
drop policy if exists campaigns_public_read_active_v2 on public.campaigns;
drop policy if exists campaigns_admin_all_v2 on public.campaigns;
create policy campaigns_public_read_active_v2 on public.campaigns for select to anon, authenticated
  using (status = 'active');
create policy campaigns_admin_all_v2 on public.campaigns for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.suppliers enable row level security;
drop policy if exists suppliers_all_authenticated on public.suppliers;
drop policy if exists suppliers_admin_all_v2 on public.suppliers;
create policy suppliers_admin_all_v2 on public.suppliers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.purchases enable row level security;
drop policy if exists purchases_all_authenticated on public.purchases;
drop policy if exists purchases_admin_all_v2 on public.purchases;
create policy purchases_admin_all_v2 on public.purchases for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.faqs enable row level security;
drop policy if exists faqs_all_authenticated on public.faqs;
drop policy if exists faqs_public_read_active_v2 on public.faqs;
drop policy if exists faqs_admin_all_v2 on public.faqs;
create policy faqs_public_read_active_v2 on public.faqs for select to anon, authenticated
  using (active = true);
create policy faqs_admin_all_v2 on public.faqs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.policies enable row level security;
drop policy if exists policies_all_authenticated on public.policies;
drop policy if exists policies_public_read_active_v2 on public.policies;
drop policy if exists policies_admin_all_v2 on public.policies;
create policy policies_public_read_active_v2 on public.policies for select to anon, authenticated
  using (active = true);
create policy policies_admin_all_v2 on public.policies for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.support_tickets enable row level security;
drop policy if exists support_tickets_all_authenticated on public.support_tickets;
drop policy if exists support_tickets_public_insert_v2 on public.support_tickets;
drop policy if exists support_tickets_admin_all_v2 on public.support_tickets;
create policy support_tickets_public_insert_v2 on public.support_tickets for insert to anon, authenticated
  with check (true);
create policy support_tickets_admin_all_v2 on public.support_tickets for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.vendors enable row level security;
drop policy if exists vendors_all_authenticated on public.vendors;
drop policy if exists vendors_admin_all_v2 on public.vendors;
create policy vendors_admin_all_v2 on public.vendors for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.warehouses enable row level security;
drop policy if exists warehouses_all_authenticated on public.warehouses;
drop policy if exists warehouses_admin_all_v2 on public.warehouses;
create policy warehouses_admin_all_v2 on public.warehouses for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.loyalty_points enable row level security;
drop policy if exists loyalty_points_all_authenticated on public.loyalty_points;
drop policy if exists loyalty_points_admin_all_v2 on public.loyalty_points;
create policy loyalty_points_admin_all_v2 on public.loyalty_points for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.integration_settings enable row level security;
drop policy if exists integration_settings_all_authenticated on public.integration_settings;
drop policy if exists integration_settings_admin_all_v2 on public.integration_settings;
create policy integration_settings_admin_all_v2 on public.integration_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Ensure settings key/value rows used by the bridge exist without overwriting.
insert into public.site_settings(key, value, updated_at)
values ('site', '{}'::jsonb, now()), ('identity', '{}'::jsonb, now()),
       ('checkout', '{}'::jsonb, now()), ('theme', '{}'::jsonb, now()),
       ('contact', '{}'::jsonb, now())
on conflict (key) do nothing;


-- Add site_settings to Supabase Realtime publication when available, so changes
-- from the separate Admin project refresh storefront config without a reload.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'site_settings'
     ) then
    execute 'alter publication supabase_realtime add table public.site_settings';
  end if;
end $$;

-- Verify after execution:
-- select key, updated_at from public.site_settings order by key;
-- select tablename, policyname, roles, cmd from pg_policies
--   where schemaname='public' and tablename in ('site_settings','faqs','policies','integration_settings');
