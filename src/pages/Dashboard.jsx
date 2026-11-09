import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, Users, TrendingUp, Clock } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import StatCard from '../components/StatCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { orderStats, listOrders } from '../services/orders.js';
import { listProducts } from '../services/products.js';
import { listCustomers } from '../services/customers.js';
import { bdt, dateTimeBn, statusLabel } from '../lib/format.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [counts, setCounts] = useState({ products: 0, customers: 0 });

  useEffect(() => {
    (async () => {
      const [s, orders, products, customers] = await Promise.all([
        orderStats(),
        listOrders(),
        listProducts(),
        listCustomers(),
      ]);
      setStats(s);
      setRecent(orders.slice(0, 6));
      setCounts({ products: products.length, customers: customers.length });
    })();
  }, []);

  if (!stats) return <div className="text-ink-muted">লোড হচ্ছে…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">ড্যাশবোর্ড</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="মোট বিক্রয়" value={bdt(stats.revenue)} icon={TrendingUp} tone="ok" />
        <StatCard label="মোট অর্ডার" value={stats.count} sub={`${stats.pending}টি নতুন`} icon={ShoppingCart} />
        <StatCard label="প্রোডাক্ট" value={counts.products} icon={Package} tone="info" />
        <StatCard label="কাস্টমার" value={counts.customers} icon={Users} tone="info" />
      </div>

      <ChartCard title="শেষ ৩০ দিনের বিক্রয়" subtitle="দৈনিক মোট বিক্রয় (৳)">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.series}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f0b429" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#f0b429" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#26262e" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#9a9aa5', fontSize: 11 }}
                tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fill: '#9a9aa5', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a20', border: '1px solid #26262e', borderRadius: 10 }}
                formatter={(v) => [bdt(v), 'বিক্রয়']}
              />
              <Area type="monotone" dataKey="total" stroke="#f0b429" fill="url(#g)" strokeWidth={2} />
            </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">সাম্প্রতিক অর্ডার</h2>
          <Link to="/orders" className="text-sm text-accent hover:underline">সব দেখুন</Link>
        </div>
        <div className="space-y-2">
          {recent.length === 0 && <p className="text-ink-muted text-sm">এখনো কোনো অর্ডার নেই</p>}
          {recent.map((o) => (
            <div key={o.id} className="flex items-center justify-between py-2 border-b border-line/60 last:border-0">
              <div>
                <p className="font-medium">{o.order_code}</p>
                <p className="text-xs text-ink-muted flex items-center gap-1">
                  <Clock size={12} /> {dateTimeBn(o.created_at)} · {o.customer_name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{bdt(o.total)}</p>
                <p className="text-xs text-ink-muted">{statusLabel(o.status)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
