import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable.jsx';
import Drawer from '../components/Drawer.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import {
  listReviews, createReview, updateReview, setReviewStatus, deleteReview,
} from '../services/reviews.js';
import { listProducts } from '../services/products.js';
import { dateTimeBn } from '../lib/format.js';

const EMPTY = {
  product_id: '', customer_name: '', customer_email: '',
  rating: 5, title: '', text: '', status: 'approved',
};

export default function Reviews() {
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([listReviews({ status }), listProducts()]);
      setRows(r);
      setProducts(p);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [status]);

  const openNew = () => {
    setForm({ ...EMPTY, product_id: products[0]?.id || '' });
    setEditing(null);
    setDrawer(true);
  };

  const openEdit = (r) => {
    setForm({
      product_id: r.product_id || '',
      customer_name: r.customer_name || '',
      customer_email: r.customer_email || '',
      rating: r.rating || 5,
      title: r.title || '',
      text: r.text || '',
      status: r.status || 'approved',
    });
    setEditing(r.id);
    setDrawer(true);
  };

  const save = async () => {
    if (!form.product_id) { toast.error('প্রোডাক্ট বাছুন'); return; }
    if (!form.customer_name.trim()) { toast.error('কাস্টমারের নাম দিন'); return; }
    if (!form.text.trim()) { toast.error('রিভিউ লিখুন'); return; }
    setSaving(true);
    const payload = {
      product_id: form.product_id,
      customer_name: form.customer_name.trim(),
      customer_email: form.customer_email.trim(),
      rating: Math.max(1, Math.min(5, Number(form.rating) || 5)),
      title: form.title.trim(),
      text: form.text.trim(),
      status: form.status,
      source: 'admin',
    };
    try {
      if (editing) await updateReview(editing, payload);
      else await createReview(payload);
      toast.success(editing ? 'রিভিউ আপডেট হয়েছে' : 'রিভিউ যোগ হয়েছে');
      setDrawer(false);
      load();
    } catch (e) {
      toast.error('সেভ ব্যর্থ: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'prod', label: 'প্রোডাক্ট', render: (r) => r.products?.name || '—' },
    { key: 'name', label: 'কাস্টমার', render: (r) => (
      <div>
        <p>{r.customer_name}</p>
        {r.customer_email && <p className="text-xs text-ink-muted">{r.customer_email}</p>}
      </div>
    ) },
    { key: 'rating', label: 'রেটিং', render: (r) => (
      <span className="inline-flex items-center gap-1 text-accent">
        <Star size={14} fill="currentColor" /> {r.rating}
      </span>
    ) },
    { key: 'text', label: 'মন্তব্য', render: (r) => (
      <span className="text-ink-muted">
        {r.title ? <b className="text-ink">{r.title} — </b> : null}
        {r.text}
      </span>
    ) },
    { key: 'date', label: 'তারিখ', render: (r) => dateTimeBn(r.created_at) },
    { key: 'status', label: 'স্ট্যাটাস', render: (r) => (
      <span className={`badge ${r.status === 'approved' ? 'bg-emerald-400/15 text-emerald-400' : 'bg-amber-400/15 text-amber-400'}`}>
        {r.status === 'approved' ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
      </span>
    ) },
    { key: 'act', label: '', render: (r) => (
      <div className="flex gap-2 justify-end">
        {r.status !== 'approved' && (
          <button className="p-2 rounded hover:bg-emerald-500/20 text-emerald-400"
            title="অনুমোদন"
            onClick={async () => { await setReviewStatus(r.id, 'approved'); toast.success('অনুমোদিত'); load(); }}>
            <Check size={16} />
          </button>
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
        <h1 className="text-2xl font-semibold">রিভিউ</h1>
        <div className="flex gap-3">
          <select className="input max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">সব</option>
            <option value="pending">অপেক্ষমাণ</option>
            <option value="approved">অনুমোদিত</option>
          </select>
          <button className="btn-primary" onClick={openNew}>
            <Plus size={18} /> নতুন রিভিউ
          </button>
        </div>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} empty="কোনো রিভিউ নেই" />

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={editing ? 'রিভিউ এডিট' : 'নতুন রিভিউ'}
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
          <div>
            <label className="label">প্রোডাক্ট *</label>
            <select className="input" value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
              <option value="">— বাছুন —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name_bn || p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">কাস্টমারের নাম *</label>
              <input className="input" value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
            </div>
            <div>
              <label className="label">ইমেইল</label>
              <input className="input" value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">রেটিং (১–৫)</label>
              <select className="input" value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
              </select>
            </div>
            <div>
              <label className="label">স্ট্যাটাস</label>
              <select className="input" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="approved">অনুমোদিত</option>
                <option value="pending">অপেক্ষমাণ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">শিরোনাম</label>
            <input className="input" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div>
            <label className="label">রিভিউ *</label>
            <textarea className="input min-h-[110px]" value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })} />
          </div>
        </div>
      </Drawer>

      <ConfirmDialog open={Boolean(confirm)} onClose={() => setConfirm(null)} danger
        title="রিভিউ ডিলিট" message="এই রিভিউটি ডিলিট করতে চান?"
        onConfirm={async () => { await deleteReview(confirm.id); toast.success('ডিলিট হয়েছে'); load(); }} />
    </div>
  );
}
