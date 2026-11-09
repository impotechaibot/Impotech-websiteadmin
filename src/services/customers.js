import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { localdb } from '../lib/localdb.js';

export async function listCustomers(params = {}) {
  if (!isSupabaseConfigured) return localdb.listCustomers(params);
  const { search = '' } = params;
  let q = supabase.from('customers').select('*').order('total_spent', { ascending: false });
  if (search) q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function upsertCustomer(payload) {
  if (!isSupabaseConfigured) {
    const existing = localdb.all('customers').find((c) => c.phone === payload.phone);
    return existing ? localdb.update('customers', existing.id, payload) : localdb.insert('customers', payload);
  }
  const { data, error } = await supabase
    .from('customers')
    .upsert(payload, { onConflict: 'phone' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
