import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { localdb } from '../lib/localdb.js';

export async function listOrders(params = {}) {
  if (!isSupabaseConfigured) return localdb.listOrders(params);
  const { status = '', search = '' } = params;
  let q = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  if (search) q = q.or(`order_code.ilike.%${search}%,customer_phone.ilike.%${search}%,customer_name.ilike.%${search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id, status) {
  if (!isSupabaseConfigured) { localdb.update('orders', id, { status }); return; }
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteOrder(id) {
  if (!isSupabaseConfigured) { localdb.remove('orders', id); return; }
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw error;
}

/** ড্যাশবোর্ড/অ্যানালিটিক্সের জন্য সামারি */
export async function orderStats() {
  if (!isSupabaseConfigured) return localdb.orderStats();
  const { data, error } = await supabase
    .from('orders')
    .select('total, status, created_at, items');
  if (error) throw error;

  const valid = data.filter((o) => o.status !== 'cancelled');
  const revenue = valid.reduce((s, o) => s + Number(o.total || 0), 0);
  const count = data.length;
  const pending = data.filter((o) => o.status === 'new').length;

  const days = {};
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days[d.toISOString().slice(0, 10)] = 0;
  }
  valid.forEach((o) => {
    const key = new Date(o.created_at).toISOString().slice(0, 10);
    if (key in days) days[key] += Number(o.total || 0);
  });

  return {
    revenue,
    count,
    pending,
    avg: count ? Math.round(revenue / count) : 0,
    series: Object.entries(days).map(([date, total]) => ({ date, total })),
  };
}
