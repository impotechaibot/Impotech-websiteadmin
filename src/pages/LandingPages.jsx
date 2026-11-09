import { useEffect, useState } from 'react';
import {
  Plus, Search, Pencil, Trash2, ExternalLink, Eye, Copy, Rocket,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable.jsx';
import Drawer from '../components/Drawer.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import VideoUploader from '../components/VideoUploader.jsx';
import {
  listLandingPages, createLandingPage, updateLandingPage, deleteLandingPage,
} from '../services/landingPages.js';
import { listProducts } from '../services/products.js';
import { slugify, dateTimeBn } from '../lib/format.js';

const EMPTY = {
  slug: '', title: '', product_id: '', published: false,
  hero: { headline: '', sub: '', image: '', cta: 'এখনই অর্ডার করুন', badge: '' },
  features: [],
  gallery: [],
  videos: [],
  reviews: [],
  offer: { enabled: false, text: '', endsAt: '', discount: 0 },
  order_form: { enabled: true, buttonText: 'অর্ডার করুন' },
  seo: { title: '', description: '', ogImage: '' },
};

const SITE_URL = import.meta.env.VITE_SITE_URL || '';

export default function LandingPages() {
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [l, p] = await Promise.all([listLandingPages({ search }), listProducts()]);
      setRows(l);
      setProducts(p);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [search]);

  const openNew = () => {
    setForm({ ...EMPTY });
    setEditing(null);
    setDrawer(true);
  };

  const openEdit = (p) => {
    setForm({
      ...EMPTY,
      ...p,
      hero: { ...EMPTY.hero, ...(p.hero || {}) },
      offer: { ...EMPTY.offer, ...(p.offer || {}) },
      order_form: { ...EMPTY.order_form, ...(p.order_form || {}) },
      seo: { ...EMPTY.seo, ...(p.seo || {}) },
      features: p.features || [],
      gallery: p.gallery || [],
      videos: p.videos || [],
      reviews: p.reviews || [],
    });
    setEditing(p.id);
    setDrawer(true);
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error('শিরোনাম দিন'); return; }
    const slug = (form.slug || slugify(form.title)).trim();
    if (!slug) { toast.error('URL slug দিন'); return; }
    setSaving(true);
    const payload = {
      slug,
      title: form.title.trim(),
      product_id: form.product_id || null,
      published: Boolean(form.published),
      hero: form.hero,
      features: form.features,
      gallery: form.gallery,
      videos: form.videos,
      reviews: form.reviews,
      offer: form.offer,
      order_form: form.order_form,
      seo: form.seo,
    };
    try {
      if (editing) await updateLandingPage(editing, payload);
      else await createLandingPage(payload);
      toast.success(editing ? 'ল্যান্ডিং পেজ আপডেট হয়েছে' : 'ল্যান্ডিং পেজ তৈরি হয়েছে');
      setDrawer(false);
      load();
    } catch (e) {
      toast.error('সেভ ব্যর্থ: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = (slug) => `${SITE_URL}/lp/${slug}`;

  const copyUrl = (slug) => {
    const url = publicUrl(slug);
    navigator.clipboard?.writeText(url).then(
      () => toast.success('লিংক কপি হয়েছে'),
      () => toast.error('কপি করা যায়নি')
    );
  };

  const columns = [
    { key: 'title', label: 'শিরোনাম', render: (r) => (
      <div>
        <p className="font-medium">{r.title}</p>
        <p className="text-xs text-ink-muted">/lp/{r.slug}</p>
      </div>
    ) },
    { key: 'product', label: 'প্রোডাক্ট', render: (r) => r.products?.name_bn || r.products?.name || '—' },
    { key: 'views', label: 'ভিউ', render: (r) => r.views || 0 },
    { key: 'status', label: 'স্ট্যাটাস', render: (r) => (
      <span className={`badge ${r.published ? 'bg-emerald-400/15 text-emerald-400' : 'bg-line text-ink-muted'}`}>
        {r.published ? 'লাইভ' : 'ড্রাফট'}
      </span>
    ) },
    { key: 'updated', label: 'আপডেট', render: (r) => dateTimeBn(r.updated_at || r.created_at) },
    { key: 'act', label: '', render: (r) => (
      <div className="flex gap-2 justify-end">
        <button className="p-2 rounded hover:bg-surface2" title="লিংক কপি" onClick={() => copyUrl(r.slug)}>
          <Copy size={16} />
        </button>
        {r.published && (
          <a className="p-2 rounded hover:bg-surface2" title="দেখুন"
            href={publicUrl(r.slug)} target="_blank" rel="noreferrer">
            <ExternalLink size={16} />
          </a>
        )}
        <button className="p-2 rounded hover:bg-surface2" title="এডিট" onClick={() => openEdit(r)}>
          <Pencil size={16} />
        </button>
        <button className="p-2 rounded hover:bg-red-500/20 text-red-400" title="ডিলিট" onClick={() => setConfirm(r)}>
          <Trash2 size={16} />
        </button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">ল্যান্ডিং পেজ</h1>
        <button className="btn-primary" onClick={openNew}>
          <Plus size={18} /> নতুন ল্যান্ডিং পেজ
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input className="input pl-9" placeholder="শিরোনাম / slug…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} empty="কোনো ল্যান্ডিং পেজ নেই" />

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={editing ? 'ল্যান্ডিং পেজ এডিট' : 'নতুন ল্যান্ডিং পেজ'}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setDrawer(false)}>বাতিল</button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'সেভ হচ্ছে…' : 'সেভ করুন'}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* basic */}
          <section className="space-y-3">
            <h3 className="font-semibold text-accent">মূল তথ্য</h3>
            <div>
              <label className="label">শিরোনাম *</label>
              <input className="input" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">URL slug</label>
                <input className="input" value={form.slug} placeholder="auto"
                  onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div>
                <label className="label">প্রোডাক্ট</label>
                <select className="input" value={form.product_id || ''}
                  onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
                  <option value="">— বাছুন —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name_bn || p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              <Rocket size={14} /> পাবলিশ করুন (লাইভ)
            </label>
          </section>

          {/* hero */}
          <section className="space-y-3">
            <h3 className="font-semibold text-accent">হিরো সেকশন</h3>
            <div>
              <label className="label">হেডলাইন</label>
              <input className="input" value={form.hero.headline}
                onChange={(e) => setForm({ ...form, hero: { ...form.hero, headline: e.target.value } })} />
            </div>
            <div>
              <label className="label">সাব-টেক্সট</label>
              <textarea className="input min-h-[70px]" value={form.hero.sub}
                onChange={(e) => setForm({ ...form, hero: { ...form.hero, sub: e.target.value } })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">CTA বাটন</label>
                <input className="input" value={form.hero.cta}
                  onChange={(e) => setForm({ ...form, hero: { ...form.hero, cta: e.target.value } })} />
              </div>
              <div>
                <label className="label">ব্যাজ</label>
                <input className="input" value={form.hero.badge}
                  onChange={(e) => setForm({ ...form, hero: { ...form.hero, badge: e.target.value } })} />
              </div>
            </div>
            <div>
              <label className="label">হিরো ছবি</label>
              <ImageUploader images={form.hero.image ? [form.hero.image] : []}
                onChange={(imgs) => setForm({ ...form, hero: { ...form.hero, image: imgs[0] || '' } })} />
            </div>
          </section>

          {/* features */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-accent">ফিচার</h3>
              <button type="button" className="text-xs text-accent"
                onClick={() => setForm({ ...form, features: [...form.features, { icon: 'star', title: '', text: '' }] })}>
                + যোগ করুন
              </button>
            </div>
            {form.features.map((f, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                <input className="input" placeholder="শিরোনাম" value={f.title}
                  onChange={(e) => {
                    const next = [...form.features];
                    next[i] = { ...f, title: e.target.value };
                    setForm({ ...form, features: next });
                  }} />
                <input className="input" placeholder="বর্ণনা" value={f.text}
                  onChange={(e) => {
                    const next = [...form.features];
                    next[i] = { ...f, text: e.target.value };
                    setForm({ ...form, features: next });
                  }} />
                <button type="button" className="p-2 text-red-400"
                  onClick={() => setForm({ ...form, features: form.features.filter((_, x) => x !== i) })}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </section>

          {/* gallery */}
          <section className="space-y-3">
            <h3 className="font-semibold text-accent">গ্যালারি</h3>
            <ImageUploader images={form.gallery}
              onChange={(gallery) => setForm({ ...form, gallery })} />
          </section>

          {/* videos */}
          <section className="space-y-3">
            <h3 className="font-semibold text-accent">ভিডিও</h3>
            <VideoUploader videos={form.videos}
              onChange={(videos) => setForm({ ...form, videos })} />
          </section>

          {/* reviews */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-accent">রিভিউ</h3>
              <button type="button" className="text-xs text-accent"
                onClick={() => setForm({ ...form, reviews: [...form.reviews, { name: '', rating: 5, text: '' }] })}>
                + যোগ করুন
              </button>
            </div>
            {form.reviews.map((r, i) => (
              <div key={i} className="space-y-2 border border-line rounded-field p-3">
                <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                  <input className="input" placeholder="নাম" value={r.name}
                    onChange={(e) => {
                      const next = [...form.reviews];
                      next[i] = { ...r, name: e.target.value };
                      setForm({ ...form, reviews: next });
                    }} />
                  <select className="input max-w-[90px]" value={r.rating}
                    onChange={(e) => {
                      const next = [...form.reviews];
                      next[i] = { ...r, rating: Number(e.target.value) };
                      setForm({ ...form, reviews: next });
                    }}>
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}★</option>)}
                  </select>
                  <button type="button" className="p-2 text-red-400"
                    onClick={() => setForm({ ...form, reviews: form.reviews.filter((_, x) => x !== i) })}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <textarea className="input min-h-[60px]" placeholder="রিভিউ" value={r.text}
                  onChange={(e) => {
                    const next = [...form.reviews];
                    next[i] = { ...r, text: e.target.value };
                    setForm({ ...form, reviews: next });
                  }} />
              </div>
            ))}
          </section>

          {/* offer */}
          <section className="space-y-3">
            <h3 className="font-semibold text-accent">অফার / কাউন্টডাউন</h3>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.offer.enabled}
                onChange={(e) => setForm({ ...form, offer: { ...form.offer, enabled: e.target.checked } })} />
              অফার চালু
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">অফার টেক্সট</label>
                <input className="input" value={form.offer.text}
                  onChange={(e) => setForm({ ...form, offer: { ...form.offer, text: e.target.value } })} />
              </div>
              <div>
                <label className="label">শেষ হওয়ার সময়</label>
                <input type="datetime-local" className="input" value={form.offer.endsAt}
                  onChange={(e) => setForm({ ...form, offer: { ...form.offer, endsAt: e.target.value } })} />
              </div>
            </div>
            <div>
              <label className="label">ছাড় (%)</label>
              <input className="input" inputMode="numeric" value={form.offer.discount}
                onChange={(e) => setForm({ ...form, offer: { ...form.offer, discount: Number(e.target.value) || 0 } })} />
            </div>
          </section>

          {/* order form */}
          <section className="space-y-3">
            <h3 className="font-semibold text-accent">অর্ডার ফর্ম</h3>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.order_form.enabled}
                onChange={(e) => setForm({ ...form, order_form: { ...form.order_form, enabled: e.target.checked } })} />
              অর্ডার ফর্ম দেখান
            </label>
            <div>
              <label className="label">বাটন টেক্সট</label>
              <input className="input" value={form.order_form.buttonText}
                onChange={(e) => setForm({ ...form, order_form: { ...form.order_form, buttonText: e.target.value } })} />
            </div>
          </section>

          {/* seo */}
          <section className="space-y-3">
            <h3 className="font-semibold text-accent">SEO</h3>
            <div>
              <label className="label">SEO শিরোনাম</label>
              <input className="input" value={form.seo.title}
                onChange={(e) => setForm({ ...form, seo: { ...form.seo, title: e.target.value } })} />
            </div>
            <div>
              <label className="label">SEO বর্ণনা</label>
              <textarea className="input min-h-[70px]" value={form.seo.description}
                onChange={(e) => setForm({ ...form, seo: { ...form.seo, description: e.target.value } })} />
            </div>
          </section>
        </div>
      </Drawer>

      <ConfirmDialog open={Boolean(confirm)} onClose={() => setConfirm(null)} danger
        title="ল্যান্ডিং পেজ ডিলিট" message={`"${confirm?.title}" ডিলিট করতে চান?`}
        onConfirm={async () => { await deleteLandingPage(confirm.id); toast.success('ডিলিট হয়েছে'); load(); }} />
    </div>
  );
}
