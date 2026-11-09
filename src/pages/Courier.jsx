import { useEffect, useState } from 'react';
import { Search, Truck, ExternalLink, Trash2, RefreshCw, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import {
  listShipments, createShipment, updateShipmentStatus, deleteShipment,
} from '../services/courier.js';
import { listOrders } from '../services/orders.js';
import {
  COURIER_PROVIDERS, COURIER_STATUSES, courierStatusLabel, courierStatusTone,
  trackingUrl, isCourierLive,
} from '../lib/courier.js';
import { bdt, dateTimeBn } from '../lib/format.js';

export default function Courier() {
  const [rows, setRows] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [provider, setProvider] = useState('steadfast');
  const [deliveryType, setDeliveryType] = useState('normal');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, o] = await Promise.all([listShipments({ status, search }), listOrders()]);
      setRows(s);
      setOrders(o);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [status, search]);

  const openNew = () => {
    setOrderId(orders[0]?.id || '');
    setProvider('steadfast');
    setDeliveryType('normal');
    setNote('');
    setDrawer(true);
  };

  const submit = async () => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) { toast.error('অর্ডার বাছুন'); return; }
    setBusy(true);
    try {
      const res = await createShipment(order, { provider, deliveryType, note });
      toast.success(
        res?.raw?.demo
          ? `ডেমো মোডে এন্ট্রি হয়েছে — ট্র্যাকিং: ${res.tracking_code}`
          : `কুরিয়ারে এন্ট্রি হয়েছে — ট্র্যাকিং: ${res.tracking_code}`
      );
      setDrawer(false);
      load();
    } catch (e) {
      toast.error('এন্ট্রি ব্যর্থ: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'order', label: 'অর্ডার', render: (r) => (
      <div>
        <p className="font-medium">{r.order_code}</p>
        <p className="text-xs text-ink-muted">{dateTimeBn(r.created_at)}</p>
      </div>
    ) },
    { key: 'provider', label: 'কুরিয়ার', render: (r) => (
      <span className="badge bg-surface2 text-ink">
        {COURIER_PROVIDERS.find((p) => p.id === r.provider)?.name || r.provider}
      </span>
    ) },
    { key: 'tracking', label: 'ট্র্যাকিং', render: (r) => (
      <div>
        <p className="font-mono text-xs">{r.tracking_code || '—'}</p>
        <p className="text-xs text-ink-muted">{r.consignment_id}</p>
      </div>
    ) },
    { key: 'recipient', label: 'প্রাপক', render: (r) => (
      <div>
        <p>{r.recipient_name}</p>
        <p className="text-xs text-ink-muted">{r.recipient_phone}</p>
      </div>
    ) },
    { key: 'cod', label: 'COD', render: (r) => bdt(r.cod_amount) },
    { key: 'status', label: 'স্ট্যাটাস', render: (r) => (
      <select className="input py-1 text-xs max-w-[150px]" value={r.status}
        onChange={async (e) => {
          await updateShipmentStatus(r.id, e.target.value);
          toast.success('স্ট্যাটাস আপডেট');
          load();
        }}>
        {COURIER_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
    ) },
    { key: 'act', label: '', render: (r) => (
      <div className="flex gap-2 justify-end">
        {trackingUrl(r.provider, r.tracking_code) && (
          <a className="p-2 rounded hover:bg-surface2" title="কুরিয়ারে ট্র্যাক"
            href={trackingUrl(r.provider, r.tracking_code)} target="_blank" rel="noreferrer">
            <ExternalLink size={16} />
          </a>
        )}
        <button className="p-2 rounded hover:bg-red-500/20 text-red-400" title="ডিলিট"
          onClick={() => setConfirm(r)}>
          <Trash2 size={16} />
        </button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">কুরিয়ার শিপমেন্ট</h1>
        <div className="flex items-center gap-3">
          <span className={`badge ${isCourierLive() ? 'bg-emerald-400/15 text-emerald-400' : 'bg-amber-400/15 text-amber-400'}`}>
            {isCourierLive() ? 'লাইভ মোড' : 'ডেমো মোড'}
          </span>
          <button className="btn-primary" onClick={openNew}>
            <Plus size={18} /> নতুন এন্ট্রি
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input className="input pl-9" placeholder="অর্ডার / ট্র্যাকিং / প্রাপক…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">সব স্ট্যাটাস</option>
          {COURIER_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} empty="কোনো শিপমেন্ট নেই" />

      <Modal open={drawer} onClose={() => setDrawer(false)} title="কুরিয়ারে এন্ট্রি">
        <div className="space-y-4">
          <div>
            <label className="label">অর্ডার *</label>
            <select className="input" value={orderId} onChange={(e) => setOrderId(e.target.value)}>
              <option value="">— বাছুন —</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.order_code} — {o.customer_name} ({bdt(o.total)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">কুরিয়ার</label>
            <div className="grid grid-cols-2 gap-2">
              {COURIER_PROVIDERS.map((p) => (
                <button key={p.id} type="button"
                  className={`btn-ghost justify-center ${provider === p.id ? 'ring-1 ring-accent text-accent' : ''}`}
                  onClick={() => setProvider(p.id)}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">ডেলিভারি ধরন</label>
              <select className="input" value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
                <option value="normal">নরমাল</option>
                <option value="express">এক্সপ্রেস</option>
              </select>
            </div>
            <div>
              <label className="label">নোট</label>
              <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>

          {!isCourierLive() && (
            <p className="text-xs text-amber-400 bg-amber-400/10 rounded-field px-3 py-2">
              ডেমো মোড — আসল কুরিয়ার API key সেট না থাকায় একটি নমুনা কনসিগমেন্ট আইডি তৈরি হবে।
              লাইভ করতে <code>.env</code>-এ <code>VITE_COURIER_API_BASE</code> দিন।
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setDrawer(false)}>বাতিল</button>
            <button className="btn-primary" onClick={submit} disabled={busy}>
              {busy ? 'এন্ট্রি হচ্ছে…' : <><Truck size={16} /> এন্ট্রি করুন</>}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(confirm)} onClose={() => setConfirm(null)} danger
        title="শিপমেন্ট ডিলিট" message={`${confirm?.order_code} এর শিপমেন্ট ডিলিট করতে চান?`}
        onConfirm={async () => { await deleteShipment(confirm.id); toast.success('ডিলিট হয়েছে'); load(); }} />
    </div>
  );
}
