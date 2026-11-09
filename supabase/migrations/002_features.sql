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
