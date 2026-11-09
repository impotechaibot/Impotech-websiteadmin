import CrudPage from '../components/CrudPage.jsx';

export default function Policies() {
  return (
    <CrudPage
      table="policies"
      title="পলিসি পেজ"
      subtitle="রিটার্ন, রিফান্ড, প্রাইভেসি, শর্তাবলী, শিপিং — সাইটের আইনি ও নীতিমালা পেজ।"
      addLabel="নতুন পলিসি"
      searchKeys={['title', 'slug', 'body']}
      filter={{
        key: 'type',
        label: 'ধরন',
        options: [
          { value: 'return', label: 'রিটার্ন' },
          { value: 'refund', label: 'রিফান্ড' },
          { value: 'privacy', label: 'প্রাইভেসি' },
          { value: 'terms', label: 'শর্তাবলী' },
          { value: 'shipping', label: 'শিপিং' },
          { value: 'warranty', label: 'ওয়ারেন্টি' },
          { value: 'other', label: 'অন্যান্য' },
        ],
      }}
      emptyText="কোনো পলিসি পেজ নেই"
      fields={[
        { key: 'title', label: 'পেজের শিরোনাম', required: true, placeholder: 'রিটার্ন পলিসি' },
        { key: 'slug', label: 'URL slug', required: true, placeholder: 'return-policy', help: 'সাইটে /page/return-policy হিসেবে খুলবে।' },
        { key: 'type', label: 'ধরন', type: 'select', options: [
          { value: 'return', label: 'রিটার্ন' },
          { value: 'refund', label: 'রিফান্ড' },
          { value: 'privacy', label: 'প্রাইভেসি' },
          { value: 'terms', label: 'শর্তাবলী' },
          { value: 'shipping', label: 'শিপিং' },
          { value: 'warranty', label: 'ওয়ারেন্টি' },
          { value: 'other', label: 'অন্যান্য' },
        ], default: 'return' },
        { key: 'body', label: 'বিষয়বস্তু', type: 'textarea', required: true, placeholder: 'পণ্য পাওয়ার ৭ দিনের মধ্যে রিটার্ন করা যাবে…' },
        { key: 'meta_title', label: 'মেটা টাইটেল (SEO)', placeholder: 'খালি রাখলে শিরোনাম ব্যবহার হবে' },
        { key: 'meta_description', label: 'মেটা ডেসক্রিপশন (SEO)', type: 'textarea' },
        { key: 'active', label: 'সাইটে দেখাবে', type: 'toggle', default: true },
      ]}
      beforeSave={(p) => ({
        ...p,
        slug: String(p.slug || '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]+/g, '-')
          .replace(/^-+|-+$/g, ''),
      })}
      columns={[
        { key: 'title', label: 'শিরোনাম', render: (r) => <span className="font-medium">{r.title}</span> },
        { key: 'slug', label: 'URL', render: (r) => <span className="font-mono text-xs text-ink-muted">/page/{r.slug}</span> },
        { key: 'type', label: 'ধরন', render: (r) => <span className="badge bg-surface2 text-ink-muted">{r.type}</span> },
        { key: 'active', label: 'স্ট্যাটাস', render: (r) => (
          <span className={`badge ${r.active ? 'bg-emerald-400/15 text-emerald-400' : 'bg-line text-ink-muted'}`}>
            {r.active ? 'প্রকাশিত' : 'খসড়া'}
          </span>
        ) },
      ]}
    />
  );
}
