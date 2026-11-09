import { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { localdb } from '../lib/localdb.js';
import { isSupabaseConfigured } from '../lib/supabase.js';

export default function Backup() {
  const fileRef = useRef(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportJson = () => {
    try {
      const data = localdb.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `impotech-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('ব্যাকআপ ডাউনলোড হয়েছে');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const importJson = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      localdb.importAll(data);
      toast.success('ডেটা ইমপোর্ট হয়েছে — পেজ রিলোড হচ্ছে');
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      toast.error('ইমপোর্ট ব্যর্থ: ' + e.message);
    }
  };

  const reset = () => {
    localdb.resetAll();
    toast.success('সব ডেটা রিসেট হয়েছে — ডিফল্ট ফিরে এসেছে');
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold">ব্যাকআপ ও রিস্টোর</h1>

      {!isSupabaseConfigured && (
        <div className="card border-accent/40 bg-accent/5">
          <p className="text-sm text-accent flex items-center gap-2">
            <Database size={16} /> ডেমো মোড — সব ডেটা এই ব্রাউজারের localStorage-এ আছে।
            অন্য ডিভাইসে নিতে চাইলে JSON এক্সপোর্ট করে সেখানে ইমপোর্ট করুন।
          </p>
        </div>
      )}

      <div className="card space-y-4">
        <h2 className="font-semibold">এক্সপোর্ট</h2>
        <p className="text-sm text-ink-muted">
          পুরো সাইটের ডেটা (প্রোডাক্ট, ক্যাটাগরি, অর্ডার, কুপন, রিভিউ, কাস্টমার, সেটিংস) একটি JSON ফাইলে সেভ করুন।
        </p>
        <button className="btn-primary" onClick={exportJson}>
          <Download size={16} /> JSON ডাউনলোড
        </button>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold">ইমপোর্ট</h2>
        <p className="text-sm text-ink-muted">
          আগের ব্যাকআপ JSON ফাইল থেকে ডেটা ফিরিয়ে আনুন। বর্তমান ডেটা প্রতিস্থাপিত হবে।
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => e.target.files[0] && importJson(e.target.files[0])}
        />
        <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
          <Upload size={16} /> JSON ফাইল বাছুন
        </button>
      </div>

      <div className="card space-y-4 border-red-500/30">
        <h2 className="font-semibold text-red-400">সব রিসেট</h2>
        <p className="text-sm text-ink-muted">
          সব পরিবর্তন মুছে ডিফল্ট ডেটায় ফিরে যান। এটি ফেরানো যাবে না।
        </p>
        <button className="btn-danger" onClick={() => setConfirmReset(true)}>
          <RotateCcw size={16} /> ডিফল্টে ফিরিয়ে নিন
        </button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={reset}
        danger
        title="সব ডেটা রিসেট"
        message="সব প্রোডাক্ট, অর্ডার, সেটিংস মুছে ডিফল্টে ফিরে যাবে। নিশ্চিত?"
      />
    </div>
  );
}
