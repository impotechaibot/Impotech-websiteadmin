import CrudPage from '../components/CrudPage.jsx';
import { bdt, dateBn } from '../lib/format.js';

const STATUS = [
  { value: 'draft', label: 'খসড়া' },
  { value: 'ordered', label: 'অর্ডার দেওয়া হয়েছে' },
  { value: 'received', label: 'স্টকে এসেছে' },
  { value: 'cancelled', label: 'বাতিল' },
];

const TONE = {
  draft: 'bg-line text-ink-muted',
  ordered: 'bg-sky-400/15 text-sky-400',
  received: 'bg-emerald-400/15 text-emerald-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

export default function Purchases() {
  return (
    <CrudPage
      table="purchases"
      title="পারচেজ (ক্রয়)"
      subtitle="সাপ্লায়ার থেকে পণ্য কেনার রেকর্ড — খরচ ও স্টক হিসাব রাখুন।"
      addLabel="নতুন পারচেজ"
      searchKeys={['purchase_code', 'supplier_name', 'product_name', 'note']}
      filter={{ key: 'status', label: 'স্ট্যাটাস', options: STATUS }}
      emptyText="কোনো পারচেজ রেকর্ড নেই"
      fields={[
        { key: 'purchase_code', label: 'পারচেজ নম্বর', required: true, placeholder: 'PO-2026-0001' },
        { key: 'supplier_name', label: 'সাপ্লায়ার', required: true },
        { key: 'product_name', label: 'পণ্যের নাম', required: true },
        { key: 'qty', label: 'পরিমাণ', type: 'number', default: 1 },
        { key: 'unit_cost', label: 'একক ক্রয়মূল্য (৳)', type: 'number', default: 0 },
        { key: 'total_cost', label: 'মোট খরচ (৳)', type: 'number', default: 0, help: 'খালি রাখলে পরিমাণ × একক মূল্য ধরা হবে।' },
        { key: 'paid_amount', label: 'পরিশোধিত (৳)', type: 'number', default: 0 },
        { key: 'purchase_date', label: 'ক্রয়ের তারিখ', type: 'date' },
        { key: 'status', label: 'স্ট্যাটাস', type: 'select', options: STATUS, default: 'ordered' },
        { key: 'note', label: 'নোট', type: 'textarea' },
      ]}
      beforeSave={(p) => ({
        ...p,
        total_cost: Number(p.total_cost) || Number(p.qty) * Number(p.unit_cost) || 0,
      })}
      columns={[
        { key: 'purchase_code', label: 'পারচেজ নম্বর', render: (r) => <span className="font-mono text-xs">{r.purchase_code}</span> },
        { key: 'supplier_name', label: 'সাপ্লায়ার' },
        { key: 'product_name', label: 'পণ্য', render: (r) => <span className="text-ink-muted">{r.product_name}</span> },
        { key: 'qty', label: 'পরিমাণ' },
        { key: 'total_cost', label: 'মোট খরচ', render: (r) => bdt(r.total_cost) },
        { key: 'due', label: 'বাকি', render: (r) => {
          const due = Number(r.total_cost || 0) - Number(r.paid_amount || 0);
          return <span className={due > 0 ? 'text-red-400' : 'text-emerald-400'}>{bdt(due)}</span>;
        } },
        { key: 'status', label: 'স্ট্যাটাস', render: (r) => (
          <span className={`badge ${TONE[r.status] || 'bg-line text-ink-muted'}`}>
            {STATUS.find((s) => s.value === r.status)?.label || r.status}
          </span>
        ) },
        { key: 'purchase_date', label: 'তারিখ', render: (r) => <span className="text-xs text-ink-muted">{r.purchase_date ? dateBn(r.purchase_date) : '—'}</span> },
      ]}
    />
  );
}
