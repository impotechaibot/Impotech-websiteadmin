import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Send, CheckCircle2, Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard.jsx';
import { localdb } from '../lib/localdb.js';
import { dateTimeBn } from '../lib/format.js';

/**
 * কাস্টমার সাপোর্ট — লাইভ চ্যাট/টিকিট ইনবক্স।
 * ডেমো মোডে localStorage-এ টিকিট থাকে; Supabase থাকলে একই টেবিলে সিঙ্ক হবে।
 */
export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [reply, setReply] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    try {
      const all = localdb.all('support_tickets');
      setTickets(all);
      if (!activeId && all.length) setActiveId(all[0].id);
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = useMemo(() => tickets.find((t) => t.id === activeId) || null, [tickets, activeId]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return tickets
      .filter((t) => !s || String(t.customer_name || '').toLowerCase().includes(s) || String(t.subject || '').toLowerCase().includes(s))
      .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));
  }, [tickets, search]);

  const stats = useMemo(() => ({
    open: tickets.filter((t) => t.status === 'open').length,
    pending: tickets.filter((t) => t.status === 'pending').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  }), [tickets]);

  const sendReply = () => {
    if (!reply.trim() || !active) return;
    const messages = [...(active.messages || []), {
      id: 'msg-' + Date.now().toString(36),
      from: 'admin',
      text: reply.trim(),
      at: new Date().toISOString(),
    }];
    try {
      localdb.update('support_tickets', active.id, {
        messages,
        status: 'pending',
        updated_at: new Date().toISOString(),
      });
      setReply('');
      toast.success('রিপ্লাই পাঠানো হয়েছে');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const setStatus = (status) => {
    if (!active) return;
    try {
      localdb.update('support_tickets', active.id, { status, updated_at: new Date().toISOString() });
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">কাস্টমার সাপোর্ট</h1>
        <p className="text-sm text-ink-muted mt-1">লাইভ চ্যাট ও সাপোর্ট টিকিট — কাস্টমারের প্রশ্নের উত্তর দিন।</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="খোলা টিকিট" value={stats.open} icon={MessageSquare} tone="bad" />
        <StatCard label="উত্তরের অপেক্ষায়" value={stats.pending} icon={Clock} tone="info" />
        <StatCard label="সমাধান হয়েছে" value={stats.closed} icon={CheckCircle2} tone="ok" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* টিকিট লিস্ট */}
        <div className="card p-0 overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-3 border-b border-line">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input className="input pl-9 text-sm" placeholder="সার্চ…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="p-6 text-center text-sm text-ink-muted">কোনো টিকিট নেই</p>
            ) : (
              filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={`w-full text-left px-4 py-3 border-b border-line/60 hover:bg-surface2/60 transition-colors ${
                    t.id === activeId ? 'bg-accent/10 border-l-2 border-l-accent' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate">{t.customer_name}</span>
                    <span className={`badge shrink-0 text-[10px] ${
                      t.status === 'open' ? 'bg-red-500/15 text-red-400'
                        : t.status === 'pending' ? 'bg-accent/15 text-accent'
                        : 'bg-emerald-400/15 text-emerald-400'
                    }`}>
                      {t.status === 'open' ? 'খোলা' : t.status === 'pending' ? 'অপেক্ষায়' : 'সমাধান'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted truncate mt-0.5">{t.subject}</p>
                  <p className="text-[10px] text-ink-muted mt-1">{dateTimeBn(t.updated_at || t.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* চ্যাট উইন্ডো */}
        <div className="card p-0 flex flex-col max-h-[600px]">
          {!active ? (
            <div className="flex-1 grid place-items-center text-ink-muted text-sm p-10">
              বাম দিক থেকে একটি টিকিট বেছে নিন
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-line flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-semibold">{active.customer_name}</h3>
                  <p className="text-xs text-ink-muted">{active.subject} · {active.customer_phone}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost text-xs px-3 py-1.5" onClick={() => setStatus('pending')}>অপেক্ষায়</button>
                  <button className="btn-ghost text-xs px-3 py-1.5" onClick={() => setStatus('closed')}>সমাধান</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {(active.messages || []).map((m) => (
                  <div key={m.id} className={`flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-card px-4 py-2.5 text-sm ${
                      m.from === 'admin' ? 'bg-accent text-black' : 'bg-surface2 text-ink'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <p className={`text-[10px] mt-1 ${m.from === 'admin' ? 'text-black/60' : 'text-ink-muted'}`}>
                        {dateTimeBn(m.at)}
                      </p>
                    </div>
                  </div>
                ))}
                {(!active.messages || active.messages.length === 0) && (
                  <p className="text-center text-sm text-ink-muted py-8">এখনো কোনো বার্তা নেই</p>
                )}
              </div>

              <div className="p-3 border-t border-line flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="উত্তর লিখুন…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                />
                <button className="btn-primary" onClick={sendReply} disabled={!reply.trim()}>
                  <Send size={16} /> পাঠান
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
