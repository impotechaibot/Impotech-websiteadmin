import { useEffect, useMemo, useState } from 'react';
import { Save, Gift, Users, TrendingUp, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard.jsx';
import { localdb } from '../lib/localdb.js';
import { bdt } from '../lib/format.js';

/**
 * লয়্যালটি / পয়েন্ট সিস্টেম — কাস্টমার প্রতি কেনাকাটায় পয়েন্ট, রিডেম্পশন ও টিয়ার।
 */
export default function Loyalty() {
  const [cfg, setCfg] = useState({
    enabled: true,
    earnRate: 1,          // প্রতি ১০০ টাকায় কত পয়েন্ট
    earnPer: 100,
    redeemValue: 1,       // ১ পয়েন্ট = কত টাকা
    minRedeem: 100,
    expiryDays: 365,
    tiers: [
      { name: 'ব্রোঞ্জ', minSpent: 0, discount: 0 },
      { name: 'সিলভার', minSpent: 10000, discount: 3 },
      { name: 'গোল্ড', minSpent: 30000, discount: 5 },
      { name: 'প্লাটিনাম', minSpent: 75000, discount: 8 },
    ],
  });
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    try {
      setCfg((c) => ({ ...c, ...(localdb.getSetting('loyalty') || {}) }));
      setCustomers(localdb.all('customers'));
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

  const save = () => {
    try {
      localdb.saveSetting('loyalty', cfg);
      toast.success('লয়্যালটি সেটিংস সেভ হয়েছে');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const stats = useMemo(() => {
    const totalPoints = customers.reduce((s, c) => s + Number(c.points || 0), 0);
    const members = customers.filter((c) => Number(c.points || 0) > 0).length;
    const value = totalPoints * Number(cfg.redeemValue || 0);
    return { totalPoints, members, value };
  }, [customers, cfg.redeemValue]);

  const tierOf = (spent) => {
    const sorted = [...(cfg.tiers || [])].sort((a, b) => b.minSpent - a.minSpent);
    return sorted.find((t) => Number(spent) >= Number(t.minSpent)) || cfg.tiers[0];
  };

  const updateTier = (i, key, value) => {
    const tiers = [...cfg.tiers];
    tiers[i] = { ...tiers[i], [key]: key === 'name' ? value : Number(value) || 0 };
    set('tiers', tiers);
  };

  const addTier = () => set('tiers', [...cfg.tiers, { name: 'নতুন টিয়ার', minSpent: 0, discount: 0 }]);
  const removeTier = (i) => set('tiers', cfg.tiers.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">লয়্যালটি ও পয়েন্ট</h1>
          <p className="text-sm text-ink-muted mt-1">কাস্টমার কেনাকাটায় পয়েন্ট পাবে, পয়েন্ট দিয়ে ছাড় নিতে পারবে।</p>
        </div>
        <button className="btn-primary" onClick={save}>
          <Save size={16} /> সেভ করুন
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="মোট পয়েন্ট" value={stats.totalPoints.toLocaleString('en-US')} icon={Gift} />
        <StatCard label="সদস্য" value={stats.members} icon={Users} tone="info" />
        <StatCard label="পয়েন্টের মূল্য" value={bdt(stats.value)} icon={TrendingUp} tone="ok" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-4">
          <h2 className="font-semibold">আর্নিং ও রিডেম্পশন</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={cfg.enabled} onChange={(e) => set('enabled', e.target.checked)} />
            লয়্যালটি প্রোগ্রাম চালু
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">প্রতি (৳) খরচে</label>
              <input className="input" type="number" value={cfg.earnPer} onChange={(e) => set('earnPer', Number(e.target.value) || 0)} />
            </div>
            <div>
              <label className="label">পয়েন্ট</label>
              <input className="input" type="number" value={cfg.earnRate} onChange={(e) => set('earnRate', Number(e.target.value) || 0)} />
            </div>
          </div>
          <p className="text-xs text-ink-muted">
            অর্থাৎ প্রতি {bdt(cfg.earnPer)} কেনাকাটায় {cfg.earnRate} পয়েন্ট।
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">১ পয়েন্ট = (৳)</label>
              <input className="input" type="number" step="0.01" value={cfg.redeemValue} onChange={(e) => set('redeemValue', Number(e.target.value) || 0)} />
            </div>
            <div>
              <label className="label">সর্বনিম্ন রিডেম্পশন</label>
              <input className="input" type="number" value={cfg.minRedeem} onChange={(e) => set('minRedeem', Number(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <label className="label">পয়েন্টের মেয়াদ (দিন)</label>
            <input className="input" type="number" value={cfg.expiryDays} onChange={(e) => set('expiryDays', Number(e.target.value) || 0)} />
            <p className="text-xs text-ink-muted mt-1">০ দিলে মেয়াদ শেষ হবে না।</p>
          </div>
        </div>

        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">কাস্টমার টিয়ার</h2>
            <button className="btn-ghost text-xs px-3 py-1.5" onClick={addTier}>
              <Plus size={14} /> টিয়ার
            </button>
          </div>
          <div className="space-y-2">
            {cfg.tiers.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className="input flex-1" value={t.name} onChange={(e) => updateTier(i, 'name', e.target.value)} placeholder="টিয়ারের নাম" />
                <input className="input w-28" type="number" value={t.minSpent} onChange={(e) => updateTier(i, 'minSpent', e.target.value)} placeholder="খরচ" />
                <input className="input w-20" type="number" value={t.discount} onChange={(e) => updateTier(i, 'discount', e.target.value)} placeholder="%" />
                <button className="p-2 rounded hover:bg-red-500/20 text-red-400" onClick={() => removeTier(i)}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-muted">ক্রম: নাম · ন্যূনতম মোট খরচ (৳) · ছাড় (%)</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-line">
          <h2 className="font-semibold">কাস্টমার পয়েন্ট</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-muted">
                <th className="px-4 py-3 font-medium">কাস্টমার</th>
                <th className="px-4 py-3 font-medium">মোট খরচ</th>
                <th className="px-4 py-3 font-medium">পয়েন্ট</th>
                <th className="px-4 py-3 font-medium">টিয়ার</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-ink-muted">কোনো কাস্টমার নেই</td></tr>
              ) : (
                customers.map((c) => {
                  const tier = tierOf(c.total_spent);
                  return (
                    <tr key={c.id} className="border-b border-line/60 hover:bg-surface2/50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-ink-muted">{c.phone}</div>
                      </td>
                      <td className="px-4 py-3">{bdt(c.total_spent)}</td>
                      <td className="px-4 py-3 font-medium text-accent">{Number(c.points || 0).toLocaleString('en-US')}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-accent/15 text-accent">{tier?.name || '—'}</span>
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
