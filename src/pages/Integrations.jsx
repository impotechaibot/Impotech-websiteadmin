import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { GROUPS, PROVIDERS, isConfigured } from '../lib/integrations.js';

const ROUTES = {
  payment: '/payment',
  courier: '/courier-settings',
  sms: '/sms',
  analytics: '/analytics-settings',
  marketing: '/marketing',
};

/**
 * ইন্টিগ্রেশন হাব — সব সার্ভিস এক নজরে, কোনটা কনফিগারড আর কোনটা বাকি।
 */
export default function Integrations() {
  const [tick, setTick] = useState(0);

  const total = Object.values(PROVIDERS).reduce((s, arr) => s + arr.length, 0);
  const done = Object.entries(PROVIDERS).reduce(
    (s, [group, arr]) => s + arr.filter((p) => isConfigured(group, p.id)).length,
    0
  );

  return (
    <div className="space-y-5" key={tick}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">ইন্টিগ্রেশন হাব</h1>
          <p className="text-sm text-ink-muted mt-1">
            পেমেন্ট, কুরিয়ার, SMS, অ্যানালিটিক্স ও মার্কেটিং — সব সার্ভিস এক জায়গা থেকে কনফিগার করুন।
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge bg-accent/15 text-accent">{done}/{total} কনফিগারড</span>
          <button className="btn-ghost" onClick={() => setTick((t) => t + 1)}>
            <RefreshCw size={16} /> রিফ্রেশ
          </button>
        </div>
      </div>

      <div className="rounded-card border border-accent/25 bg-accent/5 p-4 text-sm text-ink-muted">
        <strong className="text-accent">ডেমো মোড:</strong> কোনো API key ছাড়াই সব সার্ভিস কাজ করে —
        নমুনা রেসপন্স ও ম্যানুয়াল এন্ট্রি দিয়ে। আসল key বসালে কোড না বদলেই লাইভ।
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Object.entries(GROUPS).map(([group, meta]) => {
          const list = PROVIDERS[group] || [];
          const configured = list.filter((p) => isConfigured(group, p.id)).length;
          return (
            <div key={group} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-11 h-11 rounded-lg bg-surface2 grid place-items-center text-xl shrink-0">
                    {meta.icon}
                  </span>
                  <div>
                    <h2 className="font-semibold">{meta.label}</h2>
                    <p className="text-xs text-ink-muted mt-0.5">{meta.desc}</p>
                  </div>
                </div>
                <span className={`badge shrink-0 ${configured ? 'bg-emerald-400/15 text-emerald-400' : 'bg-line text-ink-muted'}`}>
                  {configured}/{list.length}
                </span>
              </div>

              <div className="space-y-1.5">
                {list.map((p) => {
                  const ok = isConfigured(group, p.id);
                  return (
                    <div key={p.id} className="flex items-center gap-2 text-sm py-1">
                      {ok ? (
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Circle size={15} className="text-ink-muted shrink-0" />
                      )}
                      <span className="text-ink-muted w-5 text-center">{p.icon}</span>
                      <span className="flex-1 truncate">{p.name_bn || p.name}</span>
                      <span className={`text-[10px] ${ok ? 'text-emerald-400' : 'text-ink-muted'}`}>
                        {ok ? 'কনফিগারড' : 'সেট করা হয়নি'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Link to={ROUTES[group]} className="btn-ghost w-full justify-center text-sm">
                সেটিংস খুলুন <ArrowRight size={15} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
