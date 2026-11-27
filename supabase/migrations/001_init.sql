-- ============================================================
-- Impotech Store — admin app schema
-- ============================================================

-- ---------- categories ----------
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  name_bn     text default '',
  image       text default '',
  sort_order  int  default 0,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- ---------- products ----------
create table if not exists products (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  name_bn        text default '',
  slug           text unique,
  category_id    uuid references categories(id) on delete set null,
  price          numeric not null default 0,
  old_price      numeric default 0,
  stock          int default 0,
  description    text default '',
  images         text[] default '{}',
  videos         text[] default '{}',
  video_autoplay boolean default false,
  badge          text default '',
  tag            text default '',
  rating         numeric default 0,
  reviews_count  int default 0,
  colors         text[] default '{}',
  features       text[] default '{}',
  featured       boolean default false,
  active         boolean default true,
  created_at     timestamptz default now()
);
create index if not exists products_category_idx on products(category_id);
create index if not exists products_active_idx on products(active);

-- ---------- orders ----------
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  order_code       text unique not null,
  customer_name    text not null,
  customer_phone   text not null,
  customer_address text default '',
  items            jsonb default '[]',
  subtotal         numeric default 0,
  shipping         numeric default 0,
  discount         numeric default 0,
  coupon_code      text default '',
  total            numeric default 0,
  payment_method   text default 'cod',
  status           text default 'new',
  note             text default '',
  created_at       timestamptz default now()
);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_idx on orders(created_at desc);

-- ---------- coupons ----------
create table if not exists coupons (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  type       text default 'percent',   -- percent | fixed
  value      numeric default 0,
  min_order  numeric default 0,
  expires_at date,
  active     boolean default true,
  note       text default '',
  created_at timestamptz default now()
);

-- ---------- reviews ----------
create table if not exists reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid references products(id) on delete cascade,
  customer_name text default 'অতিথি',
  rating        int default 5,
  text          text default '',
  status        text default 'pending',  -- pending | approved
  created_at    timestamptz default now()
);

-- ---------- customers ----------
create table if not exists customers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  phone        text unique,
  email        text default '',
  address      text default '',
  total_orders int default 0,
  total_spent  numeric default 0,
  created_at   timestamptz default now()
);

-- ---------- site_settings (key/value) ----------
create table if not exists site_settings (
  key        text primary key,
  value      jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- ---------- admin_users ----------
create table if not exists admin_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text default 'admin',
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table categories    enable row level security;
alter table products      enable row level security;
alter table orders        enable row level security;
alter table coupons       enable row level security;
alter table reviews       enable row level security;
alter table customers     enable row level security;
alter table site_settings enable row level security;
alter table admin_users   enable row level security;

-- helper: is the caller an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where id = auth.uid() and coalesce(role, 'admin') in ('admin', 'owner'));
$$;

-- ---- public read (storefront) ----
create policy "public read categories" on categories
  for select using (active = true);
create policy "public read products" on products
  for select using (active = true);
create policy "public read settings" on site_settings
  for select using (true);
create policy "public read approved reviews" on reviews
  for select using (status = 'approved');

-- ---- public insert (checkout / review submit) ----
create policy "public insert orders" on orders
  for insert with check (true);
create policy "public insert reviews" on reviews
  for insert with check (true);

-- ---- admin full access ----
create policy "admin all categories" on categories
  for all using (is_admin()) with check (is_admin());
create policy "admin all products" on products
  for all using (is_admin()) with check (is_admin());
create policy "admin all orders" on orders
  for all using (is_admin()) with check (is_admin());
create policy "admin all coupons" on coupons
  for all using (is_admin()) with check (is_admin());
create policy "admin all reviews" on reviews
  for all using (is_admin()) with check (is_admin());
create policy "admin all customers" on customers
  for all using (is_admin()) with check (is_admin());
create policy "admin all settings" on site_settings
  for all using (is_admin()) with check (is_admin());
create policy "admin read admins" on admin_users
  for select using (is_admin());

-- ============================================================
-- Storage bucket for product media
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

create policy "public read media" on storage.objects
  for select using (bucket_id = 'product-media');
create policy "admin upload media" on storage.objects
  for insert with check (bucket_id = 'product-media' and is_admin());
create policy "admin update media" on storage.objects
  for update using (bucket_id = 'product-media' and is_admin());
create policy "admin delete media" on storage.objects
  for delete using (bucket_id = 'product-media' and is_admin());

-- ============================================================
-- Seed: default categories + settings
-- ============================================================
insert into categories (name, name_bn, sort_order) values
  ('Angel Wings', 'অ্যাঞ্জেল উইংস', 0),
  ('LED Light', 'LED লাইট', 1),
  ('Bike Accessories', 'বাইক অ্যাকসেসরিজ', 2),
  ('Riding Gear', 'রাইডিং গিয়ার', 3),
  ('Horn & Siren', 'হর্ন ও সাইরেন', 4),
  ('Phone Holder', 'মোবাইল হোল্ডার', 5)
on conflict do nothing;

insert into site_settings (key, value) values
  ('identity', '{"siteName":"ইম্পোটেক","siteNameEn":"IMPOTECH","tagline":"চায়না থেকে সরাসরি আমদানি — প্রিমিয়াম বাইক অ্যাক্সেসরিজ","logo":"","favicon":"","copyright":"© {year} ইম্পোটেক — সর্বস্বত্ব সংরক্ষিত।"}'),
  ('theme', '{"accent":"#f0b429","accentDark":"#c9920f","fontScale":100,"radius":18,"mode":"dark"}'),
  ('contact', '{"phone":"01884332067","email":"support@impotech.com.bd","address":"ঢাকা, বাংলাদেশ","hours":"সকাল ১০টা — রাত ১০টা","whatsapp":"01884332067","facebook":"","instagram":"","youtube":"","tiktok":""}'),
  ('checkout', '{"deliveryCharge":80,"outsideDeliveryCharge":130,"freeDeliveryAbove":2000,"codEnabled":true,"bkashEnabled":true,"bkashNumber":"01884332067","nagadEnabled":true,"nagadNumber":"01884332067","rocketEnabled":false,"rocketNumber":"","paymentNote":"বিকাশ/নগদে টাকা পাঠিয়ে ট্রানজেকশন আইডি অর্ডার নোটে লিখুন।","confirmMessage":"ধন্যবাদ! আপনার অর্ডারটি আমরা পেয়েছি।"}'),
  ('background', '{"type":"color","color":"#08080a","image":"","overlay":45,"blur":0}')
on conflict (key) do nothing;
