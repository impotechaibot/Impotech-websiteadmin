# ইম্পোটেক অ্যাডমিন অ্যাপ

ইম্পোটেক স্টোরের জন্য সম্পূর্ণ অ্যাডমিন প্যানেল — **React + Vite + Tailwind + Supabase**।
এই অ্যাপ থেকে সাইটের প্রোডাক্ট, ক্যাটাগরি, অর্ডার, ইনভয়েস, কুরিয়ার, কুপন, রিভিউ, কাস্টমার,
ল্যান্ডিং পেজ, সাইট সেটিংস, হোম কনটেন্ট, থিম, কনটেন্ট পেজ, SEO — সব কিছু নিয়ন্ত্রণ করা যায়।

> **নতুন (এই ভার্সনে):** একাধিক ভিডিও ও ছবি গ্যালারি, অটো ইনভয়েস + প্রিন্ট/PDF,
> এক ক্লিকে কুরিয়ারে এন্ট্রি, অ্যাডমিন থেকে রিভিউ যোগ/এডিট, আর যেকোনো পণ্যের ল্যান্ডিং পেজ।

---

## ০. দ্রুত শুরু (ডেমো মোড — Supabase ছাড়াই)

**Supabase কনফিগার না করেই অ্যাপ সাথে সাথে চালানো যায়।** `.env` ফাইলে আসল
Supabase URL/key না থাকলে অ্যাপ স্বয়ংক্রিয়ভাবে **ডেমো মোডে** চলে:

- সব ডেটা (প্রোডাক্ট, ক্যাটাগরি, অর্ডার, ইনভয়েস, কুরিয়ার, কুপন, রিভিউ, কাস্টমার, ল্যান্ডিং পেজ, সেটিংস)
  ব্রাউজারের `localStorage`-এ রাখা হয় — রিলোডের পরও টিকে থাকে
- লগইনে **যেকোনো ইমেইল/পাসওয়ার্ড** দিলেই ঢোকা যায় (ডিফল্ট আগেই বসানো থাকে)
- ছবি/ভিডিও আপলোড ডেমো মোডে data URL হিসেবে সেভ হয় (প্রতি ফাইল ৩MB-এর কম রাখুন)
- কুরিয়ার API key না থাকলে **ডেমো/ম্যানুয়াল মোডে** নমুনা কনসাইমেন্ট আইডি তৈরি হয়
- উপরের ডান কোণে **"ডেমো মোড"** ব্যাজ দেখাবে

```bash
npm install
npm run dev      # http://localhost:5174
```

পরে Supabase যোগ করলে (নিচের ধাপ ২–৪) অ্যাপ স্বয়ংক্রিয়ভাবে আসল ডেটাবেসে চলে যাবে —
**কোড বদলাতে হবে না।**

---

## ১. প্রজেক্টে কী আছে

| মডিউল | ফাইল | কাজ |
|------|------|-----|
| লগইন | `src/pages/Login.jsx` | Supabase Auth (ইমেইল/পাসওয়ার্ড), protected route |
| ড্যাশবোর্ড | `src/pages/Dashboard.jsx` | সেলস/অর্ডার/স্টক সামারি কার্ড + ৩০ দিনের বিক্রয় চার্ট |
| প্রোডাক্ট | `src/pages/Products.jsx` | লিস্ট, সার্চ, ফিল্টার, add/edit drawer, **একাধিক ছবি ও ভিডিও আপলোড (রিঅর্ডার)** |
| ক্যাটাগরি | `src/pages/Categories.jsx` | CRUD, ক্রম বদলানো, প্রোডাক্ট সংখ্যা |
| অর্ডার | `src/pages/Orders.jsx` | লিস্ট, স্ট্যাটাস বদলানো, ডিটেইল, **ইনভয়েস প্রিন্ট**, **এক ক্লিকে কুরিয়ারে এন্ট্রি** |
| ইনভয়েস | `src/pages/Invoices.jsx` | সব ইনভয়েসের লিস্ট, প্রিন্ট/PDF ডাউনলোড |
| কুরিয়ার | `src/pages/Courier.jsx` | কনসাইমেন্ট লিস্ট, ট্র্যাকিং, স্ট্যাটাস আপডেট, ডেমো/ম্যানুয়াল মোড |
| ল্যান্ডিং পেজ | `src/pages/LandingPages.jsx` | যেকোনো পণ্যের জন্য আলাদা ল্যান্ডিং পেজ বিল্ডার (নিজস্ব URL) |
| কুপন | `src/pages/Coupons.jsx` | পার্সেন্ট/ফিক্সড ছাড়, ন্যূনতম অর্ডার, মেয়াদ |
| রিভিউ | `src/pages/Reviews.jsx` | **যোগ/এডিট/ডিলিট**, অনুমোদন, রেটিং, কাস্টমার নাম |
| কাস্টমার | `src/pages/Customers.jsx` | লিস্ট, মোট অর্ডার ও খরচ |
| সাইট সেটিংস | `src/pages/SiteSettings.jsx` | লোগো, ফেভিকন, নাম, ট্যাগলাইন, যোগাযোগ, সোশ্যাল লিংক |
| হোম কনটেন্ট | `src/pages/HomeContent.jsx` | হিরো স্লাইড, ব্যানার, সার্ভিস কার্ড, নিউজলেটার |
| থিম | `src/pages/ThemeSettings.jsx` | অ্যাকসেন্ট কালার, ফন্ট স্কেল, radius, ডার্ক/লাইট, ব্যাকগ্রাউন্ড |
| কনটেন্ট পেজ | `src/pages/ContentPages.jsx` | About, Privacy, Terms, Return, FAQ |
| SEO | `src/pages/SeoSettings.jsx` | প্রতি পেজের টাইটেল, মেটা ডেসক্রিপশন, OG ইমেজ |
| অ্যানালিটিক্স | `src/pages/Analytics.jsx` | টপ প্রোডাক্ট, ক্যাটাগরি চার্ট, রেভিনিউ |
| AI অ্যাসিস্ট্যান্ট | `src/pages/AiAssistant.jsx` | Gemini API দিয়ে মার্কেটিং কনটেন্ট |
| ব্যাকআপ | `src/pages/Backup.jsx` | পুরো ডেটা JSON এক্সপোর্ট/ইমপোর্ট, সব রিসেট |
| **আপডেট** | `src/pages/Update.jsx` | **ZIP আপলোড করলেই অটো-আপডেট** — ব্যাকআপ, স্কিমা প্রয়োগ, লগ, রিস্টোর |

---

## ২. নতুন ৬টি ফিচার (বিস্তারিত)

### ১) একাধিক ভিডিও আপলোড ও সরাসরি প্লে
- **অ্যাডমিন:** `src/components/VideoUploader.jsx` — একাধিক ভিডিও আপলোড, ড্র্যাগ করে রিঅর্ডার,
  যেকোনো একটা **প্রধান ভিডিও** সেট করা যায়। প্রোডাক্ট ফর্মে (`Products.jsx`) যুক্ত।
- **ওয়েবসাইট:** প্রোডাক্ট ডিটেইল পেজে গ্যালারি/থাম্বনেইল সহ প্লে হয় — muted অটো-প্লে + সাউন্ড বাটন।

### ২) একাধিক ছবি (গ্যালারি)
- **অ্যাডমিন:** `src/components/ImageUploader.jsx` — একাধিক ছবি আপলোড + রিঅর্ডার।
- **ওয়েবসাইট:** থাম্বনেইল গ্যালারি + জুম।

### ৩) অর্ডার করলে অটো ইনভয়েস
- অর্ডার প্লেস করলেই ইনভয়েস জেনারেট হয় (অর্ডার নম্বর, তারিখ, কাস্টমার, আইটেম, দাম,
  ডিসকাউন্ট, ডেলিভারি চার্জ, টোটাল)।
- **অ্যাডমিন:** `src/lib/invoice.js` (জেনারেটর), `src/pages/Invoices.jsx` (লিস্ট + প্রিন্ট/PDF),
  `src/pages/Orders.jsx`-এ প্রিন্ট বাটন।
- **PDF:** ব্রাউজারের প্রিন্ট ডায়ালগ → **Save as PDF**।

### ৪) এক ক্লিকে কুরিয়ারে এন্ট্রি
- **অ্যাডমিন:** `src/lib/courier.js` (Pathao/Steadfast/RedX অ্যাডাপ্টার), `src/pages/Courier.jsx`,
  `src/pages/Orders.jsx`-এ "কুরিয়ারে পাঠান" বাটন।
- কনসাইমেন্ট আইডি/ট্র্যাকিং নম্বর সেভ হয়, স্ট্যাটাস আপডেট হয়।
- **API key না থাকলে ডেমো/ম্যানুয়াল মোডে** নমুনা আইডি তৈরি হয় — কোনো ক্র্যাশ নেই।

### ৫) অ্যাডমিন থেকে রিভিউ যোগ/এডিট/ডিলিট
- **অ্যাডমিন:** `src/pages/Reviews.jsx` — কাস্টমার নাম, রেটিং, কমেন্ট, তারিখ, অ্যাপ্রুভড স্ট্যাটাস।
- শুধু অনুমোদিত (`approved`) রিভিউ স্টোরফ্রন্টে দেখায়।

### ৬) যেকোনো পণ্যের ল্যান্ডিং পেজ
- **অ্যাডমিন:** `src/pages/LandingPages.jsx` — হিরো, ফিচার, গ্যালারি, ভিডিও, রিভিউ,
  অর্ডার ফর্ম, কাউন্টডাউন/অফার সহ পেজ বিল্ডার।
- প্রতিটা পেজের **নিজস্ব URL**: `/lp/{slug}`। অ্যাডমিন থেকে লিংক কপি করা যায়।

---

## ২.১. সর্বশেষ দুটি নতুন ফিচার (বিস্তারিত)

### ১) সার্ভিস (বাংলা ফর্ম)
অ্যাডমিন থেকে সরাসরি সাইটের সার্ভিসসমূহ যোগ/এডিট/ডিলিট করা যায় — পুরো ফর্ম বাংলায়।

- **পেজ:** `src/pages/Services.jsx` (সাইডবারে **সার্ভিস** মেনু, রুট `/services`)
- **ডেটা লেয়ার:** `src/services/services.js`
- **ডেমো ডেটা:** `src/lib/localdb.js`-এ `services` টেবিল + ৫টি নমুনা সার্ভিস
- **SQL:** `supabase/migrations/003_services.sql` (services টেবিল + RLS + seed)

**ফর্মে যা যা আছে:** সার্ভিসের নাম (বাংলা + ইংরেজি), আইকন (ইমোজি বা ছবি আপলোড),
সংক্ষিপ্ত বর্ণনা (বাংলা), বিস্তারিত বর্ণনা, মূল্য/চার্জ (ঐচ্ছিক, ০ = ফ্রি),
সময়কাল/ডেলিভারি টাইম, স্ট্যাটাস (সক্রিয়/নিষ্ক্রিয়), ক্রম, SEO (slug, মেটা টাইটেল,
মেটা ডেসক্রিপশন), ছবি গ্যালারি (একাধিক + রিঅর্ডার), ভিডিও (একাধিক + রিঅর্ডার)।

**লিস্ট পেজে:** সার্চ, স্ট্যাটাস ফিল্টার, পেজিনেশন (প্রতি পেজে ৮টি)।

### ২) অটো-আপডেট (ZIP আপলোড)
অ্যাডমিন অ্যাপের ভেতরে একটি **আপডেট** পেজ — শুধু একটি ZIP ফাইল আপলোড করলেই
অ্যাপ নিজে থেকে কোড, ফিচার ও ডেটা স্কিমা আপডেট করে নেয়। কোনো কমান্ড চালাতে হয় না।

- **পেজ:** `src/pages/Update.jsx` (সাইডবারে **আপডেট** মেনু, রুট `/update`)
- **ইঞ্জিন:** `src/lib/updater.js` (JSZip দিয়ে ZIP পার্স)
- **ডিপেন্ডেন্সি:** `jszip` (package.json-এ যোগ করা)

**আপডেট প্রক্রিয়া (স্বয়ংক্রিয়):**
1. **ব্যাকআপ** — বর্তমান ডেটা + সেটিংস সংরক্ষণ
2. **ZIP পার্স** — সোর্স কোড, `supabase/migrations/*.sql`, `seed.json`, `impotech-update.json`
3. **ডেটা স্কিমা প্রয়োগ** — নতুন টেবিল/কলাম সাথে সাথে যোগ হয়
4. **কোড স্টেজ** — নতুন কোড ফাইল সংরক্ষিত (পরের রিলিজে কার্যকর)
5. **লগ** — প্রতিটি ধাপের লগ বাংলায়, সফল/ব্যর্থ মেসেজসহ

**ZIP-এর ভেতরে থাকতে পারে:**
- `impotech-update.json` (ঐচ্ছিক manifest): `{ "version": "1.1.0", "name": "...", "features": ["..."], "tables": { "services": [...] } }`
- `supabase/migrations/00X_*.sql` — নতুন টেবিল/কলাম
- `seed.json` — `{ "services": [ {...} ] }` আকারে নতুন ডেটা
- যেকোনো সোর্স ফাইল (`.jsx`, `.js`, `.css`, `.html`)

**ডেমো মোডে** (Supabase ছাড়া) সবকিছু localStorage-এ কাজ করে; **Supabase থাকলে**
আপডেট-লগ ও স্কিমা-ভার্সন ডেটাবেসেও সিঙ্ক হয়। ব্যাকআপ থেকে যেকোনো সময় ফিরিয়ে আনা যায়।

---

## ৩. সেটআপ

### ধাপ ১ — ডিপেন্ডেন্সি ইনস্টল

```bash
npm install
```

### ধাপ ২ — `.env` ফাইল

```bash
cp .env.example .env
```

তারপর `.env`-এ বসান:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
VITE_GEMINI_API_KEY=AIzaSy....
VITE_SITE_URL=https://impotech.sellsull.com
```

> `.env` না বানালেও অ্যাপ ডেমো মোডে চলবে।

### ধাপ ৩ — Supabase প্রজেক্ট

1. [supabase.com](https://supabase.com)-এ নতুন প্রজেক্ট খুলুন
2. বাম মেনু → **SQL Editor** → **New query**
3. `supabase/migrations/001_init.sql` ফাইলের পুরো কনটেন্ট পেস্ট করে **Run** চাপুন
   (এতে ৮টি টেবিল, RLS policy, Storage bucket ও seed data তৈরি হবে)
4. এরপর `supabase/migrations/002_features.sql` ফাইলের পুরো কনটেন্ট পেস্ট করে **Run** চাপুন
   (এতে নতুন ৫টি টেবিল তৈরি হবে: `product_images`, `product_videos`, `invoices`,
   `courier_shipments`, `landing_pages` — সাথে RLS policy, Storage bucket ও ট্রিগার)
5. **Authentication → Users → Add user** দিয়ে অ্যাডমিন অ্যাকাউন্ট বানান (ইমেইল + পাসওয়ার্ড)
6. সেই ইউজারের UUID কপি করে SQL Editor-এ চালান:

```sql
insert into admin_users (id, email) values ('<user-uuid>', '<email>');
```

7. **Project Settings → API** থেকে `URL` ও `anon key` নিয়ে `.env`-এ বসান

### ধাপ ৪ — Storage bucket

`001_init.sql` চালালেই `product-media` নামে পাবলিক bucket তৈরি হয়ে যাবে।
না হলে **Storage → New bucket** → নাম `product-media`, **Public** টিক দিন।

### ধাপ ৫ — চালান

```bash
npm run dev      # http://localhost:5174
```

---

## ৪. বিল্ড ও ডিপ্লয়

```bash
npm run build    # dist/ ফোল্ডার তৈরি হবে
npm run preview  # লোকাল প্রোডাকশন বিল্ড দেখুন
```

**Vercel-এ ডিপ্লয়:**
1. [vercel.com](https://vercel.com) → **Add New → Project** → Git রিপো ইমপোর্ট করুন
2. Framework: **Vite**, Build Command: `npm run build`, Output: `dist`
3. **Environment Variables**-এ `.env`-এর চারটি ভেরিয়েবল যোগ করুন
4. **Deploy** চাপুন

**Netlify:** Build command `npm run build`, Publish directory `dist`।

---

## ৫. লাইভ সাইটের সাথে কানেকশন

বর্তমান স্টোরফ্রন্ট (v3) সব ডেটা `localStorage`-এ রাখে। Supabase-এ যেতে হলে
শুধু `src/hooks/` ফোল্ডারের ফাইলগুলো বদলাতে হবে — কম্পোনেন্ট/পেজ অপরিবর্তিত থাকবে,
কারণ সব কম্পোনেন্ট হুক থেকেই ডেটা নেয়। বিস্তারিত: `docs/impotech-admin-app-guide.md` → পার্ট ৪।

---

## ৬. Firebase ব্যবহার করতে চাইলে

Supabase-এর বদলে Firebase চাইলে শুধু `src/lib/` ও `src/services/` বদলাতে হবে —
UI অপরিবর্তিত থাকবে। উদাহরণ কোড: `docs/firebase-adapter/` ফোল্ডারে।

```bash
npm install firebase
```

> ⚠️ Firebase-এ ছবি/ভিডিও আপলোড করতে **Blaze প্ল্যান** (কার্ড লাগবে) দরকার।
> Supabase-এ ১ GB ফ্রি।

---

## ৭. ফোল্ডার স্ট্রাকচার

```
impotech-admin-app/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── README.md
├── docs/                     # গাইড + AI Studio প্রম্পট + Firebase অ্যাডাপ্টার
├── supabase/
│   └── migrations/
│       ├── 001_init.sql      # ৮টি টেবিল, RLS, bucket, seed
│       ├── 002_features.sql  # নতুন ৫টি টেবিল (ভিডিও/ছবি/ইনভয়েস/কুরিয়ার/ল্যান্ডিং)
│       └── 003_services.sql  # services টেবিল (সার্ভিস), RLS, seed
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── lib/                  # supabase.js, localdb.js (ডেমো DB), gemini.js, format.js,
    │                         # invoice.js, courier.js
    ├── context/              # AuthContext.jsx
    ├── hooks/                # ডেটা ফেচিং হুক
    ├── components/           # Layout, Sidebar, DataTable, Drawer, Modal,
    │                         # ImageUploader, VideoUploader, ...
    ├── services/             # products, categories, orders, coupons, reviews,
    │                         # customers, settings, storage, invoices, courier, landingPages
    └── pages/                # ১৯টি পেজ
```

---

## ৮. নিরাপত্তা নোট

- **`service_role` key** কখনো ফ্রন্টএন্ডে রাখবেন না — সব RLS বাইপাস করে
- শুধু `anon key` ব্যবহার করুন; অ্যাডমিন অ্যাক্সেস RLS-এর `is_admin()` ফাংশন দিয়ে নিয়ন্ত্রিত
- কুরিয়ার API key ব্রাউজারে রাখবেন না — `VITE_COURIER_API_BASE`-এ একটা প্রক্সি সার্ভার দিন
- Supabase ফ্রি প্রজেক্ট ১ সপ্তাহ নিষ্ক্রিয় থাকলে pause হয়

---

# 📦 GitHub → Vercel অটো-ডিপ্লয় (এই ভার্সনে নতুন)

## স্ক্রিনশটের এরর — কারণ ও সমাধান

| এরর | কারণ | সমাধান |
|------|------|--------|
| ❌ নেটওয়ার্ক এরর: Failed to fetch | (১) রিপো পাবলিক নয়/টোকেন নেই, (২) রিপোতে ফাইলই নেই, (৩) ব্রাউজার থেকে GitHub API-তে CORS ব্লক | রিপো পাবলিক করুন বা PAT দিন; অথবা ZIP থেকে ফাইল আপলোড করুন |
| ⚠️ মোট ০ টি ফাইল সফল, ৪ টি ফাইল এরর | উপরের Failed to fetch-এর ফল — কিছুই পড়া যায়নি | আগের এরর ঠিক করলেই সমাধান |
| root/index.html, root/vercel.json, root/package.json, root/data.json | ফাইলগুলো খুঁজে পাওয়া যায়নি — রিপোর রুটে থাকতে হবে | ফাইলগুলো রিপোর রুটে রাখুন, সাব-ফোল্ডারে নয় |
| Vercel-এ 404 | SPA rewrite নেই | vercel.json-এ rewrites নিয়ম আছে (এই প্রজেক্টে দেওয়া) |
| Command "npm run build" exited with 1 | node_modules কমিট হয়েছে / lockfile নেই / Node ভার্সন পুরনো | .gitignore ঠিক রাখুন; Vercel Node 20.x; Redeploy |

**মূল কথা:** অ্যাডমিনের ভেতরের "Sync" ব্রাউজার থেকে GitHub-এ লিখতে চায় —
ব্রাউজার নিরাপত্তায় এটা সবসময় কাজ করে না। **নির্ভরযোগ্য পথ: ZIP → GitHub আপলোড → Vercel অটো-ডিপ্লয়।**

## GitHub-এ আপলোড

```bash
cd impotech-admin
git init
git add .
git commit -m "Impotech Admin — full features"
git branch -M main
git remote add origin https://github.com/USERNAME/impotech-admin.git
git push -u origin main
```

## Vercel-এ ডিপ্লয় (UI দিয়ে — সবচেয়ে সহজ)

1. [vercel.com/new](https://vercel.com/new) → GitHub Login
2. রিপো সিলেক্ট করুন → Framework: **Vite** (vercel.json থেকে অটো আসবে)
3. Environment Variables বসান (`.env.example` থেকে) — Supabase না থাকলে খালি রাখলেই ডেমো মোড চলবে
4. **Deploy** → ১–২ মিনিটে লাইভ

এরপর GitHub-এ যেকোনো push করলেই Vercel নিজে থেকে নতুন ভার্সন ডিপ্লয় করবে।

## GitHub Actions অটো-ডিপ্লয় (ঐচ্ছিক)

`.github/workflows/deploy.yml` ফাইলটা আগেই দেওয়া। ব্যবহার করতে:

1. Vercel → **Account → Settings → Tokens** → নতুন Token (vercel_token)
2. Vercel → প্রজেক্ট → **Settings → General** → project/org ID কপি করুন
3. GitHub রিপো → **Settings → Secrets and variables → Actions** → ৩টি সিক্রেট:
   - `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`
4. main-এ push করলেই Actions নিজে ডিপ্লয় করবে

---

# 🆕 এই ভার্সনে নতুন — ই-কমার্স সার্ভিস স্যুট

বাংলাদেশের ই-কমার্স সাইটের (Daraz, Chaldal, impotech.shop) স্ট্যান্ডার্ড সার্ভিসগুলো
যোগ হলো — সব অ্যাডমিন প্যানেল থেকে কনফিগার করা যায়, API key ছাড়াই ডেমো মোডে চলে।

## নতুন মেনু (সাইডবারে গ্রুপভিত্তিক)

| গ্রুপ | মেনু | পেজ | কাজ |
|-------|------|-----|-----|
| প্রধান | ড্যাশবোর্ড / অ্যানালিটিক্স | — | আগের মতোই |
| ক্যাটালগ | **স্টক ও ইনভেন্টরি** | `/inventory` | লাইভ স্টক, লো-স্টক অ্যালার্ট, স্টক ভ্যালু |
| বিক্রয় | **রিটার্ন ও রিফান্ড** | `/returns` | রিটার্ন অনুরোধ → অনুমোদন → রিফান্ড |
| বিক্রয় | **ওয়ারেন্টি** | `/warranties` | ওয়ারেন্টি কার্ড, দাবি, রিপ্লেসমেন্ট |
| মার্কেটিং | **ক্যাম্পেইন** | `/campaigns` | সিজনাল অফার, কুপন লিংক |
| মার্কেটিং | **লয়্যালটি ও পয়েন্ট** | `/loyalty` | পয়েন্ট আর্ন/রিডিম, কাস্টমার টিয়ার (ব্রোঞ্জ→প্লাটিনাম) |
| সাপ্লাই চেইন | **সাপ্লায়ার** | `/suppliers` | সাপ্লায়ার যোগ, বাকি হিসাব |
| সাপ্লাই চেইন | **পারচেজ** | `/purchases` | ক্রয় রেকর্ড, খরচ, স্টক এন্ট্রি |
| সাপ্লাই চেইন | **ভেন্ডর ও ওয়্যারহাউস** | `/vendors` | মাল্টি-ভেন্ডর কমিশন, মাল্টি-ওয়্যারহাউস স্টক |
| সাপোর্ট | **কাস্টমার সাপোর্ট** | `/support` | লাইভ চ্যাট/টিকিট ইনবক্স |
| সাপোর্ট | **FAQ** | `/faqs` | প্রশ্নোত্তর যোগ/এডিট |
| সাপোর্ট | **পলিসি পেজ** | `/policies` | রিটার্ন/রিফান্ড/প্রাইভেসি পেজ |
| ইন্টিগ্রেশন | **ইন্টিগ্রেশন হাব** | `/integrations` | সব সার্ভিস এক নজরে |
| ইন্টিগ্রেশন | **পেমেন্ট গেটওয়ে** | `/payment` | bKash, Nagad, Rocket, Upay, SSLCommerz, aamarPay, COD |
| ইন্টিগ্রেশন | **কুরিয়ার সেটিংস** | `/courier-settings` | Pathao, Steadfast, RedX, Sundarban, eCourier |
| ইন্টিগ্রেশন | **SMS ও নোটিফিকেশন** | `/sms` | BulkSMSBD, GreenWeb, SSL Wireless, WhatsApp API |
| ইন্টিগ্রেশন | **ট্র্যাকিং সেটিংস** | `/analytics-settings` | GA4, GTM, Meta Pixel, TikTok Pixel |
| ইন্টিগ্রেশন | **মার্কেটিং সেটিংস** | `/marketing` | FB CAPI, Google Ads, Mailchimp |
| সাইট | **SEO অ্যাডভান্সড** | `/seo-advanced` | sitemap.xml, robots.txt, JSON-LD জেনারেট |
| সিস্টেম | **ডিপ্লয় গাইড** | `/deploy` | GitHub→Vercel গাইড, এরর ডায়াগনোসিস |

## নতুন SQL মাইগ্রেশন

`supabase/migrations/004_integrations.sql` — ১২টি নতুন টেবিল (returns, warranties, campaigns,
suppliers, purchases, faqs, policies, support_tickets, vendors, warehouses, loyalty_points,
integration_settings) + RLS policy।

**একবারে সব:** `supabase/migrations/000_all_in_one.sql` — ০০১+০০২+০০৩+০০৪ এক ফাইলে (২৬টি টেবিল)।

## ডেমো মোড

কোনো API key (Supabase/কুরিয়ার/SMS) না দিলেও সব পেজ কাজ করে — ডেটা ব্রাউজারের
localStorage-এ থাকে। `.env`-এ আসল key বসালেই কোড না বদলে লাইভ হয়ে যায়।

## ফাইল স্ট্রাকচার (নতুন)

```
src/
├── lib/integrations.js          # সব প্রোভাইডারের কেন্দ্রীয় কনফিগ
├── components/
│   ├── IntegrationCard.jsx      # প্রোভাইডার কার্ড + সেটিংস ড্রয়ার
│   ├── IntegrationGroupPage.jsx # গ্রুপ পেজ (পেমেন্ট/কুরিয়ার/...)
│   └── CrudPage.jsx             # রিইউজেবল বাংলা CRUD পেজ
└── pages/
    ├── Integrations.jsx         # হাব
    ├── PaymentSettings.jsx / CourierSettings.jsx / SmsSettings.jsx
    ├── AnalyticsSettings.jsx / MarketingSettings.jsx
    ├── Returns.jsx / Warranties.jsx / Campaigns.jsx
    ├── Suppliers.jsx / Purchases.jsx / Inventory.jsx
    ├── Loyalty.jsx / Vendors.jsx
    ├── Support.jsx / Faqs.jsx / Policies.jsx
    ├── SeoAdvanced.jsx / DeployGuide.jsx
```
