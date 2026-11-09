import { useState } from 'react';
import { CheckCircle2, XCircle, Settings2, ExternalLink, FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';
import Drawer from './Drawer.jsx';
import { getProviderDef, initialValues, saveConfig, testProvider, isConfigured } from '../lib/integrations.js';

/**
 * একটি প্রোভাইডারের কার্ড + সেটিংস ড্রয়ার।
 * group: 'payment' | 'courier' | 'sms' | 'analytics' | 'marketing'
 */
export default function IntegrationCard({ group, provider, onSaved }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const configured = isConfigured(group, provider.id);

  const openDrawer = () => {
    setValues(initialValues(group, provider.id));
    setTestResult(null);
    setOpen(true);
  };

  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const save = () => {
    // বাধ্যতামূলক ফিল্ড যাচাই
    const missing = provider.fields.filter((f) => f.required && !String(values[f.key] || '').trim());
    if (missing.length) {
      toast.error(`পূরণ করুন: ${missing.map((m) => m.label).join(', ')}`);
      return;
    }
    try {
      saveConfig(group, provider.id, values);
      toast.success(`${provider.name_bn || provider.name} সেটিংস সেভ হয়েছে`);
      setOpen(false);
      onSaved?.();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // টেস্টের আগে বর্তমান ফর্মের মান সেভ করে নিই
      saveConfig(group, provider.id, values);
      const r = await testProvider(group, provider.id);
      setTestResult(r);
      if (r.ok) toast.success(r.demo ? 'ডেমো মোডে সফল' : 'সংযোগ সফল');
      else toast.error(r.message);
      onSaved?.();
    } catch (e) {
      setTestResult({ ok: false, message: e.message });
      toast.error(e.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <div className="card flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 rounded-lg bg-surface2 grid place-items-center text-xl shrink-0">
            {provider.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{provider.name_bn || provider.name}</h3>
              <span className="badge bg-surface2 text-ink-muted">{provider.tag}</span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5 truncate">{provider.name}</p>
          </div>
          <span
            className={`badge shrink-0 ${
              configured ? 'bg-emerald-400/15 text-emerald-400' : 'bg-line text-ink-muted'
            }`}
          >
            {configured ? 'কনফিগারড' : 'সেট করা হয়নি'}
          </span>
        </div>

        <p className="text-sm text-ink-muted leading-relaxed">{provider.desc}</p>

        <div className="flex items-center gap-2 mt-auto pt-1">
          <button className="btn-ghost text-sm flex-1 justify-center" onClick={openDrawer}>
            <Settings2 size={15} /> সেটিংস
          </button>
          {provider.docs && (
            <a
              href={provider.docs}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost text-sm px-3"
              title="ডকুমেন্টেশন"
            >
              <ExternalLink size={15} />
            </a>
          )}
        </div>
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={`${provider.icon} ${provider.name_bn || provider.name} — সেটিংস`}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              বাতিল
            </button>
            <button className="btn-ghost" onClick={runTest} disabled={testing}>
              <FlaskConical size={16} /> {testing ? 'টেস্ট হচ্ছে…' : 'সংযোগ টেস্ট'}
            </button>
            <button className="btn-primary" onClick={save}>
              সেভ করুন
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-field bg-surface2 border border-line p-3 text-sm text-ink-muted">
            {provider.desc}
            {provider.docs && (
              <>
                {' '}
                <a
                  href={provider.docs}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  ডকুমেন্টেশন দেখুন →
                </a>
              </>
            )}
          </div>

          {provider.fields.map((f) => (
            <div key={f.key}>
              <label className="label">
                {f.label}
                {f.required && <span className="text-red-400"> *</span>}
              </label>

              {f.type === 'select' ? (
                <select
                  className="input"
                  value={values[f.key] ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                >
                  {(f.options || []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : f.type === 'toggle' ? (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(values[f.key])}
                    onChange={(e) => set(f.key, e.target.checked)}
                  />
                  চালু
                </label>
              ) : f.type === 'textarea' ? (
                <textarea
                  className="input min-h-[80px]"
                  value={values[f.key] ?? ''}
                  placeholder={f.placeholder || ''}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              ) : (
                <input
                  className="input"
                  type={f.type === 'password' ? 'password' : f.type === 'number' ? 'number' : 'text'}
                  value={values[f.key] ?? ''}
                  placeholder={f.placeholder || ''}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}

              {f.help && <p className="text-xs text-ink-muted mt-1">{f.help}</p>}
            </div>
          ))}

          {testResult && (
            <div
              className={`rounded-field border p-3 text-sm flex items-start gap-2 ${
                testResult.ok
                  ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {testResult.ok ? <CheckCircle2 size={16} className="mt-0.5" /> : <XCircle size={16} className="mt-0.5" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <p className="text-xs text-ink-muted border-t border-line pt-3">
            🔒 API key শুধু আপনার ব্রাউজারে সংরক্ষিত থাকে। প্রোডাকশনে key ব্রাউজারে না রেখে
            <code className="mx-1 px-1 rounded bg-surface2">VITE_INTEGRATION_PROXY</code>
            দিয়ে সার্ভার-সাইড প্রক্সি ব্যবহার করুন।
          </p>
        </div>
      </Drawer>
    </>
  );
}
