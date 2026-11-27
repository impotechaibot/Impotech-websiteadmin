import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSetting, saveSetting } from '../services/settings.js';

const DEFAULT_CHECKOUT = {
  deliveryCharge: 80,
  outsideDeliveryCharge: 130,
  freeDeliveryAbove: 2000,
  codEnabled: true,
  bkashEnabled: true,
  bkashNumber: '01884332067',
  nagadEnabled: true,
  nagadNumber: '01884332067',
  rocketEnabled: false,
  rocketNumber: '',
  paymentNote: 'বিকাশ/নগদে টাকা পাঠিয়ে ট্রানজেকশন আইডি অর্ডার নোটে লিখুন।',
  confirmMessage: 'ধন্যবাদ! আপনার অর্ডারটি আমরা পেয়েছি। শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।',
};

export default function CheckoutSettings() {
  const [cfg, setCfg] = useState(DEFAULT_CHECKOUT);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => { (async () => { const v = await getSetting('checkout'); setCfg({ ...DEFAULT_CHECKOUT, ...(v || {}) }); setReady(true); })(); }, []);
  const update = (key, value) => setCfg((old) => ({ ...old, [key]: value }));
  const save = async () => { setSaving(true); try { await saveSetting('checkout', cfg); toast.success('ডেলিভারি ও Checkout সেটিংস Website-এ Sync হয়েছে'); } catch (e) { toast.error(e.message); } finally { setSaving(false); } };
  if (!ready) return <div className="text-ink-muted">লোড হচ্ছে…</div>;
  const numberField = (key, label) => <div><label className="label">{label}</label><input className="input" type="number" min="0" value={Number(cfg[key] || 0)} onChange={(e) => update(key, Number(e.target.value))}/></div>;
  const toggle = (key, label) => <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!cfg[key]} onChange={(e) => update(key, e.target.checked)}/>{label}</label>;
  const payment = (key, numKey, label) => <div className="border border-line rounded-field p-4 space-y-3"><div className="flex items-center justify-between"><strong>{label}</strong>{toggle(key, 'চালু')}</div><label className="label">পেমেন্ট নম্বর<input className="input mt-1" value={cfg[numKey] || ''} onChange={(e) => update(numKey, e.target.value)} placeholder="01XXXXXXXXX"/></label></div>;
  return <div className="space-y-6 max-w-3xl"><div className="flex items-center justify-between gap-3"><h1 className="text-2xl font-semibold">ডেলিভারি ও Checkout সেটিংস</h1><button className="btn-primary" disabled={saving} onClick={save}>{saving ? 'সেভ হচ্ছে…' : 'সেভ ও Sync'}</button></div>
    <div className="card space-y-4"><h2 className="font-semibold">ডেলিভারি চার্জ</h2><div className="grid sm:grid-cols-2 gap-3">{numberField('deliveryCharge', 'ঢাকা ডেলিভারি চার্জ (৳)')}{numberField('outsideDeliveryCharge', 'ঢাকার বাইরে চার্জ (৳)')}{numberField('freeDeliveryAbove', 'ফ্রি ডেলিভারি শুরু (৳)')}</div><p className="text-xs text-ink-muted">ফ্রি ডেলিভারি থ্রেশহোল্ড ০ করলে ফ্রি ডেলিভারি অফ হবে।</p></div>
    <div className="card space-y-4"><h2 className="font-semibold">পেমেন্ট অপশন</h2>{toggle('codEnabled', 'Cash on Delivery চালু')}{payment('bkashEnabled', 'bkashNumber', 'bKash')}{payment('nagadEnabled', 'nagadNumber', 'Nagad')}{payment('rocketEnabled', 'rocketNumber', 'Rocket')}</div>
    <div className="card space-y-4"><h2 className="font-semibold">Checkout নির্দেশনা</h2><div><label className="label">Payment Note</label><textarea className="input" rows={4} value={cfg.paymentNote || ''} onChange={(e) => update('paymentNote', e.target.value)}/></div><div><label className="label">Order Confirmation Message</label><textarea className="input" rows={3} value={cfg.confirmMessage || ''} onChange={(e) => update('confirmMessage', e.target.value)}/></div></div>
  </div>;
}
