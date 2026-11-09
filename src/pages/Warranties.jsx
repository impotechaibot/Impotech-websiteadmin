import CrudPage from '../components/CrudPage.jsx';
import { dateBn } from '../lib/format.js';

const STATUS = [
  { value: 'active', label: 'সক্রিয়' },
  { value: 'claimed', label: 'দাবি করা হয়েছে' },
  { value: 'expired', label: 'মেয়াদ শেষ' },
  { value: 'void', label: 'বাতিল' },
];

const TONE = {
  active: 'bg-emerald-400/15 text-emerald-400',
  claimed: 'bg-sky-400/15 text-sky-400',
  expired: 'bg-line text-ink-muted',
  void: 'bg-red-500/15 text-red-400',
};

export default function Warranties() {
  return (
    <CrudPage
      table="warranties"
      title="ওয়ারেন্টি"
      subtitle="প্রতিটি বিক্রির ওয়ারেন্টি কার্ড — মেয়াদ, দাবি ও রিপ্লেসমেন্ট ট্র্যাক করুন।"
      addLabel="নতুন ওয়ারেন্টি"
      searchKeys={['warranty_code', 'order_code', 'customer_name', 'customer_phone', 'product_name']}
      filter={{ key: 'status', label: 'স্ট্যাটাস', options: STATUS }}
      emptyText="কোনো ওয়ারেন্টি নেই"
      fields={[
        { key: 'warranty_code', label: 'ওয়ারেন্টি নম্বর', required: true, placeholder: 'WR-2026-0001' },
        { key: 'order_code', label: 'অর্ডার নম্বর', required: true, placeholder: 'IMP-1001' },
        { key: 'customer_name', label: 'কাস্টমারের নাম', required: true },
        { key: 'customer_phone', label: 'মোবাইল নম্বর', required: true, placeholder: '01XXXXXXXXX' },
        { key: 'product_name', label: 'পণ্যের নাম', required: true },
        { key: 'serial_no', label: 'সিরিয়াল / IMEI নম্বর', placeholder: 'ঐচ্ছিক' },
        { key: 'duration_days', label: 'ওয়ারেন্টি মেয়াদ (দিন)', type: 'number', default: 30, help: 'যেমন ৭ দিন = ৭, ১ বছর = ৩৬৫।' },
        { key: 'start_date', label: 'শুরুর তারিখ', type: 'date' },
        { key: 'status', label: 'স্ট্যাটাস', type: 'select', options: STATUS, default: 'active' },
        { key: 'claim_note', label: 'দাবির বিবরণ', type: 'textarea', placeholder: 'কী সমস্যা হয়েছে, কীভাবে সমাধান হলো' },
        { key: 'replacement_product', label: 'রিপ্লেসমেন্ট পণ্য', placeholder: 'রিপ্লেস করলে পণ্যের নাম' },
      ]}
      columns={[
        { key: 'warranty_code', label: 'ওয়ারেন্টি নম্বর', render: (r) => <span className="font-mono text-xs">{r.warranty_code}</span> },
        { key: 'customer_name', label: 'কাস্টমার' },
        { key: 'product_name', label: 'পণ্য', render: (r) => <span className="text-ink-muted">{r.product_name}</span> },
        { key: 'duration_days', label: 'মেয়াদ', render: (r) => `${r.duration_days || 0} দিন` },
        { key: 'start_date', label: 'শুরু', render: (r) => <span className="text-xs text-ink-muted">{r.start_date ? dateBn(r.start_date) : '—'}</span> },
        { key: 'status', label: 'স্ট্যাটাস', render: (r) => (
          <span className={`badge ${TONE[r.status] || 'bg-line text-ink-muted'}`}>
            {STATUS.find((s) => s.value === r.status)?.label || r.status}
          </span>
        ) },
      ]}
    />
  );
}
