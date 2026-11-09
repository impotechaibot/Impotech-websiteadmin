import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSetting, saveSetting } from '../services/settings.js';
import ImageUploader from '../components/ImageUploader.jsx';
import { generateSeo, geminiReady } from '../lib/gemini.js';

const ROUTES = ['home', 'products', 'product', 'cart', 'checkout', 'track', 'search', 'wishlist'];

export default function SeoSettings() {
  const [seo, setSeo] = useState(null);
  const [ogImage, setOgImage] = useState('');
  const [active, setActive] = useState('home');

  useEffect(() => {
    (async () => {
      const [s, og] = await Promise.all([getSetting('seo'), getSetting('ogImage')]);
      setSeo(s || {});
      setOgImage(og || '');
    })();
  }, []);

  const save = async () => {
    try {
      await saveSetting('seo', seo);
      await saveSetting('ogImage', ogImage);
      toast.success('SEO সেভ হয়েছে');
    } catch (e) { toast.error(e.message); }
  };

  const aiFill = async () => {
    try {
      const text = await generateSeo(active, seo[active]?.description || '');
      const title = text.match(/TITLE:\s*(.+)/)?.[1]?.trim() || '';
      const desc = text.match(/DESC:\s*(.+)/)?.[1]?.trim() || '';
      setSeo({ ...seo, [active]: { title, description: desc } });
      toast.success('AI SEO তৈরি হয়েছে');
    } catch (e) { toast.error(e.message); }
  };

  if (!seo) return <div className="text-ink-muted">লোড হচ্ছে…</div>;

  const page = seo[active] || { title: '', description: '' };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">SEO</h1>
        <button className="btn-primary" onClick={save}>সেভ করুন</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {ROUTES.map((r) => (
          <button key={r}
            className={`px-3 py-2 rounded-field text-sm border ${active === r ? 'border-accent text-accent' : 'border-line text-ink-muted'}`}
            onClick={() => setActive(r)}>{r}</button>
        ))}
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{active} পেজ</h2>
          {geminiReady() && (
            <button className="text-xs text-accent inline-flex items-center gap-1" onClick={aiFill}>
              <Sparkles size={13} /> AI দিয়ে লিখুন
            </button>
          )}
        </div>
        <div>
          <label className="label">টাইটেল ({page.title?.length || 0}/60)</label>
          <input className="input" value={page.title}
            onChange={(e) => setSeo({ ...seo, [active]: { ...page, title: e.target.value } })} />
        </div>
        <div>
          <label className="label">মেটা ডেসক্রিপশন ({page.description?.length || 0}/155)</label>
          <textarea className="input" value={page.description}
            onChange={(e) => setSeo({ ...seo, [active]: { ...page, description: e.target.value } })} />
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold">OG ইমেজ (সোশ্যাল শেয়ার)</h2>
        <ImageUploader images={ogImage ? [ogImage] : []}
          onChange={(imgs) => setOgImage(imgs[0] || '')} />
      </div>
    </div>
  );
}
