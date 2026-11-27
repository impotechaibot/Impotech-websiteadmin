import { useEffect, useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Monitor, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSetting, saveSetting } from '../services/settings.js';
import ImageUploader from '../components/ImageUploader.jsx';

const EMPTY_SLIDE = { image: '', imageDesktop: '', imageMobile: '', video: '', videoThumbnail: '', tag: '', title: '', text: '', cta: '', link: '' };
const DEFAULT_HERO_SETTINGS = { overlay: 65, desktopHeight: 520, mobileHeight: 400, textPosition: 'left', imageFit: 'cover', imagePosition: 'center', autoSlideSeconds: 6, showServiceButton: true };
const DEFAULT_SECTIONS = [
  { id: 'hero', type: 'hero', enabled: true, title: '', subtitle: '', backgroundColor: '', backgroundImage: '', overlay: 0, padding: '0' },
  { id: 'perks', type: 'perks', enabled: true, title: '', subtitle: '', backgroundColor: '', backgroundImage: '', overlay: 0, padding: '40px 0' },
  { id: 'categories', type: 'categories', enabled: true, title: 'ক্যাটাগরি', subtitle: 'আপনার পছন্দের ক্যাটাগরি বেছে নিন', backgroundColor: '', backgroundImage: '', overlay: 0, padding: '32px 0' },
  { id: 'featured', type: 'featured', enabled: true, title: 'ফিচার্ড পণ্য', subtitle: 'আমাদের বাছাই করা সেরা পণ্য', backgroundColor: '', backgroundImage: '', overlay: 0, padding: '32px 0' },
  { id: 'banners', type: 'banners', enabled: true, title: '', subtitle: '', backgroundColor: '', backgroundImage: '', overlay: 0, padding: '32px 0' },
  { id: 'services', type: 'services', enabled: true, title: 'আমাদের সার্ভিস', subtitle: 'কেনার পরেও আমরা পাশে আছি', backgroundColor: '', backgroundImage: '', overlay: 0, padding: '32px 0' },
  { id: 'latest', type: 'latest', enabled: true, title: 'নতুন এসেছে', subtitle: 'সদ্য যোগ হওয়া পণ্য', backgroundColor: '', backgroundImage: '', overlay: 0, padding: '32px 0' },
  { id: 'newsletter', type: 'newsletter', enabled: true, title: '', subtitle: '', backgroundColor: '', backgroundImage: '', overlay: 0, padding: '32px 0' },
];
const SECTION_LABELS = { hero: 'Hero Slider', perks: 'Service Benefits', categories: 'Category Strip', featured: 'Featured Products', banners: 'Promo Banners', services: 'Services', latest: 'Latest Products', newsletter: 'Newsletter', custom: 'Custom Section' };
const cloneDefaults = () => DEFAULT_SECTIONS.map((s) => ({ ...s }));

export default function HomeContent() {
  const [slides, setSlides] = useState([]);
  const [banners, setBanners] = useState([]);
  const [services, setServices] = useState([]);
  const [newsletter, setNewsletter] = useState({ title: '', text: '', button: '' });
  const [sections, setSections] = useState(cloneDefaults());
  const [heroSettings, setHeroSettings] = useState(DEFAULT_HERO_SETTINGS);
  const [draggedSectionId, setDraggedSectionId] = useState('');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [h, n] = await Promise.all([getSetting('home'), getSetting('newsletter')]);
      setSlides(h?.slides || []);
      setBanners(h?.banners || []);
      setServices(h?.services || []);
      setNewsletter(n || h?.newsletter || { title: '', text: '', button: '' });
      setSections(Array.isArray(h?.sectionLayout) && h.sectionLayout.length ? h.sectionLayout : cloneDefaults());
      setHeroSettings({ ...DEFAULT_HERO_SETTINGS, ...(h?.heroSettings || {}) });
      setReady(true);
    })();
  }, []);

  const save = async () => {
    try {
      await saveSetting('home', { slides, banners, services, sectionLayout: sections, heroSettings });
      await saveSetting('newsletter', newsletter);
      toast.success('হোম কনটেন্ট সেভ হয়েছে — Website-এর সঙ্গে Sync হয়েছে');
    } catch (e) { toast.error(e.message); }
  };

  const move = (list, setList, i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
  };
  const updateSection = (id, patch) => setSections((old) => old.map((s) => s.id === id ? { ...s, ...patch } : s));
  const addCustomSection = () => setSections((old) => [...old, {
    id: `custom-${Date.now()}`, type: 'custom', enabled: true, title: 'নতুন সেকশন', subtitle: '', text: '', image: '', buttonText: '', buttonLink: '', backgroundColor: '', backgroundImage: '', overlay: 35, padding: '32px 0'
  }]);
  const removeSection = (id) => setSections((old) => old.filter((s) => s.id !== id));
  const reorderSection = (sourceId, targetId) => setSections((old) => { const a = old.findIndex((x) => x.id === sourceId); const b = old.findIndex((x) => x.id === targetId); if (a < 0 || b < 0 || a === b) return old; const next = [...old]; const [item] = next.splice(a, 1); next.splice(b, 0, item); return next; });

  if (!ready) return <div className="text-ink-muted">লোড হচ্ছে…</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">হোম কনটেন্ট ও Visual Builder</h1>
        <button className="btn-primary" onClick={save}>সেভ ও Website Sync</button>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold">Hero Slider — Global Settings</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="label">Overlay darkness: {heroSettings.overlay}%<input className="w-full" type="range" min="0" max="95" value={heroSettings.overlay} onChange={(e) => setHeroSettings({ ...heroSettings, overlay: Number(e.target.value) })}/></label>
          <div><label className="label">Text position</label><select className="input" value={heroSettings.textPosition} onChange={(e) => setHeroSettings({ ...heroSettings, textPosition: e.target.value })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></div>
          <div><label className="label">Desktop height (px)</label><input className="input" type="number" min="250" max="900" value={heroSettings.desktopHeight} onChange={(e) => setHeroSettings({ ...heroSettings, desktopHeight: Number(e.target.value) })}/></div>
          <div><label className="label">Mobile height (px)</label><input className="input" type="number" min="220" max="700" value={heroSettings.mobileHeight} onChange={(e) => setHeroSettings({ ...heroSettings, mobileHeight: Number(e.target.value) })}/></div>
          <div><label className="label">Image fit</label><select className="input" value={heroSettings.imageFit} onChange={(e) => setHeroSettings({ ...heroSettings, imageFit: e.target.value })}><option value="cover">Cover</option><option value="contain">Contain</option></select></div>
          <div><label className="label">Image position</label><select className="input" value={heroSettings.imagePosition} onChange={(e) => setHeroSettings({ ...heroSettings, imagePosition: e.target.value })}><option value="center">Center</option><option value="top">Top</option><option value="bottom">Bottom</option><option value="left">Left</option><option value="right">Right</option></select></div>
          <div><label className="label">Auto slide seconds</label><input className="input" type="number" min="0" max="30" value={heroSettings.autoSlideSeconds} onChange={(e) => setHeroSettings({ ...heroSettings, autoSlideSeconds: Number(e.target.value) })}/><small className="text-ink-muted">0 = auto-slide off</small></div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={heroSettings.showServiceButton !== false} onChange={(e) => setHeroSettings({ ...heroSettings, showServiceButton: e.target.checked })}/> Show secondary Service button</label>
      </div>

      {/* Home page section builder */}
      <div className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><h2 className="font-semibold">Homepage Section Builder</h2><p className="text-xs text-ink-muted mt-1">Section চালু/বন্ধ, উপরে-নিচে সরান, Background ও Custom Section নিয়ন্ত্রণ করুন।</p></div>
          <button className="btn-ghost text-sm" onClick={addCustomSection}><Plus size={16}/> Custom Section</button>
        </div>
        <div className="space-y-3">
          {sections.map((s, i) => (
            <div key={s.id} draggable onDragStart={() => setDraggedSectionId(s.id)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (draggedSectionId) reorderSection(draggedSectionId, s.id); setDraggedSectionId(''); }} onDragEnd={() => setDraggedSectionId('')} className="border border-line rounded-field p-3 sm:p-4 space-y-3 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <button className="p-1.5 rounded hover:bg-surface2" title="উপরে" onClick={() => move(sections, setSections, i, -1)}><ArrowUp size={15}/></button>
                  <button className="p-1.5 rounded hover:bg-surface2" title="নিচে" onClick={() => move(sections, setSections, i, 1)}><ArrowDown size={15}/></button>
                </div>
                <strong className="text-sm flex-1">{SECTION_LABELS[s.type] || s.type} {s.type === 'custom' ? `(${s.title || 'Custom'})` : ''}</strong>
                <button className="p-1.5 rounded hover:bg-surface2" title={s.enabled ? 'Hide section' : 'Show section'} onClick={() => updateSection(s.id, { enabled: !s.enabled })}>{s.enabled ? <Eye size={16}/> : <EyeOff size={16}/>}</button>
                {s.type === 'custom' && <button className="p-1.5 rounded text-red-400 hover:bg-red-500/10" onClick={() => removeSection(s.id)} title="Remove"><Trash2 size={16}/></button>}
              </div>
              {s.type !== 'hero' && s.type !== 'banners' && s.type !== 'perks' && s.type !== 'newsletter' && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <input className="input" value={s.title || ''} placeholder="Section title" onChange={(e) => updateSection(s.id, { title: e.target.value })}/>
                  <input className="input" value={s.subtitle || ''} placeholder="Section subtitle" onChange={(e) => updateSection(s.id, { subtitle: e.target.value })}/>
                </div>
              )}
              {s.type === 'custom' && <>
                <textarea className="input" rows={3} placeholder="Custom section text" value={s.text || ''} onChange={(e) => updateSection(s.id, { text: e.target.value })}/>
                <div className="grid sm:grid-cols-2 gap-3"><input className="input" placeholder="Button text" value={s.buttonText || ''} onChange={(e) => updateSection(s.id, { buttonText: e.target.value })}/><input className="input" placeholder="Button link / URL" value={s.buttonLink || ''} onChange={(e) => updateSection(s.id, { buttonLink: e.target.value })}/></div>
                <label className="label">Section image</label><ImageUploader images={s.image ? [s.image] : []} onChange={(imgs) => updateSection(s.id, { image: imgs[0] || '' })}/>
              </>}
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-xs text-ink-muted">Background color<input className="input mt-1" type="color" value={s.backgroundColor || '#08080a'} onChange={(e) => updateSection(s.id, { backgroundColor: e.target.value })}/></label>
                <label className="text-xs text-ink-muted">Overlay: {Number(s.overlay || 0)}%<input className="w-full" type="range" min="0" max="90" value={Number(s.overlay || 0)} onChange={(e) => updateSection(s.id, { overlay: Number(e.target.value) })}/></label>
              </div>
              <label className="label">Background image (optional)</label><ImageUploader images={s.backgroundImage ? [s.backgroundImage] : []} onChange={(imgs) => updateSection(s.id, { backgroundImage: imgs[0] || '' })}/>
              <div className="grid sm:grid-cols-2 gap-3"><label className="label">Section padding<input className="input mt-1" value={s.padding || '32px 0'} placeholder="32px 0" onChange={(e) => updateSection(s.id, { padding: e.target.value })}/></label><label className="label">Background position<select className="input mt-1" value={s.backgroundPosition || 'center'} onChange={(e) => updateSection(s.id, { backgroundPosition: e.target.value })}><option value="center">Center</option><option value="top">Top</option><option value="bottom">Bottom</option><option value="left">Left</option><option value="right">Right</option></select></label></div>
              <label className="label">Animation<select className="input mt-1" value={s.animation || 'none'} onChange={(e) => updateSection(s.id, { animation: e.target.value })}><option value="none">None</option><option value="fade-up">Fade up</option><option value="fade-in">Fade in</option></select></label>
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-3"><div className="flex items-center justify-between"><h2 className="font-semibold">Responsive Preview</h2><div className="flex gap-1"><button className={`btn-ghost ${previewMode === 'desktop' ? 'text-accent' : ''}`} onClick={() => setPreviewMode('desktop')}><Monitor size={16}/></button><button className={`btn-ghost ${previewMode === 'mobile' ? 'text-accent' : ''}`} onClick={() => setPreviewMode('mobile')}><Smartphone size={16}/></button></div></div><div className="bg-surface2 rounded-field p-3 flex justify-center overflow-auto"><div className="bg-bg border border-line rounded-lg overflow-hidden transition-all" style={{ width: previewMode === 'mobile' ? 360 : '100%', maxWidth: previewMode === 'mobile' ? 360 : 900 }}><div className="p-2 border-b border-line text-xs text-ink-muted">Homepage Preview — {previewMode}</div>{sections.filter((sec) => sec.enabled !== false).map((sec) => <div key={sec.id} className="p-3 border-b border-line" style={{ backgroundColor: sec.backgroundColor || 'transparent', backgroundImage: sec.backgroundImage ? `linear-gradient(rgba(0,0,0,${Number(sec.overlay || 0)/100}),rgba(0,0,0,${Number(sec.overlay || 0)/100})),url(${sec.backgroundImage})` : 'none', backgroundSize: 'cover', backgroundPosition: sec.backgroundPosition || 'center', backgroundPosition: sec.backgroundPosition || 'center' }}><strong className="text-xs">{SECTION_LABELS[sec.type] || sec.type}</strong>{sec.type === 'hero' && slides[0]?.title && <p className="font-semibold mt-2">{slides[0].title}</p>}{sec.type === 'custom' && <p className="text-sm mt-1">{sec.title || sec.text || 'Custom content'}</p>}</div>)}</div></div></div>

      {/* hero slide CRUD */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between"><h2 className="font-semibold">হিরো স্লাইড</h2><button className="btn-ghost text-sm" onClick={() => setSlides([...slides, { ...EMPTY_SLIDE }])}><Plus size={16}/> যোগ</button></div>
        {slides.map((s, i) => <div key={i} className="border border-line rounded-field p-4 space-y-3">
          <div className="flex items-center justify-between"><span className="text-sm text-ink-muted">স্লাইড {i + 1}</span><div className="flex gap-1"><button className="p-1.5 rounded hover:bg-surface2" onClick={() => move(slides, setSlides, i, -1)}><ArrowUp size={14}/></button><button className="p-1.5 rounded hover:bg-surface2" onClick={() => move(slides, setSlides, i, 1)}><ArrowDown size={14}/></button><button className="p-1.5 rounded hover:bg-red-500/20 text-red-400" onClick={() => setSlides(slides.filter((_, x) => x !== i))}><Trash2 size={14}/></button></div></div>
          <div><label className="label">Desktop image</label><ImageUploader images={(s.imageDesktop || s.image) ? [s.imageDesktop || s.image] : []} onChange={(imgs) => setSlides(slides.map((x, xi) => xi === i ? { ...x, imageDesktop: imgs[0] || '', image: imgs[0] || x.image } : x))}/></div>
          <div><label className="label">Mobile image (optional)</label><ImageUploader images={s.imageMobile ? [s.imageMobile] : []} onChange={(imgs) => setSlides(slides.map((x, xi) => xi === i ? { ...x, imageMobile: imgs[0] || '' } : x))}/></div>
          <input className="input" placeholder="Video URL (MP4/WebM or YouTube)" value={s.video || ''} onChange={(e) => setSlides(slides.map((x, xi) => xi === i ? { ...x, video: e.target.value } : x))}/>
          <div><label className="label">Video thumbnail / poster</label><ImageUploader images={s.videoThumbnail ? [s.videoThumbnail] : []} onChange={(imgs) => setSlides(slides.map((x, xi) => xi === i ? { ...x, videoThumbnail: imgs[0] || '' } : x))}/></div>
          <input className="input" placeholder="ট্যাগ" value={s.tag || ''} onChange={(e) => setSlides(slides.map((x, xi) => xi === i ? { ...x, tag: e.target.value } : x))}/>
          <input className="input" placeholder="শিরোনাম" value={s.title || ''} onChange={(e) => setSlides(slides.map((x, xi) => xi === i ? { ...x, title: e.target.value } : x))}/>
          <textarea className="input" placeholder="সাবটাইটেল" value={s.text || ''} onChange={(e) => setSlides(slides.map((x, xi) => xi === i ? { ...x, text: e.target.value } : x))}/>
          <div className="grid grid-cols-2 gap-3"><input className="input" placeholder="বাটন টেক্সট" value={s.cta || ''} onChange={(e) => setSlides(slides.map((x, xi) => xi === i ? { ...x, cta: e.target.value } : x))}/><input className="input" placeholder="বাটন লিংক" value={s.link || ''} onChange={(e) => setSlides(slides.map((x, xi) => xi === i ? { ...x, link: e.target.value } : x))}/></div>
        </div>)}
      </div>

      {/* banners */}
      <div className="card space-y-4"><div className="flex items-center justify-between"><h2 className="font-semibold">ব্যানার</h2><button className="btn-ghost text-sm" onClick={() => setBanners([...banners, { image: '', title: '', text: '', link: '/shop' }])}><Plus size={16}/> যোগ</button></div>
        {banners.map((b, i) => <div key={i} className="border border-line rounded-field p-4 space-y-3"><div className="flex justify-end"><button className="p-1.5 rounded hover:bg-red-500/20 text-red-400" onClick={() => setBanners(banners.filter((_, x) => x !== i))}><Trash2 size={14}/></button></div><ImageUploader images={b.image ? [b.image] : []} onChange={(imgs) => setBanners(banners.map((x, xi) => xi === i ? { ...x, image: imgs[0] || '' } : x))}/><input className="input" placeholder="শিরোনাম" value={b.title || ''} onChange={(e) => setBanners(banners.map((x, xi) => xi === i ? { ...x, title: e.target.value } : x))}/><input className="input" placeholder="টেক্সট" value={b.text || ''} onChange={(e) => setBanners(banners.map((x, xi) => xi === i ? { ...x, text: e.target.value } : x))}/><input className="input" placeholder="Link" value={b.link || ''} onChange={(e) => setBanners(banners.map((x, xi) => xi === i ? { ...x, link: e.target.value } : x))}/></div>)}
      </div>

      {/* services */}
      <div className="card space-y-4"><div className="flex items-center justify-between"><h2 className="font-semibold">সার্ভিস কার্ড</h2><button className="btn-ghost text-sm" onClick={() => setServices([...services, { title: '', text: '' }])}><Plus size={16}/> যোগ</button></div>
        {services.map((s, i) => <div key={i} className="border border-line rounded-field p-4 space-y-3"><div className="flex justify-end"><button className="p-1.5 rounded hover:bg-red-500/20 text-red-400" onClick={() => setServices(services.filter((_, x) => x !== i))}><Trash2 size={14}/></button></div><input className="input" placeholder="শিরোনাম" value={s.title || ''} onChange={(e) => setServices(services.map((x, xi) => xi === i ? { ...x, title: e.target.value } : x))}/><input className="input" placeholder="টেক্সট" value={s.text || ''} onChange={(e) => setServices(services.map((x, xi) => xi === i ? { ...x, text: e.target.value } : x))}/></div>)}
      </div>

      <div className="card space-y-4"><h2 className="font-semibold">নিউজলেটার</h2><input className="input" placeholder="শিরোনাম" value={newsletter.title || ''} onChange={(e) => setNewsletter({ ...newsletter, title: e.target.value })}/><input className="input" placeholder="টেক্সট" value={newsletter.text || ''} onChange={(e) => setNewsletter({ ...newsletter, text: e.target.value })}/><input className="input" placeholder="বাটন টেক্সট" value={newsletter.button || ''} onChange={(e) => setNewsletter({ ...newsletter, button: e.target.value })}/></div>
    </div>
  );
}
