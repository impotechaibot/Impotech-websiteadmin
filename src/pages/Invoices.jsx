import { useEffect, useState } from 'react';
import { Search, Eye, Printer, Download, Trash2, FileText, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { listInvoices, updateInvoiceStatus, deleteInvoice } from '../services/invoices.js';
import { printInvoice, downloadInvoiceHtml } from '../lib/invoice.js';
import { bdt, dateTimeBn } from '../lib/format.js';

const STATUS = [
  { id: 'issued', label: 'ইস্যু করা হয়েছে', cls: 'bg-amber-400/15 text-amber-400' },
  { id: 'paid', label: 'পরিশোধিত', cls: 'bg-emerald-400/15 text-emerald-400' },
  { id: 'cancelled', label: 'বাতিল', cls: 'bg-red-400/15 text-red-400' },
];

export default function Invoices() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setRows(await listInvoices({ search })); }
    catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [search]);

  const doPrint = (inv) => {
    try { printInvoice(inv); }
    catch (e) { toast.error(e.message); }
  };

  const columns = [
    { key: 'no', label: 'ইনভয়েস', render: (r) => (
      <div>
        <p className="font-medium">{r.invoice_no}</p>
        <p className="text-xs text-ink-muted">{r.order_code}</p>
      </div>
    ) },
    { key: 'cust', label: 'কাস্টমার', render: (r) => (
      <div>
        <p>{r.customer_name}</p>
        <p className="text-xs text-ink-muted">{r.customer_phone}</p>
      </div>
    ) },
    { key: 'date', label: 'তারিখ', render: (r) => dateTimeBn(r.issued_at || r.created_at) },
    { key: 'total', label: 'মোট', render: (r) => <span className="font-medium">{bdt(r.total)}</span> },
    { key: 'status', label: 'স্ট্যাটাস', render: (r) => {
      const s = STATUS.find((x) => x.id === r.status) || STATUS[0];
      return <span className={`badge ${s.cls}`}>{s.label}</span>;
    } },
    { key: 'act', label: '', render: (r) => (
      <div className="flex gap-2 justify-end">
        <button className="p-2 rounded hover:bg-surface2" title="দেখুন" onClick={() => setDetail(r)}>
          <Eye size={16} />
        </button>
        <button className="p-2 rounded hover:bg-surface2" title="প্রিন্ট / PDF" onClick={() => doPrint(r)}>
          <Printer size={16} />
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
        <h1 className="text-2xl font-semibold">ইনভয়েস</h1>
        <span className="text-sm text-ink-muted">মোট {rows.length}টি</span>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input className="input pl-9" placeholder="ইনভয়েস নম্বর / অর্ডার / কাস্টমার…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} empty="কোনো ইনভয়েস নেই" />

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)}
        title={`ইনভয়েস ${detail?.invoice_no || ''}`} wide>
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-ink-muted">কাস্টমার</p><p>{detail.customer_name}</p></div>
              <div><p className="text-ink-muted">ফোন</p><p>{detail.customer_phone}</p></div>
              <div className="col-span-2"><p className="text-ink-muted">ঠিকানা</p><p>{detail.customer_address}</p></div>
              <div><p className="text-ink-muted">অর্ডার</p><p>{detail.order_code}</p></div>
              <div><p className="text-ink-muted">তারিখ</p><p>{dateTimeBn(detail.issued_at || detail.created_at)}</p></div>
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
              <button className="btn-primary" onClick={() => doPrint(detail)}>
                <Printer size={16} /> প্রিন্ট / PDF
              </button>
              <button className="btn-ghost" onClick={() => downloadInvoiceHtml(detail)}>
                <Download size={16} /> HTML ডাউনলোড
              </button>
              {detail.status !== 'paid' && (
                <button className="btn-ghost" onClick={async () => {
                  await updateInvoiceStatus(detail.id, 'paid');
                  toast.success('পরিশোধিত হিসেবে চিহ্নিত');
                  setDetail({ ...detail, status: 'paid' });
                  load();
                }}>
                  <Check size={16} /> পরিশোধিত
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={Boolean(confirm)} onClose={() => setConfirm(null)} danger
        title="ইনভয়েস ডিলিট" message={`${confirm?.invoice_no} ডিলিট করতে চান?`}
        onConfirm={async () => { await deleteInvoice(confirm.id); toast.success('ডিলিট হয়েছে'); load(); }} />
    </div>
  );
}
