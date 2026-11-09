import { useEffect, useMemo, useState } from 'react';
import { Package, AlertTriangle, XCircle, Warehouse, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard.jsx';
import { localdb } from '../lib/localdb.js';
import { bdt } from '../lib/format.js';

/**
 * স্টক / ইনভেন্টরি — প্রোডাক্টের স্টক, লো-স্টক অ্যালার্ট ও স্টক ভ্যালু।
 * স্টক সরাসরি এখান থেকে বাড়ানো/কমানো যায় (localStorage-এ সেভ হয়)।
 */
export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [onlyLow, setOnlyLow] = useState(false);
  const [threshold, setThreshold] = useState(10);

  const load = () => {
    try {
      setProducts(localdb.all('products'));
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const total = products.length;
    const out = products.filter((p) => Number(p.stock) <= 0).length;
    const low = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= threshold).length;
    const value = products.reduce((s, p) => s + Number(p.stock || 0) * Number(p.price || 0), 0);
    return { total, out, low, value };
  }, [products, threshold]);

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    return products
      .filter((p) => {
        const matchS = !s || String(p.name || '').toLowerCase().includes(s) || String(p.name_bn || '').includes(search);
        const matchLow = !onlyLow || Number(p.stock) <= threshold;
        return matchS && matchLow;
      })
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));
  }, [products, search, onlyLow, threshold]);

  const adjust = (p, delta) => {
    const next = Math.max(0, Number(p.stock || 0) + delta);
    try {
      localdb.update('products', p.id, { stock: next });
      toast.success(`${p.name_bn || p.name} — স্টক এখন ${next}`);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const setStock = (p, value) => {
    const next = Math.max(0, Number(value) || 0);
    try {
      localdb.update('products', p.id, { stock: next });
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">স্টক ও ইনভেন্টরি</h1>
          <p className="text-sm text-ink-muted mt-1">প্রতিটি পণ্যের স্টক, লো-স্টক অ্যালার্ট ও মোট স্টক ভ্যালু।</p>
        </div>
        <button className="btn-ghost" onClick={load}>
          <RefreshCw size={16} /> রিফ্রেশ
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="মোট পণ্য" value={stats.total} icon={Package} />
        <StatCard label="স্টক শেষ" value={stats.out} icon={XCircle} tone="bad" sub="এখনই রিস্টক করুন" />
        <StatCard label={`লো স্টক (≤ ${threshold})`} value={stats.low} icon={AlertTriangle} tone="info" />
        <StatCard label="স্টক ভ্যালু" value={bdt(stats.value)} icon={Warehouse} tone="ok" />
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input className="input pl-9" placeholder="পণ্য সার্চ করুন…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
          শুধু লো স্টক
        </label>
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          থ্রেশহোল্ড
          <input
            className="input w-20"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-muted">
                <th className="px-4 py-3 font-medium">পণ্য</th>
                <th className="px-4 py-3 font-medium">দাম</th>
                <th className="px-4 py-3 font-medium">স্টক</th>
                <th className="px-4 py-3 font-medium">স্ট্যাটাস</th>
                <th className="px-4 py-3 font-medium text-right">স্টক পরিবর্তন</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">কোনো পণ্য পাওয়া যায়নি</td>
                </tr>
              ) : (
                rows.map((p) => {
                  const stock = Number(p.stock || 0);
                  const tone = stock <= 0 ? 'bg-red-500/15 text-red-400' : stock <= threshold ? 'bg-accent/15 text-accent' : 'bg-emerald-400/15 text-emerald-400';
                  const label = stock <= 0 ? 'স্টক শেষ' : stock <= threshold ? 'লো স্টক' : 'পর্যাপ্ত';
                  return (
                    <tr key={p.id} className="border-b border-line/60 hover:bg-surface2/50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.name_bn || p.name}</div>
                        <div className="text-xs text-ink-muted">{p.name}</div>
                      </td>
                      <td className="px-4 py-3">{bdt(p.price)}</td>
                      <td className="px-4 py-3">
                        <input
                          className="input w-24"
                          type="number"
                          value={stock}
                          onChange={(e) => setStock(p, e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${tone}`}>{label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button className="btn-ghost px-2 py-1 text-xs" onClick={() => adjust(p, -1)}>−১</button>
                          <button className="btn-ghost px-2 py-1 text-xs" onClick={() => adjust(p, 1)}>+১</button>
                          <button className="btn-ghost px-2 py-1 text-xs" onClick={() => adjust(p, 10)}>+১০</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
