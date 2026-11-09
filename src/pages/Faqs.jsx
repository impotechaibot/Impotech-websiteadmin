import CrudPage from '../components/CrudPage.jsx';

export default function Faqs() {
  return (
    <CrudPage
      table="faqs"
      title="সাধারণ প্রশ্নোত্তর (FAQ)"
      subtitle="কাস্টমারদের বারবার জিজ্ঞাসা — এখানে যোগ করলে সাইটে দেখাবে।"
      addLabel="নতুন প্রশ্ন"
      searchKeys={['question', 'answer', 'category']}
      filter={{
        key: 'category',
        label: 'বিভাগ',
        options: [
          { value: 'order', label: 'অর্ডার' },
          { value: 'delivery', label: 'ডেলিভারি' },
          { value: 'payment', label: 'পেমেন্ট' },
          { value: 'return', label: 'রিটার্ন' },
          { value: 'product', label: 'পণ্য' },
          { value: 'other', label: 'অন্যান্য' },
        ],
      }}
      emptyText="কোনো প্রশ্ন যোগ করা হয়নি"
      fields={[
        { key: 'question', label: 'প্রশ্ন', required: true, placeholder: 'ডেলিভারি কত দিনে পাব?' },
        { key: 'answer', label: 'উত্তর', type: 'textarea', required: true, placeholder: 'ঢাকার ভেতরে ২৪–৪৮ ঘণ্টা, ঢাকার বাইরে ৩–৫ দিন।' },
        { key: 'category', label: 'বিভাগ', type: 'select', options: [
          { value: 'order', label: 'অর্ডার' },
          { value: 'delivery', label: 'ডেলিভারি' },
          { value: 'payment', label: 'পেমেন্ট' },
          { value: 'return', label: 'রিটার্ন' },
          { value: 'product', label: 'পণ্য' },
          { value: 'other', label: 'অন্যান্য' },
        ], default: 'order' },
        { key: 'sort_order', label: 'ক্রম', type: 'number', default: 0, help: 'ছোট সংখ্যা আগে দেখাবে।' },
        { key: 'active', label: 'সাইটে দেখাবে', type: 'toggle', default: true },
      ]}
      columns={[
        { key: 'question', label: 'প্রশ্ন', render: (r) => <span className="font-medium">{r.question}</span> },
        { key: 'answer', label: 'উত্তর', render: (r) => <span className="text-ink-muted text-xs line-clamp-2">{r.answer}</span> },
        { key: 'category', label: 'বিভাগ', render: (r) => <span className="badge bg-surface2 text-ink-muted">{r.category}</span> },
        { key: 'sort_order', label: 'ক্রম' },
        { key: 'active', label: 'স্ট্যাটাস', render: (r) => (
          <span className={`badge ${r.active ? 'bg-emerald-400/15 text-emerald-400' : 'bg-line text-ink-muted'}`}>
            {r.active ? 'দৃশ্যমান' : 'লুকানো'}
          </span>
        ) },
      ]}
    />
  );
}
