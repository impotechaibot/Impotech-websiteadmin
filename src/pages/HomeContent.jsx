import { useEffect, useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSetting, saveSetting } from '../services/settings.js';
import ImageUploader from '../components/ImageUploader.jsx';

const EMPTY_SLIDE = { image: '', tag: '', title: '', text: '', cta: '', link: '' };

export default function HomeContent() {
  const [slides, setSlides] = useState([]);
  const [banners, setBanners] = useState([]);
  const [services, setServices] = useState([]);
  const [newsletter, setNewsletter] = useState({ title: '', text: '', button: '' });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [h, n] = await Promise.all([getSetting('home'), getSetting('newsletter')]);
      setSlides(h?.slides || []);
      setBanners(h?.banners || []);
      setServices(h?.services || []);
      setNewsletter(n || { title: '', text: '', button: '' });
      setReady(true);
    })();
  }, []);

  const save = async () => {
    try {
      await saveSetting('home', { slides, banners, services });
      await saveSetting('newsletter', newsletter);
      toast.success('হোম কনটেন্ট সেভ হয়েছে');
    } catch (e) { toast.error(e.message); }
  };

  const move = (list, setList, i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
  };

  if (!ready) return <div className="text-ink-muted">লোড হচ্ছে…</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">হোম কনটেন্ট</h1>
        <button className="btn-primary" onClick={save}>সেভ করুন</button>
      </div>

      {/* হিরো স্লাইড */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">হিরো স্লাইড</h2>
          <button className="btn-ghost text-sm" onClick={() => setSlides([...slides, { ...EMPTY_SLIDE }])}>
            <Plus size={16} /> যোগ
          </button>
        </div>
        {slides.map((s, i) => (
          <div key={i} className="border border-line rounded-field p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-muted">স্লাইড {i + 1}</span>
              <div className="flex gap-1">
                <button className="p-1.5 rounded hover:bg-surface2" onClick={() => move(slides, setSlides, i, -1)}><ArrowUp size={14} /></button>
                <button className="p-1.5 rounded hover:bg-surface2" onClick={() => move(slides, setSlides, i, 1)}><ArrowDown size={14} /></button>
                <button className="p-1.5 rounded hover:bg-red-500/20 text-red-400"
                  onClick={() => setSlides(slides.filter((_, x) => x !== i))}><Trash2 size={14} /></button>
              </div>
            </div>
            <ImageUploader images={s.image ? [s.image] : []}
              onChange={(imgs) => setSlides(slides.map((x, xi) => xi === i ? { ...x, image: imgs[0] || '' } : x))} />
            <input className="input" placeholder="ট্যাগ" value={s.tag}
              onChange={(e) => setSlides(slides.map((x, xi) => xi === i ? { ...x, tag: e.target.value } : x))} />
            <input className="input" placeholder="শিরোনাম" value={s.title}
              onChange={(e) => setSlides(slides.map((x, xi) => xi === i ? { ...x, title: e.target.value } : x))} />
            <textarea className="input" placeholder="সাবটাইটেল" value={s.text}
              onChange={(e) => setSlides(slides.map((x, xi) => xi === i ? { ...x, text: e.target.value } : x))} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="বাটন টেক্সট" value={s.cta}
                onChange={(e) => setSlides(slides.map((x, xi) => xi === i ? { ...x, cta: e.target.value } : x))} />
              <input className="input" placeholder="বাটন লিংক" value={s.link}
                onChange={(e) => setSlides(slides.map((x, xi) => xi === i ? { ...x, link: e.target.value } : x))} />
            </div>
          </div>
        ))}
      </div>

      {/* ব্যানার */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">ব্যানার</h2>
          <button className="btn-ghost text-sm" onClick={() => setBanners([...banners, { image: '', title: '', text: '', link: '' }])}>
            <Plus size={16} /> যোগ
          </button>
        </div>
        {banners.map((b, i) => (
          <div key={i} className="border border-line rounded-field p-4 space-y-3">
            <div className="flex justify-end">
              <button className="p-1.5 rounded hover:bg-red-500/20 text-red-400"
                onClick={() => setBanners(banners.filter((_, x) => x !== i))}><Trash2 size={14} /></button>
            </div>
            <ImageUploader images={b.image ? [b.image] : []}
              onChange={(imgs) => setBanners(banners.map((x, xi) => xi === i ? { ...x, image: imgs[0] || '' } : x))} />
            <input className="input" placeholder="শিরোনাম" value={b.title}
              onChange={(e) => setBanners(banners.map((x, xi) => xi === i ? { ...x, title: e.target.value } : x))} />
            <input className="input" placeholder="টেক্সট" value={b.text}
              onChange={(e) => setBanners(banners.map((x, xi) => xi === i ? { ...x, text: e.target.value } : x))} />
          </div>
        ))}
      </div>

      {/* সার্ভিস */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">সার্ভিস কার্ড</h2>
          <button className="btn-ghost text-sm" onClick={() => setServices([...services, { title: '', text: '' }])}>
            <Plus size={16} /> যোগ
          </button>
        </div>
        {services.map((s, i) => (
          <div key={i} className="border border-line rounded-field p-4 space-y-3">
            <div className="flex justify-end">
              <button className="p-1.5 rounded hover:bg-red-500/20 text-red-400"
                onClick={() => setServices(services.filter((_, x) => x !== i))}><Trash2 size={14} /></button>
            </div>
            <input className="input" placeholder="শিরোনাম" value={s.title}
              onChange={(e) => setServices(services.map((x, xi) => xi === i ? { ...x, title: e.target.value } : x))} />
            <input className="input" placeholder="টেক্সট" value={s.text}
              onChange={(e) => setServices(services.map((x, xi) => xi === i ? { ...x, text: e.target.value } : x))} />
          </div>
        ))}
      </div>

      {/* নিউজলেটার */}
      <div className="card space-y-4">
        <h2 className="font-semibold">নিউজলেটার</h2>
        <input className="input" placeholder="শিরোনাম" value={newsletter.title}
          onChange={(e) => setNewsletter({ ...newsletter, title: e.target.value })} />
        <input className="input" placeholder="টেক্সট" value={newsletter.text}
          onChange={(e) => setNewsletter({ ...newsletter, text: e.target.value })} />
        <input className="input" placeholder="বাটন টেক্সট" value={newsletter.button}
          onChange={(e) => setNewsletter({ ...newsletter, button: e.target.value })} />
      </div>
    </div>
  );
}
