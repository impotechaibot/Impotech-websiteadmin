/**
 * updater.js — অটো-আপডেট ইঞ্জিন
 * ------------------------------------------------------------
 * অ্যাডমিন অ্যাপের ভেতর থেকে একটি ZIP ফাইল আপলোড করলেই:
 *   ১. ব্যাকআপ নেওয়া হয় (বর্তমান ডেটা + সেটিংস)
 *   ২. ZIP পার্স করে নতুন ফাইল, SQL মাইগ্রেশন ও seed ডেটা বের করা হয়
 *   ৩. ডেটা স্কিমা (নতুন টেবিল/কলাম) সাথে সাথে প্রয়োগ হয়
 *   ৪. কোড ফাইলগুলো "স্টেজ" করা হয় (পরের রিলোডে কার্যকর)
 *   ৫. প্রতিটি ধাপের লগ বাংলায় সংরক্ষণ ও দেখানো হয়
 *
 * ডেমো মোডে (Supabase ছাড়া) সবকিছু localStorage-এ কাজ করে।
 * Supabase থাকলে আপডেট-লগ ও স্কিমা-ভার্সন ডেটাবেসেও সিঙ্ক হয়।
 */

import JSZip from 'jszip';
import { localdb } from './localdb.js';
import { supabase, isSupabaseConfigured } from './supabase.js';

const LOG_KEY = 'impotech_update_log_v1';
const STAGED_KEY = 'impotech_update_staged_v1';
const BACKUP_KEY = 'impotech_update_backup_v1';
const SCHEMA_KEY = 'impotech_schema_version_v1';

/* ---------- helpers ---------- */
const nowIso = () => new Date().toISOString();

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('updater write failed', e);
    throw new Error('লোকাল স্টোরেজ পূর্ণ — কিছু ছবি/ভিডিও মুছে আবার চেষ্টা করুন।');
  }
}

/* ---------- লগ ---------- */
export function getUpdateLog() {
  return readJson(LOG_KEY, []);
}

export function clearUpdateLog() {
  writeJson(LOG_KEY, []);
}

function appendLog(entry) {
  const log = getUpdateLog();
  log.unshift({ id: 'log-' + Date.now().toString(36), at: nowIso(), ...entry });
  writeJson(LOG_KEY, log.slice(0, 100));
  return log;
}

/* ---------- স্কিমা ভার্সন ---------- */
export function getSchemaVersion() {
  return readJson(SCHEMA_KEY, { version: '1.0.0', tables: [], updatedAt: null });
}

function setSchemaVersion(v) {
  writeJson(SCHEMA_KEY, v);
}

/* ---------- ব্যাকআপ ---------- */
export function createBackup() {
  const snapshot = {
    at: nowIso(),
    data: localdb.exportAll(),
    schema: getSchemaVersion(),
    staged: readJson(STAGED_KEY, null),
  };
  writeJson(BACKUP_KEY, snapshot);
  return snapshot;
}

export function getBackup() {
  return readJson(BACKUP_KEY, null);
}

export function restoreBackup() {
  const snap = getBackup();
  if (!snap) throw new Error('কোনো ব্যাকআপ পাওয়া যায়নি।');
  localdb.importAll(snap.data);
  if (snap.schema) setSchemaVersion(snap.schema);
  writeJson(STAGED_KEY, snap.staged || null);
  return snap;
}

export function downloadBackup() {
  const snap = getBackup() || createBackup();
  const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `impotech-update-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- স্টেজড আপডেট ---------- */
export function getStagedUpdate() {
  return readJson(STAGED_KEY, null);
}

export function clearStagedUpdate() {
  writeJson(STAGED_KEY, null);
}

/* ---------- ZIP পার্স ---------- */
const CODE_EXT = /\.(jsx?|tsx?|css|html|json|md|sql|txt)$/i;

/**
 * ZIP ফাইল পার্স করে একটি স্ট্রাকচার্ড অবজেক্ট দেয়।
 * @param {File} file
 * @param {(msg:string)=>void} onLog
 */
export async function parseUpdateZip(file, onLog = () => {}) {
  if (!file) throw new Error('কোনো ফাইল দেওয়া হয়নি।');
  if (!/\.zip$/i.test(file.name)) throw new Error('শুধু .zip ফাইল আপলোড করুন।');

  onLog('ZIP ফাইল পড়া হচ্ছে…');
  const zip = await JSZip.loadAsync(file);

  const files = {};
  const migrations = [];
  const seeds = {};
  let manifest = null;
  let fileCount = 0;

  const entries = Object.values(zip.files).filter((e) => !e.dir);
  for (const entry of entries) {
    const path = entry.name.replace(/^\/+/, '');
    // node_modules / dist / .git বাদ
    if (/(^|\/)(node_modules|dist|\.git)\//.test(path)) continue;
    if (!CODE_EXT.test(path)) continue;

    const content = await entry.async('string');
    files[path] = content;
    fileCount += 1;

    // SQL মাইগ্রেশন
    if (/supabase\/migrations\/.*\.sql$/i.test(path)) {
      migrations.push({ path, sql: content });
    }
    // seed JSON
    if (/(^|\/)seed\.json$/i.test(path) || /(^|\/)data\/.*\.json$/i.test(path)) {
      try { seeds[path] = JSON.parse(content); } catch { /* ignore */ }
    }
    // manifest
    if (/(^|\/)impotech-update\.json$/i.test(path)) {
      try { manifest = JSON.parse(content); } catch { /* ignore */ }
    }
  }

  onLog(`ZIP পার্স সম্পন্ন — ${fileCount}টি ফাইল পাওয়া গেছে।`);
  return { files, migrations, seeds, manifest, fileCount, name: file.name };
}

/* ---------- SQL থেকে টেবিল নাম বের করা ---------- */
function extractTables(sql) {
  const names = new Set();
  const re = /create\s+table\s+(?:if\s+not\s+exists\s+)?["']?([a-z0-9_]+)["']?/gi;
  let m;
  while ((m = re.exec(sql)) !== null) names.add(m[1].toLowerCase());
  return [...names];
}

function extractColumns(sql) {
  // alter table X add column if not exists Y ...
  const cols = [];
  const re = /alter\s+table\s+["']?([a-z0-9_]+)["']?\s+add\s+column\s+(?:if\s+not\s+exists\s+)?["']?([a-z0-9_]+)["']?/gi;
  let m;
  while ((m = re.exec(sql)) !== null) cols.push({ table: m[1].toLowerCase(), column: m[2].toLowerCase() });
  return cols;
}

/* ---------- ডেটা স্কিমা প্রয়োগ ---------- */
function applySchema(parsed, onLog) {
  const db = localdb.exportAll();
  const existing = new Set(Object.keys(db));
  const added = [];

  // ১. SQL থেকে নতুন টেবিল
  for (const mig of parsed.migrations) {
    const tables = extractTables(mig.sql);
    for (const t of tables) {
      if (!existing.has(t)) {
        db[t] = [];
        existing.add(t);
        added.push(t);
      }
    }
    const cols = extractColumns(mig.sql);
    if (cols.length) {
      onLog(`নতুন কলাম পাওয়া গেছে: ${cols.map((c) => `${c.table}.${c.column}`).join(', ')}`);
    }
  }

  // ২. seed JSON থেকে টেবিল + ডেটা
  for (const [path, seed] of Object.entries(parsed.seeds)) {
    if (seed && typeof seed === 'object' && !Array.isArray(seed)) {
      for (const [table, rows] of Object.entries(seed)) {
        if (!Array.isArray(rows)) continue;
        if (!existing.has(table)) {
          db[table] = [];
          existing.add(table);
          added.push(table);
        }
        // বিদ্যমান আইডি বাদ দিয়ে নতুন রো যোগ
        const ids = new Set((db[table] || []).map((r) => r.id));
        const fresh = rows.filter((r) => r && r.id && !ids.has(r.id));
        db[table] = [...(db[table] || []), ...fresh];
      }
      onLog(`seed ডেটা মেশানো হয়েছে: ${path}`);
    }
  }

  // ৩. manifest-এ সরাসরি টেবিল ডেটা থাকলে
  if (parsed.manifest?.tables && typeof parsed.manifest.tables === 'object') {
    for (const [table, rows] of Object.entries(parsed.manifest.tables)) {
      if (!Array.isArray(rows)) continue;
      if (!existing.has(table)) { db[table] = []; existing.add(table); added.push(table); }
      const ids = new Set((db[table] || []).map((r) => r.id));
      db[table] = [...(db[table] || []), ...rows.filter((r) => r && r.id && !ids.has(r.id))];
    }
  }

  localdb.importAll(db);

  if (added.length) onLog(`নতুন টেবিল যোগ হয়েছে: ${added.join(', ')}`);
  else onLog('নতুন কোনো টেবিল পাওয়া যায়নি — বিদ্যমান স্কিমা অপরিবর্তিত।');

  return added;
}

/* ---------- মূল আপডেট ফাংশন ---------- */
/**
 * @param {File} file
 * @param {(msg:string, level?:string)=>void} onLog
 */
export async function runUpdate(file, onLog = () => {}) {
  const startedAt = nowIso();
  try {
    onLog('আপডেট শুরু হচ্ছে…');

    // ১. ব্যাকআপ
    onLog('ব্যাকআপ নেওয়া হচ্ছে…');
    createBackup();
    onLog('ব্যাকআপ সম্পন্ন (ডেটা + সেটিংস সংরক্ষিত)।', 'ok');

    // ২. পার্স
    const parsed = await parseUpdateZip(file, onLog);

    // ৩. ডেটা স্কিমা
    onLog('ডেটা স্কিমা প্রয়োগ করা হচ্ছে…');
    const addedTables = applySchema(parsed, onLog);

    // ৪. কোড স্টেজ
    onLog('কোড ফাইল স্টেজ করা হচ্ছে…');
    const version = parsed.manifest?.version || `auto-${new Date().toISOString().slice(0, 10)}`;
    const staged = {
      version,
      name: parsed.manifest?.name || file.name,
      notes: parsed.manifest?.notes || '',
      features: parsed.manifest?.features || [],
      files: parsed.files,
      fileCount: parsed.fileCount,
      migrations: parsed.migrations.map((m) => m.path),
      stagedAt: nowIso(),
    };
    writeJson(STAGED_KEY, staged);
    onLog(`${parsed.fileCount}টি কোড ফাইল স্টেজ হয়েছে (ভার্সন ${version})।`, 'ok');

    // ৫. স্কিমা ভার্সন আপডেট
    const prev = getSchemaVersion();
    const nextSchema = {
      version,
      tables: [...new Set([...(prev.tables || []), ...addedTables])],
      updatedAt: nowIso(),
    };
    setSchemaVersion(nextSchema);

    // ৬. Supabase থাকলে সিঙ্ক
    if (isSupabaseConfigured) {
      try {
        await supabase.from('site_settings').upsert(
          { key: 'update_schema', value: nextSchema, updated_at: nowIso() },
          { onConflict: 'key' }
        );
        onLog('Supabase ডেটাবেসে স্কিমা-ভার্সন সিঙ্ক হয়েছে।', 'ok');
      } catch (e) {
        onLog('Supabase সিঙ্ক ব্যর্থ (ডেমোতে সমস্যা নেই): ' + e.message, 'warn');
      }
    }

    // ৭. লগ
    const entry = appendLog({
      status: 'success',
      version,
      name: staged.name,
      fileCount: parsed.fileCount,
      addedTables,
      startedAt,
      finishedAt: nowIso(),
      message: 'আপডেট সফলভাবে প্রয়োগ হয়েছে।',
    });

    onLog('✅ আপডেট সফলভাবে সম্পন্ন হয়েছে!', 'ok');
    return { ok: true, staged, addedTables, log: entry };
  } catch (e) {
    appendLog({
      status: 'failed',
      startedAt,
      finishedAt: nowIso(),
      message: 'আপডেট ব্যর্থ: ' + e.message,
    });
    onLog('❌ আপডেট ব্যর্থ: ' + e.message, 'error');
    throw e;
  }
}
