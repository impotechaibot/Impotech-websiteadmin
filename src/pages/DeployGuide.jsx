import { useState } from 'react';
import { Copy, CheckCircle2, AlertTriangle, Terminal, Github, Rocket, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = [
  {
    n: 1,
    title: 'GitHub-এ রিপো তৈরি করুন',
    body: 'github.com-এ লগইন করে New repository → নাম দিন (যেমন impotech-admin) → Private/Public বেছে নিন → Create। README/ gitignore যোগ করবেন না (আমরা নিজেরাই দেব)।',
    code: null,
  },
  {
    n: 2,
    title: 'ZIP আনজিপ করে ফাইল আপলোড করুন',
    body: 'ZIP-টা আনজিপ করুন। রিপো পেজে "uploading an existing file" লিংকে ক্লিক করে ভেতরের সব ফাইল (node_modules বাদে) ড্র্যাগ করে দিন → Commit changes।',
    code: null,
  },
  {
    n: 3,
    title: 'Vercel-এ প্রজেক্ট ইমপোর্ট করুন',
    body: 'vercel.com → Add New → Project → GitHub রিপো সিলেক্ট করুন। Framework: Vite, Build Command: npm run build, Output Directory: dist — এগুলো vercel.json থেকে অটো আসবে।',
    code: null,
  },
  {
    n: 4,
    title: 'Environment Variables বসান',
    body: 'Vercel → Settings → Environment Variables-এ .env.example-এর কী-গুলো যোগ করুন। Supabase না থাকলে খালি রাখলেও চলবে (ডেমো মোড)।',
    code: 'VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGci...\nVITE_SITE_URL=https://your-domain.vercel.app',
  },
  {
    n: 5,
    title: 'Deploy চাপুন',
    body: 'Deploy বাটনে ক্লিক করুন। ১–২ মিনিটে বিল্ড হবে। সফল হলে একটি URL পাবেন — সেটাই আপনার লাইভ অ্যাডমিন।',
    code: null,
  },
  {
    n: 6,
    title: 'অটো-ডিপ্লয় চালু করুন',
    body: 'এরপর থেকে GitHub-এ যেকোনো commit/push করলেই Vercel নিজে থেকে নতুন ভার্সন ডিপ্লয় করবে। .github/workflows/deploy.yml ফাইলটা এটাই নিশ্চিত করে।',
    code: null,
  },
];

const ERRORS = [
  {
    err: '❌ নেটওয়ার্ক এরর: Failed to fetch',
    why: 'অ্যাডমিন অ্যাপ GitHub API থেকে ফাইল পড়তে গিয়ে ব্যর্থ হয়েছে। কারণ তিনটি হতে পারে: (১) রিপো পাবলিক নয় বা টোকেন নেই, (২) রিপোতে ফাইলই নেই (খালি রিপো), (৩) ব্রাউজার থেকে GitHub API-তে CORS/নেটওয়ার্ক ব্লক।',
    fix: 'রিপো পাবলিক করুন অথবা Personal Access Token দিন। রিপোতে অন্তত index.html, vercel.json, package.json থাকতে হবে। অথবা এই পেজের ধাপ ২ অনুযায়ী ZIP-এর ফাইলগুলো আপলোড করুন।',
  },
  {
    err: '⚠️ মোট ০ টি ফাইল সফল, ৪ টি ফাইল এরর মুক্ত হয়নি',
    why: 'উপরের Failed to fetch-এর ফলাফল — কোনো ফাইলই পড়া যায়নি, তাই কিছুই আপডেট হয়নি।',
    fix: 'আগের এররটা ঠিক করলেই এটা নিজে থেকে সমাধান হবে।',
  },
  {
    err: 'root/index.html, root/vercel.json, root/package.json, root/data.json',
    why: 'অ্যাপ এই ৪টি ফাইল খুঁজছিল। এগুলো রিপোর রুটে (সাব-ফোল্ডারে নয়) থাকতে হবে।',
    fix: 'ফাইলগুলো রিপোর একেবারে রুটে রাখুন — src/ ফোল্ডারের ভেতরে নয়। ZIP আনজিপ করলে ঠিক এই লেআউটই পাবেন।',
  },
  {
    err: 'Vercel-এ 404 এরর',
    why: 'SPA (Single Page App) রাউটিংয়ের জন্য rewrite নিয়ম নেই — সরাসরি /products লিখলে Vercel ফাইল খুঁজে পায় না।',
    fix: 'vercel.json-এ rewrites নিয়ম আছে কিনা দেখুন (এই প্রজেক্টে দেওয়া আছে)। না থাকলে যোগ করুন: {"source":"/(.*)","destination":"/index.html"}',
  },
  {
    err: 'বিল্ড ফেইল: Command "npm run build" exited with 1',
    why: 'সাধারণত node_modules কমিট হয়ে গেছে, অথবা package-lock.json মিসিং, অথবা Node ভার্সন পুরনো।',
    fix: '.gitignore-এ node_modules আছে কিনা দেখুন। Vercel → Settings → Node.js Version = 20.x করুন। তারপর Redeploy।',
  },
];

export default function DeployGuide() {
  const [copied, setCopied] = useState(null);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      toast.success('কপি হয়েছে');
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">GitHub → Vercel ডিপ্লয় গাইড</h1>
        <p className="text-sm text-ink-muted mt-1">
          স্ক্রিনশটের এররগুলোর কারণ, সমাধান ও ধাপে ধাপে ডিপ্লয় নির্দেশনা।
        </p>
      </div>

      {/* এরর ডায়াগনোসিস */}
      <div className="card space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <AlertTriangle size={18} className="text-accent" /> এরর ডায়াগনোসিস
        </h2>
        <p className="text-sm text-ink-muted">
          আপনার স্ক্রিনশটে <strong className="text-ink">৪টি ফাইলের জন্য "Failed to fetch"</strong> এবং{' '}
          <strong className="text-ink">"মোট ০ টি ফাইল সফল"</strong> দেখাচ্ছিল। নিচে প্রতিটির কারণ ও সমাধান:
        </p>

        <div className="space-y-3">
          {ERRORS.map((e, i) => (
            <div key={i} className="rounded-field border border-line bg-surface2/50 p-4 space-y-2">
              <p className="font-mono text-sm text-red-400">{e.err}</p>
              <p className="text-sm text-ink-muted">
                <strong className="text-ink">কারণ:</strong> {e.why}
              </p>
              <p className="text-sm text-emerald-300">
                <strong>সমাধান:</strong> {e.fix}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-field border border-accent/30 bg-accent/5 p-4 text-sm">
          <strong className="text-accent">মূল কথা:</strong> অ্যাডমিন অ্যাপের ভেতরের "Sync" বাটনটা
          ব্রাউজার থেকে সরাসরি GitHub-এ ফাইল লিখতে চায় — এটা ব্রাউজার নিরাপত্তার কারণে সবসময় কাজ করবে না।
          <strong className="text-ink"> নির্ভরযোগ্য পথ হলো ZIP ডাউনলোড → GitHub-এ আপলোড → Vercel অটো-ডিপ্লয়।</strong>{' '}
          নিচের ধাপগুলো ঠিক সেটাই।
        </div>
      </div>

      {/* ধাপ */}
      <div className="card space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Rocket size={18} className="text-accent" /> ধাপে ধাপে ডিপ্লয়
        </h2>

        <div className="space-y-4">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-accent text-black grid place-items-center font-bold text-sm shrink-0">
                {s.n}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{s.title}</h3>
                <p className="text-sm text-ink-muted mt-1 leading-relaxed">{s.body}</p>
                {s.code && (
                  <div className="relative mt-2">
                    <pre className="bg-surface2 rounded-field p-3 text-xs overflow-x-auto text-ink-muted whitespace-pre">
{s.code}
                    </pre>
                    <button
                      className="absolute top-2 right-2 p-1.5 rounded bg-surface hover:bg-line text-ink-muted"
                      onClick={() => copy(s.code, s.n)}
                    >
                      {copied === s.n ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ফাইল চেকলিস্ট */}
      <div className="card space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Github size={18} className="text-accent" /> রিপোতে যা যা থাকতে হবে
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          {[
            'index.html (রুটে)',
            'vercel.json (রুটে)',
            'package.json (রুটে)',
            'vite.config.js',
            'tailwind.config.js',
            'postcss.config.js',
            '.gitignore',
            '.env.example',
            'src/ (সব ফাইল)',
            'supabase/migrations/',
            '.github/workflows/deploy.yml',
            'README.md',
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-ink-muted">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <code className="text-xs">{f}</code>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-muted border-t border-line pt-3">
          ⚠️ <code className="px-1 rounded bg-surface2">node_modules</code> ও{' '}
          <code className="px-1 rounded bg-surface2">dist</code> কখনো কমিট করবেন না — .gitignore এগুলো বাদ দেয়।
        </p>
      </div>

      {/* কমান্ড */}
      <div className="card space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Terminal size={18} className="text-accent" /> কমান্ড লাইন দিয়ে (বিকল্প)
        </h2>
        <div className="relative">
          <pre className="bg-surface2 rounded-field p-4 text-xs overflow-x-auto text-ink-muted whitespace-pre">
{`# ১. প্রজেক্ট ফোল্ডারে যান
cd impotech-admin-app

# ২. Git শুরু করুন
git init
git add .
git commit -m "Impotech Admin — full features"

# ৩. GitHub রিপোতে যুক্ত করুন
git branch -M main
git remote add origin https://github.com/USERNAME/impotech-admin.git
git push -u origin main`}
          </pre>
          <button
            className="absolute top-2 right-2 p-1.5 rounded bg-surface hover:bg-line text-ink-muted"
            onClick={() =>
              copy(
                `cd impotech-admin-app\ngit init\ngit add .\ngit commit -m "Impotech Admin — full features"\ngit branch -M main\ngit remote add origin https://github.com/USERNAME/impotech-admin.git\ngit push -u origin main`,
                'cmd'
              )
            }
          >
            {copied === 'cmd' ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
        <p className="text-xs text-ink-muted">
          push করার পর Vercel-এ ইমপোর্ট করলেই অটো-ডিপ্লয় চালু হয়ে যাবে।
        </p>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-2">দরকারি লিংক</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          {[
            { label: 'GitHub', url: 'https://github.com/new' },
            { label: 'Vercel', url: 'https://vercel.com/new' },
            { label: 'Supabase', url: 'https://supabase.com/dashboard' },
            { label: 'Vercel Docs', url: 'https://vercel.com/docs' },
          ].map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost text-sm"
            >
              {l.label} <ExternalLink size={13} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
