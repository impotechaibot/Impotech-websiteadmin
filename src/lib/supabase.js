import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase কনফিগার করা আছে কি না।
 * `.env`-এ আসল URL/key না থাকলে অ্যাপ ডেমো মোডে (localStorage) চলে —
 * কোনো ক্র্যাশ নেই, সাথে সাথে `npm run dev` দিয়ে দেখা যায়।
 */
export const isSupabaseConfigured = Boolean(
  url &&
    anon &&
    !url.includes('xxxxxxxx') &&
    !url.includes('placeholder') &&
    !anon.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export const MEDIA_BUCKET = 'product-media';

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.info(
    '%c[ইম্পোটেক অ্যাডমিন] ডেমো মোড — Supabase কনফিগার করা নেই, ডেটা localStorage-এ রাখা হচ্ছে।',
    'color:#f0b429'
  );
}
