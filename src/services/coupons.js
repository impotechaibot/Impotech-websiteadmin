import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { localdb } from '../lib/localdb.js';

export async function listCoupons() {
  if (!isSupabaseConfigured) return localdb.all('coupons');
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createCoupon(payload) {
  if (!isSupabaseConfigured) return localdb.insert('coupons', payload);
  const { data, error } = await supabase.from('coupons').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateCoupon(id, payload) {
  if (!isSupabaseConfigured) return localdb.update('coupons', id, payload);
  const { data, error } = await supabase.from('coupons').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCoupon(id) {
  if (!isSupabaseConfigured) { localdb.remove('coupons', id); return; }
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw error;
}
