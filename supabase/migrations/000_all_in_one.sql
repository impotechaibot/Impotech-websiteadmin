-- ============================================================
-- Impotech Store — সম্পূর্ণ ডেটাবেস মাইগ্রেশন (একবারে সব)
-- 001_init + 002_features + 003_services + 004_integrations
-- একবারেই এক্সিকিউট করুন
-- ============================================================

-- >>>>>>>>>> ফাইল: 001_init.sql <<<<<<<<<<
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
create or replace function is_admin()
returns boolean language sql stable as $$
  select exists (select 1 from admin_users where id = auth.uid());
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
  ('checkout', '{"deliveryCharge":80,"freeDeliveryAbove":2000,"codEnabled":true,"bkashEnabled":true,"bkashNumber":"01884332067","nagadEnabled":true,"nagadNumber":"01884332067","rocketEnabled":false,"rocketNumber":"","paymentNote":"বিকাশ/নগদে টাকা পাঠিয়ে ট্রানজেকশন আইডি অর্ডার নোটে লিখুন।","confirmMessage":"ধন্যবাদ! আপনার অর্ডারটি আমরা পেয়েছি।"}'),
  ('background', '{"type":"color","color":"#08080a","image":"","overlay":45,"blur":0}')
on conflict (key) do nothing;

-- >>>>>>>>>> ফাইল: 002_features.sql <<<<<<<<<<
-- ============================================================
-- Impotech Store — admin app schema, migration 002
-- নতুন ৫টি ফিচারের জন্য টেবিল/কলাম
--   ১. একাধিক ভিডিও + ছবি (product_videos, product_images)
--   ২. ইনভয়েস (invoices)
--   ৩. কুরিয়ার এন্ট্রি (courier_shipments)
--   ৪. অ্যাডমিন রিভিউ (reviews টেবিলে নতুন কলাম)
--   ৫. ল্যান্ডিং পেজ (landing_pages)
-- ============================================================

-- ------------------------------------------------------------
-- ১. product_images — একাধিক ছবি, ক্রম অনুযায়ী
--    (products.images text[] আগেও ছিল; এই টেবিলটি রিলেশনাল
--     বিকল্প, যেখানে প্রতিটি ছবির আলাদা রেকর্ড ও ক্রম থাকে)
-- ------------------------------------------------------------
create table if not exists product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  url        text not null,
  alt        text default '',
  sort_order int  default 0,
  created_at timestamptz default now()
);
create index if not exists product_images_product_idx on product_images(product_id, sort_order);

-- ------------------------------------------------------------
-- ১. product_videos — একাধিক ভিডিও, থাম্বনেইল ও অটোপ্লে
-- ------------------------------------------------------------
create table if not exists product_videos (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  url        text not null,
  thumbnail  text default '',
  title      text default '',
  sort_order int  default 0,
  autoplay   boolean default false,
  created_at timestamptz default now()
);
create index if not exists product_videos_product_idx on product_videos(product_id, sort_order);

-- ------------------------------------------------------------
-- ২. invoices — অর্ডার প্লেস হলেই অটো তৈরি
-- ------------------------------------------------------------
create table if not exists invoices (
  id               uuid primary key default gen_random_uuid(),
  invoice_no       text unique not null,
  order_id         uuid references orders(id) on delete set null,
  order_code       text default '',
  customer_name    text default '',
  customer_phone   text default '',
  customer_address text default '',
  items            jsonb default '[]',
  subtotal         numeric default 0,
  shipping         numeric default 0,
  discount         numeric default 0,
  coupon_code      text default '',
  total            numeric default 0,
  payment_method   text default 'cod',
  status           text default 'issued',   -- issued | paid | cancelled
  note             text default '',
  issued_at        timestamptz default now(),
  created_at       timestamptz default now()
);
create index if not exists invoices_order_idx on invoices(order_id);
create index if not exists invoices_created_idx on invoices(created_at desc);

-- ------------------------------------------------------------
-- ৩. courier_shipments — এক ক্লিকে কুরিয়ারে এন্ট্রি
-- ------------------------------------------------------------
create table if not exists courier_shipments (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid references orders(id) on delete cascade,
  order_code       text default '',
  provider         text default 'steadfast',  -- pathao | steadfast | redx | manual
  consignment_id   text default '',
  tracking_code    text default '',
  status           text default 'pending',    -- pending | picked | in_transit | delivered | returned | cancelled
  recipient_name   text default '',
  recipient_phone  text default '',
  recipient_address text default '',
  cod_amount       numeric default 0,
  delivery_type    text default 'normal',     -- normal | express
  note             text default '',
  raw              jsonb default '{}',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
create index if not exists courier_order_idx on courier_shipments(order_id);
create index if not exists courier_status_idx on courier_shipments(status);

-- ------------------------------------------------------------
-- ৪. reviews — অ্যাডমিন থেকে যোগ/এডিট করার জন্য নতুন কলাম
-- ------------------------------------------------------------
alter table reviews add column if not exists customer_email text default '';
alter table reviews add column if not exists title          text default '';
alter table reviews add column if not exists source         text default 'admin';  -- admin | customer
alter table reviews add column if not exists updated_at     timestamptz default now();

-- ------------------------------------------------------------
-- ৫. landing_pages — যেকোনো পণ্যের আলাদা ল্যান্ডিং পেজ
-- ------------------------------------------------------------
create table if not exists landing_pages (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  product_id  uuid references products(id) on delete set null,
  hero        jsonb default '{}',   -- { headline, sub, image, cta, badge }
  features    jsonb default '[]',   -- [{ icon, title, text }]
  gallery     jsonb default '[]',   -- [url, ...]
  videos      jsonb default '[]',   -- [url, ...]
  reviews     jsonb default '[]',   -- [{ name, rating, text }]
  offer       jsonb default '{}',   -- { enabled, text, endsAt, discount }
  order_form  jsonb default '{}',   -- { enabled, fields, buttonText }
  seo         jsonb default '{}',   -- { title, description, ogImage }
  published   boolean default false,
  views       int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists landing_pages_slug_idx on landing_pages(slug);
create index if not exists landing_pages_published_idx on landing_pages(published);

-- ============================================================
-- Row Level Security — নতুন টেবিলগুলোর জন্য
-- ============================================================
alter table product_images    enable row level security;
alter table product_videos    enable row level security;
alter table invoices          enable row level security;
alter table courier_shipments enable row level security;
alter table landing_pages     enable row level security;

-- ---- public read (storefront) ----
create policy "public read product_images" on product_images
  for select using (true);
create policy "public read product_videos" on product_videos
  for select using (true);
create policy "public read published landing_pages" on landing_pages
  for select using (published = true);

-- ---- public insert (checkout → invoice, landing order form) ----
create policy "public insert invoices" on invoices
  for insert with check (true);

-- ---- admin full access ----
create policy "admin all product_images" on product_images
  for all using (is_admin()) with check (is_admin());
create policy "admin all product_videos" on product_videos
  for all using (is_admin()) with check (is_admin());
create policy "admin all invoices" on invoices
  for all using (is_admin()) with check (is_admin());
create policy "admin all courier_shipments" on courier_shipments
  for all using (is_admin()) with check (is_admin());
create policy "admin all landing_pages" on landing_pages
  for all using (is_admin()) with check (is_admin());

-- ============================================================
-- Seed: একটি নমুনা ল্যান্ডিং পেজ (ডেমো)
-- ============================================================
insert into landing_pages (slug, title, hero, features, offer, order_form, seo, published)
values (
  'angel-wings-offer',
  'অ্যাঞ্জেল উইংস LED — বিশেষ অফার',
  '{"headline":"অ্যাঞ্জেল উইংস LED","sub":"গাড়ি ও বাইকের জন্য প্রিমিয়াম LED লাইট","image":"","cta":"এখনই অর্ডার করুন","badge":"সীমিত স্টক"}',
  '[{"icon":"truck","title":"ফ্রি ডেলিভারি","text":"২০০০ টাকার উপরে"},{"icon":"shield","title":"৭ দিনের রিটার্ন","text":"শর্তসাপেক্ষে"},{"icon":"star","title":"অরিজিনাল পণ্য","text":"১০০% গ্যারান্টি"}]',
  '{"enabled":true,"text":"আজকের অফারে ৩০% ছাড়","endsAt":"","discount":30}',
  '{"enabled":true,"buttonText":"অর্ডার করুন"}',
  '{"title":"অ্যাঞ্জেল উইংস LED — বিশেষ অফার","description":"সীমিত সময়ের অফারে অ্যাঞ্জেল উইংস LED লাইট অর্ডার করুন।"}',
  true
)
on conflict (slug) do nothing;

-- >>>>>>>>>> ফাইল: 003_services.sql <<<<<<<<<<
-- ============================================================
-- Impotech Store — admin app schema, migration 003
-- নতুন ফিচার: সার্ভিস (services)
--   অ্যাডমিন থেকে সার্ভিস যোগ/এডিট/ডিলিট — বাংলা ফর্ম
--   (নাম, আইকন, বর্ণনা, মূল্য, সময়কাল, স্ট্যাটাস, ক্রম, SEO,
--    ছবি গ্যালারি, ভিডিও)
-- ============================================================

-- ------------------------------------------------------------
-- services — সাইটের সার্ভিসসমূহ
-- ------------------------------------------------------------
create table if not exists services (
  id               uuid primary key default gen_random_uuid(),
  name             text default '',            -- ইংরেজি নাম
  name_bn          text default '',            -- বাংলা নাম
  slug             text unique not null,       -- URL slug
  icon             text default '',            -- ইমোজি আইকন
  image            text default '',            -- আইকন ছবি (ঐচ্ছিক)
  short_desc       text default '',            -- সংক্ষিপ্ত বর্ণনা (বাংলা)
  description      text default '',            -- বিস্তারিত বর্ণনা
  price            numeric default 0,          -- মূল্য / চার্জ (০ = ফ্রি)
  duration         text default '',            -- সময়কাল / ডেলিভারি টাইম
  status           text default 'active',      -- active | inactive
  sort_order       int  default 0,             -- ক্রম (ছোট আগে)
  meta_title       text default '',            -- SEO মেটা টাইটেল
  meta_description text default '',            -- SEO মেটা ডেসক্রিপশন
  images           jsonb default '[]',         -- ছবি গ্যালারি [url, ...]
  videos           jsonb default '[]',         -- ভিডিও [url, ...]
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists services_slug_idx    on services(slug);
create index if not exists services_status_idx  on services(status);
create index if not exists services_order_idx   on services(sort_order);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table services enable row level security;

-- স্টোরফ্রন্টে শুধু সক্রিয় সার্ভিস পড়া যাবে
create policy "public read active services" on services
  for select using (status = 'active');

-- অ্যাডমিনের সম্পূর্ণ অ্যাক্সেস
create policy "admin all services" on services
  for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- Seed: নমুনা সার্ভিস (ডেমো)
-- ------------------------------------------------------------
insert into services (name, name_bn, slug, icon, short_desc, description, price, duration, status, sort_order, meta_title, meta_description)
values
  ('Home Delivery', 'হোম ডেলিভারি', 'home-delivery', '🚚',
   'সারা বাংলাদেশে দ্রুত হোম ডেলিভারি।',
   'আমরা সারা বাংলাদেশে ২–৪ কর্মদিবসের মধ্যে পণ্য পৌঁছে দিই। ঢাকার ভেতরে ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ৩–৫ দিন।',
   80, '২–৪ দিন', 'active', 0,
   'হোম ডেলিভারি — ইম্পোটেক', 'সারা বাংলাদেশে দ্রুত ও নিরাপদ হোম ডেলিভারি সার্ভিস।'),
  ('Installation Service', 'ইনস্টলেশন সার্ভিস', 'installation-service', '🔧',
   'পণ্য কেনার সাথে ফ্রি ইনস্টলেশন।',
   'LED লাইট, হর্ন বা যেকোনো অ্যাকসেসরির প্রফেশনাল ইনস্টলেশন। ঢাকার ভেতরে ফ্রি, ঢাকার বাইরে চার্জ প্রযোজ্য।',
   0, '১ দিন', 'active', 1,
   'ইনস্টলেশন সার্ভিস — ইম্পোটেক', 'প্রফেশনাল ইনস্টলেশন সার্ভিস, ঢাকার ভেতরে ফ্রি।'),
  ('Warranty & Replacement', 'ওয়ারেন্টি ও রিপ্লেসমেন্ট', 'warranty-replacement', '🛡️',
   '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি।',
   'পণ্য পাওয়ার ৭ দিনের মধ্যে কোনো সমস্যা থাকলে বিনামূল্যে রিপ্লেসমেন্ট। শর্তসাপেক্ষে ৩০ দিনের ওয়ারেন্টি সুবিধা।',
   0, '৭ দিন', 'active', 2,
   'ওয়ারেন্টি ও রিপ্লেসমেন্ট — ইম্পোটেক', '৭ দিনের রিপ্লেসমেন্ট ও ৩০ দিনের ওয়ারেন্টি সুবিধা।'),
  ('Cash on Delivery', 'ক্যাশ অন ডেলিভারি', 'cash-on-delivery', '💵',
   'পণ্য হাতে পেয়ে টাকা দিন।',
   'সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা। পণ্য হাতে পেয়ে দেখে নিয়ে তারপর পেমেন্ট করুন।',
   0, 'সাথে সাথে', 'active', 3,
   'ক্যাশ অন ডেলিভারি — ইম্পোটেক', 'পণ্য হাতে পেয়ে টাকা পরিশোধের সুবিধা।'),
  ('Bulk / Wholesale Order', 'বাল্ক / পাইকারি অর্ডার', 'bulk-wholesale-order', '📦',
   'পাইকারি দামে বাল্ক অর্ডার।',
   'দোকানদার ও রিসেলারদের জন্য বিশেষ পাইকারি দাম। ১০ পিসের বেশি অর্ডারে অতিরিক্ত ছাড়।',
   0, '৩–৭ দিন', 'inactive', 4,
   'বাল্ক / পাইকারি অর্ডার — ইম্পোটেক', 'রিসেলারদের জন্য বিশেষ পাইকারি দাম ও বাল্ক অর্ডার সুবিধা।')
on conflict (slug) do nothing;

-- >>>>>>>>>> ফাইল: 004_integrations.sql <<<<<<<<<<
-- ============================================================
-- Impotech Store — admin app schema, migration 004
-- ই-কমার্স সার্ভিস এক্সপ্যানশন: নতুন ১২টি টেবিল
--   • returns           — রিটার্ন ও রিফান্ড
--   • warranties        — ওয়ারেন্টি
--   • campaigns         — ক্যাম্পেইন
--   • suppliers         — সাপ্লায়ার
--   • purchases         — পারচেজ (ক্রয়)
--   • faqs              — সাধারণ প্রশ্নোত্তর
--   • policies          — পলিসি পেজ
--   • support_tickets   — কাস্টমার সাপোর্ট / লাইভ চ্যাট
--   • vendors           — মাল্টি-ভেন্ডর
--   • warehouses        — মাল্টি-ওয়্যারহাউস
--   • loyalty_points    — লয়্যালটি পয়েন্ট লেজার
--   • integration_settings — থার্ড-পার্টি সার্ভিস কনফিগ
-- ============================================================

-- ------------------------------------------------------------
-- 1. returns — রিটার্ন ও রিফান্ড
-- ------------------------------------------------------------
create table if not exists returns (
  id              uuid primary key default gen_random_uuid(),
  return_code     text default '',
  order_id        uuid references orders(id) on delete set null,
  order_code      text default '',
  customer_name   text default '',
  customer_phone  text default '',
  product_name    text default '',
  qty             int  default 1,
  amount          numeric default 0,
  reason          text default '',
  status          text default 'requested',  -- requested | approved | received | refunded | rejected
  refund_method   text default 'bkash',      -- bkash | nagad | rocket | bank | store_credit
  refund_ref      text default '',
  note            text default '',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists returns_status_idx on returns(status);
create index if not exists returns_order_idx on returns(order_id);

-- ------------------------------------------------------------
-- 2. warranties — ওয়ারেন্টি
-- ------------------------------------------------------------
create table if not exists warranties (
  id                  uuid primary key default gen_random_uuid(),
  warranty_code       text default '',
  order_id            uuid references orders(id) on delete set null,
  order_code          text default '',
  customer_name       text default '',
  customer_phone      text default '',
  product_name        text default '',
  serial_no           text default '',
  duration_days       int  default 30,
  start_date          date,
  status              text default 'active',  -- active | claimed | expired | void
  claim_note          text default '',
  replacement_product text default '',
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
create index if not exists warranties_status_idx on warranties(status);
create index if not exists warranties_order_idx on warranties(order_id);

-- ------------------------------------------------------------
-- 3. campaigns — ক্যাম্পেইন
-- ------------------------------------------------------------
create table if not exists campaigns (
  id              uuid primary key default gen_random_uuid(),
  name            text not null default '',
  code            text default '',
  description     text default '',
  discount_type   text default 'percent',   -- percent | fixed
  discount_value  numeric default 0,
  min_order       numeric default 0,
  start_date      date,
  end_date        date,
  banner_text     text default '',
  status          text default 'active',    -- active | paused | ended
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists campaigns_status_idx on campaigns(status);

-- ------------------------------------------------------------
-- 4. suppliers — সাপ্লায়ার
-- ------------------------------------------------------------
create table if not exists suppliers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null default '',
  company       text default '',
  phone         text default '',
  email         text default '',
  address       text default '',
  country       text default 'China',
  payment_terms text default '',
  due_amount    numeric default 0,
  note          text default '',
  active        boolean default true,
  created_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- 5. purchases — পারচেজ (ক্রয়)
-- ------------------------------------------------------------
create table if not exists purchases (
  id             uuid primary key default gen_random_uuid(),
  purchase_code  text default '',
  supplier_name  text default '',
  product_name   text default '',
  qty            int  default 1,
  unit_cost      numeric default 0,
  total_cost     numeric default 0,
  paid_amount    numeric default 0,
  purchase_date  date,
  status         text default 'ordered',   -- draft | ordered | received | cancelled
  note           text default '',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
create index if not exists purchases_status_idx on purchases(status);

-- ------------------------------------------------------------
-- 6. faqs — সাধারণ প্রশ্নোত্তর
-- ------------------------------------------------------------
create table if not exists faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null default '',
  answer     text default '',
  category   text default 'order',  -- order | delivery | payment | return | product | other
  sort_order int  default 0,
  active     boolean default true,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 7. policies — পলিসি পেজ
-- ------------------------------------------------------------
create table if not exists policies (
  id               uuid primary key default gen_random_uuid(),
  title            text not null default '',
  slug             text unique not null default '',
  type             text default 'other',   -- return | refund | privacy | terms | shipping | warranty | other
  body             text default '',
  meta_title       text default '',
  meta_description text default '',
  active           boolean default true,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ------------------------------------------------------------
-- 8. support_tickets — কাস্টমার সাপোর্ট / লাইভ চ্যাট
-- ------------------------------------------------------------
create table if not exists support_tickets (
  id             uuid primary key default gen_random_uuid(),
  customer_name  text default '',
  customer_phone text default '',
  subject        text default '',
  status         text default 'open',   -- open | pending | closed
  messages       jsonb default '[]',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
create index if not exists support_tickets_status_idx on support_tickets(status);

-- ------------------------------------------------------------
-- 9. vendors — মাল্টি-ভেন্ডর
-- ------------------------------------------------------------
create table if not exists vendors (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default '',
  owner      text default '',
  phone      text default '',
  email      text default '',
  address    text default '',
  commission numeric default 10,
  active     boolean default true,
  note       text default '',
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 10. warehouses — মাল্টি-ওয়্যারহাউস
-- ------------------------------------------------------------
create table if not exists warehouses (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default '',
  code       text default '',
  address    text default '',
  phone      text default '',
  manager    text default '',
  active     boolean default true,
  note       text default '',
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 11. loyalty_points — লয়্যালটি পয়েন্ট লেজার
-- ------------------------------------------------------------
create table if not exists loyalty_points (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  customer_name text default '',
  points      int  default 0,        -- ধনাত্মক = পান, ঋণাত্মক = খরচ
  type        text default 'earn',    -- earn | redeem | adjust | expire
  ref         text default '',        -- order_code / invoice_no
  note        text default '',
  created_at  timestamptz default now()
);
create index if not exists loyalty_points_customer_idx on loyalty_points(customer_id);

-- ------------------------------------------------------------
-- 12. integration_settings — থার্ড-পার্টি সার্ভিস কনফিগ
--    (কৌশলে key/value আকারে: group|provider → jsonb config)
-- ------------------------------------------------------------
create table if not exists integration_settings (
  id         uuid primary key default gen_random_uuid(),
  group_key  text not null default '',   -- payment | courier | sms | analytics | marketing
  provider   text not null default '',   -- bkash | pathao | ga4 | ...
  config     jsonb default '{}',
  updated_at timestamptz default now(),
  unique (group_key, provider)
);

-- ------------------------------------------------------------
-- RLS policies — demo থেকে live-এ যাওয়ার সময় এগুলো চালু করুন
-- (advisable: সাপ্লায়ার/ভেন্ডর/পারচেজ শুধু অ্যাডমিন অ্যাক্সেস)
-- ------------------------------------------------------------
alter table returns    enable row level security;
alter table warranties enable row level security;
alter table campaigns  enable row level security;
alter table suppliers  enable row level security;
alter table purchases  enable row level security;
alter table faqs       enable row level security;
alter table policies   enable row level security;
alter table support_tickets enable row level security;
alter table vendors    enable row level security;
alter table warehouses enable row level security;
alter table loyalty_points enable row level security;
alter table integration_settings enable row level security;

-- পলিসি ফাংশন: 'admin' রোল বা authenticated হলে সব পড়তে/লিখতে পারে
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'returns' and policyname = 'returns_all_authenticated') then
    create policy returns_all_authenticated on returns for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'warranties' and policyname = 'warranties_all_authenticated') then
    create policy warranties_all_authenticated on warranties for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'campaigns' and policyname = 'campaigns_all_authenticated') then
    create policy campaigns_all_authenticated on campaigns for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'suppliers' and policyname = 'suppliers_all_authenticated') then
    create policy suppliers_all_authenticated on suppliers for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'purchases' and policyname = 'purchases_all_authenticated') then
    create policy purchases_all_authenticated on purchases for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'faqs' and policyname = 'faqs_all_authenticated') then
    create policy faqs_all_authenticated on faqs for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'policies' and policyname = 'policies_all_authenticated') then
    create policy policies_all_authenticated on policies for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'support_tickets' and policyname = 'support_tickets_all_authenticated') then
    create policy support_tickets_all_authenticated on support_tickets for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'vendors' and policyname = 'vendors_all_authenticated') then
    create policy vendors_all_authenticated on vendors for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'warehouses' and policyname = 'warehouses_all_authenticated') then
    create policy warehouses_all_authenticated on warehouses for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'loyalty_points' and policyname = 'loyalty_points_all_authenticated') then
    create policy loyalty_points_all_authenticated on loyalty_points for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'integration_settings' and policyname = 'integration_settings_all_authenticated') then
    create policy integration_settings_all_authenticated on integration_settings for all to authenticated using (true) with check (true);
  end if;
end $$;

