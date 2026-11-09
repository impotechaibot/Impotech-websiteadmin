import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { localdb } from '../lib/localdb.js';

export async function listReviews(params = {}) {
  if (!isSupabaseConfigured) return localdb.listReviews(params);
  const { status = '' } = params;
  let q = supabase.from('reviews').select('*, products(name)').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

/** অ্যাডমিন থেকে নতুন রিভিউ যোগ। */
export async function createReview(payload) {
  if (!isSupabaseConfigured) return localdb.insert('reviews', payload);
  const { data, error } = await supabase.from('reviews').insert(payload).select().single();
  if (error) throw error;
  return data;
}

/** অ্যাডমিন থেকে রিভিউ এডিট। */
export async function updateReview(id, payload) {
  const patch = { ...payload, updated_at: new Date().toISOString() };
  if (!isSupabaseConfigured) return localdb.update('reviews', id, patch);
  const { data, error } = await supabase.from('reviews').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function setReviewStatus(id, status) {
  if (!isSupabaseConfigured) { localdb.update('reviews', id, { status }); return; }
  const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteReview(id) {
  if (!isSupabaseConfigured) { localdb.remove('reviews', id); return; }
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}
