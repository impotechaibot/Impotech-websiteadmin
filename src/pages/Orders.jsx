import { useEffect, useState } from 'react';
import { Search, Eye, Trash2, Printer, Truck, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { listOrders, updateOrderStatus, deleteOrder } from '../services/orders.js';
import { createInvoiceFromOrder, listInvoices } from '../services/invoices.js';
import { createShipment, getShipmentByOrder } from '../services/courier.js';
import { getAllSettings } from '../services/settings.js';
import { printInvoice } from '../lib/invoice.js';
import { COURIER_PROVIDERS, isCourierLive } from '../lib/courier.js';
import { bdt, dateTimeBn, ORDER_STATUSES, statusLabel } from '../lib/format.js';

export default function Orders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [site, setSite] = useState({});

  // courier modal
  const [courierFor, setCourierFor] = useState(null);
  const [provider, setProvider] = useState('steadfast');
  const [deliveryType, setDeliveryType] = useState('normal');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setRows(await listOrders({ status, search })); }
    catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [status, search]);
  useEffect(() => { getAllSettings().then(setSite).catch(() => {}); }, []);

  const changeStatus = async (id, s) => {
    try {
      await updateOrderStatus(id, s);
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
      load();
      if (detail?.id === id) setDetail({ ...detail, status: s });
    } catch (e) { toast.error(e.message); }
  };

  /** অর্ডার থেকে ইনভয়েস তৈরি (থাকলে পুনর্ব্যবহার) করে প্রিন্ট। */
  const makeInvoice = async (o) => {
    try {
      const existing = (await listInvoices({ search: o.order_code })).find(
        (inv) => inv.order_id === o.id
      );
      const inv = existing || (await createInvoiceFromOrder(o, site));
      printInvoice(inv);
      toast.success(existing ? 'ইনভয়েস খোলা হয়েছে' : 'ইনভয়েস তৈরি হয়েছে');
    } catch (e) {
      toast.error('ইনভয়েস ব্যর্থ: ' + e.message);
    }
  };

  const openCourier = async (o) => {
    setCourierFor(o);
    setProvider('steadfast');
    setDeliveryType('normal');
    setNote('');
    try {
      const existing = await getShipmentByOrder(o.id);
      if (existing) {
        setProvider(existing.provider || 'steadfast');
        setDeliveryType(existing.delivery_type || 'normal');
        setNote(existing.note || '');
      }
    } catch { /* ignore */ }
  };

  const submitCourier = async () => {
    if (!courierFor) return;
    setBusy(true);
    try {
      const res = await createShipment(courierFor, { provider, deliveryType, note });
      toast.success(
        res?.raw?.demo
          ? `ডেমো মোডে এন্ট্রি — ট্র্যাকিং: ${res.tracking_code}`
          : `কুরিয়ারে এন্ট্রি হয়েছে — ট্র্যাকিং: ${res.tracking_code}`
      );
      setCourierFor(null);
    } catch (e) {
      toast.error('এন্ট্রি ব্যর্থ: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'code', label: 'অর্ডার', render: (o) => <span className="font-medium">{o.order_code}</span> },
    { key: 'cust', label: 'কাস্টমার', render: (o) => (
      <div><p>{o.customer_name}</p><p className="text-xs text-ink-muted">{o.customer_phone}</p></div>
    )},
    { key: 'date', label: 'তারিখ', render: (o) => dateTimeBn(o.created_at) },
    { key: 'total', label: 'মোট', render: (o) => <span className="font-medium">{bdt(o.total)}</span> },
    { key: 'status', label: 'স্ট্যাটাস', render: (o) => (
      <select className="input py-1 text-xs max-w-[130px]" value={o.status}
        onChange={(e) => changeStatus(o.id, e.target.value)}>
        {ORDER_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
    )},
    { key: 'act', label: '', render: (o) => (
      <div className="flex gap-2 justify-end">
        <button className="p-2 rounded hover:bg-surface2" title="বিস্তারিত" onClick={() => setDetail(o)}><Eye size={16} /></button>
        <button className="p-2 rounded hover:bg-surface2" title="ইনভয়েস" onClick={() => makeInvoice(o)}><Receipt size={16} /></button>
        <button className="p-2 rounded hover:bg-surface2" title="কুরিয়ারে পাঠান" onClick={() => openCourier(o)}><Truck size={16} /></button>
        <button className="p-2 rounded hover:bg-red-500/20 text-red-400" title="ডিলিট" onClick={() => setConfirm(o)}><Trash2 size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">অর্ডার</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input className="input pl-9" placeholder="অর্ডার কোড / ফোন / নাম…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">সব স্ট্যাটাস</option>
          {ORDER_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} empty="কোনো অর্ডার নেই" />

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={`অর্ডার ${detail?.order_code || ''}`} wide>
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-ink-muted">কাস্টমার</p><p>{detail.customer_name}</p></div>
              <div><p className="text-ink-muted">ফোন</p><p>{detail.customer_phone}</p></div>
              <div className="col-span-2"><p className="text-ink-muted">ঠিকানা</p><p>{detail.customer_address}</p></div>
              <div><p className="text-ink-muted">পেমেন্ট</p><p>{detail.payment_method}</p></div>
              <div><p className="text-ink-muted">স্ট্যাটাস</p><p>{statusLabel(detail.status)}</p></div>
            </div>
            <div className="border border-line rounded-field overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface2"><tr>
                  <th className="text-left px-3 py-2">পণ্য</th>
                  <th className="text-left px-3 py-2">পরিমাণ</th>
                  <th className="text-right px-3 py-2">দাম</th>
                </tr></thead>
                <tbody>
                  {(detail.items || []).map((it, i) => (
                    <tr key={i} className="border-t border-line/60">
                      <td className="px-3 py-2">{it.name}</td>
                      <td className="px-3 py-2">{it.qty}</td>
                      <td className="px-3 py-2 text-right">{bdt(it.price * it.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right space-y-1">
              <p>সাবটোটাল: {bdt(detail.subtotal)}</p>
              <p>ডেলিভারি: {bdt(detail.shipping)}</p>
              <p>ছাড়: {bdt(detail.discount)}</p>
              <p className="text-lg font-semibold">মোট: {bdt(detail.total)}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" onClick={() => makeInvoice(detail)}>
                <Receipt size={16} /> ইনভয়েস তৈরি / প্রিন্ট
              </button>
              <button className="btn-ghost" onClick={() => openCourier(detail)}>
                <Truck size={16} /> কুরিয়ারে পাঠান
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* courier modal */}
      <Modal open={Boolean(courierFor)} onClose={() => setCourierFor(null)}
        title={`কুরিয়ারে এন্ট্রি — ${courierFor?.order_code || ''}`}>
        <div className="space-y-4">
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
              ডেমো মোড — আসল কুরিয়ার API key সেট না থাকায় নমুনা কনসিগমেন্ট আইডি তৈরি হবে।
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setCourierFor(null)}>বাতিল</button>
            <button className="btn-primary" onClick={submitCourier} disabled={busy}>
              {busy ? 'এন্ট্রি হচ্ছে…' : <><Truck size={16} /> এন্ট্রি করুন</>}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(confirm)} onClose={() => setConfirm(null)} danger
        title="অর্ডার ডিলিট" message={`${confirm?.order_code} ডিলিট করতে চান?`}
        onConfirm={async () => { await deleteOrder(confirm.id); toast.success('ডিলিট হয়েছে'); load(); }} />
    </div>
  );
}
