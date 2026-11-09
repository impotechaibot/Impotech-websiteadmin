import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { localdb } from '../lib/localdb.js';

export async function listProducts(params = {}) {
  if (!isSupabaseConfigured) return localdb.listProducts(params);
  const { search = '', categoryId = '' } = params;
  let q = supabase.from('products').select('*, categories(name, name_bn)').order('created_at', { ascending: false });
  if (categoryId) q = q.eq('category_id', categoryId);
  if (search) q = q.or(`name.ilike.%${search}%,name_bn.ilike.%${search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function getProduct(id) {
  if (!isSupabaseConfigured) return localdb.find('products', id);
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createProduct(payload) {
  if (!isSupabaseConfigured) return localdb.insert('products', payload);
  const { data, error } = await supabase.from('products').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, payload) {
  if (!isSupabaseConfigured) return localdb.update('products', id, payload);
  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  if (!isSupabaseConfigured) { localdb.remove('products', id); return; }
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}
