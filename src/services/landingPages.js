import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { localdb } from '../lib/localdb.js';

export async function listLandingPages(params = {}) {
  if (!isSupabaseConfigured) return localdb.listLandingPages(params);
  const { search = '' } = params;
  let q = supabase
    .from('landing_pages')
    .select('*, products(name, name_bn)')
    .order('updated_at', { ascending: false });
  if (search) q = q.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function getLandingPage(id) {
  if (!isSupabaseConfigured) return localdb.find('landing_pages', id);
  const { data, error } = await supabase.from('landing_pages').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getLandingPageBySlug(slug) {
  if (!isSupabaseConfigured) return localdb.findLandingPage(slug);
  const { data, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createLandingPage(payload) {
  if (!isSupabaseConfigured) return localdb.insert('landing_pages', payload);
  const { data, error } = await supabase.from('landing_pages').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateLandingPage(id, payload) {
  const patch = { ...payload, updated_at: new Date().toISOString() };
  if (!isSupabaseConfigured) return localdb.update('landing_pages', id, patch);
  const { data, error } = await supabase
    .from('landing_pages')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLandingPage(id) {
  if (!isSupabaseConfigured) {
    localdb.remove('landing_pages', id);
    return;
  }
  const { error } = await supabase.from('landing_pages').delete().eq('id', id);
  if (error) throw error;
}
