import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSetting, saveSetting } from '../services/settings.js';

const PAGES = [
  { key: 'about', label: 'আমাদের সম্পর্কে' },
  { key: 'privacy', label: 'প্রাইভেসি পলিসি' },
  { key: 'terms', label: 'শর্তাবলী' },
  { key: 'returns', label: 'রিটার্ন পলিসি' },
  { key: 'faq', label: 'সাধারণ প্রশ্নোত্তর' },
];

export default function ContentPages() {
  const [content, setContent] = useState(null);
  const [active, setActive] = useState('about');

  useEffect(() => {
    (async () => setContent((await getSetting('content')) || {}))();
  }, []);

  const save = async () => {
    try {
      await saveSetting('content', content);
      toast.success('কনটেন্ট সেভ হয়েছে');
    } catch (e) { toast.error(e.message); }
  };

  if (!content) return <div className="text-ink-muted">লোড হচ্ছে…</div>;

  const page = content[active] || { title: '', body: '' };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">কনটেন্ট পেজ</h1>
        <button className="btn-primary" onClick={save}>সেভ করুন</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {PAGES.map((p) => (
          <button key={p.key}
            className={`px-3 py-2 rounded-field text-sm border ${active === p.key ? 'border-accent text-accent' : 'border-line text-ink-muted'}`}
            onClick={() => setActive(p.key)}>{p.label}</button>
        ))}
      </div>

      <div className="card space-y-4">
        <div>
          <label className="label">শিরোনাম</label>
          <input className="input" value={page.title}
            onChange={(e) => setContent({ ...content, [active]: { ...page, title: e.target.value } })} />
        </div>
        <div>
          <label className="label">বডি (Markdown সাপোর্টেড)</label>
          <textarea className="input min-h-[300px] font-mono text-sm" value={page.body}
            onChange={(e) => setContent({ ...content, [active]: { ...page, body: e.target.value } })} />
        </div>
      </div>
    </div>
  );
}
