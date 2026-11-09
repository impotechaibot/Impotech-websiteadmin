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
