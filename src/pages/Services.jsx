import { useEffect, useState } from 'react';
import {
  Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable.jsx';
import Drawer from '../components/Drawer.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import VideoUploader from '../components/VideoUploader.jsx';
import {
  listServices, createService, updateService, deleteService,
} from '../services/services.js';
import { bdt, slugify } from '../lib/format.js';
import { ph } from '../lib/localdb.js';

const PER_PAGE = 8;

const EMPTY = {
  name: '',
  name_bn: '',
  slug: '',
  icon: '',
  image: '',
  short_desc: '',
  description: '',
  price: '',
  duration: '',
  status: 'active',
  sort_order: 0,
  meta_title: '',
  meta_description: '',
  images: [],
  videos: [],
};

const ICON_SUGGESTIONS = ['🚚', '🔧', '🛡️', '💵', '📦', '⭐', '🎧', '⚡', '🏆', '🔄'];

export default function Services() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [drawer, setDrawer] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listServices({ search, status, page, perPage: PER_PAGE });
      setRows(res.items);
      setMeta({ total: res.total, page: res.page, pages: res.pages });
    } catch (e) {
      toast.error('লোড ব্যর্থ: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, status, page]);

  const openNew = () => {
    setForm({ ...EMPTY });
    setEditing(null);
    setDrawer(true);
  };

  const openEdit = (s) => {
    setForm({
      ...EMPTY,
      ...s,
      price: s.price === 0 || s.price ? String(s.price) : '',
      images: s.images || [],
      videos: s.videos || [],
    });
    setEditing(s.id);
    setDrawer(true);
  };

  const validate = () => {
    if (!form.name_bn.trim() && !form.name.trim()) return 'সার্ভিসের নাম (বাংলা বা ইংরেজি) অবশ্যই দিতে হবে।';
    if (!form.short_desc.trim()) return 'সংক্ষিপ্ত বর্ণনা লিখুন।';
    if (form.price !== '' && isNaN(Number(form.price))) return 'মূল্য একটি সংখ্যা হতে হবে।';
    if (form.price !== '' && Number(form.price) < 0) return 'মূল্য ঋণাত্মক হতে পারে না।';
    return null;
  };

  const save = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    setSaving(true);
    const slug = (form.slug || slugify(form.name || form.name_bn)).trim();
    const payload = {
      name: form.name.trim(),
      name_bn: form.name_bn.trim(),
      slug,
      icon: form.icon.trim(),
      image: form.image || '',
      short_desc: form.short_desc.trim(),
      description: form.description.trim(),
      price: form.price === '' ? 0 : Number(form.price),
      duration: form.duration.trim(),
      status: form.status,
      sort_order: Number(form.sort_order) || 0,
      meta_title: form.meta_title.trim(),
      meta_description: form.meta_description.trim(),
      images: form.images,
      videos: form.videos,
    };
    try {
      if (editing) await updateService(editing, payload);
      else await createService(payload);
      toast.success(editing ? 'সার্ভিস আপডেট হয়েছে' : 'নতুন সার্ভিস যোগ হয়েছে');
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
      await deleteService(id);
      toast.success('সার্ভিস ডিলিট হয়েছে');
      load();
    } catch (e) {
      toast.error('ডিলিট ব্যর্থ: ' + e.message);
    }
  };

  const columns = [
    {
      key: 'icon', label: 'আইকন',
      render: (s) => (
        <div className="w-11 h-11 rounded-lg grid place-items-center bg-surface2 border border-line text-xl overflow-hidden">
          {s.image
            ? <img src={s.image} alt="" className="w-full h-full object-cover" />
            : (s.icon || '🛠️')}
        </div>
      ),
    },
    {
      key: 'name', label: 'নাম',
      render: (s) => (
        <div>
          <p className="font-medium">{s.name_bn || s.name}</p>
          <p className="text-xs text-ink-muted">{s.name}</p>
        </div>
      ),
    },
    {
      key: 'short', label: 'সংক্ষিপ্ত বর্ণনা',
      render: (s) => <span className="text-ink-muted">{s.short_desc || '—'}</span>,
    },
    {
      key: 'price', label: 'মূল্য',
      render: (s) => (Number(s.price) > 0 ? bdt(s.price) : <span className="text-ink-muted">ফ্রি</span>),
    },
    { key: 'duration', label: 'সময়কাল', render: (s) => s.duration || '—' },
    {
      key: 'status', label: 'স্ট্যাটাস',
      render: (s) => (
        <span className={`badge ${s.status === 'active' ? 'bg-emerald-400/15 text-emerald-400' : 'bg-line text-ink-muted'}`}>
          {s.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
        </span>
      ),
    },
    {
      key: 'act', label: '',
      render: (s) => (
        <div className="flex gap-2 justify-end">
          <button className="p-2 rounded hover:bg-surface2" title="এডিট" onClick={() => openEdit(s)}>
            <Pencil size={16} />
          </button>
          <button className="p-2 rounded hover:bg-red-500/20 text-red-400" title="ডিলিট" onClick={() => setConfirm(s)}>
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">সার্ভিস</h1>
          <p className="text-sm text-ink-muted mt-1">
            সাইটের সার্ভিসসমূহ যোগ, এডিট ও ডিলিট করুন — সব তথ্য বাংলায়।
          </p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <Plus size={18} /> নতুন সার্ভিস
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            className="input pl-9"
            placeholder="নাম বা slug দিয়ে খুঁজুন…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="input max-w-[200px]"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">সব স্ট্যাটাস</option>
          <option value="active">সক্রিয়</option>
          <option value="inactive">নিষ্ক্রিয়</option>
        </select>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} empty="কোনো সার্ভিস নেই" />

      {/* পেজিনেশন */}
      {meta.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-muted">
            মোট {meta.total}টি — পেজ {meta.page}/{meta.pages}
          </span>
          <div className="flex gap-2">
            <button
              className="btn-ghost"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} /> আগের
            </button>
            <button
              className="btn-ghost"
              disabled={meta.page >= meta.pages}
              onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
            >
              পরের <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={editing ? 'সার্ভিস এডিট' : 'নতুন সার্ভিস'}
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
          {/* মৌলিক তথ্য */}
          <section className="space-y-3">
            <h3 className="font-semibold text-accent">মৌলিক তথ্য</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">সার্ভিসের নাম (বাংলা) *</label>
                <input
                  className="input"
                  placeholder="যেমন: হোম ডেলিভারি"
                  value={form.name_bn}
                  onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
                />
              </div>
              <div>
                <label className="label">সার্ভিসের নাম (English)</label>
                <input
                  className="input"
                  placeholder="যেমন: Home Delivery"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">আইকন (ইমোজি)</label>
              <input
                className="input"
                placeholder="যেমন: 🚚"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              />
              <p className="text-xs text-ink-muted mt-1.5">
                একটি ইমোজি পেস্ট করুন, অথবা নিচে ছবি আপলোড করুন (ছবি থাকলে সেটিই দেখাবে)।
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {ICON_SUGGESTIONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    className="w-9 h-9 rounded-field bg-surface2 border border-line hover:border-accent/60 text-lg"
                    onClick={() => setForm({ ...form, icon: ic })}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">আইকন ছবি (ঐচ্ছিক)</label>
              <ImageUploader
                images={form.image ? [form.image] : []}
                onChange={(imgs) => setForm({ ...form, image: imgs[0] || '' })}
              />
            </div>
          </section>

          {/* বর্ণনা */}
          <section className="space-y-3">
            <h3 className="font-semibold text-accent">বর্ণনা</h3>
            <div>
              <label className="label">সংক্ষিপ্ত বর্ণনা (বাংলায়) *</label>
              <input
                className="input"
                placeholder="এক লাইনে সার্ভিসের সারমর্ম"
                value={form.short_desc}
                onChange={(e) => setForm({ ...form, short_desc: e.target.value })}
              />
            </div>
            <div>
              <label className="label">বিস্তারিত বর্ণনা</label>
              <textarea
                className="input min-h-[120px]"
                placeholder="সার্ভিসের বিস্তারিত তথ্য লিখুন…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </section>

          {/* মূল্য ও সময় */}
          <section className="space-y-3">
            <h3 className="font-semibold text-accent">মূল্য ও সময়কাল</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">মূল্য / চার্জ (ঐচ্ছিক)</label>
                <input
                  className="input"
                  inputMode="numeric"
                  placeholder="০ = ফ্রি"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                <p className="text-xs text-ink-muted mt-1.5">০ দিলে "ফ্রি" হিসেবে দেখাবে।</p>
              </div>
              <div>
                <label className="label">সময়কাল / ডেলিভারি টাইম</label>
                <input
                  className="input"
                  placeholder="যেমন: ২–৪ দিন"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* স্ট্যাটাস ও ক্রম */}
          <section className="space-y-3">
            <h3 className="font-semibold text-accent">স্ট্যাটাস ও ক্রম</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">স্ট্যাটাস</label>
                <select
                  className="input"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">সক্রিয়</option>
                  <option value="inactive">নিষ্ক্রিয়</option>
                </select>
              </div>
              <div>
                <label className="label">ক্রম (কোনটা আগে দেখাবে)</label>
                <input
                  className="input"
                  inputMode="numeric"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                />
                <p className="text-xs text-ink-muted mt-1.5">ছোট সংখ্যা আগে দেখাবে।</p>
              </div>
            </div>
          </section>

          {/* SEO */}
          <section className="space-y-3">
            <h3 className="font-semibold text-accent">SEO</h3>
            <div>
              <label className="label">Slug (URL)</label>
              <input
                className="input"
                placeholder="auto — খালি রাখলে নাম থেকে তৈরি হবে"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div>
              <label className="label">মেটা টাইটেল</label>
              <input
                className="input"
                value={form.meta_title}
                onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
              />
            </div>
            <div>
              <label className="label">মেটা ডেসক্রিপশন</label>
              <textarea
                className="input min-h-[70px]"
                value={form.meta_description}
                onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
              />
            </div>
          </section>

          {/* গ্যালারি */}
          <section className="space-y-3">
            <h3 className="font-semibold text-accent">ছবি গ্যালারি</h3>
            <p className="text-xs text-ink-muted">একাধিক ছবি আপলোড করুন, ড্র্যাগ করে ক্রম বদলান।</p>
            <ImageUploader
              images={form.images}
              onChange={(images) => setForm({ ...form, images })}
            />
          </section>

          {/* ভিডিও */}
          <section className="space-y-3">
            <h3 className="font-semibold text-accent">ভিডিও</h3>
            <p className="text-xs text-ink-muted">একাধিক ভিডিও আপলোড করুন, ড্র্যাগ করে ক্রম বদলান।</p>
            <VideoUploader
              videos={form.videos}
              onChange={(videos) => setForm({ ...form, videos })}
            />
          </section>
        </div>
      </Drawer>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => doDelete(confirm.id)}
        danger
        title="সার্ভিস ডিলিট"
        message={`"${confirm?.name_bn || confirm?.name}" ডিলিট করতে চান? এটি ফেরানো যাবে না।`}
      />
    </div>
  );
}
