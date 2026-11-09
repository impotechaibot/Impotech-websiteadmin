import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from './DataTable.jsx';
import Drawer from './Drawer.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { localdb } from '../lib/localdb.js';

/**
 * রিইউজেবল বাংলা CRUD পেজ।
 * সার্চ + ফিল্টার + পেজিনেশন + ড্রয়ার ফর্ম + ডিলিট কনফার্ম — সব একসাথে।
 *
 * props:
 *   table      — localdb টেবিলের নাম
 *   title      — পেজের শিরোনাম
 *   subtitle   — ছোট বর্ণনা
 *   addLabel   — "নতুন …" বাটনের লেখা
 *   fields     — [{ key, label, type, options, required, help, default, span }]
 *   columns    — [{ key, label, render }]
 *   searchKeys — কোন ফিল্ডে সার্চ হবে
 *   filter     — { key, label, options:[{value,label}] } (ঐচ্ছিক)
 *   perPage    — প্রতি পেজে কতটি (ডিফল্ট ১০)
 *   emptyText  — খালি অবস্থার লেখা
 *   beforeSave — (payload) => payload  (ঐচ্ছিক ট্রান্সফর্ম)
 */
export default function CrudPage({
  table,
  title,
  subtitle,
  addLabel = 'নতুন যোগ করুন',
  fields = [],
  columns = [],
  searchKeys = [],
  filter = null,
  perPage = 10,
  emptyText = 'কোনো ডেটা নেই',
  beforeSave,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [page, setPage] = useState(1);

  const blank = useMemo(() => {
    const o = {};
    fields.forEach((f) => {
      o[f.key] = f.default !== undefined ? f.default : f.type === 'toggle' ? false : '';
    });
    return o;
  }, [fields]);

  const load = () => {
    setLoading(true);
    try {
      setRows(localdb.all(table));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  /* ---------- সার্চ + ফিল্টার + পেজিনেশন ---------- */
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rows
      .filter((r) => {
        if (!s) return true;
        const keys = searchKeys.length ? searchKeys : Object.keys(r);
        return keys.some((k) => String(r[k] ?? '').toLowerCase().includes(s));
      })
      .filter((r) => (filter && filterValue ? String(r[filter.key]) === filterValue : true))
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [rows, search, searchKeys, filter, filterValue]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, pages);
  const pageRows = filtered.slice((current - 1) * perPage, current * perPage);

  useEffect(() => {
    setPage(1);
  }, [search, filterValue]);

  /* ---------- ফর্ম ---------- */
  const openNew = () => {
    setForm({ ...blank });
    setEditing(null);
    setDrawer(true);
  };

  const openEdit = (row) => {
    const o = { ...blank };
    fields.forEach((f) => {
      o[f.key] = row[f.key] !== undefined && row[f.key] !== null ? row[f.key] : o[f.key];
    });
    setForm(o);
    setEditing(row.id);
    setDrawer(true);
  };

  const save = () => {
    const missing = fields.filter((f) => f.required && !String(form[f.key] ?? '').trim());
    if (missing.length) {
      toast.error(`পূরণ করুন: ${missing.map((m) => m.label).join(', ')}`);
      return;
    }
    try {
      let payload = { ...form };
      fields.forEach((f) => {
        if (f.type === 'number') payload[f.key] = Number(payload[f.key]) || 0;
      });
      if (beforeSave) payload = beforeSave(payload);
      if (editing) localdb.update(table, editing, payload);
      else localdb.insert(table, payload);
      toast.success(editing ? 'আপডেট হয়েছে' : 'যোগ হয়েছে');
      setDrawer(false);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const doDelete = () => {
    try {
      localdb.remove(table, confirm.id);
      toast.success('ডিলিট হয়েছে');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const allColumns = [
    ...columns,
    {
      key: '__act',
      label: '',
      render: (r) => (
        <div className="flex gap-2 justify-end">
          <button className="p-2 rounded hover:bg-surface2" onClick={() => openEdit(r)} title="এডিট">
            <Pencil size={16} />
          </button>
          <button
            className="p-2 rounded hover:bg-red-500/20 text-red-400"
            onClick={() => setConfirm(r)}
            title="ডিলিট"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}
        </div>
        <button className="btn-primary" onClick={openNew}>
          <Plus size={18} /> {addLabel}
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            className="input pl-9"
            placeholder="সার্চ করুন…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {filter && (
          <select
            className="input max-w-[220px]"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          >
            <option value="">{filter.label} — সব</option>
            {(filter.options || []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <DataTable columns={allColumns} rows={pageRows} loading={loading} empty={emptyText} />

      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <span>
            মোট {filtered.length}টি — পেজ {current}/{pages}
          </span>
          <div className="flex gap-2">
            <button
              className="btn-ghost px-3 py-1.5"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft size={16} /> আগের
            </button>
            <button
              className="btn-ghost px-3 py-1.5"
              disabled={current >= pages}
              onClick={() => setPage(current + 1)}
            >
              পরের <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={editing ? `${title} — এডিট` : addLabel}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setDrawer(false)}>
              বাতিল
            </button>
            <button className="btn-primary" onClick={save}>
              সেভ করুন
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key} className={f.span === 2 ? '' : ''}>
              <label className="label">
                {f.label}
                {f.required && <span className="text-red-400"> *</span>}
              </label>

              {f.type === 'select' ? (
                <select
                  className="input"
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                >
                  <option value="">— নির্বাচন করুন —</option>
                  {(f.options || []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : f.type === 'toggle' ? (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(form[f.key])}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                  />
                  চালু
                </label>
              ) : f.type === 'textarea' ? (
                <textarea
                  className="input min-h-[90px]"
                  value={form[f.key] ?? ''}
                  placeholder={f.placeholder || ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              ) : (
                <input
                  className="input"
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                  value={form[f.key] ?? ''}
                  placeholder={f.placeholder || ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              )}

              {f.help && <p className="text-xs text-ink-muted mt-1">{f.help}</p>}
            </div>
          ))}
        </div>
      </Drawer>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        danger
        title="ডিলিট নিশ্চিত করুন"
        message="এই রেকর্ডটি স্থায়ীভাবে ডিলিট হয়ে যাবে। আপনি কি নিশ্চিত?"
        onConfirm={doDelete}
      />
    </div>
  );
}
