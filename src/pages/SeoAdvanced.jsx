import { useEffect, useMemo, useState } from 'react';
import { Save, Download, Globe, FileCode2, Bot, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { localdb } from '../lib/localdb.js';
import { getSetting, saveSetting } from '../services/settings.js';
import { listProducts } from '../services/products.js';
import { listCategories } from '../services/categories.js';
import { listLandingPages } from '../services/landingPages.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * SEO অ্যাডভান্সড — সাইটম্যাপ, robots.txt, স্ট্রাকচার্ড ডেটা ও অ্যানালিটিক্স কনফিগ।
 * সব মান localStorage-এ সেভ হয়; সাইট বিল্ডের সময় এগুলো ব্যবহার করা যায়।
 */
export default function SeoAdvanced() {
  const [cfg, setCfg] = useState({
    siteUrl: 'https://impotech.sellsull.com',
    siteName: 'ইম্পোটেক',
    defaultTitle: 'ইম্পোটেক — প্রিমিয়াম বাইক অ্যাকসেসরিজ',
    defaultDescription: 'চায়না থেকে সরাসরি আমদানি করা প্রিমিয়াম বাইক অ্যাক্সেসরিজ, LED লাইট ও রাইডিং গিয়ার।',
    defaultImage: '',
    robotsIndex: true,
    robotsFollow: true,
    sitemapIncludeProducts: true,
    sitemapIncludeCategories: true,
    sitemapIncludePages: true,
    sitemapIncludeLanding: true,
    structuredData: true,
    canonicalBase: '',
    twitterHandle: '',
    facebookAppId: '',
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState([]);
  const [landing, setLanding] = useState([]);
  const [customPages, setCustomPages] = useState([]);
  const [contentPages, setContentPages] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const remoteCfg = await getSetting('seo_advanced');
        setCfg((c) => ({ ...c, ...(remoteCfg || localdb.getSetting('seo_advanced') || {}) }));
        const [p, c, l, custom, content] = await Promise.all([listProducts(), listCategories(), listLandingPages(), getSetting('pages'), getSetting('content')]);
        setProducts(p || []);
        setCategories(c || []);
        if (isSupabaseConfigured) { const { data: policyData, error: policyError } = await supabase.from('policies').select('slug,active'); if (policyError) throw policyError; setPages(policyData || []); } else setPages(localdb.all('policies'));
        setContentPages(content || {});
        setLanding(l || []);
        setCustomPages(Array.isArray(custom) ? custom : []);
      } catch (e) {
        toast.error(e.message);
      }
    })();
  }, []);

  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

  const save = async () => {
    try {
      await saveSetting('seo_advanced', cfg);
      localdb.saveSetting('seo_advanced', cfg);
      toast.success('SEO Advanced settings Website-এ Sync হয়েছে');
    } catch (e) {
      toast.error(e.message);
    }
  };

  /* ---------- সাইটম্যাপ জেনারেট ---------- */
  const sitemap = useMemo(() => {
    const base = String(cfg.siteUrl || '').replace(/\/$/, '');
    const today = new Date().toISOString().slice(0, 10);
    const urls = [{ loc: `${base}/`, priority: '1.0', changefreq: 'daily' }];

    if (cfg.sitemapIncludeProducts) {
      products.filter((p) => p.active !== false).forEach((p) => {
        urls.push({ loc: `${base}/product/${p.slug || p.id}`, priority: '0.8', changefreq: 'weekly' });
      });
    }
    if (cfg.sitemapIncludeCategories) {
      categories.filter((c) => c.active !== false).forEach((c) => {
        urls.push({ loc: `${base}/shop?category=${c.slug || c.id}`, priority: '0.7', changefreq: 'weekly' });
      });
    }
    if (cfg.sitemapIncludePages) {
      pages.filter((p) => p.active !== false).forEach((p) => {
        urls.push({ loc: `${base}/policy/${p.slug}`, priority: '0.5', changefreq: 'monthly' });
      });
      customPages.filter((p) => p.status === 'published').forEach((p) => {
        urls.push({ loc: `${base}/page/${p.slug}`, priority: '0.6', changefreq: 'monthly' });
      });
      Object.entries(contentPages || {}).forEach(([slug, page]) => {
        if (page?.title) urls.push({ loc: `${base}/content/${slug}`, priority: '0.5', changefreq: 'monthly' });
      });
    }
    if (cfg.sitemapIncludeLanding) {
      landing.filter((p) => p.published).forEach((p) => {
        urls.push({ loc: `${base}/lp/${p.slug}`, priority: '0.9', changefreq: 'weekly' });
      });
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  }, [cfg, products, categories, pages, landing, customPages, contentPages]);

  const robots = useMemo(() => {
    const base = String(cfg.siteUrl || '').replace(/\/$/, '');
    return `User-agent: *
${cfg.robotsIndex ? 'Allow: /' : 'Disallow: /'}
Disallow: /admin
Disallow: /checkout
Disallow: /cart
Disallow: /api

Sitemap: ${base}/sitemap.xml`;
  }, [cfg]);

  const structured = useMemo(() => {
    const base = String(cfg.siteUrl || '').replace(/\/$/, '');
    return JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'OnlineStore',
        name: cfg.siteName,
        url: base,
        description: cfg.defaultDescription,
        ...(cfg.defaultImage ? { logo: cfg.defaultImage, image: cfg.defaultImage } : {}),
        potentialAction: {
          '@type': 'SearchAction',
          target: `${base}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      null,
      2
    );
  }, [cfg]);

  const download = (name, content, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${name} ডাউনলোড হয়েছে`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">SEO অ্যাডভান্সড</h1>
          <p className="text-sm text-ink-muted mt-1">সাইটম্যাপ, robots.txt, স্ট্রাকচার্ড ডেটা ও ডিফল্ট মেটা ট্যাগ।</p>
        </div>
        <button className="btn-primary" onClick={save}>
          <Save size={16} /> সেভ করুন
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* বেসিক */}
        <div className="card space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Globe size={17} className="text-accent" /> সাইট তথ্য</h2>
          <div>
            <label className="label">সাইট URL</label>
            <input className="input" value={cfg.siteUrl} onChange={(e) => set('siteUrl', e.target.value)} placeholder="https://impotech.shop" />
            <p className="text-xs text-ink-muted mt-1">সাইটম্যাপ ও canonical URL-এ ব্যবহৃত হবে।</p>
          </div>
          <div>
            <label className="label">সাইটের নাম</label>
            <input className="input" value={cfg.siteName} onChange={(e) => set('siteName', e.target.value)} />
          </div>
          <div>
            <label className="label">ডিফল্ট টাইটেল</label>
            <input className="input" value={cfg.defaultTitle} onChange={(e) => set('defaultTitle', e.target.value)} />
          </div>
          <div>
            <label className="label">ডিফল্ট ডেসক্রিপশন</label>
            <textarea className="input min-h-[80px]" value={cfg.defaultDescription} onChange={(e) => set('defaultDescription', e.target.value)} />
          </div>
          <div>
            <label className="label">ডিফল্ট OG ইমেজ URL</label>
            <input className="input" value={cfg.defaultImage} onChange={(e) => set('defaultImage', e.target.value)} placeholder="https://…/og.jpg" />
          </div>
        </div>

        {/* ইনডেক্সিং */}
        <div className="card space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Bot size={17} className="text-accent" /> ইনডেক্সিং</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={cfg.robotsIndex} onChange={(e) => set('robotsIndex', e.target.checked)} />
            সার্চ ইঞ্জিনে ইনডেক্স করতে দিন
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={cfg.robotsFollow} onChange={(e) => set('robotsFollow', e.target.checked)} />
            লিংক ফলো করতে দিন
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={cfg.structuredData} onChange={(e) => set('structuredData', e.target.checked)} />
            স্ট্রাকচার্ড ডেটা (Schema.org) যোগ করুন
          </label>

          <div className="border-t border-line pt-4 space-y-2">
            <p className="text-sm font-medium">সাইটম্যাপে যা থাকবে</p>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={cfg.sitemapIncludeProducts} onChange={(e) => set('sitemapIncludeProducts', e.target.checked)} />
              পণ্য ({products.length})
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={cfg.sitemapIncludeCategories} onChange={(e) => set('sitemapIncludeCategories', e.target.checked)} />
              ক্যাটাগরি ({categories.length})
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={cfg.sitemapIncludePages} onChange={(e) => set('sitemapIncludePages', e.target.checked)} />
              পলিসি পেজ ({pages.length})
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={cfg.sitemapIncludeLanding} onChange={(e) => set('sitemapIncludeLanding', e.target.checked)} />
              ল্যান্ডিং পেজ ({landing.length})
            </label>
          </div>

          <div className="border-t border-line pt-4 space-y-3">
            <div>
              <label className="label">Twitter/X হ্যান্ডেল</label>
              <input className="input" value={cfg.twitterHandle} onChange={(e) => set('twitterHandle', e.target.value)} placeholder="@impotech" />
            </div>
            <div>
              <label className="label">Facebook App ID</label>
              <input className="input" value={cfg.facebookAppId} onChange={(e) => set('facebookAppId', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* আউটপুট */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2"><FileCode2 size={17} className="text-accent" /> sitemap.xml</h2>
            <button className="btn-ghost text-xs px-3 py-1.5" onClick={() => download('sitemap.xml', sitemap, 'application/xml')}>
              <Download size={14} /> ডাউনলোড
            </button>
          </div>
          <pre className="bg-surface2 rounded-field p-3 text-[11px] leading-relaxed overflow-auto max-h-[280px] text-ink-muted whitespace-pre">
{sitemap}
          </pre>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2"><Bot size={17} className="text-accent" /> robots.txt</h2>
            <button className="btn-ghost text-xs px-3 py-1.5" onClick={() => download('robots.txt', robots)}>
              <Download size={14} /> ডাউনলোড
            </button>
          </div>
          <pre className="bg-surface2 rounded-field p-3 text-[11px] leading-relaxed overflow-auto max-h-[280px] text-ink-muted whitespace-pre">
{robots}
          </pre>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2"><BarChart3 size={17} className="text-accent" /> স্ট্রাকচার্ড ডেটা (JSON-LD)</h2>
          <button className="btn-ghost text-xs px-3 py-1.5" onClick={() => download('structured-data.json', structured, 'application/json')}>
            <Download size={14} /> ডাউনলোড
          </button>
        </div>
        <pre className="bg-surface2 rounded-field p-3 text-[11px] leading-relaxed overflow-auto max-h-[240px] text-ink-muted whitespace-pre">
{structured}
        </pre>
        <p className="text-xs text-ink-muted mt-2">
          এই কোডটি সাইটের <code className="px-1 rounded bg-surface2">&lt;head&gt;</code>-এ{' '}
          <code className="px-1 rounded bg-surface2">&lt;script type="application/ld+json"&gt;</code> হিসেবে বসান।
        </p>
      </div>
    </div>
  );
}
