import CrudPage from '../components/CrudPage.jsx';
import { bdt } from '../lib/format.js';

export default function Suppliers() {
  return (
    <CrudPage
      table="suppliers"
      title="সাপ্লায়ার"
      subtitle="পণ্য সরবরাহকারীদের তথ্য, বাকি ও পেমেন্ট — এক জায়গায়।"
      addLabel="নতুন সাপ্লায়ার"
      searchKeys={['name', 'company', 'phone', 'email', 'address']}
      emptyText="কোনো সাপ্লায়ার নেই"
      fields={[
        { key: 'name', label: 'সাপ্লায়ারের নাম', required: true },
        { key: 'company', label: 'প্রতিষ্ঠানের নাম', placeholder: 'যেমন: চায়না ট্রেডিং কোং' },
        { key: 'phone', label: 'মোবাইল নম্বর', required: true, placeholder: '01XXXXXXXXX' },
        { key: 'email', label: 'ইমেইল', placeholder: 'supplier@example.com' },
        { key: 'address', label: 'ঠিকানা', type: 'textarea' },
        { key: 'country', label: 'দেশ', default: 'China' },
        { key: 'payment_terms', label: 'পেমেন্ট শর্ত', placeholder: 'যেমন: ৩০ দিনের ক্রেডিট' },
        { key: 'due_amount', label: 'বাকি (৳)', type: 'number', default: 0 },
        { key: 'note', label: 'নোট', type: 'textarea' },
        { key: 'active', label: 'সক্রিয়', type: 'toggle', default: true },
      ]}
      columns={[
        { key: 'name', label: 'নাম' },
        { key: 'company', label: 'প্রতিষ্ঠান', render: (r) => <span className="text-ink-muted">{r.company || '—'}</span> },
        { key: 'phone', label: 'মোবাইল', render: (r) => <span className="font-mono text-xs">{r.phone}</span> },
        { key: 'due_amount', label: 'বাকি', render: (r) => (
          <span className={Number(r.due_amount) > 0 ? 'text-red-400' : 'text-ink-muted'}>{bdt(r.due_amount)}</span>
        ) },
        { key: 'active', label: 'স্ট্যাটাস', render: (r) => (
          <span className={`badge ${r.active ? 'bg-emerald-400/15 text-emerald-400' : 'bg-line text-ink-muted'}`}>
            {r.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
          </span>
        ) },
      ]}
    />
  );
}
