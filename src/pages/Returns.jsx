import CrudPage from '../components/CrudPage.jsx';
import { bdt, dateBn } from '../lib/format.js';

const STATUS = [
  { value: 'requested', label: 'অনুরোধ করা হয়েছে' },
  { value: 'approved', label: 'অনুমোদিত' },
  { value: 'received', label: 'পণ্য ফেরত পাওয়া গেছে' },
  { value: 'refunded', label: 'রিফান্ড সম্পন্ন' },
  { value: 'rejected', label: 'বাতিল' },
];

const STATUS_TONE = {
  requested: 'bg-accent/15 text-accent',
  approved: 'bg-sky-400/15 text-sky-400',
  received: 'bg-violet-400/15 text-violet-400',
  refunded: 'bg-emerald-400/15 text-emerald-400',
  rejected: 'bg-red-500/15 text-red-400',
};

export default function Returns() {
  return (
    <CrudPage
      table="returns"
      title="রিটার্ন ও রিফান্ড"
      subtitle="কাস্টমারের রিটার্ন অনুরোধ, অনুমোদন ও রিফান্ড — সব এক জায়গায়।"
      addLabel="নতুন রিটার্ন"
      searchKeys={['return_code', 'order_code', 'customer_name', 'customer_phone', 'reason']}
      filter={{ key: 'status', label: 'স্ট্যাটাস', options: STATUS }}
      emptyText="কোনো রিটার্ন অনুরোধ নেই"
      fields={[
        { key: 'return_code', label: 'রিটার্ন নম্বর', required: true, placeholder: 'RTN-2026-0001', help: 'অর্ডার নম্বর থেকে আলাদা একটি কোড।' },
        { key: 'order_code', label: 'অর্ডার নম্বর', required: true, placeholder: 'IMP-1001' },
        { key: 'customer_name', label: 'কাস্টমারের নাম', required: true },
        { key: 'customer_phone', label: 'মোবাইল নম্বর', required: true, placeholder: '01XXXXXXXXX' },
        { key: 'product_name', label: 'পণ্যের নাম', required: true },
        { key: 'qty', label: 'পরিমাণ', type: 'number', default: 1 },
        { key: 'amount', label: 'রিফান্ড পরিমাণ (৳)', type: 'number', default: 0 },
        { key: 'reason', label: 'রিটার্নের কারণ', type: 'textarea', placeholder: 'যেমন: পণ্য ভাঙা এসেছে / ভুল পণ্য পাঠানো হয়েছে' },
        { key: 'status', label: 'স্ট্যাটাস', type: 'select', options: STATUS, default: 'requested' },
        { key: 'refund_method', label: 'রিফান্ড মাধ্যম', type: 'select', options: [
          { value: 'bkash', label: 'বিকাশ' },
          { value: 'nagad', label: 'নগদ' },
          { value: 'rocket', label: 'রকেট' },
          { value: 'bank', label: 'ব্যাংক' },
          { value: 'store_credit', label: 'স্টোর ক্রেডিট' },
        ], default: 'bkash' },
        { key: 'refund_ref', label: 'রিফান্ড ট্রানজেকশন আইডি', placeholder: 'TrxID' },
        { key: 'note', label: 'অভ্যন্তরীণ নোট', type: 'textarea' },
      ]}
      columns={[
        { key: 'return_code', label: 'রিটার্ন নম্বর', render: (r) => <span className="font-mono text-xs">{r.return_code}</span> },
        { key: 'order_code', label: 'অর্ডার', render: (r) => <span className="font-mono text-xs">{r.order_code}</span> },
        { key: 'customer_name', label: 'কাস্টমার' },
        { key: 'product_name', label: 'পণ্য', render: (r) => <span className="text-ink-muted">{r.product_name}</span> },
        { key: 'amount', label: 'রিফান্ড', render: (r) => bdt(r.amount) },
        { key: 'status', label: 'স্ট্যাটাস', render: (r) => (
          <span className={`badge ${STATUS_TONE[r.status] || 'bg-line text-ink-muted'}`}>
            {STATUS.find((s) => s.value === r.status)?.label || r.status}
          </span>
        ) },
        { key: 'created_at', label: 'তারিখ', render: (r) => <span className="text-ink-muted text-xs">{dateBn(r.created_at)}</span> },
      ]}
    />
  );
}
