import { useEffect, useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllSettings, saveSetting } from '../services/settings.js';
import ImageUploader from '../components/ImageUploader.jsx';

const DEFAULT_NAV = [
  { id: 'n1', label: 'হোম', to: '/', end: true },
  { id: 'n2', label: 'ফ্ল্যাশ সেল', to: '/shop?sort=flash', hot: true },
  { id: 'n3', label: 'সব পণ্য', to: '/shop' },
  { id: 'n4', label: 'রাইডিং গিয়ার', to: '/shop?category=riding-gear' },
  { id: 'n5', label: 'অর্ডার ট্র্যাকিং', to: '/track' },
];
const DEFAULT_FOOTER = [
  { title: 'কোম্পানি', links: [{ label: 'আমাদের সম্পর্কে', to: '/content/about' }, { label: 'যোগাযোগ', to: '/contact' }, { label: 'ব্লগ', to: '/blog' }] },
  { title: 'সহায়তা', links: [{ label: 'অর্ডার ট্র্যাকিং', to: '/track' }, { label: 'ডেলিভারি তথ্য', to: '/policy/shipping-policy' }, { label: 'রিটার্ন পলিসি', to: '/policy/return-policy' }, { label: 'প্রশ্নোত্তর', to: '/faq' }] },
  { title: 'ক্যাটাগরি', links: [{ label: 'অ্যাঞ্জেল উইংস', to: '/shop' }, { label: 'LED লাইট', to: '/shop' }, { label: 'রাইডিং গিয়ার', to: '/shop' }, { label: 'মোবাইল হোল্ডার', to: '/shop' }] },
];

export default function SiteSettings() {
  const [identity, setIdentity] = useState(null);
  const [contact, setContact] = useState(null);
  const [nav, setNav] = useState(DEFAULT_NAV);
  const [footer, setFooter] = useState(DEFAULT_FOOTER);
  const [headerSettings, setHeaderSettings] = useState({ sticky: true, showTopBar: true, showSearch: true, showMenu: true, navAlignment: 'right' });
  const [footerSettings, setFooterSettings] = useState({ showSocial: true, showContact: true, backgroundColor: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await getAllSettings();
      setIdentity(s.identity || {});
      setContact(s.contact || {});
      setNav(Array.isArray(s.nav) && s.nav.length ? s.nav : DEFAULT_NAV);
      setFooter(Array.isArray(s.footerLinks) && s.footerLinks.length ? s.footerLinks.map((g) => ({ ...g, links: (g.links || []).map((l) => typeof l === 'string' ? { label: l, to: '/shop' } : l) })) : DEFAULT_FOOTER);
      setHeaderSettings({ sticky: true, showTopBar: true, showSearch: true, showMenu: true, navAlignment: 'right', ...(s.headerSettings || {}) });
      setFooterSettings({ showSocial: true, showContact: true, backgroundColor: '', ...(s.footerSettings || {}) });
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await saveSetting('identity', identity);
      await saveSetting('contact', contact);
      await saveSetting('nav', nav);
      await saveSetting('footerLinks', footer);
      await saveSetting('headerSettings', headerSettings);
      await saveSetting('footerSettings', footerSettings);
      toast.success('সাইট সেটিংস, Header ও Footer Website-এ Sync হয়েছে');
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (!identity || !contact) return <div className="text-ink-muted">লোড হচ্ছে…</div>;
  const field = (obj, setObj, key, label, type = 'text') => <div><label className="label">{label}</label><input className="input" type={type} value={obj[key] || ''} onChange={(e) => setObj({ ...obj, [key]: e.target.value })}/></div>;
  const moveItem = (arr, setter, i, dir) => { const j = i + dir; if (j < 0 || j >= arr.length) return; const next = [...arr]; [next[i], next[j]] = [next[j], next[i]]; setter(next); };

  return <div className="space-y-6 max-w-4xl">
    <div className="flex items-center justify-between gap-3"><h1 className="text-2xl font-semibold">সাইট সেটিংস</h1><button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'সেভ হচ্ছে…' : 'সেভ ও Website Sync'}</button></div>
    <div className="card space-y-4"><h2 className="font-semibold">পরিচিতি</h2><div className="grid grid-cols-2 gap-3">{field(identity, setIdentity, 'siteName', 'সাইটের নাম (বাংলা)')}{field(identity, setIdentity, 'siteNameEn', 'সাইটের নাম (English)')}</div>{field(identity, setIdentity, 'tagline', 'ট্যাগলাইন')}{field(identity, setIdentity, 'copyright', 'ফুটার কপিরাইট')}<div><label className="label">লোগো</label><ImageUploader images={identity.logo ? [identity.logo] : []} onChange={(imgs) => setIdentity({ ...identity, logo: imgs[0] || '' })}/></div><div><label className="label">ফেভিকন</label><ImageUploader images={identity.favicon ? [identity.favicon] : []} onChange={(imgs) => setIdentity({ ...identity, favicon: imgs[0] || '' })}/></div></div>
    <div className="card space-y-4"><h2 className="font-semibold">যোগাযোগ</h2><div className="grid grid-cols-2 gap-3">{field(contact, setContact, 'phone', 'ফোন')}{field(contact, setContact, 'whatsapp', 'WhatsApp নম্বর')}{field(contact, setContact, 'email', 'ইমেইল', 'email')}{field(contact, setContact, 'hours', 'খোলার সময়')}</div>{field(contact, setContact, 'address', 'ঠিকানা')}<div className="grid grid-cols-2 gap-3">{field(contact, setContact, 'facebook', 'Facebook লিংক')}{field(contact, setContact, 'instagram', 'Instagram লিংক')}{field(contact, setContact, 'youtube', 'YouTube লিংক')}{field(contact, setContact, 'tiktok', 'TikTok লিংক')}</div></div>

    <div className="card space-y-4"><div className="flex items-center justify-between"><h2 className="font-semibold">Header / Navigation Builder</h2><button className="btn-ghost" onClick={() => setNav((n) => [...n, { id: `nav-${Date.now()}`, label: '', to: '' }])}><Plus size={15}/> মেনু যোগ</button></div><p className="text-xs text-ink-muted">মেনুর নাম, লিংক, ক্রম ও Hot badge নিয়ন্ত্রণ করুন।</p>{nav.map((item, i) => <div key={item.id || i} className="border border-line rounded-field p-3 space-y-3"><div className="flex gap-1 justify-end"><button className="p-1.5 rounded hover:bg-surface2" onClick={() => moveItem(nav, setNav, i, -1)}><ArrowUp size={14}/></button><button className="p-1.5 rounded hover:bg-surface2" onClick={() => moveItem(nav, setNav, i, 1)}><ArrowDown size={14}/></button><button className="p-1.5 rounded text-red-400 hover:bg-red-500/10" onClick={() => setNav(nav.filter((_, x) => x !== i))}><Trash2 size={14}/></button></div><div className="grid sm:grid-cols-2 gap-3"><input className="input" placeholder="মেনু টেক্সট" value={item.label || ''} onChange={(e) => setNav(nav.map((n, x) => x === i ? { ...n, label: e.target.value } : n))}/><input className="input" placeholder="Link: /shop or https://..." value={item.to || ''} onChange={(e) => setNav(nav.map((n, x) => x === i ? { ...n, to: e.target.value } : n))}/></div><div className="flex flex-wrap gap-4"><label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={item.enabled !== false} onChange={(e) => setNav(nav.map((n, x) => x === i ? { ...n, enabled: e.target.checked } : n))}/> Show menu item</label><label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={!!item.hot} onChange={(e) => setNav(nav.map((n, x) => x === i ? { ...n, hot: e.target.checked } : n))}/> Hot badge</label></div></div>)}</div>

    <div className="card space-y-3"><h2 className="font-semibold">Header Display Options</h2><div className="flex flex-wrap gap-4"><label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={headerSettings.sticky !== false} onChange={(e) => setHeaderSettings({ ...headerSettings, sticky: e.target.checked })}/> Sticky header</label><label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={headerSettings.showTopBar !== false} onChange={(e) => setHeaderSettings({ ...headerSettings, showTopBar: e.target.checked })}/> Top bar show</label><label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={headerSettings.showSearch !== false} onChange={(e) => setHeaderSettings({ ...headerSettings, showSearch: e.target.checked })}/> Search show</label><label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={headerSettings.showMenu !== false} onChange={(e) => setHeaderSettings({ ...headerSettings, showMenu: e.target.checked })}/> Navigation show</label></div><div><label className="label">Navigation alignment</label><select className="input" value={headerSettings.navAlignment || 'right'} onChange={(e) => setHeaderSettings({ ...headerSettings, navAlignment: e.target.value })}><option value="right">Right</option><option value="center">Center</option></select></div></div>

    <div className="card space-y-3"><h2 className="font-semibold">Footer Display Options</h2><div className="flex flex-wrap gap-4"><label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={footerSettings.showSocial !== false} onChange={(e) => setFooterSettings({ ...footerSettings, showSocial: e.target.checked })}/> Social icons</label><label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={footerSettings.showContact !== false} onChange={(e) => setFooterSettings({ ...footerSettings, showContact: e.target.checked })}/> Contact block</label></div><label className="label">Footer background color<input className="input mt-1" type="color" value={footerSettings.backgroundColor || '#141418'} onChange={(e) => setFooterSettings({ ...footerSettings, backgroundColor: e.target.value })}/></label></div>

    <div className="card space-y-4"><div className="flex items-center justify-between"><h2 className="font-semibold">Footer Builder</h2><button className="btn-ghost" onClick={() => setFooter((f) => [...f, { title: 'নতুন গ্রুপ', links: [] }])}><Plus size={15}/> গ্রুপ যোগ</button></div>{footer.map((group, i) => <div key={i} className="border border-line rounded-field p-3 space-y-3"><div className="flex gap-2"><input className="input" placeholder="Footer group title" value={group.title || ''} onChange={(e) => setFooter(footer.map((g, x) => x === i ? { ...g, title: e.target.value } : g))}/><button className="p-2 text-red-400" onClick={() => setFooter(footer.filter((_, x) => x !== i))}><Trash2 size={15}/></button></div>{(group.links || []).map((link, li) => <div key={li} className="grid sm:grid-cols-2 gap-2 items-center"><input className="input" placeholder="লিংকের নাম" value={link.label || ''} onChange={(e) => setFooter(footer.map((g, x) => x === i ? { ...g, links: g.links.map((l, j) => j === li ? { ...l, label: e.target.value } : l) } : g))}/><div className="flex gap-2"><input className="input" placeholder="URL / Path" value={link.to || ''} onChange={(e) => setFooter(footer.map((g, x) => x === i ? { ...g, links: g.links.map((l, j) => j === li ? { ...l, to: e.target.value } : l) } : g))}/><button className="p-2 text-red-400" onClick={() => setFooter(footer.map((g, x) => x === i ? { ...g, links: g.links.filter((_, j) => j !== li) } : g))}><Trash2 size={14}/></button></div></div>)}<button className="btn-ghost text-sm" onClick={() => setFooter(footer.map((g, x) => x === i ? { ...g, links: [...(g.links || []), { label: '', to: '' }] } : g))}><Plus size={14}/> লিংক যোগ</button></div>)}</div>
  </div>;
}
