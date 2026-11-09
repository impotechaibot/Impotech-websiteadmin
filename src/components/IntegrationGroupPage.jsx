import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import IntegrationCard from './IntegrationCard.jsx';
import { GROUPS, PROVIDERS, configuredCount } from '../lib/integrations.js';

/**
 * একটি গ্রুপের সব প্রোভাইডার কার্ড দেখায় (পেমেন্ট / কুরিয়ার / SMS / অ্যানালিটিক্স / মার্কেটিং)।
 */
export default function IntegrationGroupPage({ group, title, subtitle }) {
  const [tick, setTick] = useState(0);
  const meta = GROUPS[group] || {};
  const list = PROVIDERS[group] || [];
  const done = configuredCount(group);

  return (
    <div className="space-y-5" key={tick}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">
            {meta.icon} {title || meta.label}
          </h1>
          <p className="text-sm text-ink-muted mt-1">{subtitle || meta.desc}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge bg-accent/15 text-accent">
            {done}/{list.length} কনফিগারড
          </span>
          <button className="btn-ghost" onClick={() => setTick((t) => t + 1)}>
            <RefreshCw size={16} /> রিফ্রেশ
          </button>
        </div>
      </div>

      <div className="rounded-card border border-accent/25 bg-accent/5 p-4 text-sm text-ink-muted">
        <strong className="text-accent">ডেমো মোড:</strong> কোনো API key না দিলেও সব সার্ভিস কাজ করবে —
        নমুনা রেসপন্স ও ম্যানুয়াল এন্ট্রি দিয়ে। আসল key বসালে কোড না বদলেই লাইভ হয়ে যাবে।
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => (
          <IntegrationCard
            key={p.id}
            group={group}
            provider={p}
            onSaved={() => setTick((t) => t + 1)}
          />
        ))}
      </div>
    </div>
  );
}
