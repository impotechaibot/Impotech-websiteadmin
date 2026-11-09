import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable.jsx';
import { listCustomers } from '../services/customers.js';
import { bdt, dateBn } from '../lib/format.js';

export default function Customers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setRows(await listCustomers({ search })); }
      catch (e) { toast.error(e.message); }
      finally { setLoading(false); }
    })();
  }, [search]);

  const columns = [
    { key: 'name', label: 'নাম', render: (c) => <span className="font-medium">{c.name}</span> },
    { key: 'phone', label: 'ফোন', render: (c) => c.phone },
    { key: 'email', label: 'ইমেইল', render: (c) => c.email || '—' },
    { key: 'orders', label: 'অর্ডার', render: (c) => c.total_orders },
    { key: 'spent', label: 'মোট খরচ', render: (c) => <span className="font-medium">{bdt(c.total_spent)}</span> },
    { key: 'since', label: 'যোগদান', render: (c) => dateBn(c.created_at) },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">কাস্টমার</h1>
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input className="input pl-9" placeholder="নাম / ফোন…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <DataTable columns={columns} rows={rows} loading={loading} empty="কোনো কাস্টমার নেই" />
    </div>
  );
}
