export default function StatCard({ label, value, sub, icon: Icon, tone = 'accent' }) {
  const tones = {
    accent: 'text-accent bg-accent/10',
    ok: 'text-emerald-400 bg-emerald-400/10',
    info: 'text-sky-400 bg-sky-400/10',
    bad: 'text-red-400 bg-red-400/10',
  };
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-muted">{label}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {sub && <p className="text-xs text-ink-muted mt-1">{sub}</p>}
        </div>
        {Icon && (
          <span className={`w-10 h-10 rounded-lg grid place-items-center ${tones[tone]}`}>
            <Icon size={20} />
          </span>
        )}
      </div>
    </div>
  );
}
