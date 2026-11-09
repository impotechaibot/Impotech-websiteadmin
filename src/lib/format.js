export const bdt = (n) =>
  '৳' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });

export const dateBn = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const dateTimeBn = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('bn-BD', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

export const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';

export const ORDER_STATUSES = [
  { id: 'new', label: 'নতুন', tone: 'accent' },
  { id: 'processing', label: 'প্রসেসিং', tone: 'info' },
  { id: 'shipped', label: 'শিপড', tone: 'info' },
  { id: 'delivered', label: 'ডেলিভারড', tone: 'ok' },
  { id: 'cancelled', label: 'বাতিল', tone: 'bad' },
];

export const statusLabel = (id) =>
  ORDER_STATUSES.find((s) => s.id === id)?.label || 'নতুন';
