import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { localdb } from '../lib/localdb.js';

/** সব সেটিংস একবারে পড়ে { key: value } ম্যাপ দেয় */
export async function getAllSettings() {
  if (!isSupabaseConfigured) return localdb.getAllSettings();
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) throw error;
  return Object.fromEntries(data.map((r) => [r.key, r.value]));
}

export async function getSetting(key) {
  if (!isSupabaseConfigured) return localdb.getSetting(key);
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) throw error;
  return data?.value ?? null;
}

export async function saveSetting(key, value) {
  if (!isSupabaseConfigured) { localdb.saveSetting(key, value); return; }
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
}
