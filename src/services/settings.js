import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { localdb } from '../lib/localdb.js';

/**
 * Settings bridge for ImpoTech Admin ↔ Storefront.
 *
 * Admin's older pages use individual keys (home, newsletter, seo, etc.) while
 * the storefront's current loader reads canonical rows: `site`, `identity`,
 * `checkout`, `theme`, and `contact`. This service keeps both formats in sync
 * so older Admin pages remain compatible and the storefront receives updates.
 *
 * site_settings schema: key text primary key, value jsonb, updated_at timestamptz.
 */
const SITE_KEY = 'site';
const SECTION_KEYS = new Set(['checkout', 'theme', 'contact']);
const IDENTITY_KEYS = new Set(['identity']);
const SITE_SECTION_KEYS = new Set([
  'home', 'newsletter', 'nav', 'footerLinks', 'content', 'seo', 'ogImage',
  'layout', 'background', 'pageBuilder', 'pages', 'customPages', 'announcement', 'headerSettings', 'footerSettings', 'seo_advanced',
]);
const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);
const merge = (base, patch) => {
  if (!isObject(base) || !isObject(patch)) return patch ?? base;
  const out = { ...base };
  for (const [k, v] of Object.entries(patch)) out[k] = isObject(v) && isObject(base[k]) ? merge(base[k], v) : v;
  return out;
};

async function readRows() {
  if (!isSupabaseConfigured) return localdb.getAllSettings();
  const { data, error } = await supabase.from('site_settings').select('key,value,updated_at');
  if (error) throw error;
  return Object.fromEntries((data || []).map((r) => [r.key, r.value]));
}

export async function getAllSettings() {
  if (!isSupabaseConfigured) return localdb.getAllSettings();
  const rows = await readRows();
  const site = isObject(rows[SITE_KEY]) ? rows[SITE_KEY] : {};
  const result = { ...rows, ...site };
  if (rows.identity) result.identity = rows.identity;
  if (rows.home) result.home = merge(site.home || {}, rows.home);
  else if (site.home) result.home = site.home;
  if (rows.newsletter) result.newsletter = rows.newsletter;
  else if (site.home?.newsletter) result.newsletter = site.home.newsletter;
  for (const key of ['checkout', 'theme', 'contact']) if (rows[key]) result[key] = rows[key];
  return result;
}

export async function getSetting(key) {
  if (!isSupabaseConfigured) return localdb.getSetting(key);
  const rows = await readRows();
  if (rows[key] !== undefined && rows[key] !== null) return rows[key];
  const site = isObject(rows[SITE_KEY]) ? rows[SITE_KEY] : {};
  if (key === 'newsletter') return site.home?.newsletter ?? null;
  return site[key] ?? null;
}

async function upsertRows(rows) {
  if (!rows.length) return;
  const now = new Date().toISOString();
  const payload = rows.map(([key, value]) => ({ key, value, updated_at: now }));
  const { error } = await supabase.from('site_settings').upsert(payload, { onConflict: 'key' });
  if (error) throw error;
}

/** Save legacy key and the storefront canonical `site` blob in one upsert. */
export async function saveSetting(key, value) {
  if (!isSupabaseConfigured) {
    localdb.saveSetting(key, value);
    return;
  }

  // Keep the old per-key record for Admin compatibility.
  const rows = await readRows();
  const canonical = isObject(rows[SITE_KEY]) ? { ...rows[SITE_KEY] } : {};
  const writes = [[key, value]];

  if (key === SITE_KEY) {
    writes.push([SITE_KEY, value]);
  } else if (SECTION_KEYS.has(key) || IDENTITY_KEYS.has(key)) {
    // Storefront fetchRemoteSiteConfig reads these section rows separately.
  } else if (key === 'home') {
    canonical.home = merge(canonical.home || {}, value || {});
    // Preserve newsletter when an older Admin page saves only slides/banners.
    if (rows.newsletter && canonical.home.newsletter === undefined) canonical.home.newsletter = rows.newsletter;
    writes.push([SITE_KEY, canonical]);
  } else if (key === 'newsletter') {
    canonical.home = { ...(canonical.home || {}), newsletter: value };
    writes.push([SITE_KEY, canonical]);
  } else if (SITE_SECTION_KEYS.has(key)) {
    canonical[key] = value;
    writes.push([SITE_KEY, canonical]);
  } else {
    // Unknown setting keys are retained under the canonical site object.
    canonical[key] = value;
    writes.push([SITE_KEY, canonical]);
  }

  // De-duplicate keys in case the canonical `site` row is explicitly updated.
  const finalRows = [...new Map(writes.map(([k, v]) => [k, v])).entries()];
  await upsertRows(finalRows);
}
