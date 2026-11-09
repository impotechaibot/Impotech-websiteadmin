import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { localdb } from '../lib/localdb.js';
import { createShipment as apiCreateShipment } from '../lib/courier.js';

export async function listShipments(params = {}) {
  if (!isSupabaseConfigured) return localdb.listShipments(params);
  const { status = '', search = '' } = params;
  let q = supabase.from('courier_shipments').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  if (search)
    q = q.or(
      `order_code.ilike.%${search}%,tracking_code.ilike.%${search}%,consignment_id.ilike.%${search}%,recipient_name.ilike.%${search}%,recipient_phone.ilike.%${search}%`
    );
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function getShipmentByOrder(orderId) {
  if (!isSupabaseConfigured) return localdb.findShipmentByOrder(orderId);
  const { data, error } = await supabase
    .from('courier_shipments')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * এক ক্লিকে কুরিয়ারে এন্ট্রি — API কল করে রেকর্ড সেভ করে।
 * @param {object} order
 * @param {object} opts { provider, deliveryType, note, config }
 */
export async function createShipment(order, opts = {}) {
  const result = await apiCreateShipment(order, opts);

  const record = {
    order_id: order.id,
    order_code: order.order_code || order.orderCode || order.id,
    provider: result.provider,
    consignment_id: result.consignmentId,
    tracking_code: result.trackingCode,
    status: result.status || 'pending',
    recipient_name: order.customer_name || order.customer?.name || '',
    recipient_phone: order.customer_phone || order.customer?.phone || '',
    recipient_address: order.customer_address || order.customer?.address || '',
    cod_amount: Number(order.total) || 0,
    delivery_type: opts.deliveryType || 'normal',
    note: opts.note || '',
    raw: result.raw || {},
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    // একই অর্ডারের আগের শিপমেন্ট থাকলে আপডেট, নাহলে নতুন
    const existing = localdb.findShipmentByOrder(order.id);
    if (existing) return localdb.update('courier_shipments', existing.id, record);
    return localdb.insert('courier_shipments', record);
  }

  const { data, error } = await supabase
    .from('courier_shipments')
    .upsert(record, { onConflict: 'order_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateShipmentStatus(id, status) {
  const patch = { status, updated_at: new Date().toISOString() };
  if (!isSupabaseConfigured) {
    localdb.update('courier_shipments', id, patch);
    return;
  }
  const { error } = await supabase.from('courier_shipments').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteShipment(id) {
  if (!isSupabaseConfigured) {
    localdb.remove('courier_shipments', id);
    return;
  }
  const { error } = await supabase.from('courier_shipments').delete().eq('id', id);
  if (error) throw error;
}
