import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Store, Warehouse, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable.jsx';
import Drawer from '../components/Drawer.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { localdb } from '../lib/localdb.js';

const EMPTY_VENDOR = { name: '', owner: '', phone: '', email: '', address: '', commission: 10, active: true, note: '' };
const EMPTY_WH = { name: '', code: '', address: '', phone: '', manager: '', active: true, note: '' };

/**
 * মাল্টি-ভেন্ডর ও মাল্টি-ওয়্যারহাউস — একই অ্যাডমিন থেকে একাধিক বিক্রেতা ও গুদাম পরিচালনা।
 */
export default function Vendors() {
  const [tab, setTab] = useState('vendors');
  const [vendors, setVendors] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState(EMPTY_VENDOR);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    try {
      setVendors(localdb.all('vendors'));
      setWarehouses(localdb.all('warehouses'));
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const isVendor = tab === 'vendors';
  const table = isVendor ? 'vendors' : 'warehouses';
  const rows = isVendor ? vendors : warehouses;

  const openNew = () => {
    setForm(isVendor ? { ...EMPTY_VENDOR } : { ...EMPTY_WH });
    setEditing(null);
    setDrawer(true);
  };

  const openEdit = (r) => {
    setForm({ ...(isVendor ? EMPTY_VENDOR : EMPTY_WH), ...r });
    setEditing(r.id);
    setDrawer(true);
  };

  const save = () => {
    if (!String(form.name || '').trim()) {
      toast.error('নাম আবশ্যক');
      return;
    }
    try {
      const payload = { ...form, commission: Number(form.commission) || 0 };
      if (editing) localdb.update(table, editing, payload);
      else localdb.insert(table, payload);
      toast.success(editing ? 'আপডেট হয়েছে' : 'যোগ হয়েছে');
      setDrawer(false);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const columns = isVendor
    ? [
        { key: 'name', label: 'ভেন্ডর', render: (r) => (
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-ink-muted">{r.owner || '—'}</div>
          </div>
        ) },
        { key: 'phone', label: 'মোবাইল', render: (r) => <span className="font-mono text-xs">{r.phone || '—'}</span> },
        { key: 'commission', label: 'কমিশন', render: (r) => `${r.commission || 0}%` },
        { key: 'active', label: 'স্ট্যাটাস', render: (r) => (
          <span className={`badge ${r.active ? 'bg-emerald-400/15 text-emerald-400' : 'bg-line text-ink-muted'}`}>
            {r.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
          </span>
        ) },
        { key: 'act', label: '', render: (r) => (
          <div className="flex gap-2 justify-end">
            <button className="p-2 rounded hover:bg-surface2" onClick={() => openEdit(r)}><Pencil size={16} /></button>
            <button className="p-2 rounded hover:bg-red-500/20 text-red-400" onClick={() => setConfirm(r)}><Trash2 size={16} /></button>
          </div>
        ) },
      ]
    : [
        { key: 'name', label: 'ওয়্যারহাউস', render: (r) => (
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-ink-muted font-mono">{r.code || '—'}</div>
          </div>
        ) },
        { key: 'address', label: 'ঠিকানা', render: (r) => <span className="text-ink-muted text-xs">{r.address || '—'}</span> },
        { key: 'manager', label: 'ম্যানেজার', render: (r) => r.manager || '—' },
        { key: 'phone', label: 'মোবাইল', render: (r) => <span className="font-mono text-xs">{r.phone || '—'}</span> },
        { key: 'active', label: 'স্ট্যাটাস', render: (r) => (
          <span className={`badge ${r.active ? 'bg-emerald-400/15 text-emerald-400' : 'bg-line text-ink-muted'}`}>
            {r.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
          </span>
        ) },
        { key: 'act', label: '', render: (r) => (
          <div className="flex gap-2 justify-end">
            <button className="p-2 rounded hover:bg-surface2" onClick={() => openEdit(r)}><Pencil size={16} /></button>
            <button className="p-2 rounded hover:bg-red-500/20 text-red-400" onClick={() => setConfirm(r)}><Trash2 size={16} /></button>
          </div>
        ) },
      ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">মাল্টি-ভেন্ডর ও ওয়্যারহাউস</h1>
          <p className="text-sm text-ink-muted mt-1">একাধিক বিক্রেতা ও গুদাম — স্টক ও কমিশন আলাদাভাবে পরিচালনা করুন।</p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <Plus size={18} /> {isVendor ? 'নতুন ভেন্ডর' : 'নতুন ওয়্যারহাউস'}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          className={`btn ${isVendor ? 'bg-accent text-black' : 'bg-surface2 text-ink border border-line'}`}
          onClick={() => setTab('vendors')}
        >
          <Store size={16} /> ভেন্ডর ({vendors.length})
        </button>
        <button
          className={`btn ${!isVendor ? 'bg-accent text-black' : 'bg-surface2 text-ink border border-line'}`}
          onClick={() => setTab('warehouses')}
        >
          <Warehouse size={16} /> ওয়্যারহাউস ({warehouses.length})
        </button>
      </div>

      <DataTable columns={columns} rows={rows} empty={isVendor ? 'কোনো ভেন্ডর নেই' : 'কোনো ওয়্যারহাউস নেই'} />

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={editing ? 'এডিট করুন' : isVendor ? 'নতুন ভেন্ডর' : 'নতুন ওয়্যারহাউস'}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setDrawer(false)}>বাতিল</button>
            <button className="btn-primary" onClick={save}>সেভ করুন</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">নাম <span className="text-red-400">*</span></label>
            <input className="input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          {isVendor ? (
            <>
              <div>
                <label className="label">মালিকের নাম</label>
                <input className="input" value={form.owner || ''} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">মোবাইল</label>
                  <input className="input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
                </div>
                <div>
                  <label className="label">কমিশন (%)</label>
                  <input className="input" type="number" value={form.commission ?? 10} onChange={(e) => setForm({ ...form, commission: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">ইমেইল</label>
                <input className="input" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">কোড</label>
                  <input className="input" value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="WH-DHK-01" />
                </div>
                <div>
                  <label className="label">ম্যানেজার</label>
                  <input className="input" value={form.manager || ''} onChange={(e) => setForm({ ...form, manager: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">মোবাইল</label>
                <input className="input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
              </div>
            </>
          )}

          <div>
            <label className="label">ঠিকানা</label>
            <textarea className="input min-h-[80px]" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="label">নোট</label>
            <textarea className="input min-h-[70px]" value={form.note || ''} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(form.active)} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            সক্রিয়
          </label>
        </div>
      </Drawer>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        danger
        title="ডিলিট নিশ্চিত করুন"
        message={`${confirm?.name || ''} ডিলিট করতে চান?`}
        onConfirm={() => {
          try {
            localdb.remove(table, confirm.id);
            toast.success('ডিলিট হয়েছে');
            load();
          } catch (e) {
            toast.error(e.message);
          }
        }}
      />
    </div>
  );
}
