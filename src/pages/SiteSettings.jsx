import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllSettings, saveSetting } from '../services/settings.js';
import ImageUploader from '../components/ImageUploader.jsx';

export default function SiteSettings() {
  const [identity, setIdentity] = useState(null);
  const [contact, setContact] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await getAllSettings();
      setIdentity(s.identity || {});
      setContact(s.contact || {});
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await saveSetting('identity', identity);
      await saveSetting('contact', contact);
      toast.success('সেটিংস সেভ হয়েছে');
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (!identity || !contact) return <div className="text-ink-muted">লোড হচ্ছে…</div>;

  const field = (obj, setObj, key, label, type = 'text') => (
    <div>
      <label className="label">{label}</label>
      <input className="input" type={type} value={obj[key] || ''}
        onChange={(e) => setObj({ ...obj, [key]: e.target.value })} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">সাইট সেটিংস</h1>
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? 'সেভ হচ্ছে…' : 'সেভ করুন'}
        </button>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold">পরিচিতি</h2>
        <div className="grid grid-cols-2 gap-3">
          {field(identity, setIdentity, 'siteName', 'সাইটের নাম (বাংলা)')}
          {field(identity, setIdentity, 'siteNameEn', 'সাইটের নাম (English)')}
        </div>
        {field(identity, setIdentity, 'tagline', 'ট্যাগলাইন')}
        {field(identity, setIdentity, 'copyright', 'ফুটার কপিরাইট')}
        <div>
          <label className="label">লোগো</label>
          <ImageUploader images={identity.logo ? [identity.logo] : []}
            onChange={(imgs) => setIdentity({ ...identity, logo: imgs[0] || '' })} />
        </div>
        <div>
          <label className="label">ফেভিকন</label>
          <ImageUploader images={identity.favicon ? [identity.favicon] : []}
            onChange={(imgs) => setIdentity({ ...identity, favicon: imgs[0] || '' })} />
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold">যোগাযোগ</h2>
        <div className="grid grid-cols-2 gap-3">
          {field(contact, setContact, 'phone', 'ফোন')}
          {field(contact, setContact, 'whatsapp', 'WhatsApp নম্বর')}
          {field(contact, setContact, 'email', 'ইমেইল', 'email')}
          {field(contact, setContact, 'hours', 'খোলার সময়')}
        </div>
        {field(contact, setContact, 'address', 'ঠিকানা')}
        <div className="grid grid-cols-2 gap-3">
          {field(contact, setContact, 'facebook', 'Facebook লিংক')}
          {field(contact, setContact, 'instagram', 'Instagram লিংক')}
          {field(contact, setContact, 'youtube', 'YouTube লিংক')}
          {field(contact, setContact, 'tiktok', 'TikTok লিংক')}
        </div>
      </div>
    </div>
  );
}
