import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable.jsx';
import Drawer from '../components/Drawer.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from '../services/coupons.js';
import { bdt } from '../lib/format.js';

const EMPTY = { code: '', type: 'percent', value: '', min_order: '', expires_at: '', active: true, note: '' };

export default function Coupons() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setRows(await listCoupons()); }
    catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.code.trim()) { toast.error('কোড বাধ্যতামূলক'); return; }
    if (!form.value || isNaN(Number(form.value))) { toast.error('ছাড়ের মান সংখ্যা হতে হবে'); return; }
    const payload = {
      ...form,
      code: form.code.toUpperCase().trim(),
      value: Number(form.value),
      min_order: Number(form.min_order) || 0,
      expires_at: form.expires_at || null,
    };
    try {
      if (editing) await updateCoupon(editing, payload);
      else await createCoupon(payload);
      toast.success('সেভ হয়েছে');
      setDrawer(false);
      load();
    } catch (e) { toast.error(e.message); }
  };

  const columns = [
    { key: 'code', label: 'কোড', render: (c) => <span className="font-mono font-medium">{c.code}</span> },
    { key: 'type', label: 'ধরন', render: (c) => c.type === 'percent' ? 'শতকরা' : 'ফিক্সড' },
    { key: 'value', label: 'ছাড়', render: (c) => c.type === 'percent' ? `${c.value}%` : bdt(c.value) },
    { key: 'min', label: 'ন্যূনতম অর্ডার', render: (c) => c.min_order ? bdt(c.min_order) : '—' },
    { key: 'exp', label: 'মেয়াদ', render: (c) => c.expires_at || '—' },
    { key: 'status', label: 'স্ট্যাটাস', render: (c) => (
      <span className={`badge ${c.active ? 'bg-emerald-400/15 text-emerald-400' : 'bg-line text-ink-muted'}`}>
        {c.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
      </span>
    )},
    { key: 'act', label: '', render: (c) => (
      <div className="flex gap-2 justify-end">
        <button className="p-2 rounded hover:bg-surface2"
          onClick={() => { setForm({ ...EMPTY, ...c, value: String(c.value), min_order: String(c.min_order || '') }); setEditing(c.id); setDrawer(true); }}>
          <Pencil size={16} />
        </button>
        <button className="p-2 rounded hover:bg-red-500/20 text-red-400" onClick={() => setConfirm(c)}>
          <Trash2 size={16} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">কুপন</h1>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setEditing(null); setDrawer(true); }}>
          <Plus size={18} /> নতুন কুপন
        </button>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} empty="কোনো কুপন নেই" />

      <Drawer open={drawer} onClose={() => setDrawer(false)}
        title={editing ? 'কুপন এডিট' : 'নতুন কুপন'}
        footer={<>
          <button className="btn-ghost" onClick={() => setDrawer(false)}>বাতিল</button>
          <button className="btn-primary" onClick={save}>সেভ করুন</button>
        </>}>
        <div className="space-y-4">
          <div><label className="label">কোড *</label>
            <input className="input font-mono uppercase" value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SAVE10" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">ধরন</label>
              <select className="input" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="percent">শতকরা (%)</option>
                <option value="fixed">ফিক্সড (৳)</option>
              </select></div>
            <div><label className="label">ছাড়ের মান *</label>
              <input className="input" inputMode="numeric" value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">ন্যূনতম অর্ডার</label>
              <input className="input" inputMode="numeric" value={form.min_order}
                onChange={(e) => setForm({ ...form, min_order: e.target.value })} /></div>
            <div><label className="label">মেয়াদ শেষ</label>
              <input className="input" type="date" value={form.expires_at || ''}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></div>
          </div>
          <div><label className="label">নোট</label>
            <input className="input" value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })} /> সক্রিয়
          </label>
        </div>
      </Drawer>

      <ConfirmDialog open={Boolean(confirm)} onClose={() => setConfirm(null)} danger
        title="কুপন ডিলিট" message={`${confirm?.code} ডিলিট করতে চান?`}
        onConfirm={async () => { await deleteCoupon(confirm.id); toast.success('ডিলিট হয়েছে'); load(); }} />
    </div>
  );
}
