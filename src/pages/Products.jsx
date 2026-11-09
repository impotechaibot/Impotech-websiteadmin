import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable.jsx';
import Drawer from '../components/Drawer.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import VideoUploader from '../components/VideoUploader.jsx';
import { listProducts, createProduct, updateProduct, deleteProduct } from '../services/products.js';
import { listCategories } from '../services/categories.js';
import { bdt, slugify } from '../lib/format.js';
import { ph } from '../lib/localdb.js';
import { generateProductDescription, geminiReady } from '../lib/gemini.js';

const EMPTY = {
  name: '', name_bn: '', category_id: '', price: '', old_price: '', stock: '',
  description: '', images: [], videos: [], video_autoplay: false,
  badge: '', tag: '', colors: [], features: [], featured: false, active: true,
};

export default function Products() {
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([listProducts(), listCategories()]);
      setRows(p);
      setCats(c);
    } catch (e) {
      toast.error('লোড ব্যর্থ: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return rows.filter((p) => {
      const matchS = !s || p.name.toLowerCase().includes(s) || (p.name_bn || '').includes(search);
      const matchC = !catFilter || p.category_id === catFilter;
      return matchS && matchC;
    });
  }, [rows, search, catFilter]);

  const openNew = () => { setForm(EMPTY); setEditing(null); setDrawer(true); };
  const openEdit = (p) => {
    setForm({
      ...EMPTY, ...p,
      price: String(p.price ?? ''), old_price: String(p.old_price ?? ''),
      stock: String(p.stock ?? ''),
      images: p.images || [], videos: p.videos || [],
      colors: p.colors || [], features: p.features || [],
    });
    setEditing(p.id);
    setDrawer(true);
  };

  const validate = () => {
    if (!form.name.trim()) return 'নাম বাধ্যতামূলক';
    if (form.price === '' || isNaN(Number(form.price))) return 'দাম একটি সংখ্যা হতে হবে';
    if (Number(form.price) < 0) return 'দাম ঋণাত্মক হতে পারে না';
    if (form.old_price && Number(form.old_price) < Number(form.price))
      return 'আগের দাম বর্তমান দামের চেয়ে কম হতে পারে না';
    return null;
  };

  const save = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      name_bn: form.name_bn.trim(),
      slug: slugify(form.name),
      category_id: form.category_id || null,
      price: Number(form.price),
      old_price: Number(form.old_price) || 0,
      stock: Number(form.stock) || 0,
      description: form.description,
      images: form.images,
      videos: form.videos,
      video_autoplay: form.video_autoplay,
      badge: form.badge,
      tag: form.tag,
      colors: form.colors,
      features: form.features,
      featured: form.featured,
      active: form.active,
    };
    try {
      if (editing) await updateProduct(editing, payload);
      else await createProduct(payload);
      toast.success(editing ? 'প্রোডাক্ট আপডেট হয়েছে' : 'প্রোডাক্ট যোগ হয়েছে');
      setDrawer(false);
      load();
    } catch (e) {
      toast.error('সেভ ব্যর্থ: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async (id) => {
    try {
      await deleteProduct(id);
      toast.success('প্রোডাক্ট ডিলিট হয়েছে');
      load();
    } catch (e) {
      toast.error('ডিলিট ব্যর্থ: ' + e.message);
    }
  };

  const aiFill = async () => {
    if (!form.name) { toast.error('আগে নাম লিখুন'); return; }
    try {
      const cat = cats.find((c) => c.id === form.category_id)?.name || '';
      const text = await generateProductDescription(form.name, cat);
      setForm((f) => ({ ...f, description: text.trim() }));
      toast.success('AI ডেসক্রিপশন তৈরি হয়েছে');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const columns = [
    {
      key: 'img', label: 'ছবি',
      render: (p) => (
        <img src={p.images?.[0] || ph('নেই')} alt=""
          className="w-11 h-11 rounded-lg object-cover bg-surface2 border border-line" />
      ),
    },
    {
      key: 'name', label: 'নাম',
      render: (p) => (
        <div>
          <p className="font-medium">{p.name_bn || p.name}</p>
          <p className="text-xs text-ink-muted">{p.name}</p>
        </div>
      ),
    },
    { key: 'cat', label: 'ক্যাটাগরি', render: (p) => p.categories?.name_bn || p.categories?.name || '—' },
    {
      key: 'price', label: 'দাম',
      render: (p) => (
        <div>
          <span className="font-medium">{bdt(p.price)}</span>
          {Number(p.old_price) > Number(p.price) && (
            <span className="text-xs text-ink-muted line-through ml-2">{bdt(p.old_price)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'stock', label: 'স্টক',
      render: (p) => (
        <span className={`badge ${p.stock > 5 ? 'bg-emerald-400/15 text-emerald-400'
          : p.stock > 0 ? 'bg-amber-400/15 text-amber-400' : 'bg-red-400/15 text-red-400'}`}>
          {p.stock}
        </span>
      ),
    },
    {
      key: 'status', label: 'স্ট্যাটাস',
      render: (p) => (
        <span className={`badge ${p.active ? 'bg-emerald-400/15 text-emerald-400' : 'bg-line text-ink-muted'}`}>
          {p.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
        </span>
      ),
    },
    {
      key: 'act', label: '',
      render: (p) => (
        <div className="flex gap-2 justify-end">
          <button className="p-2 rounded hover:bg-surface2" onClick={() => openEdit(p)}>
            <Pencil size={16} />
          </button>
          <button className="p-2 rounded hover:bg-red-500/20 text-red-400"
            onClick={() => setConfirm(p)}>
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">প্রোডাক্ট</h1>
        <button className="btn-primary" onClick={openNew}>
          <Plus size={18} /> নতুন প্রোডাক্ট
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input className="input pl-9" placeholder="নাম দিয়ে খুঁজুন…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input max-w-[200px]" value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">সব ক্যাটাগরি</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>{c.name_bn || c.name}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} empty="কোনো প্রোডাক্ট নেই" />

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={editing ? 'প্রোডাক্ট এডিট' : 'নতুন প্রোডাক্ট'}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setDrawer(false)}>বাতিল</button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'সেভ হচ্ছে…' : 'সেভ করুন'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">নাম (বাংলা) *</label>
              <input className="input" value={form.name_bn}
                onChange={(e) => setForm({ ...form, name_bn: e.target.value })} />
            </div>
            <div>
              <label className="label">নাম (English) *</label>
              <input className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">ক্যাটাগরি</label>
            <select className="input" value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">— বাছুন —</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.name_bn || c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">দাম *</label>
              <input className="input" inputMode="numeric" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="label">আগের দাম</label>
              <input className="input" inputMode="numeric" value={form.old_price}
                onChange={(e) => setForm({ ...form, old_price: e.target.value })} />
            </div>
            <div>
              <label className="label">স্টক</label>
              <input className="input" inputMode="numeric" value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">বিবরণ</label>
              {geminiReady() && (
                <button type="button" className="text-xs text-accent inline-flex items-center gap-1"
                  onClick={aiFill}>
                  <Sparkles size={13} /> AI দিয়ে লিখুন
                </button>
              )}
            </div>
            <textarea className="input min-h-[100px]" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <label className="label">ছবি (একাধিক)</label>
            <ImageUploader images={form.images}
              onChange={(images) => setForm({ ...form, images })} />
          </div>

          <div>
            <label className="label">ভিডিও (একাধিক)</label>
            <VideoUploader videos={form.videos}
              onChange={(videos) => setForm({ ...form, videos })} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.video_autoplay}
              onChange={(e) => setForm({ ...form, video_autoplay: e.target.checked })} />
            ভিডিও অটো-প্লে (muted)
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">ব্যাজ</label>
              <input className="input" value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })} />
            </div>
            <div>
              <label className="label">ট্যাগ</label>
              <input className="input" value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })} />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              ফিচার্ড
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              সক্রিয়
            </label>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => doDelete(confirm.id)}
        danger
        title="প্রোডাক্ট ডিলিট"
        message={`"${confirm?.name_bn || confirm?.name}" ডিলিট করতে চান? এটি ফেরানো যাবে না।`}
      />
    </div>
  );
}
