import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { localdb } from '../lib/localdb.js';
import { buildInvoicePayload } from '../lib/invoice.js';

export async function listInvoices(params = {}) {
  if (!isSupabaseConfigured) return localdb.listInvoices(params);
  const { search = '' } = params;
  let q = supabase.from('invoices').select('*').order('created_at', { ascending: false });
  if (search)
    q = q.or(
      `invoice_no.ilike.%${search}%,order_code.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`
    );
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function getInvoice(id) {
  if (!isSupabaseConfigured) return localdb.find('invoices', id);
  const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

/** অর্ডার থেকে অটো ইনভয়েস তৈরি। */
export async function createInvoiceFromOrder(order, site = {}) {
  if (!isSupabaseConfigured) {
    const seq = localdb.nextInvoiceSeq();
    const payload = buildInvoicePayload(order, seq, site);
    return localdb.insert('invoices', payload);
  }
  // Supabase-এ পরবর্তী সিকোয়েন্স বের করি
  const { count } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true });
  const payload = buildInvoicePayload(order, (count || 0) + 1, site);
  const { data, error } = await supabase.from('invoices').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateInvoiceStatus(id, status) {
  if (!isSupabaseConfigured) {
    localdb.update('invoices', id, { status });
    return;
  }
  const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteInvoice(id) {
  if (!isSupabaseConfigured) {
    localdb.remove('invoices', id);
    return;
  }
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) throw error;
}
