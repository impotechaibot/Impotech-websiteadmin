import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import { orderStats, listOrders } from '../services/orders.js';
import { listProducts } from '../services/products.js';
import { bdt } from '../lib/format.js';

const COLORS = ['#f0b429', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#14b8a6'];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [byCategory, setByCategory] = useState([]);

  useEffect(() => {
    (async () => {
      const [s, orders, products] = await Promise.all([orderStats(), listOrders(), listProducts()]);

      // টপ প্রোডাক্ট (বিক্রয়ের পরিমাণ অনুযায়ী)
      const tally = {};
      orders.filter((o) => o.status !== 'cancelled').forEach((o) => {
        (o.items || []).forEach((it) => {
          tally[it.name] = (tally[it.name] || 0) + (it.qty || 0);
        });
      });
      setTopProducts(
        Object.entries(tally).map(([name, qty]) => ({ name, qty }))
          .sort((a, b) => b.qty - a.qty).slice(0, 8)
      );

      // ক্যাটাগরি অনুযায়ী প্রোডাক্ট সংখ্যা
      const catMap = {};
      products.forEach((p) => {
        const c = p.categories?.name_bn || p.categories?.name || 'অন্যান্য';
        catMap[c] = (catMap[c] || 0) + 1;
      });
      setByCategory(Object.entries(catMap).map(([name, value]) => ({ name, value })));

      setStats(s);
    })();
  }, []);

  if (!stats) return <div className="text-ink-muted">লোড হচ্ছে…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">অ্যানালিটিক্স</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card"><p className="text-sm text-ink-muted">মোট বিক্রয়</p>
          <p className="text-2xl font-semibold mt-1">{bdt(stats.revenue)}</p></div>
        <div className="card"><p className="text-sm text-ink-muted">গড় অর্ডার মূল্য</p>
          <p className="text-2xl font-semibold mt-1">{bdt(stats.avg)}</p></div>
        <div className="card"><p className="text-sm text-ink-muted">মোট অর্ডার</p>
          <p className="text-2xl font-semibold mt-1">{stats.count}</p></div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">টপ প্রোডাক্ট (বিক্রয়)</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid stroke="#26262e" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#9a9aa5', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#9a9aa5', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1a20', border: '1px solid #26262e', borderRadius: 10 }} />
              <Bar dataKey="qty" fill="#f0b429" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">ক্যাটাগরি অনুযায়ী প্রোডাক্ট</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={100} label>
                {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a20', border: '1px solid #26262e', borderRadius: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
