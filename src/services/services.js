import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { localdb } from '../lib/localdb.js';

/**
 * services.js — সার্ভিস ডেটা লেয়ার
 * ------------------------------------------------------------
 * Supabase কনফিগার থাকলে আসল ডেটাবেস, না থাকলে ডেমো মোডে
 * localStorage (localdb) ব্যবহার করে। দুই ক্ষেত্রেই একই API।
 */

export async function listServices(params = {}) {
  if (!isSupabaseConfigured) return localdb.listServices(params);
  const { search = '', status = '', page = 1, perPage = 8 } = params;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  let q = supabase
    .from('services')
    .select('*', { count: 'exact' })
    .order('sort_order', { ascending: true })
    .range(from, to);
  if (status) q = q.eq('status', status);
  if (search) q = q.or(`name.ilike.%${search}%,name_bn.ilike.%${search}%,slug.ilike.%${search}%`);
  const { data, error, count } = await q;
  if (error) throw error;
  const total = count || 0;
  return {
    items: data || [],
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
    perPage,
  };
}

export async function getService(id) {
  if (!isSupabaseConfigured) return localdb.find('services', id);
  const { data, error } = await supabase.from('services').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createService(payload) {
  if (!isSupabaseConfigured) return localdb.insert('services', payload);
  const { data, error } = await supabase.from('services').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateService(id, payload) {
  if (!isSupabaseConfigured) return localdb.update('services', id, payload);
  const { data, error } = await supabase
    .from('services')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteService(id) {
  if (!isSupabaseConfigured) {
    localdb.remove('services', id);
    return;
  }
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}
