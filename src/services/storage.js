import { supabase, MEDIA_BUCKET, isSupabaseConfigured } from '../lib/supabase.js';

/** ডেমো মোডে localStorage-এর সীমা মেনে ফাইলের সর্বোচ্চ আকার */
const DEMO_MAX_BYTES = 3 * 1024 * 1024; // 3MB

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('ফাইল পড়া যায়নি'));
    reader.readAsDataURL(blob);
  });
}

/** ফাইল Supabase Storage-এ আপলোড করে পাবলিক URL ফেরত দেয়।
 *  ডেমো মোডে (Supabase নেই) ফাইলটি data URL হিসেবে ফেরত দেয়। */
export async function uploadMedia(fileOrBlob, originalName = 'file') {
  if (!isSupabaseConfigured) {
    if (fileOrBlob.size > DEMO_MAX_BYTES) {
      throw new Error(
        'ডেমো মোডে ফাইল ৩MB-এর কম হতে হবে (ব্রাউজার স্টোরেজ সীমা)। বড় ফাইলের জন্য URL ব্যবহার করুন, অথবা Supabase কনফিগার করুন।'
      );
    }
    return blobToDataUrl(fileOrBlob);
  }

  const ext = (originalName.split('.').pop() || 'bin').toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, fileOrBlob, { cacheControl: '31536000', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteMedia(url) {
  if (!isSupabaseConfigured) return; // data URL — মুছে ফেলার দরকার নেই
  const marker = `/${MEDIA_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  await supabase.storage.from(MEDIA_BUCKET).remove([path]);
}
