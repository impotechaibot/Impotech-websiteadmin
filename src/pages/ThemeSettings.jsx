import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSetting, saveSetting } from '../services/settings.js';
import ImageUploader from '../components/ImageUploader.jsx';

const PRESETS = ['#f0b429', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#ec4899', '#14b8a6', '#f97316'];
const BG_PRESETS = [
  { id: 'charcoal', label: 'চারকোল', value: '#08080a' },
  { id: 'midnight', label: 'মিডনাইট ব্লু', value: '#0a1226' },
  { id: 'forest', label: 'ফরেস্ট গ্রিন', value: '#07130f' },
  { id: 'plum', label: 'ডিপ প্লাম', value: '#150a1c' },
  { id: 'wine', label: 'ওয়াইন রেড', value: '#1a0808' },
  { id: 'graphite', label: 'গ্রাফাইট', value: '#17181c' },
];

export default function ThemeSettings() {
  const [theme, setTheme] = useState(null);
  const [bg, setBg] = useState(null);
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    (async () => {
      const [t, b, l] = await Promise.all([getSetting('theme'), getSetting('background'), getSetting('layout')]);
      setTheme(t || { accent: '#f0b429', accentDark: '#c9920f', fontScale: 100, radius: 18, mode: 'dark' });
      setBg(b || { type: 'color', color: '#08080a', image: '', overlay: 45, blur: 0 });
      setLayout(l || { imageRatio: 'square', titleStyle: 'stacked', priceStyle: 'inline', buttonStyle: 'split', descStyle: 'plain', spacing: 'cozy', stickyBar: true, showRelated: true, showReviews: true });
    })();
  }, []);

  const save = async () => {
    try {
      await saveSetting('theme', theme);
      await saveSetting('background', bg);
      await saveSetting('layout', layout);
      toast.success('থিম ও Product Layout Website-এ Sync হয়েছে');
    } catch (e) { toast.error(e.message); }
  };

  if (!theme || !bg || !layout) return <div className="text-ink-muted">লোড হচ্ছে…</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">থিম</h1>
        <button className="btn-primary" onClick={save}>সেভ করুন</button>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold">অ্যাকসেন্ট কালার</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((c) => (
            <button key={c} className={`w-9 h-9 rounded-lg border-2 ${theme.accent === c ? 'border-white' : 'border-transparent'}`}
              style={{ background: c }} onClick={() => setTheme({ ...theme, accent: c })} />
          ))}
          <input type="color" className="w-9 h-9 rounded-lg bg-transparent"
            value={theme.accent} onChange={(e) => setTheme({ ...theme, accent: e.target.value })} />
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold">লেআউট</h2>
        <div>
          <label className="label">ফন্ট সাইজ স্কেল: {theme.fontScale}%</label>
          <input type="range" min="85" max="120" value={theme.fontScale}
            onChange={(e) => setTheme({ ...theme, fontScale: Number(e.target.value) })} className="w-full" />
        </div>
        <div>
          <label className="label">বাটন গোলাকার (radius): {theme.radius}px</label>
          <input type="range" min="0" max="30" value={theme.radius}
            onChange={(e) => setTheme({ ...theme, radius: Number(e.target.value) })} className="w-full" />
        </div>
        <div>
          <label className="label">মোড</label>
          <select className="input max-w-[200px]" value={theme.mode}
            onChange={(e) => setTheme({ ...theme, mode: e.target.value })}>
            <option value="dark">ডার্ক</option>
            <option value="light">লাইট</option>
          </select>
        </div>
      </div>


      <div className="card space-y-4">
        <h2 className="font-semibold">Product Details Layout</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label">Product image ratio</label><select className="input" value={layout.imageRatio} onChange={(e) => setLayout({ ...layout, imageRatio: e.target.value })}><option value="square">Square (1:1)</option><option value="wide">Wide (4:3)</option><option value="tall">Portrait (3:4)</option></select></div>
          <div><label className="label">Title layout</label><select className="input" value={layout.titleStyle} onChange={(e) => setLayout({ ...layout, titleStyle: e.target.value })}><option value="stacked">Stacked</option><option value="inline">Inline</option><option value="centered">Centered</option></select></div>
          <div><label className="label">Price style</label><select className="input" value={layout.priceStyle} onChange={(e) => setLayout({ ...layout, priceStyle: e.target.value })}><option value="inline">Inline</option><option value="stacked">Stacked</option><option value="boxed">Boxed</option></select></div>
          <div><label className="label">Buy buttons</label><select className="input" value={layout.buttonStyle} onChange={(e) => setLayout({ ...layout, buttonStyle: e.target.value })}><option value="split">Side by side</option><option value="stacked">Stacked</option><option value="full">Full width</option></select></div>
          <div><label className="label">Description style</label><select className="input" value={layout.descStyle} onChange={(e) => setLayout({ ...layout, descStyle: e.target.value })}><option value="plain">Plain</option><option value="card">Card</option><option value="bullets">Bullet lines</option></select></div>
          <div><label className="label">Spacing</label><select className="input" value={layout.spacing} onChange={(e) => setLayout({ ...layout, spacing: e.target.value })}><option value="compact">Compact</option><option value="cozy">Comfortable</option><option value="roomy">Roomy</option></select></div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={layout.stickyBar !== false} onChange={(e) => setLayout({ ...layout, stickyBar: e.target.checked })}/> Mobile floating/sticky buy bar</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={layout.showRelated !== false} onChange={(e) => setLayout({ ...layout, showRelated: e.target.checked })}/> Related products section</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={layout.showReviews !== false} onChange={(e) => setLayout({ ...layout, showReviews: e.target.checked })}/> Reviews section</label>
      </div>
      <div className="card space-y-4">
        <h2 className="font-semibold">ব্যাকগ্রাউন্ড</h2>
        <div className="flex gap-2">
          <button className={`btn-ghost text-sm ${bg.type === 'color' ? 'border-accent' : ''}`}
            onClick={() => setBg({ ...bg, type: 'color' })}>রঙ</button>
          <button className={`btn-ghost text-sm ${bg.type === 'image' ? 'border-accent' : ''}`}
            onClick={() => setBg({ ...bg, type: 'image' })}>ছবি</button>
        </div>

        {bg.type === 'color' ? (
          <div className="flex flex-wrap gap-2">
            {BG_PRESETS.map((p) => (
              <button key={p.id} className={`px-3 py-2 rounded-field text-sm border ${bg.color === p.value ? 'border-accent text-accent' : 'border-line text-ink-muted'}`}
                onClick={() => setBg({ ...bg, color: p.value })}>{p.label}</button>
            ))}
            <input type="color" className="w-10 h-10 rounded-lg bg-transparent"
              value={bg.color} onChange={(e) => setBg({ ...bg, color: e.target.value })} />
          </div>
        ) : (
          <ImageUploader images={bg.image ? [bg.image] : []}
            onChange={(imgs) => setBg({ ...bg, image: imgs[0] || '' })} />
        )}

        <div>
          <label className="label">ওভারলে ডার্কনেস: {bg.overlay}%</label>
          <input type="range" min="0" max="95" value={bg.overlay}
            onChange={(e) => setBg({ ...bg, overlay: Number(e.target.value) })} className="w-full" />
        </div>
      </div>
    </div>
  );
}
