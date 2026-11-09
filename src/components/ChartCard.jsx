/**
 * চার্ট কনটেইনার কার্ড — শিরোনাম + ঐচ্ছিক অ্যাকশন + নির্দিষ্ট উচ্চতার চার্ট এরিয়া।
 * <ChartCard title="বিক্রয়" action={<button/>} height={288}>{<AreaChart .../>}</ChartCard>
 */
export default function ChartCard({ title, subtitle, action, height = 288, children }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div style={{ height }}>
        {children}
      </div>
    </div>
  );
}
