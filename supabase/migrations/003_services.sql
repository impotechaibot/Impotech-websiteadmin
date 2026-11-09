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
