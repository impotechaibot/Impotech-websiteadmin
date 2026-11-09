/**
 * integrations.js — সব থার্ড-পার্টি সার্ভিসের কেন্দ্রীয় কনফিগারেশন
 * ------------------------------------------------------------
 * বাংলাদেশের ই-কমার্সে দরকারি সব সার্ভিস এক জায়গায়:
 *   • পেমেন্ট  — bKash, Nagad, Rocket, Upay, কার্ড (SSLCommerz/aamarPay), COD
 *   • কুরিয়ার  — Pathao, Steadfast, RedX, Sundarban, eCourier
 *   • SMS      — BulkSMSBD, GreenWeb, SSL Wireless, WhatsApp Cloud API
 *   • অ্যানালিটিক্স — GA4, Meta Pixel, TikTok Pixel, GTM
 *   • মার্কেটিং — Facebook CAPI, Google Ads, Mailchimp
 *
 * API key না থাকলে প্রতিটি সার্ভিস **ডেমো মোডে** চলে — কোনো ক্র্যাশ নেই।
 * আসল key বসালে (এখান থেকে বা .env-এ) কোড না বদলেই আসল API-তে যাবে।
 */

const KEY = 'impotech_integrations_v1';

/* ---------- storage ---------- */
function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function writeAll(v) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('integrations write failed', e);
    throw new Error('লোকাল স্টোরেজ পূর্ণ — কিছু ছবি/ভিডিও মুছে আবার চেষ্টা করুন।');
  }
}

/* ---------- গ্রুপ ---------- */
export const GROUPS = {
  payment: {
    label: 'পেমেন্ট গেটওয়ে',
    icon: '💳',
    desc: 'কাস্টমার কীভাবে টাকা দেবে — মোবাইল ব্যাংকিং, কার্ড ও ক্যাশ অন ডেলিভারি।',
  },
  courier: {
    label: 'কুরিয়ার সার্ভিস',
    icon: '🚚',
    desc: 'অর্ডার এক ক্লিকে কুরিয়ারে পাঠানোর জন্য প্রোভাইডার কনফিগার করুন।',
  },
  sms: {
    label: 'SMS ও নোটিফিকেশন',
    icon: '📩',
    desc: 'অর্ডার কনফার্মেশন, শিপিং আপডেট ও OTP পাঠানোর সার্ভিস।',
  },
  analytics: {
    label: 'অ্যানালিটিক্স ও ট্র্যাকিং',
    icon: '📊',
    desc: 'ভিজিটর, কনভার্সন ও বিজ্ঞাপনের পারফরম্যান্স মাপার টুল।',
  },
  marketing: {
    label: 'মার্কেটিং',
    icon: '📣',
    desc: 'কনভার্সন API, ইমেইল ক্যাম্পেইন ও রিমার্কেটিং।',
  },
};

/* ---------- প্রোভাইডার ডেফিনিশন ---------- */
const F = (key, label, type = 'text', extra = {}) => ({ key, label, type, ...extra });

export const PROVIDERS = {
  /* ================= পেমেন্ট ================= */
  payment: [
    {
      id: 'bkash',
      name: 'bKash',
      name_bn: 'বিকাশ',
      icon: '🟣',
      tag: 'মোবাইল ব্যাংকিং',
      desc: 'দেশের সবচেয়ে জনপ্রিয় মোবাইল ওয়ালেট। মার্চেন্ট পেমেন্ট + ম্যানুয়াল সেন্ড মানি।',
      docs: 'https://developer.bka.sh',
      fields: [
        F('mode', 'মোড', 'select', {
          options: [
            { value: 'manual', label: 'ম্যানুয়াল (নম্বরে সেন্ড মানি)' },
            { value: 'api', label: 'অটোমেটিক (Merchant API)' },
          ],
          default: 'manual',
          help: 'ম্যানুয়াল মোডে কাস্টমার টাকা পাঠিয়ে TrxID লিখবে, আপনি অ্যাডমিনে যাচাই করবেন।',
        }),
        F('number', 'মার্চেন্ট নম্বর', 'text', { placeholder: '01XXXXXXXXX', help: 'যে নম্বরে কাস্টমার টাকা পাঠাবে।' }),
        F('app_key', 'App Key', 'text', { placeholder: 'bKash App Key' }),
        F('app_secret', 'App Secret', 'password', { placeholder: 'bKash App Secret' }),
        F('username', 'Merchant Username', 'text', { placeholder: 'merchant username' }),
        F('password', 'Merchant Password', 'password', { placeholder: 'merchant password' }),
        F('sandbox', 'স্যান্ডবক্স মোড', 'toggle', { default: true, help: 'টেস্ট করার সময় চালু রাখুন।' }),
        F('charge', 'অতিরিক্ত চার্জ (%)', 'number', { default: 0, help: 'কাস্টমারের কাছ থেকে নিলে দিন, নাহলে ০।' }),
      ],
    },
    {
      id: 'nagad',
      name: 'Nagad',
      name_bn: 'নগদ',
      icon: '🟠',
      tag: 'মোবাইল ব্যাংকিং',
      desc: 'সরকারি ডাক বিভাগের মোবাইল ওয়ালেট, কম চার্জে জনপ্রিয়।',
      docs: 'https://developer.nagad.com.bd',
      fields: [
        F('mode', 'মোড', 'select', {
          options: [
            { value: 'manual', label: 'ম্যানুয়াল (নম্বরে সেন্ড মানি)' },
            { value: 'api', label: 'অটোমেটিক (Merchant API)' },
          ],
          default: 'manual',
        }),
        F('number', 'মার্চেন্ট নম্বর', 'text', { placeholder: '01XXXXXXXXX' }),
        F('merchant_id', 'Merchant ID', 'text', { placeholder: 'Nagad Merchant ID' }),
        F('merchant_key', 'Merchant Private Key', 'password', { placeholder: 'private key' }),
        F('pg_key', 'PG Public Key', 'password', { placeholder: 'pg public key' }),
        F('sandbox', 'স্যান্ডবক্স মোড', 'toggle', { default: true }),
      ],
    },
    {
      id: 'rocket',
      name: 'Rocket',
      name_bn: 'রকেট',
      icon: '🟪',
      tag: 'মোবাইল ব্যাংকিং',
      desc: 'ডাচ-বাংলা ব্যাংকের মোবাইল ব্যাংকিং সার্ভিস।',
      docs: 'https://www.dutchbanglabank.com/rocket',
      fields: [
        F('mode', 'মোড', 'select', {
          options: [
            { value: 'manual', label: 'ম্যানুয়াল (নম্বরে সেন্ড মানি)' },
            { value: 'api', label: 'অটোমেটিক (DBBL API)' },
          ],
          default: 'manual',
        }),
        F('number', 'মার্চেন্ট নম্বর', 'text', { placeholder: '01XXXXXXXXX-1' }),
        F('merchant_id', 'Merchant ID', 'text', { placeholder: 'DBBL Merchant ID' }),
        F('api_key', 'API Key', 'password', { placeholder: 'API key' }),
      ],
    },
    {
      id: 'upay',
      name: 'Upay',
      name_bn: 'উপায়',
      icon: '🔵',
      tag: 'মোবাইল ব্যাংকিং',
      desc: 'ইউসিবি-র মোবাইল ওয়ালেট, কম লেনদেন চার্জ।',
      docs: 'https://upay.com.bd',
      fields: [
        F('mode', 'মোড', 'select', {
          options: [
            { value: 'manual', label: 'ম্যানুয়াল' },
            { value: 'api', label: 'অটোমেটিক' },
          ],
          default: 'manual',
        }),
        F('number', 'মার্চেন্ট নম্বর', 'text', { placeholder: '01XXXXXXXXX' }),
        F('merchant_id', 'Merchant ID', 'text', { placeholder: 'Upay Merchant ID' }),
        F('api_key', 'API Key', 'password', { placeholder: 'API key' }),
      ],
    },
    {
      id: 'card',
      name: 'কার্ড পেমেন্ট (SSLCommerz)',
      name_bn: 'কার্ড / SSLCommerz',
      icon: '💳',
      tag: 'গেটওয়ে',
      desc: 'Visa, Mastercard, Amex — SSLCommerz গেটওয়ে দিয়ে সব কার্ড ও ব্যাংক পেমেন্ট।',
      docs: 'https://developer.sslcommerz.com',
      fields: [
        F('store_id', 'Store ID', 'text', { placeholder: 'your store id' }),
        F('store_passwd', 'Store Password', 'password', { placeholder: 'store password' }),
        F('sandbox', 'স্যান্ডবক্স মোড', 'toggle', { default: true }),
        F('emi', 'EMI চালু', 'toggle', { default: false, help: 'কার্ডে কিস্তিতে কেনার সুবিধা।' }),
      ],
    },
    {
      id: 'aamarpay',
      name: 'aamarPay',
      name_bn: 'আমারপে',
      icon: '🏦',
      tag: 'গেটওয়ে',
      desc: 'বাংলাদেশি পেমেন্ট গেটওয়ে — কার্ড, বিকাশ, নগদ একসাথে।',
      docs: 'https://aamarpay.com',
      fields: [
        F('store_id', 'Store ID', 'text', { placeholder: 'aamarPay store id' }),
        F('signature_key', 'Signature Key', 'password', { placeholder: 'signature key' }),
        F('sandbox', 'স্যান্ডবক্স মোড', 'toggle', { default: true }),
      ],
    },
    {
      id: 'cod',
      name: 'ক্যাশ অন ডেলিভারি',
      name_bn: 'ক্যাশ অন ডেলিভারি',
      icon: '💵',
      tag: 'অফলাইন',
      desc: 'পণ্য হাতে পেয়ে টাকা দিন — বাংলাদেশে সবচেয়ে বেশি ব্যবহৃত পদ্ধতি।',
      fields: [
        F('enabled', 'COD চালু', 'toggle', { default: true }),
        F('max_amount', 'সর্বোচ্চ COD সীমা (৳)', 'number', { default: 10000, help: 'এর বেশি দামের অর্ডারে COD বন্ধ থাকবে।' }),
        F('advance', 'অগ্রিম (%)', 'number', { default: 0, help: 'ডেলিভারি চার্জ বা নির্দিষ্ট অংশ আগে নিতে চাইলে।' }),
        F('note', 'কাস্টমারকে দেখানো নোট', 'textarea', {
          default: 'পণ্য হাতে পেয়ে দেখে নিয়ে টাকা পরিশোধ করুন।',
        }),
      ],
    },
  ],

  /* ================= কুরিয়ার ================= */
  courier: [
    {
      id: 'pathao',
      name: 'Pathao Courier',
      name_bn: 'পাঠাও',
      icon: '🛵',
      tag: 'কুরিয়ার',
      desc: 'ঢাকায় দ্রুততম ডেলিভারি, API-তে অটো কনসাইমেন্ট তৈরি।',
      docs: 'https://merchant.pathao.com',
      fields: [
        F('base_url', 'API Base URL', 'text', { default: 'https://api-hermes.pathao.com', help: 'সাধারণত বদলাতে হবে না।' }),
        F('client_id', 'Client ID', 'text', { placeholder: 'pathao client id' }),
        F('client_secret', 'Client Secret', 'password', { placeholder: 'client secret' }),
        F('username', 'Merchant Email', 'text', { placeholder: 'you@example.com' }),
        F('password', 'Merchant Password', 'password', { placeholder: 'password' }),
        F('store_id', 'Store ID', 'text', { placeholder: 'pathao store id' }),
        F('default_weight', 'ডিফল্ট ওজন (কেজি)', 'number', { default: 0.5 }),
        F('delivery_type', 'ডেলিভারি ধরন', 'select', {
          options: [
            { value: '48', label: 'নরমাল (৪৮ ঘণ্টা)' },
            { value: '12', label: 'এক্সপ্রেস (১২ ঘণ্টা)' },
          ],
          default: '48',
        }),
      ],
    },
    {
      id: 'steadfast',
      name: 'Steadfast Courier',
      name_bn: 'স্টেডফাস্ট',
      icon: '📦',
      tag: 'কুরিয়ার',
      desc: 'সহজ API, সারা দেশে কভারেজ — ছোট ব্যবসার জন্য জনপ্রিয়।',
      docs: 'https://portal.packzy.com',
      fields: [
        F('base_url', 'API Base URL', 'text', { default: 'https://portal.packzy.com/api/v1' }),
        F('api_key', 'API Key', 'text', { placeholder: 'steadfast api key' }),
        F('secret_key', 'Secret Key', 'password', { placeholder: 'secret key' }),
        F('default_weight', 'ডিফল্ট ওজন (কেজি)', 'number', { default: 0.5 }),
      ],
    },
    {
      id: 'redx',
      name: 'RedX',
      name_bn: 'রেডএক্স',
      icon: '🔴',
      tag: 'কুরিয়ার',
      desc: 'ঢাকাসহ সারা দেশে ডেলিভারি, রিয়েল-টাইম ট্র্যাকিং।',
      docs: 'https://redx.com.bd',
      fields: [
        F('base_url', 'API Base URL', 'text', { default: 'https://openapi.redx.com.bd/v1.0.0-beta' }),
        F('api_token', 'API Token', 'password', { placeholder: 'redx api token' }),
        F('pickup_store_id', 'Pickup Store ID', 'text', { placeholder: 'store id' }),
        F('default_weight', 'ডিফল্ট ওজন (কেজি)', 'number', { default: 0.5 }),
      ],
    },
    {
      id: 'sundarban',
      name: 'Sundarban Courier',
      name_bn: 'সুন্দরবন কুরিয়ার',
      icon: '🌿',
      tag: 'কুরিয়ার',
      desc: 'দেশের প্রাচীনতম কুরিয়ার — ব্রাঞ্চ নেটওয়ার্ক সবচেয়ে বড়।',
      docs: 'https://sundarbancourierltd.com',
      fields: [
        F('mode', 'মোড', 'select', {
          options: [
            { value: 'manual', label: 'ম্যানুয়াল (ব্রাঞ্চে গিয়ে বুকিং)' },
            { value: 'api', label: 'অটোমেটিক (API)' },
          ],
          default: 'manual',
          help: 'সুন্দরবনের পাবলিক API সীমিত — বেশিরভাগ ব্যবসা ম্যানুয়াল বুকিং করে।',
        }),
        F('branch_code', 'ব্রাঞ্চ কোড', 'text', { placeholder: 'যেমন: DHK-01' }),
        F('api_key', 'API Key', 'password', { placeholder: 'api key (থাকলে)' }),
        F('default_weight', 'ডিফল্ট ওজন (কেজি)', 'number', { default: 0.5 }),
      ],
    },
    {
      id: 'ecourier',
      name: 'eCourier',
      name_bn: 'ই-কুরিয়ার',
      icon: '⚡',
      tag: 'কুরিয়ার',
      desc: 'একই দিনে ডেলিভারি, কর্পোরেট গ্রাহকদের পছন্দ।',
      docs: 'https://ecourier.com.bd',
      fields: [
        F('base_url', 'API Base URL', 'text', { default: 'https://backoffice.ecourier.com.bd/api' }),
        F('user_id', 'User ID', 'text', { placeholder: 'ecourier user id' }),
        F('api_key', 'API Key', 'password', { placeholder: 'api key' }),
        F('api_secret', 'API Secret', 'password', { placeholder: 'api secret' }),
      ],
    },
  ],

  /* ================= SMS ================= */
  sms: [
    {
      id: 'bulksmsbd',
      name: 'BulkSMSBD',
      name_bn: 'বাল্ক এসএমএস বিডি',
      icon: '📨',
      tag: 'SMS',
      desc: 'সস্তা মাস-এসএমএস, সহজ API — ছোট ব্যবসার জন্য সেরা।',
      docs: 'https://bulksmsbd.net',
      fields: [
        F('api_key', 'API Key', 'password', { placeholder: 'bulksmsbd api key' }),
        F('sender_id', 'Sender ID', 'text', { placeholder: 'যেমন: IMPOTECH' }),
        F('base_url', 'API Base URL', 'text', { default: 'http://bulksmsbd.net/api/smsapi' }),
      ],
    },
    {
      id: 'greenweb',
      name: 'GreenWeb',
      name_bn: 'গ্রিনওয়েব',
      icon: '🟢',
      tag: 'SMS',
      desc: 'বাংলাদেশি SMS গেটওয়ে, বাংলা ইউনিকোড সাপোর্ট।',
      docs: 'https://greenweb.com.bd',
      fields: [
        F('token', 'Token', 'password', { placeholder: 'greenweb token' }),
        F('sender_id', 'Sender ID', 'text', { placeholder: 'sender id' }),
        F('base_url', 'API Base URL', 'text', { default: 'https://api.greenweb.com.bd/api.php' }),
      ],
    },
    {
      id: 'sslwireless',
      name: 'SSL Wireless',
      name_bn: 'এসএসএল ওয়্যারলেস',
      icon: '🔒',
      tag: 'SMS',
      desc: 'এন্টারপ্রাইজ গ্রেড SMS, ব্যাংক ও বড় ব্র্যান্ডের পছন্দ।',
      docs: 'https://sslwireless.com',
      fields: [
        F('api_token', 'API Token', 'password', { placeholder: 'api token' }),
        F('sid', 'SID', 'text', { placeholder: 'sid' }),
        F('base_url', 'API Base URL', 'text', { default: 'https://smsplus.sslwireless.com/api/v3' }),
      ],
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Cloud API',
      name_bn: 'হোয়াটসঅ্যাপ',
      icon: '💬',
      tag: 'মেসেজিং',
      desc: 'অর্ডার আপডেট হোয়াটসঅ্যাপে পাঠান — খোলার হার সবচেয়ে বেশি।',
      docs: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
      fields: [
        F('phone_number_id', 'Phone Number ID', 'text', { placeholder: 'phone number id' }),
        F('access_token', 'Access Token', 'password', { placeholder: 'permanent access token' }),
        F('template_name', 'টেমপ্লেট নাম', 'text', { placeholder: 'order_update' }),
        F('base_url', 'API Base URL', 'text', { default: 'https://graph.facebook.com/v20.0' }),
      ],
    },
  ],

  /* ================= অ্যানালিটিক্স ================= */
  analytics: [
    {
      id: 'ga4',
      name: 'Google Analytics 4',
      name_bn: 'গুগল অ্যানালিটিক্স ৪',
      icon: '📈',
      tag: 'অ্যানালিটিক্স',
      desc: 'ভিজিটর, কনভার্সন ও রেভিনিউ ট্র্যাক করুন।',
      docs: 'https://analytics.google.com',
      fields: [
        F('measurement_id', 'Measurement ID', 'text', { placeholder: 'G-XXXXXXXXXX' }),
        F('enabled', 'চালু', 'toggle', { default: true }),
      ],
    },
    {
      id: 'gtm',
      name: 'Google Tag Manager',
      name_bn: 'গুগল ট্যাগ ম্যানেজার',
      icon: '🏷️',
      tag: 'ট্যাগ',
      desc: 'সব ট্র্যাকিং ট্যাগ এক জায়গা থেকে নিয়ন্ত্রণ করুন।',
      docs: 'https://tagmanager.google.com',
      fields: [
        F('container_id', 'Container ID', 'text', { placeholder: 'GTM-XXXXXXX' }),
        F('enabled', 'চালু', 'toggle', { default: true }),
      ],
    },
    {
      id: 'meta_pixel',
      name: 'Meta Pixel',
      name_bn: 'মেটা পিক্সেল',
      icon: '🔷',
      tag: 'অ্যাডস',
      desc: 'ফেসবুক/ইনস্টাগ্রাম বিজ্ঞাপনের কনভার্সন ট্র্যাকিং।',
      docs: 'https://business.facebook.com/events_manager',
      fields: [
        F('pixel_id', 'Pixel ID', 'text', { placeholder: '1234567890' }),
        F('enabled', 'চালু', 'toggle', { default: true }),
      ],
    },
    {
      id: 'tiktok_pixel',
      name: 'TikTok Pixel',
      name_bn: 'টিকটক পিক্সেল',
      icon: '🎵',
      tag: 'অ্যাডস',
      desc: 'টিকটক বিজ্ঞাপনের কনভার্সন ট্র্যাকিং।',
      docs: 'https://ads.tiktok.com',
      fields: [
        F('pixel_id', 'Pixel ID', 'text', { placeholder: 'CXXXXXXXXXXXXXXXX' }),
        F('enabled', 'চালু', 'toggle', { default: false }),
      ],
    },
  ],

  /* ================= মার্কেটিং ================= */
  marketing: [
    {
      id: 'fb_capi',
      name: 'Facebook Conversions API',
      name_bn: 'ফেসবুক কনভার্সন API',
      icon: '📘',
      tag: 'কনভার্সন',
      desc: 'সার্ভার-সাইড ইভেন্ট — iOS ব্লকিং এড়িয়ে নির্ভুল ট্র্যাকিং।',
      docs: 'https://developers.facebook.com/docs/marketing-api/conversions-api',
      fields: [
        F('pixel_id', 'Pixel ID', 'text', { placeholder: 'pixel id' }),
        F('access_token', 'Access Token', 'password', { placeholder: 'capi access token' }),
        F('test_code', 'Test Event Code', 'text', { placeholder: 'TEST12345', help: 'টেস্ট করার সময় ব্যবহার করুন।' }),
      ],
    },
    {
      id: 'google_ads',
      name: 'Google Ads',
      name_bn: 'গুগল অ্যাডস',
      icon: '🎯',
      tag: 'অ্যাডস',
      desc: 'সার্চ ও শপিং ক্যাম্পেইনের কনভার্সন ট্র্যাকিং।',
      docs: 'https://ads.google.com',
      fields: [
        F('conversion_id', 'Conversion ID', 'text', { placeholder: 'AW-XXXXXXXXX' }),
        F('conversion_label', 'Conversion Label', 'text', { placeholder: 'abcDEF123' }),
      ],
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      name_bn: 'মেইলচিম্প',
      icon: '🐵',
      tag: 'ইমেইল',
      desc: 'নিউজলেটার ও ইমেইল ক্যাম্পেইন।',
      docs: 'https://mailchimp.com/developer',
      fields: [
        F('api_key', 'API Key', 'password', { placeholder: 'xxxx-us1' }),
        F('list_id', 'Audience/List ID', 'text', { placeholder: 'list id' }),
        F('server', 'Server Prefix', 'text', { placeholder: 'us1' }),
      ],
    },
  ],
};

/* ---------- পাবলিক API ---------- */
export function getProviderDef(group, id) {
  return (PROVIDERS[group] || []).find((p) => p.id === id) || null;
}

export function getConfig(group, id) {
  const all = readAll();
  return { ...(all[group]?.[id] || {}) };
}

export function saveConfig(group, id, values) {
  const all = readAll();
  all[group] = { ...(all[group] || {}), [id]: { ...values, updated_at: new Date().toISOString() } };
  writeAll(all);
  return all[group][id];
}

export function removeConfig(group, id) {
  const all = readAll();
  if (all[group]) delete all[group][id];
  writeAll(all);
}

/** প্রোভাইডার কনফিগার করা আছে কি না (বাধ্যতামূলক ফিল্ড পূরণ হয়েছে কি না) */
export function isConfigured(group, id) {
  const def = getProviderDef(group, id);
  if (!def) return false;
  const cfg = getConfig(group, id);
  const required = def.fields.filter((f) => f.required);
  if (!required.length) {
    // বাধ্যতামূলক ফিল্ড নেই — অন্তত একটা মান থাকলেই কনফিগারড
    return Object.keys(cfg).some((k) => k !== 'updated_at' && cfg[k] !== '' && cfg[k] != null);
  }
  return required.every((f) => cfg[f.key]);
}

/** সব প্রোভাইডারের স্ট্যাটাস — হাব পেজে দেখানোর জন্য */
export function getAllStatus() {
  const out = {};
  for (const group of Object.keys(PROVIDERS)) {
    out[group] = PROVIDERS[group].map((p) => ({
      ...p,
      configured: isConfigured(group, p.id),
      config: getConfig(group, p.id),
    }));
  }
  return out;
}

/**
 * সংযোগ টেস্ট।
 * • key না থাকলে → ডেমো মোডে সফল রেসপন্স (কোনো নেটওয়ার্ক কল নেই)
 * • key থাকলে → VITE_INTEGRATION_PROXY-তে POST; প্রক্সি না থাকলে ডেমো
 */
export async function testProvider(group, id) {
  const def = getProviderDef(group, id);
  if (!def) return { ok: false, demo: false, message: 'অজানা প্রোভাইডার।' };

  const cfg = getConfig(group, id);
  const missing = def.fields.filter((f) => f.required && !cfg[f.key]);

  if (missing.length) {
    return {
      ok: true,
      demo: true,
      message: `ডেমো মোড — ${missing.map((m) => m.label).join(', ')} দেওয়া নেই। নমুনা রেসপন্স ফেরত দেওয়া হলো।`,
    };
  }

  const proxy = import.meta.env.VITE_INTEGRATION_PROXY;
  if (!proxy) {
    return {
      ok: true,
      demo: true,
      message: 'ডেমো মোড — প্রক্সি সার্ভার (VITE_INTEGRATION_PROXY) সেট করা নেই, তাই নমুনা রেসপন্স।',
    };
  }

  try {
    const res = await fetch(`${proxy.replace(/\/$/, '')}/test/${group}/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, demo: false, message: data.message || `সার্ভার এরর (${res.status})` };
    }
    return { ok: true, demo: false, message: data.message || 'সংযোগ সফল হয়েছে।' };
  } catch (e) {
    return { ok: false, demo: false, message: 'সংযোগ ব্যর্থ: ' + e.message };
  }
}

/** ডিফল্ট মান সহ ফর্মের প্রাথমিক ভ্যালু */
export function initialValues(group, id) {
  const def = getProviderDef(group, id);
  const saved = getConfig(group, id);
  const out = {};
  (def?.fields || []).forEach((f) => {
    out[f.key] = saved[f.key] !== undefined ? saved[f.key] : f.default !== undefined ? f.default : f.type === 'toggle' ? false : '';
  });
  return out;
}

/** কনফিগার করা প্রোভাইডারের সংখ্যা */
export function configuredCount(group) {
  return (PROVIDERS[group] || []).filter((p) => isConfigured(group, p.id)).length;
}
