import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { localdb } from '../lib/localdb.js';

export async function listCategories() {
  if (!isSupabaseConfigured) return localdb.listCategories();
  const { data, error } = await supabase
    .from('categories')
    .select('*, products(count)')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data.map((c) => ({ ...c, productCount: c.products?.[0]?.count ?? 0 }));
}

export async function createCategory(payload) {
  if (!isSupabaseConfigured) return localdb.insert('categories', payload);
  const { data, error } = await supabase.from('categories').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id, payload) {
  if (!isSupabaseConfigured) return localdb.update('categories', id, payload);
  const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  if (!isSupabaseConfigured) { localdb.remove('categories', id); return; }
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}
