import { useEffect, useRef, useState } from 'react';
import {
  Upload, RefreshCw, Database, Download, RotateCcw, CheckCircle2,
  AlertTriangle, XCircle, FileArchive, History, Trash2, ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import {
  runUpdate, getUpdateLog, clearUpdateLog, getStagedUpdate, clearStagedUpdate,
  getSchemaVersion, createBackup, downloadBackup, restoreBackup, getBackup,
} from '../lib/updater.js';
import { isSupabaseConfigured } from '../lib/supabase.js';
import { dateTimeBn } from '../lib/format.js';

const LEVEL_STYLE = {
  ok: 'text-emerald-400',
  warn: 'text-amber-400',
  error: 'text-red-400',
  info: 'text-ink-muted',
};

export default function Update() {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [staged, setStaged] = useState(null);
  const [schema, setSchema] = useState({ version: '1.0.0', tables: [] });
  const [backup, setBackup] = useState(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const refresh = () => {
    setHistory(getUpdateLog());
    setStaged(getStagedUpdate());
    setSchema(getSchemaVersion());
    setBackup(getBackup());
  };

  useEffect(() => { refresh(); }, []);

  const pushLog = (msg, level = 'info') => {
    setLogs((prev) => [...prev, { msg, level, at: new Date().toISOString() }]);
  };

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    setLogs([]);
    try {
      await runUpdate(file, pushLog);
      toast.success('আপডেট সফলভাবে সম্পন্ন হয়েছে!');
      refresh();
    } catch (e) {
      toast.error('আপডেট ব্যর্থ: ' + e.message);
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const doBackup = () => {
    try {
      createBackup();
      toast.success('ব্যাকআপ তৈরি হয়েছে');
      refresh();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const doRestore = () => {
    try {
      restoreBackup();
      toast.success('ব্যাকআপ থেকে ফিরিয়ে আনা হয়েছে — পেজ রিলোড হচ্ছে');
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">আপডেট</h1>
        <p className="text-sm text-ink-muted mt-1">
          শুধু একটি ZIP ফাইল আপলোড করলেই অ্যাপ নিজে থেকে কোড, ফিচার ও ডেটা স্কিমা আপডেট করে নেবে।
          কোনো কমান্ড চালাতে হবে না, ফাইল বদলাতে হবে না।
        </p>
      </div>

      {!isSupabaseConfigured && (
        <div className="card border-accent/40 bg-accent/5">
          <p className="text-sm text-accent flex items-center gap-2">
            <Database size={16} /> ডেমো মোড — আপডেট-লগ ও স্কিমা-ভার্সন এই ব্রাউজারের localStorage-এ থাকবে।
            Supabase কনফিগার করলে ডেটাবেসেও সিঙ্ক হবে।
          </p>
        </div>
      )}

      {/* বর্তমান অবস্থা */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs text-ink-muted">স্কিমা ভার্সন</p>
          <p className="text-lg font-semibold mt-1">{schema.version || '1.0.0'}</p>
          <p className="text-xs text-ink-muted mt-1">
            {schema.updatedAt ? dateTimeBn(schema.updatedAt) : 'এখনো আপডেট হয়নি'}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-ink-muted">স্টেজড আপডেট</p>
          <p className="text-lg font-semibold mt-1">{staged ? staged.version : 'নেই'}</p>
          <p className="text-xs text-ink-muted mt-1">
            {staged ? `${staged.fileCount}টি ফাইল` : 'কোনো আপডেট অপেক্ষমাণ নেই'}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-ink-muted">সর্বশেষ ব্যাকআপ</p>
          <p className="text-lg font-semibold mt-1">{backup ? 'আছে' : 'নেই'}</p>
          <p className="text-xs text-ink-muted mt-1">
            {backup ? dateTimeBn(backup.at) : 'এখনো ব্যাকআপ নেওয়া হয়নি'}
          </p>
        </div>
      </div>

      {/* আপলোড */}
      <div className="card space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <FileArchive size={18} className="text-accent" /> আপডেট ZIP আপলোড
        </h2>
        <div
          className={`border-2 border-dashed rounded-card p-8 text-center transition-colors cursor-pointer
            ${dragOver ? 'border-accent bg-accent/5' : 'border-line hover:border-accent/50'}`}
          onClick={() => !busy && fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!busy) handleFile(e.dataTransfer.files?.[0]);
          }}
        >
          <Upload className="mx-auto text-ink-muted" size={28} />
          <p className="text-sm text-ink-muted mt-3">
            {busy ? 'আপডেট চলছে…' : 'ZIP ফাইল টেনে আনুন বা ক্লিক করে সিলেক্ট করুন'}
          </p>
          <p className="text-xs text-ink-muted mt-1">
            ফাইলের ভেতরে থাকতে পারে: সোর্স কোড, <code>supabase/migrations/*.sql</code>, <code>seed.json</code>,{' '}
            <code>impotech-update.json</code>
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".zip,application/zip"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {busy && (
          <div className="flex items-center gap-2 text-sm text-accent">
            <RefreshCw size={16} className="animate-spin" /> আপডেট প্রক্রিয়া চলছে, অপেক্ষা করুন…
          </div>
        )}

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
      </div>

      {/* স্টেজড আপডেট */}
      {staged && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" /> স্টেজড আপডেট
            </h2>
            <button
              className="btn-ghost text-sm"
              onClick={() => { clearStagedUpdate(); toast.success('স্টেজড আপডেট মুছে ফেলা হয়েছে'); refresh(); }}
            >
              <Trash2 size={15} /> মুছুন
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <p><span className="text-ink-muted">ভার্সন:</span> {staged.version}</p>
            <p><span className="text-ink-muted">ফাইল:</span> {staged.fileCount}টি</p>
            <p><span className="text-ink-muted">স্টেজ সময়:</span> {dateTimeBn(staged.stagedAt)}</p>
            <p><span className="text-ink-muted">নাম:</span> {staged.name}</p>
          </div>
          {staged.features?.length > 0 && (
            <div>
              <p className="text-sm text-ink-muted mb-1">নতুন ফিচার:</p>
              <ul className="list-disc list-inside text-sm space-y-0.5">
                {staged.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}
          {staged.migrations?.length > 0 && (
            <p className="text-xs text-ink-muted">
              মাইগ্রেশন: {staged.migrations.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* ব্যাকআপ */}
      <div className="card space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <ShieldCheck size={18} className="text-accent" /> ব্যাকআপ ও রিস্টোর
        </h2>
        <p className="text-sm text-ink-muted">
          প্রতিটি আপডেটের আগে স্বয়ংক্রিয়ভাবে ব্যাকআপ নেওয়া হয়। চাইলে নিজেও নিতে পারেন।
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="btn-ghost" onClick={doBackup}>
            <Database size={16} /> এখনই ব্যাকআপ নিন
          </button>
          <button className="btn-ghost" onClick={() => { downloadBackup(); toast.success('ব্যাকআপ ডাউনলোড হয়েছে'); }}>
            <Download size={16} /> ব্যাকআপ ডাউনলোড
          </button>
          <button
            className="btn-danger"
            disabled={!backup}
            onClick={() => setConfirmRestore(true)}
          >
            <RotateCcw size={16} /> ব্যাকআপ থেকে ফিরিয়ে আনুন
          </button>
        </div>
      </div>

      {/* আপডেট লগ */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <History size={18} className="text-accent" /> আপডেট লগ
          </h2>
          {history.length > 0 && (
            <button className="btn-ghost text-sm" onClick={() => setConfirmClear(true)}>
              <Trash2 size={15} /> লগ মুছুন
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-ink-muted">এখনো কোনো আপডেট হয়নি।</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-start gap-3 border border-line rounded-field p-3 text-sm">
                {h.status === 'success'
                  ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  : <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className={h.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                    {h.message}
                  </p>
                  <p className="text-xs text-ink-muted mt-1">
                    {dateTimeBn(h.finishedAt || h.at)}
                    {h.version ? ` · ভার্সন ${h.version}` : ''}
                    {h.fileCount ? ` · ${h.fileCount}টি ফাইল` : ''}
                    {h.addedTables?.length ? ` · নতুন টেবিল: ${h.addedTables.join(', ')}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card border-amber-400/30 bg-amber-400/5">
        <p className="text-sm text-amber-400 flex items-start gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>
            নোট: ব্রাউজার থেকে সরাসরি ডিস্কের সোর্স কোড বদলানো সম্ভব নয় (নিরাপত্তার কারণে)।
            তাই কোড ফাইলগুলো "স্টেজ" আকারে সংরক্ষিত হয় ও ডেটা স্কিমা সাথে সাথে প্রয়োগ হয়।
            সম্পূর্ণ কোড আপডেট পেতে স্টেজড ফাইলগুলো ডাউনলোড করে প্রজেক্টে বসান, অথবা নতুন ZIP রিলিজ ব্যবহার করুন।
          </span>
        </p>
      </div>

      <ConfirmDialog
        open={confirmRestore}
        onClose={() => setConfirmRestore(false)}
        onConfirm={doRestore}
        danger
        title="ব্যাকআপ থেকে ফিরিয়ে আনুন"
        message="বর্তমান সব ডেটা মুছে ব্যাকআপের ডেটা ফিরিয়ে আনা হবে। নিশ্চিত?"
      />
      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => { clearUpdateLog(); toast.success('লগ মুছে ফেলা হয়েছে'); refresh(); }}
        danger
        title="আপডেট লগ মুছুন"
        message="সব আপডেট লগ মুছে ফেলা হবে। নিশ্চিত?"
      />
    </div>
  );
}
