/**
 * localdb.js — ডেমো মোডের ডেটাবেস (localStorage)
 * ------------------------------------------------------------
 * Supabase কনফিগার না থাকলে অ্যাপ এই মডিউল দিয়ে চলে।
 * ডেটা ব্রাউজারের localStorage-এ থাকে, তাই রিলোডের পরও টিকে থাকে।
 * Supabase যোগ করলে স্বয়ংক্রিয়ভাবে আসল ডেটাবেসে চলে যাবে।
 */

const KEY = 'impotech_admin_db_v1';

/* ---------- helpers ---------- */
export const uid = () =>
  'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

/** ছোট inline SVG placeholder — ইন্টারনেট ছাড়াও কাজ করে */
export const ph = (label = 'IMPOTECH', bg = '#1a1a20', fg = '#f0b429') =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
      <rect width="600" height="600" fill="${bg}"/>
      <text x="50%" y="50%" fill="${fg}" font-family="sans-serif" font-size="42"
        font-weight="700" text-anchor="middle" dominant-baseline="middle">${label}</text>
    </svg>`
  );

const now = () => new Date().toISOString();
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

/* ---------- seed data ---------- */
function seed() {
  const cats = [
    { id: 'cat-angel', name: 'Angel Wings', name_bn: 'অ্যাঞ্জেল উইংস', image: ph('Angel Wings'), sort_order: 0, active: true, created_at: now() },
    { id: 'cat-led', name: 'LED Light', name_bn: 'LED লাইট', image: ph('LED Light'), sort_order: 1, active: true, created_at: now() },
    { id: 'cat-bike', name: 'Bike Accessories', name_bn: 'বাইক অ্যাকসেসরিজ', image: ph('Bike'), sort_order: 2, active: true, created_at: now() },
    { id: 'cat-gear', name: 'Riding Gear', name_bn: 'রাইডিং গিয়ার', image: ph('Riding Gear'), sort_order: 3, active: true, created_at: now() },
    { id: 'cat-horn', name: 'Horn & Siren', name_bn: 'হর্ন ও সাইরেন', image: ph('Horn'), sort_order: 4, active: true, created_at: now() },
    { id: 'cat-holder', name: 'Phone Holder', name_bn: 'মোবাইল হোল্ডার', image: ph('Holder'), sort_order: 5, active: true, created_at: now() },
  ];

  const P = (i, name, name_bn, cat, price, old, stock, badge, tag, featured, desc) => ({
    id: 'prod-' + i,
    name,
    name_bn,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category_id: cat,
    price,
    old_price: old,
    stock,
    description: desc,
    images: [ph(name_bn || name)],
    videos: [],
    video_autoplay: false,
    badge,
    tag,
    rating: 4.5,
    reviews_count: 12,
    colors: [],
    features: [],
    featured,
    active: true,
    created_at: daysAgo(20 - i),
  });

  const products = [
    P(1, 'Angel Wings LED', 'অ্যাঞ্জেল উইংস LED', 'cat-angel', 850, 1200, 24, 'হট', 'new', true, 'গাড়ি ও বাইকের জন্য প্রিমিয়াম অ্যাঞ্জেল উইংস LED লাইট।'),
    P(2, 'RGB Strip Light 2m', 'RGB স্ট্রিপ লাইট ২মিটার', 'cat-led', 450, 650, 40, '', 'sale', true, 'রিমোট কন্ট্রোলসহ ২ মিটার RGB LED স্ট্রিপ।'),
    P(3, 'Bike Phone Holder', 'বাইক মোবাইল হোল্ডার', 'cat-holder', 350, 500, 60, '', '', false, 'শক্তিশালী গ্রিপ, যেকোনো মোবাইলের জন্য।'),
    P(4, 'Riding Gloves Pro', 'রাইডিং গ্লাভস প্রো', 'cat-gear', 690, 900, 18, 'নতুন', 'new', true, 'নখর-সুরক্ষা ও গ্রিপসহ প্রিমিয়াম রাইডিং গ্লাভস।'),
    P(5, 'Loud Horn 12V', 'লাউড হর্ন ১২V', 'cat-horn', 550, 750, 30, '', '', false, 'উচ্চ ডেসিবেল হর্ন, সহজ ইনস্টলেশন।'),
    P(6, 'Headlight LED H4', 'হেডলাইট LED H4', 'cat-led', 1250, 1600, 12, 'হট', 'hot', true, 'উজ্জ্বল ও দীর্ঘস্থায়ী LED হেডলাইট বাল্ব।'),
    P(7, 'Bike Cover Waterproof', 'বাইক কভার ওয়াটারপ্রুফ', 'cat-bike', 780, 1000, 22, '', '', false, 'বৃষ্টি ও ধুলো থেকে সুরক্ষা।'),
    P(8, 'Siren Police Sound', 'সাইরেন পুলিশ সাউন্ড', 'cat-horn', 420, 0, 0, '', '', false, 'মাল্টি-টোন পুলিশ সাইরেন।'),
    P(9, 'Knee Guard Set', 'নি গার্ড সেট', 'cat-gear', 950, 1300, 15, '', 'sale', false, 'রাইডিংয়ের সময় হাঁটু সুরক্ষা।'),
    P(10, 'Angel Wings RGB', 'অ্যাঞ্জেল উইংস RGB', 'cat-angel', 1100, 1450, 8, 'প্রিমিয়াম', 'new', true, 'মাল্টি-কালার RGB অ্যাঞ্জেল উইংস।'),
  ];

  const orders = [
    {
      id: 'ord-1', order_code: 'IMP-1001', customer_name: 'রাকিব হাসান', customer_phone: '01711000001',
      customer_address: 'মিরপুর ১০, ঢাকা', items: [{ name: 'অ্যাঞ্জেল উইংস LED', qty: 1, price: 850 }],
      subtotal: 850, shipping: 80, discount: 0, coupon_code: '', total: 930, payment_method: 'cod',
      status: 'new', note: '', created_at: daysAgo(1),
    },
    {
      id: 'ord-2', order_code: 'IMP-1002', customer_name: 'সাদিয়া আক্তার', customer_phone: '01711000002',
      customer_address: 'উত্তরা সেক্টর ৭, ঢাকা', items: [{ name: 'RGB স্ট্রিপ লাইট ২মিটার', qty: 2, price: 450 }],
      subtotal: 900, shipping: 80, discount: 90, coupon_code: 'SAVE10', total: 890, payment_method: 'bkash',
      status: 'processing', note: '', created_at: daysAgo(3),
    },
    {
      id: 'ord-3', order_code: 'IMP-1003', customer_name: 'তানভীর আহমেদ', customer_phone: '01711000003',
      customer_address: 'চট্টগ্রাম, আগ্রাবাদ', items: [{ name: 'হেডলাইট LED H4', qty: 1, price: 1250 }],
      subtotal: 1250, shipping: 0, discount: 0, coupon_code: '', total: 1250, payment_method: 'cod',
      status: 'delivered', note: '', created_at: daysAgo(6),
    },
    {
      id: 'ord-4', order_code: 'IMP-1004', customer_name: 'নুসরাত জাহান', customer_phone: '01711000004',
      customer_address: 'সিলেট, জিন্দাবাজার', items: [{ name: 'রাইডিং গ্লাভস প্রো', qty: 1, price: 690 }],
      subtotal: 690, shipping: 80, discount: 0, coupon_code: '', total: 770, payment_method: 'nagad',
      status: 'shipped', note: '', created_at: daysAgo(9),
    },
  ];

  const coupons = [
    { id: 'cpn-1', code: 'SAVE10', type: 'percent', value: 10, min_order: 500, expires_at: null, active: true, note: '১০% ছাড়', created_at: now() },
    { id: 'cpn-2', code: 'FLAT100', type: 'fixed', value: 100, min_order: 1000, expires_at: null, active: true, note: '১০০ টাকা ছাড়', created_at: now() },
  ];

  const reviews = [
    { id: 'rev-1', product_id: 'prod-1', customer_name: 'রাকিব হাসান', rating: 5, text: 'দুর্দান্ত কোয়ালিটি!', status: 'approved', created_at: daysAgo(2) },
    { id: 'rev-2', product_id: 'prod-2', customer_name: 'সাদিয়া আক্তার', rating: 4, text: 'ভালো, তবে ডেলিভারি একটু দেরি।', status: 'pending', created_at: daysAgo(4) },
    { id: 'rev-3', product_id: 'prod-6', customer_name: 'তানভীর আহমেদ', rating: 5, text: 'খুব উজ্জ্বল, দামের তুলনায় সেরা।', status: 'approved', created_at: daysAgo(7) },
  ];

  const customers = [
    { id: 'cus-1', name: 'রাকিব হাসান', phone: '01711000001', email: '', address: 'মিরপুর ১০, ঢাকা', total_orders: 1, total_spent: 930, created_at: daysAgo(1) },
    { id: 'cus-2', name: 'সাদিয়া আক্তার', phone: '01711000002', email: 'sadia@example.com', address: 'উত্তরা, ঢাকা', total_orders: 1, total_spent: 890, created_at: daysAgo(3) },
    { id: 'cus-3', name: 'তানভীর আহমেদ', phone: '01711000003', email: '', address: 'চট্টগ্রাম', total_orders: 1, total_spent: 1250, created_at: daysAgo(6) },
    { id: 'cus-4', name: 'নুসরাত জাহান', phone: '01711000004', email: '', address: 'সিলেট', total_orders: 1, total_spent: 770, created_at: daysAgo(9) },
  ];

  const settings = {
    identity: {
      siteName: 'ইম্পোটেক', siteNameEn: 'IMPOTECH',
      tagline: 'চায়না থেকে সরাসরি আমদানি — প্রিমিয়াম বাইক অ্যাকসেসরিজ',
      logo: '', favicon: '', copyright: '© {year} ইম্পোটেক — সর্বস্বত্ব সংরক্ষিত।',
    },
    theme: { accent: '#f0b429', accentDark: '#c9920f', fontScale: 100, radius: 18, mode: 'dark' },
    contact: {
      phone: '01884332067', email: 'support@impotech.com.bd', address: 'ঢাকা, বাংলাদেশ',
      hours: 'সকাল ১০টা — রাত ১০টা', whatsapp: '01884332067',
      facebook: '', instagram: '', youtube: '', tiktok: '',
    },
    checkout: {
      deliveryCharge: 80, freeDeliveryAbove: 2000, codEnabled: true,
      bkashEnabled: true, bkashNumber: '01884332067',
      nagadEnabled: true, nagadNumber: '01884332067',
      rocketEnabled: false, rocketNumber: '',
      paymentNote: 'বিকাশ/নগদে টাকা পাঠিয়ে ট্রানজেকশন আইডি অর্ডার নোটে লিখুন।',
      confirmMessage: 'ধন্যবাদ! আপনার অর্ডারটি আমরা পেয়েছি।',
    },
    background: { type: 'color', color: '#08080a', image: '', overlay: 45, blur: 0 },
    home: {
      slides: [
        { image: ph('IMPOTECH', '#0a1226'), tag: 'নতুন কালেকশন', title: 'প্রিমিয়াম বাইক অ্যাকসেসরিজ', text: 'চায়না থেকে সরাসরি আমদানি — সেরা দামে।', cta: 'কেনাকাটা করুন', link: '/products' },
        { image: ph('LED LIGHT', '#07130f'), tag: 'অফার', title: 'LED লাইটে ৩০% ছাড়', text: 'সীমিত সময়ের জন্য।', cta: 'দেখুন', link: '/products' },
      ],
      banners: [
        { image: ph('RIDING GEAR', '#150a1c'), title: 'রাইডিং গিয়ার', text: 'নিরাপদে রাইড করুন' },
      ],
      services: [
        { title: 'ফ্রি ডেলিভারি', text: '২০০০ টাকার উপরে' },
        { title: 'ক্যাশ অন ডেলিভারি', text: 'সারা দেশে' },
        { title: '৭ দিনের রিটার্ন', text: 'শর্তসাপেক্ষে' },
      ],
    },
    newsletter: { title: 'নিউজলেটার', text: 'নতুন অফার সবার আগে পান', button: 'সাবস্ক্রাইব' },
    content: {
      about: { title: 'আমাদের সম্পর্কে', body: 'ইম্পোটেক — চায়না থেকে সরাসরি আমদানি করা প্রিমিয়াম বাইক অ্যাকসেসরিজের বিশ্বস্ত ঠিকানা।' },
      privacy: { title: 'প্রাইভেসি পলিসি', body: 'আমরা আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখি এবং তৃতীয় পক্ষের সাথে শেয়ার করি না।' },
      terms: { title: 'শর্তাবলী', body: 'সাইট ব্যবহারের শর্তাবলী এখানে লিখুন।' },
      returns: { title: 'রিটার্ন পলিসি', body: 'পণ্য পাওয়ার ৭ দিনের মধ্যে রিটার্ন করা যাবে (শর্তসাপেক্ষে)।' },
      faq: { title: 'সাধারণ প্রশ্নোত্তর', body: 'প্রশ্ন: ডেলিভারি কত দিনে? উত্তর: সাধারণত ২-৪ দিন।' },
    },
    seo: {
      home: { title: 'ইম্পোটেক — প্রিমিয়াম বাইক অ্যাকসেসরিজ', description: 'চায়না থেকে সরাসরি আমদানি করা বাইক অ্যাকসেসরিজ, LED লাইট ও রাইডিং গিয়ার।' },
      products: { title: 'সব প্রোডাক্ট — ইম্পোটেক', description: 'সব প্রোডাক্ট দেখুন।' },
    },
    ogImage: '',
  };

  /* ---------- নতুন ফিচার: ইনভয়েস ---------- */
  const invoices = orders.map((o, i) => ({
    id: 'inv-' + (i + 1),
    invoice_no: `INV-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
    order_id: o.id,
    order_code: o.order_code,
    customer_name: o.customer_name,
    customer_phone: o.customer_phone,
    customer_address: o.customer_address,
    items: o.items,
    subtotal: o.subtotal,
    shipping: o.shipping,
    discount: o.discount,
    coupon_code: o.coupon_code,
    total: o.total,
    payment_method: o.payment_method,
    status: o.status === 'delivered' ? 'paid' : 'issued',
    note: '',
    issued_at: o.created_at,
    created_at: o.created_at,
  }));

  /* ---------- নতুন ফিচার: কুরিয়ার শিপমেন্ট ---------- */
  const courier_shipments = [
    {
      id: 'shp-1', order_id: 'ord-4', order_code: 'IMP-1004', provider: 'steadfast',
      consignment_id: 'SF-DEMO1001', tracking_code: 'SFDEMO1001', status: 'in_transit',
      recipient_name: 'নুসরাত জাহান', recipient_phone: '01711000004',
      recipient_address: 'সিলেট, জিন্দাবাজার', cod_amount: 770, delivery_type: 'normal',
      note: '', raw: { demo: true }, created_at: daysAgo(8), updated_at: daysAgo(7),
    },
  ];

  /* ---------- নতুন ফিচার: ল্যান্ডিং পেজ ---------- */
  const landing_pages = [
    {
      id: 'lp-1',
      slug: 'angel-wings-offer',
      title: 'অ্যাঞ্জেল উইংস LED — বিশেষ অফার',
      product_id: 'prod-1',
      hero: {
        headline: 'অ্যাঞ্জেল উইংস LED',
        sub: 'গাড়ি ও বাইকের জন্য প্রিমিয়াম LED লাইট — চায়না থেকে সরাসরি আমদানি',
        image: ph('ANGEL WINGS', '#0a1226'),
        cta: 'এখনই অর্ডার করুন',
        badge: 'সীমিত স্টক',
      },
      features: [
        { icon: 'truck', title: 'ফ্রি ডেলিভারি', text: '২০০০ টাকার উপরে অর্ডারে' },
        { icon: 'shield', title: '৭ দিনের রিটার্ন', text: 'শর্তসাপেক্ষে রিপ্লেসমেন্ট' },
        { icon: 'star', title: 'অরিজিনাল পণ্য', text: '১০০% কোয়ালিটি গ্যারান্টি' },
      ],
      gallery: [ph('ANGEL 1', '#0a1226'), ph('ANGEL 2', '#07130f')],
      videos: [],
      reviews: [
        { name: 'রাকিব হাসান', rating: 5, text: 'দুর্দান্ত কোয়ালিটি, দামে সেরা!' },
        { name: 'সাদিয়া আক্তার', rating: 4, text: 'ভালো, ডেলিভারি একটু দেরি।' },
      ],
      offer: { enabled: true, text: 'আজকের অফারে ৩০% ছাড়', endsAt: '', discount: 30 },
      order_form: { enabled: true, buttonText: 'অর্ডার করুন' },
      seo: {
        title: 'অ্যাঞ্জেল উইংস LED — বিশেষ অফার',
        description: 'সীমিত সময়ের অফারে অ্যাঞ্জেল উইংস LED লাইট অর্ডার করুন।',
        ogImage: '',
      },
      published: true,
      views: 0,
      created_at: daysAgo(5),
      updated_at: daysAgo(2),
    },
  ];

  /* ---------- নতুন ফিচার: সার্ভিস ---------- */
  const services = [
    {
      id: 'srv-1',
      name: 'Home Delivery',
      name_bn: 'হোম ডেলিভারি',
      slug: 'home-delivery',
      icon: '🚚',
      image: '',
      short_desc: 'সারা বাংলাদেশে দ্রুত হোম ডেলিভারি।',
      description:
        'আমরা সারা বাংলাদেশে ২–৪ কর্মদিবসের মধ্যে পণ্য পৌঁছে দিই। ঢাকার ভেতরে ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ৩–৫ দিন। প্রতিটি অর্ডার ট্র্যাকিং কোডসহ পাঠানো হয়।',
      price: 80,
      duration: '২–৪ দিন',
      status: 'active',
      sort_order: 0,
      meta_title: 'হোম ডেলিভারি — ইম্পোটেক',
      meta_description: 'সারা বাংলাদেশে দ্রুত ও নিরাপদ হোম ডেলিভারি সার্ভিস।',
      images: [ph('DELIVERY', '#0a1226')],
      videos: [],
      created_at: daysAgo(10),
    },
    {
      id: 'srv-2',
      name: 'Installation Service',
      name_bn: 'ইনস্টলেশন সার্ভিস',
      slug: 'installation-service',
      icon: '🔧',
      image: '',
      short_desc: 'পণ্য কেনার সাথে ফ্রি ইনস্টলেশন।',
      description:
        'LED লাইট, হর্ন বা যেকোনো অ্যাকসেসরির প্রফেশনাল ইনস্টলেশন। ঢাকার ভেতরে ফ্রি, ঢাকার বাইরে চার্জ প্রযোজ্য।',
      price: 0,
      duration: '১ দিন',
      status: 'active',
      sort_order: 1,
      meta_title: 'ইনস্টলেশন সার্ভিস — ইম্পোটেক',
      meta_description: 'প্রফেশনাল ইনস্টলেশন সার্ভিস, ঢাকার ভেতরে ফ্রি।',
      images: [ph('INSTALL', '#07130f')],
      videos: [],
      created_at: daysAgo(9),
    },
    {
      id: 'srv-3',
      name: 'Warranty & Replacement',
      name_bn: 'ওয়ারেন্টি ও রিপ্লেসমেন্ট',
      slug: 'warranty-replacement',
      icon: '🛡️',
      image: '',
      short_desc: '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি।',
      description:
        'পণ্য পাওয়ার ৭ দিনের মধ্যে কোনো সমস্যা থাকলে বিনামূল্যে রিপ্লেসমেন্ট। শর্তসাপেক্ষে ৩০ দিনের ওয়ারেন্টি সুবিধা।',
      price: 0,
      duration: '৭ দিন',
      status: 'active',
      sort_order: 2,
      meta_title: 'ওয়ারেন্টি ও রিপ্লেসমেন্ট — ইম্পোটেক',
      meta_description: '৭ দিনের রিপ্লেসমেন্ট ও ৩০ দিনের ওয়ারেন্টি সুবিধা।',
      images: [ph('WARRANTY', '#150a1c')],
      videos: [],
      created_at: daysAgo(8),
    },
    {
      id: 'srv-4',
      name: 'Cash on Delivery',
      name_bn: 'ক্যাশ অন ডেলিভারি',
      slug: 'cash-on-delivery',
      icon: '💵',
      image: '',
      short_desc: 'পণ্য হাতে পেয়ে টাকা দিন।',
      description:
        'সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা। পণ্য হাতে পেয়ে দেখে নিয়ে তারপর পেমেন্ট করুন।',
      price: 0,
      duration: 'সাথে সাথে',
      status: 'active',
      sort_order: 3,
      meta_title: 'ক্যাশ অন ডেলিভারি — ইম্পোটেক',
      meta_description: 'পণ্য হাতে পেয়ে টাকা পরিশোধের সুবিধা।',
      images: [ph('COD', '#0a1226')],
      videos: [],
      created_at: daysAgo(7),
    },
    {
      id: 'srv-5',
      name: 'Bulk / Wholesale Order',
      name_bn: 'বাল্ক / পাইকারি অর্ডার',
      slug: 'bulk-wholesale-order',
      icon: '📦',
      image: '',
      short_desc: 'পাইকারি দামে বাল্ক অর্ডার।',
      description:
        'দোকানদার ও রিসেলারদের জন্য বিশেষ পাইকারি দাম। ১০ পিসের বেশি অর্ডারে অতিরিক্ত ছাড়। যোগাযোগ করুন।',
      price: 0,
      duration: '৩–৭ দিন',
      status: 'inactive',
      sort_order: 4,
      meta_title: 'বাল্ক / পাইকারি অর্ডার — ইম্পোটেক',
      meta_description: 'রিসেলারদের জন্য বিশেষ পাইকারি দাম ও বাল্ক অর্ডার সুবিধা।',
      images: [ph('BULK', '#07130f')],
      videos: [],
      created_at: daysAgo(6),
    },
  ];

  /* ---------- রিটার্ন ও রিফান্ড ---------- */
  const returns = [
    {
      id: 'rtn-1', return_code: 'RTN-2026-0001', order_code: 'IMP-1002',
      customer_name: 'সাদিয়া আক্তার', customer_phone: '01711000002',
      product_name: 'RGB স্ট্রিপ লাইট ২মিটার', qty: 1, amount: 450,
      reason: 'পণ্যের রঙ কাজ করছে না', status: 'approved',
      refund_method: 'bkash', refund_ref: '', note: 'কাস্টমার ভিডিও পাঠিয়েছেন',
      created_at: daysAgo(2),
    },
    {
      id: 'rtn-2', return_code: 'RTN-2026-0002', order_code: 'IMP-1003',
      customer_name: 'তানভীর আহমেদ', customer_phone: '01711000003',
      product_name: 'হেডলাইট LED H4', qty: 1, amount: 1250,
      reason: 'ভুল মডেল পাঠানো হয়েছে', status: 'refunded',
      refund_method: 'nagad', refund_ref: 'NGD8827341', note: '',
      created_at: daysAgo(5),
    },
  ];

  /* ---------- ওয়ারেন্টি ---------- */
  const warranties = [
    {
      id: 'wr-1', warranty_code: 'WR-2026-0001', order_code: 'IMP-1003',
      customer_name: 'তানভীর আহমেদ', customer_phone: '01711000003',
      product_name: 'হেডলাইট LED H4', serial_no: 'H4-2026-8841',
      duration_days: 30, start_date: daysAgo(6).slice(0, 10), status: 'active',
      claim_note: '', replacement_product: '', created_at: daysAgo(6),
    },
    {
      id: 'wr-2', warranty_code: 'WR-2026-0002', order_code: 'IMP-1001',
      customer_name: 'রাকিব হাসান', customer_phone: '01711000001',
      product_name: 'অ্যাঞ্জেল উইংস LED', serial_no: '',
      duration_days: 7, start_date: daysAgo(1).slice(0, 10), status: 'active',
      claim_note: '', replacement_product: '', created_at: daysAgo(1),
    },
  ];

  /* ---------- ক্যাম্পেইন ---------- */
  const campaigns = [
    {
      id: 'cmp-1', name: 'ঈদ ধামাকা অফার', code: 'EID2026',
      description: 'ঈদ উপলক্ষে সব LED লাইটে বিশেষ ছাড়।',
      discount_type: 'percent', discount_value: 15, min_order: 1000,
      start_date: daysAgo(3).slice(0, 10), end_date: '', banner_text: 'ঈদ অফার — ১৫% ছাড়!',
      status: 'active', created_at: daysAgo(3),
    },
    {
      id: 'cmp-2', name: 'ফ্রি ডেলিভারি সপ্তাহ', code: '',
      description: '২০০০ টাকার উপরে অর্ডারে সারা দেশে ফ্রি ডেলিভারি।',
      discount_type: 'fixed', discount_value: 80, min_order: 2000,
      start_date: daysAgo(10).slice(0, 10), end_date: daysAgo(3).slice(0, 10),
      banner_text: '', status: 'ended', created_at: daysAgo(10),
    },
  ];

  /* ---------- সাপ্লায়ার ---------- */
  const suppliers = [
    {
      id: 'sup-1', name: 'লি ওয়েই', company: 'Guangzhou Auto Parts Co.',
      phone: '01711000011', email: 'liwei@example.com',
      address: 'Guangzhou, China', country: 'China',
      payment_terms: '৩০ দিনের ক্রেডিট', due_amount: 45000,
      note: 'LED লাইট ও হর্নের প্রধান সাপ্লায়ার', active: true, created_at: daysAgo(30),
    },
    {
      id: 'sup-2', name: 'আব্দুল করিম', company: 'ঢাকা ট্রেডিং',
      phone: '01711000012', email: '', address: 'চকবাজার, ঢাকা', country: 'Bangladesh',
      payment_terms: 'নগদ', due_amount: 0, note: 'রাইডিং গিয়ার', active: true, created_at: daysAgo(20),
    },
  ];

  /* ---------- পারচেজ ---------- */
  const purchases = [
    {
      id: 'pur-1', purchase_code: 'PO-2026-0001', supplier_name: 'Guangzhou Auto Parts Co.',
      product_name: 'অ্যাঞ্জেল উইংস LED', qty: 50, unit_cost: 420, total_cost: 21000,
      paid_amount: 10000, purchase_date: daysAgo(15).slice(0, 10),
      status: 'received', note: 'প্রথম চালান', created_at: daysAgo(15),
    },
    {
      id: 'pur-2', purchase_code: 'PO-2026-0002', supplier_name: 'ঢাকা ট্রেডিং',
      product_name: 'রাইডিং গ্লাভস প্রো', qty: 30, unit_cost: 380, total_cost: 11400,
      paid_amount: 11400, purchase_date: daysAgo(8).slice(0, 10),
      status: 'received', note: '', created_at: daysAgo(8),
    },
  ];

  /* ---------- FAQ ---------- */
  const faqs = [
    { id: 'faq-1', question: 'ডেলিভারি কত দিনে পাব?', answer: 'ঢাকার ভেতরে ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ৩–৫ কর্মদিবস।', category: 'delivery', sort_order: 0, active: true, created_at: daysAgo(12) },
    { id: 'faq-2', question: 'ক্যাশ অন ডেলিভারি আছে?', answer: 'হ্যাঁ, সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা আছে। পণ্য হাতে পেয়ে দেখে নিয়ে টাকা দিতে পারবেন।', category: 'payment', sort_order: 1, active: true, created_at: daysAgo(12) },
    { id: 'faq-3', question: 'পণ্য রিটার্ন করতে পারব?', answer: 'পণ্য পাওয়ার ৭ দিনের মধ্যে অক্ষত অবস্থায় রিটার্ন করা যাবে। শর্তসাপেক্ষে রিপ্লেসমেন্ট বা রিফান্ড।', category: 'return', sort_order: 2, active: true, created_at: daysAgo(12) },
    { id: 'faq-4', question: 'অর্ডার ট্র্যাক করব কীভাবে?', answer: 'অর্ডার নম্বর ও মোবাইল নম্বর দিয়ে সাইটের "ট্র্যাক অর্ডার" পেজ থেকে ট্র্যাক করতে পারবেন।', category: 'order', sort_order: 3, active: true, created_at: daysAgo(12) },
    { id: 'faq-5', question: 'ওয়ারেন্টি আছে কি?', answer: 'প্রতিটি পণ্যে ৭ দিনের রিপ্লেসমেন্ট ওয়ারেন্টি আছে। কিছু পণ্যে ৩০ দিন পর্যন্ত।', category: 'product', sort_order: 4, active: true, created_at: daysAgo(12) },
  ];

  /* ---------- পলিসি ---------- */
  const policies = [
    {
      id: 'pol-1', title: 'রিটার্ন পলিসি', slug: 'return-policy', type: 'return',
      body: 'পণ্য পাওয়ার ৭ দিনের মধ্যে অক্ষত ও অব্যবহৃত অবস্থায় রিটার্ন করা যাবে। রিটার্নের জন্য অর্ডার নম্বর ও কারণ জানাতে হবে। ব্যবহৃত বা ক্ষতিগ্রস্ত পণ্য ফেরত নেওয়া হয় না।',
      meta_title: 'রিটার্ন পলিসি — ইম্পোটেক',
      meta_description: 'ইম্পোটেকের ৭ দিনের রিটার্ন পলিসি সম্পর্কে জানুন।',
      active: true, created_at: daysAgo(20),
    },
    {
      id: 'pol-2', title: 'রিফান্ড পলিসি', slug: 'refund-policy', type: 'refund',
      body: 'রিটার্ন অনুমোদিত হলে ৫–৭ কর্মদিবসের মধ্যে বিকাশ/নগদ/রকেট বা ব্যাংকে রিফান্ড দেওয়া হয়। ডেলিভারি চার্জ ফেরতযোগ্য নয়।',
      meta_title: 'রিফান্ড পলিসি — ইম্পোটেক',
      meta_description: 'রিফান্ড কত দিনে ও কীভাবে পাবেন।',
      active: true, created_at: daysAgo(20),
    },
    {
      id: 'pol-3', title: 'শিপিং পলিসি', slug: 'shipping-policy', type: 'shipping',
      body: 'ঢাকার ভেতরে ডেলিভারি চার্জ ৮০ টাকা, ঢাকার বাইরে ১৩০ টাকা। ২০০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি।',
      meta_title: 'শিপিং পলিসি — ইম্পোটেক',
      meta_description: 'ডেলিভারি চার্জ ও সময় সম্পর্কে জানুন।',
      active: true, created_at: daysAgo(20),
    },
    {
      id: 'pol-4', title: 'প্রাইভেসি পলিসি', slug: 'privacy-policy', type: 'privacy',
      body: 'আমরা আপনার ব্যক্তিগত তথ্য (নাম, মোবাইল, ঠিকানা) শুধু অর্ডার প্রসেসিংয়ের জন্য ব্যবহার করি। তৃতীয় পক্ষের সাথে বিক্রি বা শেয়ার করি না।',
      meta_title: 'প্রাইভেসি পলিসি — ইম্পোটেক',
      meta_description: 'আপনার তথ্য কীভাবে সুরক্ষিত থাকে।',
      active: true, created_at: daysAgo(20),
    },
    {
      id: 'pol-5', title: 'শর্তাবলী', slug: 'terms', type: 'terms',
      body: 'সাইট ব্যবহার করে অর্ডার করলে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন। ভুল দাম বা স্টক তথ্যের ক্ষেত্রে অর্ডার বাতিলের অধিকার আমরা সংরক্ষণ করি।',
      meta_title: 'শর্তাবলী — ইম্পোটেক',
      meta_description: 'সাইট ব্যবহারের শর্তাবলী।',
      active: true, created_at: daysAgo(20),
    },
  ];

  /* ---------- সাপোর্ট টিকিট ---------- */
  const support_tickets = [
    {
      id: 'tkt-1', customer_name: 'রাকিব হাসান', customer_phone: '01711000001',
      subject: 'অর্ডার কখন পাব?', status: 'open',
      messages: [
        { id: 'm1', from: 'customer', text: 'আসসালামু আলাইকুম, আমার অর্ডার IMP-1001 কখন ডেলিভারি হবে?', at: daysAgo(0) },
      ],
      created_at: daysAgo(0), updated_at: daysAgo(0),
    },
    {
      id: 'tkt-2', customer_name: 'সাদিয়া আক্তার', customer_phone: '01711000002',
      subject: 'রিটার্ন রিফান্ড কত দিনে?', status: 'pending',
      messages: [
        { id: 'm1', from: 'customer', text: 'রিটার্ন রিকোয়েস্ট করেছি, রিফান্ড কত দিনে পাব?', at: daysAgo(1) },
        { id: 'm2', from: 'admin', text: '৫–৭ কর্মদিবসের মধ্যে বিকাশে পেয়ে যাবেন।', at: daysAgo(1) },
      ],
      created_at: daysAgo(1), updated_at: daysAgo(1),
    },
    {
      id: 'tkt-3', customer_name: 'তানভীর আহমেদ', customer_phone: '01711000003',
      subject: 'ওয়ারেন্টি ক্লেইম', status: 'closed',
      messages: [
        { id: 'm1', from: 'customer', text: 'হেডলাইটে সমস্যা হচ্ছে, ওয়ারেন্টি আছে?', at: daysAgo(4) },
        { id: 'm2', from: 'admin', text: 'হ্যাঁ, ৩০ দিনের ওয়ারেন্টি আছে। রিপ্লেসমেন্ট পাঠিয়ে দিয়েছি।', at: daysAgo(3) },
      ],
      created_at: daysAgo(4), updated_at: daysAgo(3),
    },
  ];

  /* ---------- ভেন্ডর ---------- */
  const vendors = [
    {
      id: 'vnd-1', name: 'ইম্পোটেক অফিসিয়াল', owner: 'ইম্পোটেক টিম',
      phone: '01884332067', email: 'support@impotech.com.bd',
      address: 'ঢাকা, বাংলাদেশ', commission: 0, active: true,
      note: 'প্রধান স্টোর', created_at: daysAgo(40),
    },
    {
      id: 'vnd-2', name: 'বাইকার হাব', owner: 'মাহমুদুল হাসান',
      phone: '01711000021', email: '', address: 'মিরপুর, ঢাকা',
      commission: 12, active: true, note: 'রাইডিং গিয়ার পার্টনার', created_at: daysAgo(25),
    },
  ];

  /* ---------- ওয়্যারহাউস ---------- */
  const warehouses = [
    {
      id: 'wh-1', name: 'প্রধান গুদাম', code: 'WH-DHK-01',
      address: 'মিরপুর ১০, ঢাকা', phone: '01884332067',
      manager: 'সাইফুল ইসলাম', active: true, note: '', created_at: daysAgo(40),
    },
    {
      id: 'wh-2', name: 'চট্টগ্রাম গুদাম', code: 'WH-CTG-01',
      address: 'আগ্রাবাদ, চট্টগ্রাম', phone: '01711000022',
      manager: 'রফিক উদ্দিন', active: true, note: '', created_at: daysAgo(30),
    },
  ];

  return {
    categories: cats,
    products,
    orders,
    coupons,
    reviews,
    customers,
    invoices,
    courier_shipments,
    landing_pages,
    services,
    returns,
    warranties,
    campaigns,
    suppliers,
    purchases,
    faqs,
    policies,
    support_tickets,
    vendors,
    warehouses,
    site_settings: settings,
  };
}

/* ---------- storage ---------- */
let cache = null;

function read() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      cache = JSON.parse(raw);
      // পুরোনো ভার্সনে কোনো টেবিল না থাকলে seed থেকে যোগ করি
      const base = seed();
      for (const t of Object.keys(base)) {
        if (cache[t] === undefined) cache[t] = base[t];
      }
      return cache;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('localdb read failed, reseeding', e);
  }
  cache = seed();
  write(cache);
  return cache;
}

function write(db) {
  cache = db;
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('localdb write failed (quota?)', e);
    throw new Error('লোকাল স্টোরেজ পূর্ণ — কিছু ছবি/ভিডিও মুছে আবার চেষ্টা করুন।');
  }
}

/* ---------- generic CRUD ---------- */
export const localdb = {
  all(table) {
    return [...(read()[table] || [])];
  },
  find(table, id) {
    return (read()[table] || []).find((r) => r.id === id) || null;
  },
  insert(table, row) {
    const db = read();
    const rec = { id: row.id || uid(), created_at: row.created_at || now(), ...row };
    db[table] = [rec, ...(db[table] || [])];
    write(db);
    return rec;
  },
  update(table, id, patch) {
    const db = read();
    let out = null;
    db[table] = (db[table] || []).map((r) => {
      if (r.id !== id) return r;
      out = { ...r, ...patch };
      return out;
    });
    write(db);
    return out;
  },
  remove(table, id) {
    const db = read();
    db[table] = (db[table] || []).filter((r) => r.id !== id);
    write(db);
  },

  /* ---------- settings (key/value) ---------- */
  getAllSettings() {
    return { ...(read().site_settings || {}) };
  },
  getSetting(key) {
    return read().site_settings?.[key] ?? null;
  },
  saveSetting(key, value) {
    const db = read();
    db.site_settings = { ...(db.site_settings || {}), [key]: value };
    write(db);
  },

  /* ---------- specialized ---------- */
  listCategories() {
    const db = read();
    return [...(db.categories || [])]
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((c) => ({
        ...c,
        productCount: (db.products || []).filter((p) => p.category_id === c.id).length,
      }));
  },

  listProducts({ search = '', categoryId = '' } = {}) {
    const db = read();
    const s = search.toLowerCase();
    return [...(db.products || [])]
      .filter((p) => {
        const matchS =
          !s ||
          (p.name || '').toLowerCase().includes(s) ||
          (p.name_bn || '').includes(search) ||
          (p.tag || '').toLowerCase().includes(s);
        const matchC = !categoryId || p.category_id === categoryId;
        return matchS && matchC;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((p) => {
        const cat = (db.categories || []).find((c) => c.id === p.category_id);
        return { ...p, categories: cat ? { name: cat.name, name_bn: cat.name_bn } : null };
      });
  },

  listOrders({ status = '', search = '' } = {}) {
    const db = read();
    const s = search.toLowerCase();
    return [...(db.orders || [])]
      .filter((o) => {
        const matchS =
          !s ||
          (o.order_code || '').toLowerCase().includes(s) ||
          (o.customer_phone || '').includes(search) ||
          (o.customer_name || '').includes(search);
        const matchSt = !status || o.status === status;
        return matchS && matchSt;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  listReviews({ status = '' } = {}) {
    const db = read();
    return [...(db.reviews || [])]
      .filter((r) => !status || r.status === status)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((r) => {
        const p = (db.products || []).find((x) => x.id === r.product_id);
        return { ...r, products: p ? { name: p.name } : null };
      });
  },

  listCustomers({ search = '' } = {}) {
    const db = read();
    const s = search.toLowerCase();
    return [...(db.customers || [])]
      .filter((c) => !s || (c.name || '').toLowerCase().includes(s) || (c.phone || '').includes(search))
      .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0));
  },

  /* ---------- ইনভয়েস ---------- */
  listInvoices({ search = '' } = {}) {
    const db = read();
    const s = search.toLowerCase();
    return [...(db.invoices || [])]
      .filter(
        (v) =>
          !s ||
          (v.invoice_no || '').toLowerCase().includes(s) ||
          (v.order_code || '').toLowerCase().includes(s) ||
          (v.customer_name || '').includes(search) ||
          (v.customer_phone || '').includes(search)
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  nextInvoiceSeq() {
    return (read().invoices || []).length + 1;
  },

  /* ---------- কুরিয়ার ---------- */
  listShipments({ status = '', search = '' } = {}) {
    const db = read();
    const s = search.toLowerCase();
    return [...(db.courier_shipments || [])]
      .filter((x) => {
        const matchS =
          !s ||
          (x.order_code || '').toLowerCase().includes(s) ||
          (x.tracking_code || '').toLowerCase().includes(s) ||
          (x.consignment_id || '').toLowerCase().includes(s) ||
          (x.recipient_name || '').includes(search) ||
          (x.recipient_phone || '').includes(search);
        const matchSt = !status || x.status === status;
        return matchS && matchSt;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  findShipmentByOrder(orderId) {
    return (read().courier_shipments || []).find((x) => x.order_id === orderId) || null;
  },

  /* ---------- ল্যান্ডিং পেজ ---------- */
  listLandingPages({ search = '' } = {}) {
    const db = read();
    const s = search.toLowerCase();
    return [...(db.landing_pages || [])]
      .filter((p) => !s || (p.title || '').toLowerCase().includes(s) || (p.slug || '').includes(search))
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .map((p) => {
        const prod = (db.products || []).find((x) => x.id === p.product_id);
        return { ...p, products: prod ? { name: prod.name, name_bn: prod.name_bn } : null };
      });
  },
  findLandingPage(slug) {
    return (read().landing_pages || []).find((p) => p.slug === slug) || null;
  },

  /* ---------- সার্ভিস (সার্চ + ফিল্টার + পেজিনেশন) ---------- */
  listServices({ search = '', status = '', page = 1, perPage = 8 } = {}) {
    const db = read();
    const s = search.toLowerCase();
    const all = [...(db.services || [])]
      .filter((x) => {
        const matchS =
          !s ||
          (x.name || '').toLowerCase().includes(s) ||
          (x.name_bn || '').includes(search) ||
          (x.slug || '').toLowerCase().includes(s);
        const matchSt = !status || x.status === status;
        return matchS && matchSt;
      })
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const total = all.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const p = Math.min(Math.max(1, page), pages);
    const items = all.slice((p - 1) * perPage, p * perPage);
    return { items, total, page: p, pages, perPage };
  },
  findService(slug) {
    return (read().services || []).find((x) => x.slug === slug) || null;
  },

  orderStats() {
    const data = read().orders || [];
    const valid = data.filter((o) => o.status !== 'cancelled');
    const revenue = valid.reduce((s, o) => s + Number(o.total || 0), 0);
    const count = data.length;
    const pending = data.filter((o) => o.status === 'new').length;

    const days = {};
    const d0 = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(d0);
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    valid.forEach((o) => {
      const key = new Date(o.created_at).toISOString().slice(0, 10);
      if (key in days) days[key] += Number(o.total || 0);
    });

    return {
      revenue,
      count,
      pending,
      avg: count ? Math.round(revenue / count) : 0,
      series: Object.entries(days).map(([date, total]) => ({ date, total })),
    };
  },

  /* ---------- backup / reset ---------- */
  exportAll() {
    return read();
  },
  importAll(data) {
    const base = seed();
    const next = { ...base, ...data };
    write(next);
    return next;
  },
  resetAll() {
    cache = null;
    localStorage.removeItem(KEY);
    return read();
  },
};
