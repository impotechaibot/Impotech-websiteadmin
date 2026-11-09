/**
 * courier.js — এক ক্লিকে কুরিয়ারে এন্ট্রি
 * ------------------------------------------------------------
 * Pathao / Steadfast / RedX — তিনটি জনপ্রিয় বাংলাদেশি কুরিয়ার।
 *
 * ⚠️ নিরাপত্তা: কুরিয়ারের API key কখনো ব্রাউজারে রাখা উচিত নয়।
 * তাই এই মডিউল দুটি মোডে চলে:
 *
 *   ১. লাইভ মোড — `.env`-এ VITE_COURIER_API_BASE সেট থাকলে
 *      একটি ব্যাকএন্ড প্রক্সি (Vercel/Netlify function) এ
 *      POST করে। প্রক্সি আসল key ধরে কুরিয়ার API কল করে।
 *
 *   ২. ডেমো মোড — কিছু সেট না থাকলে নিজেই একটি কনসিগমেন্ট
 *      আইডি ও ট্র্যাকিং কোড বানায়, যাতে পুরো ফ্লো টেস্ট করা যায়।
 *
 * ব্যাকএন্ড প্রক্সির প্রত্যাশিত চুক্তি:
 *   POST {base}/shipments
 *   body: { provider, order, config }
 *   → { consignmentId, trackingCode, status, raw }
 */

const API_BASE = import.meta.env.VITE_COURIER_API_BASE || '';

export const COURIER_PROVIDERS = [
  {
    id: 'steadfast',
    name: 'Steadfast',
    color: '#e11d48',
    trackingUrl: (code) => `https://steadfast.com.bd/t/${code}`,
    needsKey: ['apiKey', 'secretKey'],
  },
  {
    id: 'pathao',
    name: 'Pathao',
    color: '#e11d48',
    trackingUrl: (code) => `https://merchant.pathao.com/tracking?consignment_id=${code}`,
    needsKey: ['clientId', 'clientSecret', 'username', 'password'],
  },
  {
    id: 'redx',
    name: 'RedX',
    color: '#dc2626',
    trackingUrl: (code) => `https://redx.com.bd/track-parcel/?trackingId=${code}`,
    needsKey: ['apiKey'],
  },
  {
    id: 'manual',
    name: 'ম্যানুয়াল (নিজে কুরিয়ারে দেব)',
    color: '#9a9aa5',
    trackingUrl: () => '',
    needsKey: [],
  },
];

export const COURIER_STATUSES = [
  { id: 'pending', label: 'এন্ট্রি হয়েছে', tone: 'accent' },
  { id: 'picked', label: 'পিকআপ হয়েছে', tone: 'info' },
  { id: 'in_transit', label: 'পথে আছে', tone: 'info' },
  { id: 'delivered', label: 'ডেলিভারড', tone: 'ok' },
  { id: 'returned', label: 'ফেরত', tone: 'bad' },
  { id: 'cancelled', label: 'বাতিল', tone: 'bad' },
];

export const courierStatusLabel = (id) =>
  COURIER_STATUSES.find((s) => s.id === id)?.label || 'এন্ট্রি হয়েছে';

export const courierStatusTone = (id) =>
  COURIER_STATUSES.find((s) => s.id === id)?.tone || 'accent';

export const getProvider = (id) =>
  COURIER_PROVIDERS.find((p) => p.id === id) || COURIER_PROVIDERS[0];

/** লাইভ মোড চালু আছে কি না (ব্যাকএন্ড প্রক্সি সেট আছে কি না)। */
export const isCourierLive = () => Boolean(API_BASE);

/** ডেমো কনসিগমেন্ট আইডি — প্রোভাইডার অনুযায়ী আলাদা ফরম্যাট। */
function demoConsignment(provider) {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.floor(1000 + Math.random() * 9000);
  switch (provider) {
    case 'pathao':
      return { consignmentId: `PTH-${stamp}${rand}`, trackingCode: `PTH${stamp}${rand}` };
    case 'redx':
      return { consignmentId: `RDX-${stamp}${rand}`, trackingCode: `RDX${stamp}${rand}` };
    case 'manual':
      return { consignmentId: `MAN-${stamp}${rand}`, trackingCode: `MAN${stamp}${rand}` };
    case 'steadfast':
    default:
      return { consignmentId: `SF-${stamp}${rand}`, trackingCode: `SF${stamp}${rand}` };
  }
}

/**
 * একটি অর্ডার কুরিয়ারে এন্ট্রি করে।
 * @param {object} order  — { id, order_code, customer_name, customer_phone,
 *                            customer_address, total, items }
 * @param {object} opts   — { provider, deliveryType, note, config }
 * @returns {Promise<{consignmentId, trackingCode, status, raw, provider, demo}>}
 */
export async function createShipment(order, opts = {}) {
  const provider = opts.provider || 'steadfast';
  const deliveryType = opts.deliveryType || 'normal';
  const note = opts.note || '';

  const payload = {
    provider,
    deliveryType,
    note,
    config: opts.config || {},
    order: {
      id: order.id,
      orderCode: order.order_code || order.orderCode || order.id,
      recipientName: order.customer_name || order.customer?.name || '',
      recipientPhone: order.customer_phone || order.customer?.phone || '',
      recipientAddress: order.customer_address || order.customer?.address || '',
      codAmount: Number(order.total) || 0,
      items: order.items || [],
    },
  };

  // ---------- লাইভ মোড ----------
  if (isCourierLive()) {
    const res = await fetch(`${API_BASE}/shipments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`কুরিয়ার API ব্যর্থ (${res.status}) ${text}`.trim());
    }
    const data = await res.json();
    return {
      provider,
      consignmentId: data.consignmentId || data.consignment_id || '',
      trackingCode: data.trackingCode || data.tracking_code || '',
      status: data.status || 'pending',
      raw: data.raw || data,
      demo: false,
    };
  }

  // ---------- ডেমো মোড ----------
  await new Promise((r) => setTimeout(r, 600)); // নেটওয়ার্ক বিলম্ব অনুকরণ
  const { consignmentId, trackingCode } = demoConsignment(provider);
  return {
    provider,
    consignmentId,
    trackingCode,
    status: 'pending',
    raw: { demo: true, provider, orderCode: payload.order.orderCode },
    demo: true,
  };
}

/** ট্র্যাকিং URL — কুরিয়ারের সাইটে নিয়ে যায়। */
export function trackingUrl(provider, code) {
  const p = getProvider(provider);
  return p.trackingUrl ? p.trackingUrl(code) : '';
}
