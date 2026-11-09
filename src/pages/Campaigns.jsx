import CrudPage from '../components/CrudPage.jsx';
import { bdt, dateBn } from '../lib/format.js';

const STATUS = [
  { value: 'active', label: 'সক্রিয়' },
  { value: 'paused', label: 'বিরতিতে' },
  { value: 'ended', label: 'শেষ হয়েছে' },
];

const TONE = {
  active: 'bg-emerald-400/15 text-emerald-400',
  paused: 'bg-accent/15 text-accent',
  ended: 'bg-line text-ink-muted',
};

export default function Campaigns() {
  return (
    <CrudPage
      table="campaigns"
      title="ক্যাম্পেইন"
      subtitle="সিজনাল অফার, ফ্ল্যাশ সেল ও ডিসকাউন্ট ক্যাম্পেইন — শুরুর ও শেষের তারিখসহ।"
      addLabel="নতুন ক্যাম্পেইন"
      searchKeys={['name', 'code', 'description']}
      filter={{ key: 'status', label: 'স্ট্যাটাস', options: STATUS }}
      emptyText="কোনো ক্যাম্পেইন নেই"
      fields={[
        { key: 'name', label: 'ক্যাম্পেইনের নাম', required: true, placeholder: 'যেমন: ঈদ ধামাকা অফার' },
        { key: 'code', label: 'কুপন কোড', placeholder: 'EID2026', help: 'কুপন পেজে একই কোড তৈরি করলে এটি কাজ করবে।' },
        { key: 'description', label: 'বর্ণনা', type: 'textarea' },
        { key: 'discount_type', label: 'ছাড়ের ধরন', type: 'select', options: [
          { value: 'percent', label: 'শতকরা (%)' },
          { value: 'fixed', label: 'ফিক্সড (৳)' },
        ], default: 'percent' },
        { key: 'discount_value', label: 'ছাড়ের পরিমাণ', type: 'number', default: 0 },
        { key: 'min_order', label: 'ন্যূনতম অর্ডার (৳)', type: 'number', default: 0 },
        { key: 'start_date', label: 'শুরুর তারিখ', type: 'date' },
        { key: 'end_date', label: 'শেষের তারিখ', type: 'date' },
        { key: 'banner_text', label: 'ব্যানার লেখা', placeholder: 'সাইটের উপরে দেখানো হবে' },
        { key: 'status', label: 'স্ট্যাটাস', type: 'select', options: STATUS, default: 'active' },
      ]}
      columns={[
        { key: 'name', label: 'ক্যাম্পেইন' },
        { key: 'code', label: 'কোড', render: (r) => r.code ? <span className="font-mono text-xs">{r.code}</span> : '—' },
        { key: 'discount', label: 'ছাড়', render: (r) => r.discount_type === 'percent' ? `${r.discount_value}%` : bdt(r.discount_value) },
        { key: 'period', label: 'সময়কাল', render: (r) => (
          <span className="text-xs text-ink-muted">
            {r.start_date ? dateBn(r.start_date) : '—'} → {r.end_date ? dateBn(r.end_date) : '—'}
          </span>
        ) },
        { key: 'status', label: 'স্ট্যাটাস', render: (r) => (
          <span className={`badge ${TONE[r.status] || 'bg-line text-ink-muted'}`}>
            {STATUS.find((s) => s.value === r.status)?.label || r.status}
          </span>
        ) },
      ]}
    />
  );
}
