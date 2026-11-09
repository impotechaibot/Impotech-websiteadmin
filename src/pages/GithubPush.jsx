import { useEffect, useRef, useState } from 'react';
import {
  Github, Upload, KeyRound, Save, Plug, FileArchive, CheckCircle2, XCircle,
  AlertTriangle, ExternalLink, Download, History, Trash2, RefreshCw, Eye, EyeOff,
  ShieldCheck, Info, Rocket, ListChecks,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import {
  getSettings, saveRepoConfig, testConnection, pushZip, listZipFiles,
  getPushLog, clearPushLog, openGithubUploadPage, openRepoPage,
  downloadFilesAsZip, parseZip, TOKEN_STEPS, maskToken,
} from '../lib/github.js';
import { dateTimeBn } from '../lib/format.js';

const LEVEL_STYLE = {
  ok: 'text-emerald-400',
  warn: 'text-amber-400',
  error: 'text-red-400',
  info: 'text-ink-muted',
};

const REPOS = [
  { id: 'admin', label: 'অ্যাডমিন রিপো', hint: 'impotech-admin — এই অ্যাডমিন অ্যাপের কোড' },
  { id: 'website', label: 'ওয়েবসাইট রিপো', hint: 'impotech-website — কাস্টমার সাইটের কোড' },
];

export default function GithubPush() {
  const [which, setWhich] = useState('admin');
  const [settings, setSettings] = useState(getSettings());
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [zipFile, setZipFile] = useState(null);
  const [zipPreview, setZipPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const cfg = settings[which];

  useEffect(() => { setHistory(getPushLog()); }, []);
  useEffect(() => { setTestResult(null); setResult(null); }, [which]);

  const pushLog = (msg, level = 'info') =>
    setLogs((prev) => [...prev, { msg, level, at: new Date().toISOString() }]);

  const update = (patch) => setSettings((s) => ({ ...s, [which]: { ...s[which], ...patch } }));

  const save = () => {
    try {
      const next = saveRepoConfig(which, cfg);
      setSettings(next);
      toast.success('সেটিংস সেভ হয়েছে');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const doTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection(which);
      setTestResult(res);
      if (res.ok) toast.success('সংযোগ সফল');
      else if (res.demo) toast('ডেমো মোড — টোকেন দিন', { icon: 'ℹ️' });
      else toast.error('সংযোগ ব্যর্থ');
    } finally {
      setTesting(false);
    }
  };

  const handleZip = async (file) => {
    if (!file) return;
    setZipFile(file);
    setResult(null);
    setLogs([]);
    try {
      const list = await listZipFiles(file);
      setZipPreview(list);
      toast.success(`${list.length}টি ফাইল পাওয়া গেছে`);
    } catch (e) {
      toast.error(e.message);
      setZipPreview(null);
    }
  };

  const doPush = async () => {
    if (!zipFile) { toast.error('আগে একটি ZIP ফাইল দিন'); return; }
    setBusy(true);
    setLogs([]);
    setResult(null);
    try {
      const res = await pushZip(which, zipFile, pushLog);
      setResult(res);
      if (res.mode === 'pushed') {
        toast.success('সফলভাবে GitHub-এ পুশ হয়েছে!');
      } else {
        toast('বিকল্প পথ — ZIP ডাউনলোড হয়েছে', { icon: '⚠️' });
      }
      setHistory(getPushLog());
    } catch (e) {
      setResult({ ok: false, error: e.info || { title: e.message, why: '', fix: '' } });
      toast.error('পুশ ব্যর্থ: ' + e.message);
      setHistory(getPushLog());
    } finally {
      setBusy(false);
    }
  };

  const doFallbackZip = async () => {
    if (!zipFile) { toast.error('আগে একটি ZIP ফাইল দিন'); return; }
    try {
      const parsed = await parseZip(zipFile, pushLog);
      const name = await downloadFilesAsZip(parsed.files, `${cfg.repo || 'impotech'}-upload`);
      toast.success('রেডি ZIP ডাউনলোড হয়েছে: ' + name);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const openUpload = () => {
    try {
      openGithubUploadPage(which);
      toast.success('GitHub আপলোড পেজ খোলা হয়েছে');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const openRepo = () => {
    try {
      openRepoPage(which);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Github size={24} className="text-accent" /> GitHub পুশ
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          অ্যাডমিন থেকে সরাসরি GitHub-এ কোড পুশ করুন — কোনো কমান্ড চালাতে হবে না।
          টোকেন শুধু আপনার ব্রাউজারে সেভ থাকে, কোথাও হার্ডকোড হয় না।
        </p>
      </div>

      {/* রিপো ট্যাব */}
      <div className="flex gap-2 flex-wrap">
        {REPOS.map((r) => (
          <button
            key={r.id}
            onClick={() => setWhich(r.id)}
            className={`px-4 py-2 rounded-field text-sm border transition-colors ${
              which === r.id
                ? 'bg-accent/15 text-accent border-accent/40 font-medium'
                : 'bg-surface2 text-ink-muted border-line hover:border-accent/40'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-ink-muted -mt-3">{REPOS.find((r) => r.id === which)?.hint}</p>

      {/* সেটিংস */}
      <div className="card space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <KeyRound size={18} className="text-accent" /> রিপো সেটিংস
        </h2>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label">GitHub Personal Access Token</label>
            <div className="flex gap-2">
              <input
                className="input"
                type={showToken ? 'text' : 'password'}
                placeholder="ghp_... (শুধু এই ব্রাউজারে সেভ হবে)"
                value={cfg.token}
                onChange={(e) => update({ token: e.target.value })}
              />
              <button
                type="button"
                className="btn-ghost shrink-0"
                onClick={() => setShowToken((v) => !v)}
                title={showToken ? 'লুকান' : 'দেখান'}
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {cfg.token && (
              <p className="text-xs text-ink-muted mt-1.5">
                সেভ করা টোকেন: <code>{maskToken(cfg.token)}</code>
              </p>
            )}
          </div>

          <div>
            <label className="label">Owner (GitHub ইউজারনেম)</label>
            <input
              className="input"
              placeholder="যেমন: yourname"
              value={cfg.owner}
              onChange={(e) => update({ owner: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Repository নাম</label>
            <input
              className="input"
              placeholder="যেমন: impotech-admin"
              value={cfg.repo}
              onChange={(e) => update({ repo: e.target.value })}
            />
          </div>
          <div>
            <label className="label">ব্রাঞ্চ</label>
            <input
              className="input"
              placeholder="main"
              value={cfg.branch}
              onChange={(e) => update({ branch: e.target.value })}
            />
          </div>
          <div>
            <label className="label">সাব-ফোল্ডার (ঐচ্ছিক)</label>
            <input
              className="input"
              placeholder="খালি রাখুন (রিপোর রুটে পুশ হবে)"
              value={cfg.path}
              onChange={(e) => update({ path: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">কমিট মেসেজ</label>
            <input
              className="input"
              value={cfg.message}
              onChange={(e) => update({ message: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" onClick={save}>
            <Save size={16} /> সেটিংস সেভ করুন
          </button>
          <button className="btn-ghost" onClick={doTest} disabled={testing}>
            {testing ? <RefreshCw size={16} className="animate-spin" /> : <Plug size={16} />} সংযোগ টেস্ট
          </button>
          <button className="btn-ghost" onClick={openRepo}>
            <ExternalLink size={16} /> রিপো খুলুন
          </button>
        </div>

        {testResult && (
          <div className={`rounded-field border p-3 text-sm ${
            testResult.ok
              ? 'border-emerald-400/30 bg-emerald-400/5 text-emerald-300'
              : testResult.demo
                ? 'border-accent/30 bg-accent/5 text-accent'
                : 'border-red-400/30 bg-red-400/5 text-red-300'
          }`}>
            {testResult.ok ? <CheckCircle2 size={15} className="inline mr-1" /> : <AlertTriangle size={15} className="inline mr-1" />}
            {testResult.message}
          </div>
        )}
      </div>

      {/* টোকেন গাইড */}
      <div className="card space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <ListChecks size={18} className="text-accent" /> টোকেন কীভাবে বানাবেন
        </h2>
        <ol className="list-decimal list-inside text-sm text-ink-muted space-y-1">
          {TOKEN_STEPS.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
        <a
          href="https://github.com/settings/tokens/new?scopes=repo&description=impotech-admin-push"
          target="_blank"
          rel="noreferrer"
          className="btn-ghost text-sm w-fit"
        >
          <ExternalLink size={14} /> সরাসরি টোকেন তৈরির পেজ খুলুন
        </a>
      </div>

      {/* ZIP আপলোড */}
      <div className="card space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <FileArchive size={18} className="text-accent" /> ZIP আপলোড → সরাসরি পুশ
        </h2>
        <p className="text-sm text-ink-muted">
          প্রজেক্টের ZIP ফাইল দিন — অ্যাডমিন ব্রাউজারেই খুলে ভেতরের সব কোড ফাইল GitHub-এ পুশ করে দেবে।
          (ছবি/ভিডিওর মতো বাইনারি ফাইল বাদ যাবে; node_modules/dist বাদ যাবে।)
        </p>

        <div
          className={`border-2 border-dashed rounded-card p-8 text-center transition-colors cursor-pointer
            ${dragOver ? 'border-accent bg-accent/5' : 'border-line hover:border-accent/50'}`}
          onClick={() => !busy && fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!busy) handleZip(e.dataTransfer.files?.[0]);
          }}
        >
          <Upload className="mx-auto text-ink-muted" size={28} />
          <p className="text-sm text-ink-muted mt-3">
            {zipFile ? zipFile.name : 'ZIP ফাইল টেনে আনুন বা ক্লিক করে সিলেক্ট করুন'}
          </p>
          {zipPreview && (
            <p className="text-xs text-accent mt-1">{zipPreview.length}টি ফাইল পাওয়া গেছে</p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".zip,application/zip"
            hidden
            onChange={(e) => handleZip(e.target.files?.[0])}
          />
        </div>

        {zipPreview && zipPreview.length > 0 && (
          <details className="text-sm">
            <summary className="cursor-pointer text-ink-muted">
              ফাইল প্রিভিউ দেখুন ({zipPreview.length}টি)
            </summary>
            <div className="mt-2 max-h-56 overflow-y-auto bg-surface2 rounded-field p-3 font-mono text-xs space-y-0.5">
              {zipPreview.slice(0, 300).map((p) => (
                <p key={p} className="text-ink-muted">{p}</p>
              ))}
              {zipPreview.length > 300 && <p className="text-accent">…আরও {zipPreview.length - 300}টি</p>}
            </div>
          </details>
        )}

        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" onClick={doPush} disabled={busy || !zipFile}>
            {busy ? <RefreshCw size={16} className="animate-spin" /> : <Rocket size={16} />}
            {busy ? 'পুশ হচ্ছে…' : 'GitHub-এ পুশ করুন'}
          </button>
          <button className="btn-ghost" onClick={doFallbackZip} disabled={busy || !zipFile}>
            <Download size={16} /> রেডি ZIP ডাউনলোড
          </button>
          <button className="btn-ghost" onClick={openUpload}>
            <ExternalLink size={16} /> GitHub ওয়েব আপলোড পেজ
          </button>
        </div>

        {/* লাইভ লগ */}
        {logs.length > 0 && (
          <div className="bg-black/40 border border-line rounded-field p-4 max-h-72 overflow-y-auto font-mono text-xs space-y-1.5">
            {logs.map((l, i) => (
              <p key={i} className={LEVEL_STYLE[l.level] || LEVEL_STYLE.info}>
                <span className="text-ink-muted">[{new Date(l.at).toLocaleTimeString('bn-BD')}]</span> {l.msg}
              </p>
            ))}
          </div>
        )}

        {/* ফলাফল */}
        {result && result.mode === 'pushed' && (
          <div className="rounded-field border border-emerald-400/30 bg-emerald-400/5 p-4 space-y-2 text-sm">
            <p className="text-emerald-300 flex items-center gap-2 font-medium">
              <CheckCircle2 size={16} /> সফলভাবে পুশ হয়েছে — {result.fileCount}টি ফাইল
            </p>
            <p className="text-ink-muted">কমিট: <code>{result.commit?.slice(0, 7)}</code></p>
            <a href={result.commitUrl} target="_blank" rel="noreferrer" className="btn-ghost text-sm w-fit">
              <ExternalLink size={14} /> কমিট দেখুন
            </a>
          </div>
        )}

        {result && result.mode === 'fallback' && (
          <div className="rounded-field border border-amber-400/30 bg-amber-400/5 p-4 space-y-2 text-sm">
            <p className="text-amber-300 flex items-center gap-2 font-medium">
              <AlertTriangle size={16} /> বিকল্প পথ ব্যবহার করা হয়েছে
            </p>
            <p className="text-ink-muted">
              {result.reason === 'no-token'
                ? 'টোকেন দেওয়া নেই, তাই সরাসরি পুশ হয়নি।'
                : 'ব্রাউজার CORS/নেটওয়ার্ক বাধার কারণে সরাসরি পুশ হয়নি।'}
              {' '}নিচের ধাপে ফাইলগুলো GitHub-এ বসান:
            </p>
            <ol className="list-decimal list-inside text-ink-muted space-y-1">
              <li>“রেডি ZIP ডাউনলোড” চেপে ZIP নামান (হয়ে গেছে: {result.zipName || '—'})।</li>
              <li>“GitHub ওয়েব আপলোড পেজ” চেপে খোলা পেজে ZIP-টা ড্র্যাগ-ড্রপ করুন।</li>
              <li>Commit changes চাপুন — Vercel নিজে থেকে ডিপ্লয় করবে।</li>
            </ol>
            {result.error && (
              <p className="text-xs text-ink-muted">
                কারণ: {result.error.title} — {result.error.fix}
              </p>
            )}
          </div>
        )}

        {result && result.ok === false && (
          <div className="rounded-field border border-red-400/30 bg-red-400/5 p-4 space-y-2 text-sm">
            <p className="text-red-300 flex items-center gap-2 font-medium">
              <XCircle size={16} /> পুশ ব্যর্থ
            </p>
            <p className="text-ink-muted"><strong className="text-ink">কারণ:</strong> {result.error?.title}</p>
            {result.error?.why && <p className="text-ink-muted">{result.error.why}</p>}
            {result.error?.fix && <p className="text-emerald-300"><strong>সমাধান:</strong> {result.error.fix}</p>}
          </div>
        )}
      </div>

      {/* CORS ব্যাখ্যা */}
      <div className="card border-accent/30 bg-accent/5 space-y-2">
        <p className="text-sm text-accent flex items-start gap-2">
          <Info size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong>CORS সমস্যা হলে কী করবেন:</strong> GitHub API ব্রাউজার থেকে টোকেন থাকলে সাধারণত কাজ করে।
            কিন্তু কোনো নেটওয়ার্ক/এক্সটেনশন আটকালে উপরের <strong>“রেডি ZIP ডাউনলোড”</strong> +{' '}
            <strong>“GitHub ওয়েব আপলোড পেজ”</strong> ব্যবহার করুন — ফাইলগুলো একটা ZIP-এ প্যাক হয়ে যাবে,
            GitHub-এ ড্র্যাগ-ড্রপ করলেই হবে। কোনো কমান্ড লাগবে না।
          </span>
        </p>
      </div>

      {/* পুশ লগ */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <History size={18} className="text-accent" /> পুশ লগ
          </h2>
          {history.length > 0 && (
            <button className="btn-ghost text-sm" onClick={() => setConfirmClear(true)}>
              <Trash2 size={15} /> লগ মুছুন
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-ink-muted">এখনো কোনো পুশ হয়নি।</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-start gap-3 border border-line rounded-field p-3 text-sm">
                {h.status === 'success'
                  ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  : h.status === 'fallback'
                    ? <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                    : <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className={
                    h.status === 'success' ? 'text-emerald-400'
                      : h.status === 'fallback' ? 'text-amber-400' : 'text-red-400'
                  }>
                    {h.message}
                  </p>
                  <p className="text-xs text-ink-muted mt-1">
                    {dateTimeBn(h.at)}
                    {h.repo ? ` · ${h.repo}` : ''}
                    {h.branch ? ` · ${h.branch}` : ''}
                    {h.commit ? ` · ${h.commit.slice(0, 7)}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card border-line">
        <p className="text-sm text-ink-muted flex items-start gap-2">
          <ShieldCheck size={16} className="text-accent shrink-0 mt-0.5" />
          <span>
            <strong className="text-ink">নিরাপত্তা:</strong> টোকেন শুধু এই ব্রাউজারের localStorage-এ থাকে এবং
            শুধু api.github.com-এ পাঠানো হয়। কোডে কোথাও হার্ডকোড করা নেই। কম্পিউটার শেয়ার করলে পুশ শেষে
            টোকেন মুছে দিন।
          </span>
        </p>
      </div>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => { clearPushLog(); setHistory([]); toast.success('লগ মুছে ফেলা হয়েছে'); }}
        danger
        title="পুশ লগ মুছুন"
        message="সব পুশ লগ মুছে ফেলা হবে। নিশ্চিত?"
      />
    </div>
  );
}
