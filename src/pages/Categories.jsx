import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable.jsx';
import Drawer from '../components/Drawer.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import {
  listCategories, createCategory, updateCategory, deleteCategory,
} from '../services/categories.js';
import { ph } from '../lib/localdb.js';

const EMPTY = { name: '', name_bn: '', image: '', sort_order: 0, active: true };

export default function Categories() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setRows(await listCategories()); }
    catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim()) { toast.error('নাম বাধ্যতামূলক'); return; }
    try {
      if (editing) await updateCategory(editing, form);
      else await createCategory(form);
      toast.success('সেভ হয়েছে');
      setDrawer(false);
      load();
    } catch (e) { toast.error(e.message); }
  };

  const move = async (row, dir) => {
    const idx = rows.findIndex((r) => r.id === row.id);
    const swap = rows[idx + dir];
    if (!swap) return;
    await updateCategory(row.id, { sort_order: swap.sort_order });
    await updateCategory(swap.id, { sort_order: row.sort_order });
    load();
  };

  const columns = [
    { key: 'img', label: 'ছবি', render: (c) => (
      <img src={c.image || ph('নেই')} alt="" className="w-10 h-10 rounded-lg object-cover bg-surface2 border border-line" />
    )},
    { key: 'name', label: 'নাম', render: (c) => (
      <div><p className="font-medium">{c.name_bn || c.name}</p>
        <p className="text-xs text-ink-muted">{c.name}</p></div>
    )},
    { key: 'count', label: 'প্রোডাক্ট', render: (c) => c.productCount },
    { key: 'order', label: 'ক্রম', render: (c) => (
      <div className="flex gap-1">
        <button className="p-1.5 rounded hover:bg-surface2" onClick={() => move(c, -1)}><ArrowUp size={14} /></button>
        <button className="p-1.5 rounded hover:bg-surface2" onClick={() => move(c, 1)}><ArrowDown size={14} /></button>
      </div>
    )},
    { key: 'status', label: 'স্ট্যাটাস', render: (c) => (
      <span className={`badge ${c.active ? 'bg-emerald-400/15 text-emerald-400' : 'bg-line text-ink-muted'}`}>
        {c.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
      </span>
    )},
    { key: 'act', label: '', render: (c) => (
      <div className="flex gap-2 justify-end">
        <button className="p-2 rounded hover:bg-surface2"
          onClick={() => { setForm({ ...EMPTY, ...c }); setEditing(c.id); setDrawer(true); }}>
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
        <h1 className="text-2xl font-semibold">ক্যাটাগরি</h1>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setEditing(null); setDrawer(true); }}>
          <Plus size={18} /> নতুন ক্যাটাগরি
        </button>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} />

      <Drawer open={drawer} onClose={() => setDrawer(false)}
        title={editing ? 'ক্যাটাগরি এডিট' : 'নতুন ক্যাটাগরি'}
        footer={<>
          <button className="btn-ghost" onClick={() => setDrawer(false)}>বাতিল</button>
          <button className="btn-primary" onClick={save}>সেভ করুন</button>
        </>}>
        <div className="space-y-4">
          <div><label className="label">নাম (বাংলা) *</label>
            <input className="input" value={form.name_bn}
              onChange={(e) => setForm({ ...form, name_bn: e.target.value })} /></div>
          <div><label className="label">নাম (English)</label>
            <input className="input" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">ছবি</label>
            <ImageUploader images={form.image ? [form.image] : []}
              onChange={(imgs) => setForm({ ...form, image: imgs[0] || '' })} /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })} /> সক্রিয়
          </label>
        </div>
      </Drawer>

      <ConfirmDialog open={Boolean(confirm)} onClose={() => setConfirm(null)} danger
        title="ক্যাটাগরি ডিলিট"
        message={confirm?.productCount > 0
          ? `⚠️ এই ক্যাটাগরিতে ${confirm.productCount}টি প্রোডাক্ট আছে। ডিলিট করলে প্রোডাক্টগুলো ক্যাটাগরিহীন হয়ে যাবে। চালিয়ে যাবেন?`
          : `"${confirm?.name_bn || confirm?.name}" ডিলিট করতে চান?`}
        onConfirm={async () => { await deleteCategory(confirm.id); toast.success('ডিলিট হয়েছে'); load(); }} />
    </div>
  );
}
