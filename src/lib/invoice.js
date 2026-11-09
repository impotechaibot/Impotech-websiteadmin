/**
 * invoice.js — ইনভয়েস তৈরি, প্রিন্ট ও PDF ডাউনলোড
 * ------------------------------------------------------------
 * অর্ডার প্লেস হলেই একটি ইনভয়েস রেকর্ড তৈরি হয় (services/invoices.js)।
 * এই মডিউল সেই ইনভয়েস থেকে প্রিন্ট-উপযোগী HTML বানায় এবং
 * ব্রাউজারের প্রিন্ট ডায়ালগ খোলে — সেখান থেকে "Save as PDF" করা যায়।
 */

import { bdt, dateTimeBn } from './format.js';

/** ইনভয়েস নম্বর — INV-2026-0001 ধরনের। */
export function makeInvoiceNo(seq) {
  const year = new Date().getFullYear();
  const n = String(seq || 1).padStart(4, '0');
  return `INV-${year}-${n}`;
}

/** অর্ডার থেকে ইনভয়েস রেকর্ডের পেলোড বানায়। */
export function buildInvoicePayload(order, seq, site = {}) {
  const identity = site.identity || {};
  return {
    invoice_no: makeInvoiceNo(seq),
    order_id: order.id,
    order_code: order.order_code || order.orderCode || order.id,
    customer_name: order.customer_name || order.customer?.name || '',
    customer_phone: order.customer_phone || order.customer?.phone || '',
    customer_address: order.customer_address || order.customer?.address || '',
    items: (order.items || []).map((it) => ({
      name: it.name || it.bn || '',
      qty: it.qty || it.quantity || 1,
      price: Number(it.price) || 0,
    })),
    subtotal: Number(order.subtotal) || 0,
    shipping: Number(order.shipping) || 0,
    discount: Number(order.discount) || 0,
    coupon_code: order.coupon_code || order.coupon || '',
    total: Number(order.total) || 0,
    payment_method: order.payment_method || order.payment || 'cod',
    status: 'issued',
    note: order.note || '',
    issued_at: new Date().toISOString(),
    _site: {
      name: identity.siteName || 'ইম্পোটেক',
      nameEn: identity.siteNameEn || 'IMPOTECH',
      phone: site.contact?.phone || '',
      email: site.contact?.email || '',
      address: site.contact?.address || '',
    },
  };
}

const PAYMENT_LABEL = {
  cod: 'ক্যাশ অন ডেলিভারি',
  bkash: 'বিকাশ',
  nagad: 'নগদ',
  rocket: 'রকেট',
  card: 'কার্ড',
};

/** ইনভয়েসের সম্পূর্ণ HTML (প্রিন্ট-উপযোগী, A4)। */
export function invoiceHtml(inv) {
  const site = inv._site || {};
  const rows = (inv.items || [])
    .map(
      (it, i) => `
      <tr>
        <td class="c">${i + 1}</td>
        <td>${escapeHtml(it.name)}</td>
        <td class="c">${it.qty}</td>
        <td class="r">${bdt(it.price)}</td>
        <td class="r">${bdt(it.price * it.qty)}</td>
      </tr>`
    )
    .join('');

  return `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(inv.invoice_no)} — ${escapeHtml(site.name || 'ইনভয়েস')}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Hind Siliguri', 'Inter', system-ui, sans-serif; color: #14141a; margin: 0; padding: 32px; }
  .wrap { max-width: 780px; margin: 0 auto; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f0b429; padding-bottom: 18px; }
  .brand h1 { margin: 0; font-size: 26px; letter-spacing: -0.5px; }
  .brand p { margin: 4px 0 0; font-size: 12.5px; color: #555; line-height: 1.6; }
  .inv-meta { text-align: right; }
  .inv-meta h2 { margin: 0; font-size: 20px; color: #b8860b; letter-spacing: 1px; }
  .inv-meta p { margin: 4px 0 0; font-size: 12.5px; color: #555; }
  .parties { display: flex; justify-content: space-between; gap: 24px; margin: 24px 0; }
  .parties h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 0 0 6px; }
  .parties p { margin: 0; font-size: 13px; line-height: 1.7; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #e6e6ea; }
  th { background: #faf7ef; text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.6px; color: #7a6a3a; }
  td.c, th.c { text-align: center; }
  td.r, th.r { text-align: right; }
  .totals { margin-top: 18px; margin-left: auto; width: 300px; }
  .totals div { display: flex; justify-content: space-between; padding: 7px 0; font-size: 13.5px; }
  .totals .grand { border-top: 2px solid #14141a; margin-top: 6px; padding-top: 12px; font-size: 17px; font-weight: 800; }
  .foot { margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 16px; font-size: 11.5px; color: #777; text-align: center; line-height: 1.7; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; background: #f0b429; color: #14100a; font-size: 11px; font-weight: 700; }
  @media print { body { padding: 0; } .no-print { display: none; } }
</style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      <div class="brand">
        <h1>${escapeHtml(site.name || 'ইম্পোটেক')}</h1>
        <p>${escapeHtml(site.nameEn || 'IMPOTECH')}<br/>
        ${escapeHtml(site.address || '')}<br/>
        ${escapeHtml(site.phone || '')} ${site.email ? '· ' + escapeHtml(site.email) : ''}</p>
      </div>
      <div class="inv-meta">
        <h2>ইনভয়েস</h2>
        <p><b>${escapeHtml(inv.invoice_no)}</b><br/>
        অর্ডার: ${escapeHtml(inv.order_code || '')}<br/>
        তারিখ: ${dateTimeBn(inv.issued_at || inv.created_at)}</p>
      </div>
    </div>

    <div class="parties">
      <div>
        <h3>বিল প্রাপক</h3>
        <p><b>${escapeHtml(inv.customer_name || '—')}</b><br/>
        ${escapeHtml(inv.customer_phone || '')}<br/>
        ${escapeHtml(inv.customer_address || '')}</p>
      </div>
      <div style="text-align:right">
        <h3>পেমেন্ট</h3>
        <p>${escapeHtml(PAYMENT_LABEL[inv.payment_method] || inv.payment_method || '—')}<br/>
        <span class="badge">${inv.status === 'paid' ? 'পরিশোধিত' : 'ইস্যু করা হয়েছে'}</span></p>
      </div>
    </div>

    <table>
      <thead>
        <tr><th class="c">#</th><th>পণ্য</th><th class="c">পরিমাণ</th><th class="r">দাম</th><th class="r">মোট</th></tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="5" class="c">কোনো আইটেম নেই</td></tr>'}</tbody>
    </table>

    <div class="totals">
      <div><span>সাবটোটাল</span><b>${bdt(inv.subtotal)}</b></div>
      <div><span>ডেলিভারি চার্জ</span><b>${bdt(inv.shipping)}</b></div>
      ${Number(inv.discount) > 0 ? `<div><span>ছাড় ${inv.coupon_code ? '(' + escapeHtml(inv.coupon_code) + ')' : ''}</span><b>-${bdt(inv.discount)}</b></div>` : ''}
      <div class="grand"><span>সর্বমোট</span><b>${bdt(inv.total)}</b></div>
    </div>

    <div class="foot">
      ${inv.note ? 'নোট: ' + escapeHtml(inv.note) + '<br/>' : ''}
      এই ইনভয়েসটি কম্পিউটার-জেনারেটেড। ধন্যবাদ ${escapeHtml(site.name || 'ইম্পোটেক')}-এর সাথে থাকার জন্য।
    </div>
  </div>
</body>
</html>`;
}

/** নতুন উইন্ডোতে ইনভয়েস খুলে প্রিন্ট ডায়ালগ দেখায় (→ Save as PDF)। */
export function printInvoice(inv) {
  const w = window.open('', '_blank', 'width=900,height=1000');
  if (!w) {
    throw new Error('পপ-আপ ব্লক করা আছে — ব্রাউজারে পপ-আপ চালু করুন।');
  }
  w.document.write(invoiceHtml(inv));
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
  return w;
}

/** ইনভয়েস HTML ফাইল হিসেবে ডাউনলোড (অফলাইনে খোলা যায়)। */
export function downloadInvoiceHtml(inv) {
  const blob = new Blob([invoiceHtml(inv)], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${inv.invoice_no || 'invoice'}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
