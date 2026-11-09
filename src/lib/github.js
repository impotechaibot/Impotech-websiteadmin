/**
 * github.js — অ্যাডমিন থেকে সরাসরি GitHub-এ পুশ করার ইঞ্জিন
 * ------------------------------------------------------------
 * যা যা করতে পারে:
 *   ১. GitHub Personal Access Token, রিপো, ব্রাঞ্চ — localStorage-এ সেভ (কখনো কোডে হার্ডকোড নয়)
 *   ২. অ্যাডমিন রিপো আর ওয়েবসাইট রিপো — দুটোর জন্য আলাদা সেটিংস
 *   ৩. Git Data API দিয়ে একসাথে অনেক ফাইল atomic commit (একটাই কমিট, সব ফাইল)
 *   ৪. ZIP ফাইল আপলোড করলেই ব্রাউজারেই খুলে ভেতরের সব ফাইল পুশ
 *   ৫. টোকেন না থাকলে / CORS আটকালে বিকল্প পথ — GitHub ওয়েব আপলোড লিংক + রেডি ZIP
 *   ৬. প্রতিটি এররের বাংলা ব্যাখ্যা ও সমাধান
 *
 * নিরাপত্তা: টোকেন শুধু এই ব্রাউজারের localStorage-এ থাকে, কোথাও পাঠানো হয় না
 * (শুধু api.github.com-এ, যেটা GitHub-এর নিজের সার্ভার)।
 */

import JSZip from 'jszip';

const SETTINGS_KEY = 'impotech_github_settings_v1';
const LOG_KEY = 'impotech_github_log_v1';

/* ============================================================
 * ১. সেটিংস (দুই রিপো)
 * ============================================================ */

/** ডিফল্ট সেটিংস — অ্যাডমিন রিপো ও ওয়েবসাইট রিপো আলাদা */
export const DEFAULT_SETTINGS = {
  admin: {
    token: '',
    owner: '',
    repo: 'impotech-admin',
    branch: 'main',
    path: '', // রিপোর ভেতরে সাব-ফোল্ডার (সাধারণত খালি)
    message: 'Impotech Admin — অ্যাডমিন থেকে আপডেট',
  },
  website: {
    token: '',
    owner: '',
    repo: 'impotech-website',
    branch: 'main',
    path: '',
    message: 'Impotech Website — অ্যাডমিন থেকে আপডেট',
  },
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return structuredClone(DEFAULT_SETTINGS);
    const saved = JSON.parse(raw);
    return {
      admin: { ...DEFAULT_SETTINGS.admin, ...(saved.admin || {}) },
      website: { ...DEFAULT_SETTINGS.website, ...(saved.website || {}) },
    };
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}

export function saveSettings(next) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('github settings save failed', e);
    throw new Error('লোকাল স্টোরেজ পূর্ণ — কিছু ছবি/ভিডিও মুছে আবার চেষ্টা করুন।');
  }
  return next;
}

/** এক রিপোর সেটিংস আপডেট */
export function saveRepoConfig(which, patch) {
  const all = getSettings();
  all[which] = { ...all[which], ...patch };
  return saveSettings(all);
}

/** টোকেন কখনো UI-তে পুরো দেখানো হয় না */
export function maskToken(token) {
  if (!token) return '';
  if (token.length <= 8) return '••••';
  return token.slice(0, 4) + '••••••••' + token.slice(-4);
}

/* ============================================================
 * ২. লগ
 * ============================================================ */

export function getPushLog() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearPushLog() {
  try {
    localStorage.setItem(LOG_KEY, '[]');
  } catch {
    /* ignore */
  }
}

function appendLog(entry) {
  const log = getPushLog();
  log.unshift({ id: 'gh-' + Date.now().toString(36), at: new Date().toISOString(), ...entry });
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, 60)));
  } catch {
    /* ignore */
  }
  return log;
}

/* ============================================================
 * ৩. বাংলা এরর ম্যাপ
 * ============================================================ */

/**
 * GitHub API-র এরর → বাংলা ব্যাখ্যা + সমাধান
 * @param {number} status
 * @param {string} message
 */
export function explainGithubError(status, message = '') {
  const m = String(message || '').toLowerCase();

  if (status === 401 || m.includes('bad credentials')) {
    return {
      title: 'টোকেন ভুল বা মেয়াদোত্তীর্ণ',
      why: 'আপনার দেওয়া GitHub টোকেনটি সঠিক নয়, অথবা মেয়াদ শেষ হয়ে গেছে।',
      fix: 'GitHub → Settings → Developer settings → Personal access tokens → নতুন টোকেন বানান (repo permission সহ) → আবার বসান।',
    };
  }
  if (status === 403 && (m.includes('rate limit') || m.includes('abuse'))) {
    return {
      title: 'রেট লিমিট',
      why: 'খুব কম সময়ে অনেক রিকোয়েস্ট গেছে — GitHub সাময়িকভাবে আটকে দিয়েছে।',
      fix: 'কয়েক মিনিট অপেক্ষা করে আবার চেষ্টা করুন।',
    };
  }
  if (status === 403) {
    return {
      title: 'অনুমতি নেই (403)',
      why: 'টোকেনে এই রিপোতে লেখার (repo) অনুমতি নেই, অথবা রিপোটি আপনার নয়।',
      fix: 'টোকেনে "repo" scope আছে কিনা দেখুন, আর owner/repo নাম ঠিক আছে কিনা যাচাই করুন।',
    };
  }
  if (status === 404) {
    return {
      title: 'রিপো বা ব্রাঞ্চ পাওয়া যায়নি (404)',
      why: 'এই নামে রিপো নেই, অথবা টোকেন দিয়ে এটি দেখা যাচ্ছে না (প্রাইভেট রিপোতে টোকেন ছাড়া 404 আসে)।',
      fix: 'owner ও repo নাম হুবহু মিলিয়ে লিখুন (যেমন owner=yourname, repo=impotech-admin)। টোকেনে repo permission দিন।',
    };
  }
  if (status === 409 || m.includes('empty')) {
    return {
      title: 'রিপো খালি',
      why: 'রিপোতে এখনো কোনো কমিট নেই — তাই ব্রাঞ্চও নেই।',
      fix: 'চিন্তা নেই — অ্যাডমিন নিজেই প্রথম কমিট ও ব্রাঞ্চ তৈরি করে দেবে। আবার "পুশ" চাপুন।',
    };
  }
  if (status === 422) {
    return {
      title: 'ডেটা গ্রহণযোগ্য নয় (422)',
      why: 'ব্রাঞ্চ নাম বা ফাইল পাথ ঠিক নেই, অথবা একই নামে কিছু সংঘর্ষ করছে।',
      fix: 'ব্রাঞ্চ নাম সাধারণ "main" রাখুন, পাথ খালি রাখুন।',
    };
  }
  if (m.includes('failed to fetch') || m.includes('networkerror') || status === 0) {
    return {
      title: 'নেটওয়ার্ক এরর: Failed to fetch',
      why: 'ব্রাউজার থেকে সরাসরি GitHub API-তে পৌঁছানো যাচ্ছে না — ইন্টারনেট নেই, অথবা ব্রাউজার CORS/নেটওয়ার্ক ব্লক করছে।',
      fix: 'ইন্টারনেট চেক করুন। তারপরও না হলে নিচের "বিকল্প পথ" ব্যবহার করুন — GitHub ওয়েব আপলোড লিংক + রেডি ZIP।',
    };
  }
  return {
    title: 'GitHub এরর' + (status ? ` (${status})` : ''),
    why: message || 'অজানা সমস্যা।',
    fix: 'টোকেন, owner, repo ও ব্রাঞ্চ আবার যাচাই করে চেষ্টা করুন।',
  };
}

/* ============================================================
 * ৪. GitHub API ক্লায়েন্ট
 * ============================================================ */

const API = 'https://api.github.com';

async function ghFetch(path, { token, method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (e) {
    // নেটওয়ার্ক/CORS স্তরেই ব্যর্থ
    const info = explainGithubError(0, e.message);
    const err = new Error(info.title);
    err.info = info;
    err.network = true;
    throw err;
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const info = explainGithubError(res.status, data?.message);
    const err = new Error(info.title);
    err.info = info;
    err.status = res.status;
    throw err;
  }
  return data;
}

/** টোকেন + রিপো ঠিক আছে কিনা যাচাই */
export async function testConnection(which) {
  const cfg = getSettings()[which];
  if (!cfg.token) {
    return { ok: false, demo: true, message: 'টোকেন দেওয়া নেই — ডেমো মোড। টোকেন বসালে আসল রিপোতে যুক্ত হবে।' };
  }
  if (!cfg.owner || !cfg.repo) {
    return { ok: false, demo: false, message: 'owner ও repo নাম দুটোই দিতে হবে।' };
  }
  try {
    const user = await ghFetch('/user', { token: cfg.token });
    const repo = await ghFetch(`/repos/${cfg.owner}/${cfg.repo}`, { token: cfg.token });
    return {
      ok: true,
      demo: false,
      message: `সংযোগ সফল — ${user.login} → ${repo.full_name} (${repo.private ? 'প্রাইভেট' : 'পাবলিক'})`,
      user: user.login,
      repo: repo.full_name,
      defaultBranch: repo.default_branch,
    };
  } catch (e) {
    return { ok: false, demo: false, message: e.info ? `${e.info.title} — ${e.info.fix}` : e.message, info: e.info };
  }
}

/* ============================================================
 * ৫. একসাথে অনেক ফাইল atomic commit (Git Data API)
 * ============================================================ */

/**
 * ফাইল ম্যাপ → GitHub-এ এক কমিটে পুশ
 * @param {string} which  'admin' | 'website'
 * @param {Record<string,string>} files  { 'src/App.jsx': '...', ... }
 * @param {(msg:string, level?:string)=>void} onLog
 */
export async function pushFiles(which, files, onLog = () => {}) {
  const cfg = getSettings()[which];
  const { token, owner, repo, branch, path: subPath, message } = cfg;

  if (!token) {
    const info = explainGithubError(401, 'no token');
    const err = new Error(info.title);
    err.info = info;
    err.noToken = true;
    throw err;
  }
  if (!owner || !repo) {
    const err = new Error('owner ও repo নাম দুটোই দিতে হবে।');
    err.info = { title: 'রিপো তথ্য অসম্পূর্ণ', why: 'owner বা repo নাম দেওয়া নেই।', fix: 'সেটিংসে owner (আপনার GitHub ইউজারনেম) ও repo নাম লিখুন।' };
    throw err;
  }

  const entries = Object.entries(files).filter(([, v]) => typeof v === 'string');
  if (!entries.length) throw new Error('পুশ করার মতো কোনো ফাইল নেই।');

  const base = `/repos/${owner}/${repo}`;
  const prefix = subPath ? subPath.replace(/^\/+|\/+$/g, '') + '/' : '';

  onLog(`রিপো: ${owner}/${repo} · ব্রাঞ্চ: ${branch}`, 'info');
  onLog(`${entries.length}টি ফাইল প্রস্তুত করা হচ্ছে…`, 'info');

  /* ---- ৫.১ বর্তমান কমিট/ট্রি বের করা (রিপো খালি হলে null) ---- */
  let baseCommitSha = null;
  let baseTreeSha = null;
  try {
    const ref = await ghFetch(`${base}/git/ref/heads/${branch}`, { token });
    baseCommitSha = ref.object.sha;
    const commit = await ghFetch(`${base}/git/commits/${baseCommitSha}`, { token });
    baseTreeSha = commit.tree.sha;
    onLog(`বর্তমান কমিট পাওয়া গেছে: ${baseCommitSha.slice(0, 7)}`, 'ok');
  } catch (e) {
    if (e.status === 404 || e.status === 409) {
      onLog('রিপো/ব্রাঞ্চ খালি — প্রথম কমিট তৈরি হবে।', 'warn');
    } else {
      throw e;
    }
  }

  /* ---- ৫.২ প্রতিটি ফাইলের blob তৈরি ---- */
  const tree = [];
  let done = 0;
  for (const [relPath, content] of entries) {
    const fullPath = prefix + relPath.replace(/^\/+/, '');
    const blob = await ghFetch(`${base}/git/blobs`, {
      token,
      method: 'POST',
      body: { content, encoding: 'utf-8' },
    });
    tree.push({ path: fullPath, mode: '100644', type: 'blob', sha: blob.sha });
    done += 1;
    if (done % 10 === 0 || done === entries.length) {
      onLog(`blob তৈরি: ${done}/${entries.length}`, 'info');
    }
  }

  /* ---- ৫.৩ নতুন tree ---- */
  const newTree = await ghFetch(`${base}/git/trees`, {
    token,
    method: 'POST',
    body: { ...(baseTreeSha ? { base_tree: baseTreeSha } : {}), tree },
  });
  onLog('নতুন tree তৈরি হয়েছে।', 'ok');

  /* ---- ৫.৪ নতুন commit ---- */
  const newCommit = await ghFetch(`${base}/git/commits`, {
    token,
    method: 'POST',
    body: {
      message: message || 'Impotech — অ্যাডমিন থেকে আপডেট',
      tree: newTree.sha,
      parents: baseCommitSha ? [baseCommitSha] : [],
    },
  });
  onLog(`নতুন কমিট: ${newCommit.sha.slice(0, 7)}`, 'ok');

  /* ---- ৫.৫ ref আপডেট (ব্রাঞ্চ না থাকলে তৈরি) ---- */
  if (baseCommitSha) {
    await ghFetch(`${base}/git/refs/heads/${branch}`, {
      token,
      method: 'PATCH',
      body: { sha: newCommit.sha, force: false },
    });
  } else {
    await ghFetch(`${base}/git/refs`, {
      token,
      method: 'POST',
      body: { ref: `refs/heads/${branch}`, sha: newCommit.sha },
    });
  }
  onLog(`ব্রাঞ্চ "${branch}" আপডেট হয়েছে।`, 'ok');

  const result = {
    ok: true,
    commit: newCommit.sha,
    commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
    repoUrl: `https://github.com/${owner}/${repo}`,
    fileCount: entries.length,
  };

  appendLog({
    status: 'success',
    which,
    repo: `${owner}/${repo}`,
    branch,
    fileCount: entries.length,
    commit: newCommit.sha,
    message: `✅ ${entries.length}টি ফাইল সফলভাবে পুশ হয়েছে (${owner}/${repo})।`,
  });

  return result;
}

/* ============================================================
 * ৬. ZIP পার্স
 * ============================================================ */

const CODE_EXT = /\.(jsx?|tsx?|css|html|json|md|sql|txt|svg|yml|yaml|xml|env|example|gitignore|toml|lock)$/i;
const SKIP_DIR = /(^|\/)(node_modules|dist|\.git|\.vercel|coverage)\//;

/**
 * ZIP ফাইল → { files: {path: content}, fileCount, skipped }
 * বাইনারি ফাইল (ছবি/ভিডিও) বাদ দেওয়া হয় — শুধু টেক্সট/কোড ফাইল পুশ হয়।
 */
export async function parseZip(file, onLog = () => {}) {
  if (!file) throw new Error('কোনো ফাইল দেওয়া হয়নি।');
  if (!/\.zip$/i.test(file.name)) throw new Error('শুধু .zip ফাইল আপলোড করুন।');

  onLog('ZIP ফাইল পড়া হচ্ছে…', 'info');
  const zip = await JSZip.loadAsync(file);

  const files = {};
  let skipped = 0;
  let count = 0;

  const entries = Object.values(zip.files).filter((e) => !e.dir);
  for (const entry of entries) {
    let p = entry.name.replace(/^\/+/, '');
    if (SKIP_DIR.test(p)) { skipped += 1; continue; }
    if (!CODE_EXT.test(p)) { skipped += 1; continue; }
    // .env.example রাখি, কিন্তু আসল .env বাদ
    if (/(^|\/)\.env$/.test(p) || /(^|\/)\.env\.local$/.test(p)) { skipped += 1; continue; }

    const content = await entry.async('string');
    files[p] = content;
    count += 1;
  }

  onLog(`ZIP পার্স সম্পন্ন — ${count}টি কোড ফাইল পাওয়া গেছে${skipped ? `, ${skipped}টি বাদ (বাইনারি/অপ্রয়োজনীয়)` : ''}।`, 'ok');
  return { files, fileCount: count, skipped, name: file.name };
}

/** ZIP-এর ভেতরের ফাইল লিস্ট (প্রিভিউর জন্য) */
export async function listZipFiles(file) {
  const zip = await JSZip.loadAsync(file);
  return Object.values(zip.files)
    .filter((e) => !e.dir)
    .map((e) => e.name.replace(/^\/+/, ''))
    .filter((p) => !SKIP_DIR.test(p));
}

/* ============================================================
 * ৭. CORS / টোকেন-হীন বিকল্প পথ
 * ============================================================ */

/** GitHub-এর ওয়েব আপলোড পেজ খুলুন (টোকেন ছাড়াই ফাইল ড্র্যাগ-ড্রপ করা যায়) */
export function openGithubUploadPage(which) {
  const cfg = getSettings()[which];
  if (!cfg.owner || !cfg.repo) {
    throw new Error('আগে owner ও repo নাম সেভ করুন।');
  }
  const url = `https://github.com/${cfg.owner}/${cfg.repo}/upload/${cfg.branch}`;
  window.open(url, '_blank', 'noopener');
  return url;
}

/** রিপো পেজ খুলুন */
export function openRepoPage(which) {
  const cfg = getSettings()[which];
  if (!cfg.owner || !cfg.repo) throw new Error('আগে owner ও repo নাম সেভ করুন।');
  const url = `https://github.com/${cfg.owner}/${cfg.repo}`;
  window.open(url, '_blank', 'noopener');
  return url;
}

/**
 * ফাইল ম্যাপ → ডাউনলোডযোগ্য ZIP (GitHub-এ ড্র্যাগ-ড্রপ করার জন্য)
 * @param {Record<string,string>} files
 * @param {string} name
 */
export async function downloadFilesAsZip(files, name = 'impotech-upload') {
  const zip = new JSZip();
  Object.entries(files).forEach(([p, content]) => zip.file(p, content));
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.zip`;
  a.click();
  URL.revokeObjectURL(url);
  return a.download;
}

/* ============================================================
 * ৮. উচ্চ-স্তরের ফাংশন: ZIP → পুশ (fallback সহ)
 * ============================================================ */

/**
 * ZIP আপলোড → সরাসরি GitHub-এ পুশ।
 * টোকেন না থাকলে বা CORS আটকালে বিকল্প পথ দেখায়।
 * @returns {{ok:boolean, mode:'pushed'|'fallback', ...}}
 */
export async function pushZip(which, file, onLog = () => {}) {
  const parsed = await parseZip(file, onLog);

  if (!parsed.fileCount) {
    throw new Error('ZIP-এ কোনো কোড ফাইল পাওয়া যায়নি। সোর্স ফাইলসহ ZIP দিন।');
  }

  const cfg = getSettings()[which];

  // টোকেন নেই → বিকল্প পথ
  if (!cfg.token) {
    onLog('টোকেন দেওয়া নেই — বিকল্প পথ ব্যবহার করা হচ্ছে।', 'warn');
    const zipName = await downloadFilesAsZip(parsed.files, `${cfg.repo || 'impotech'}-upload`);
    onLog(`রেডি ZIP ডাউনলোড হয়েছে: ${zipName}`, 'ok');
    let uploadUrl = '';
    try { uploadUrl = openGithubUploadPage(which); } catch { /* owner/repo নেই */ }
    appendLog({
      status: 'fallback',
      which,
      fileCount: parsed.fileCount,
      message: `⚠️ টোকেন ছাড়া — ${parsed.fileCount}টি ফাইল ZIP আকারে ডাউনলোড হয়েছে, GitHub ওয়েব আপলোড পেজ খোলা হয়েছে।`,
    });
    return { ok: true, mode: 'fallback', reason: 'no-token', fileCount: parsed.fileCount, zipName, uploadUrl };
  }

  // টোকেন আছে → আসল পুশ
  try {
    const res = await pushFiles(which, parsed.files, onLog);
    return { ok: true, mode: 'pushed', ...res };
  } catch (e) {
    // CORS/নেটওয়ার্ক ব্যর্থ হলে বিকল্প পথ
    if (e.network) {
      onLog('সরাসরি পুশ ব্যর্থ (নেটওয়ার্ক/CORS) — বিকল্প পথ দেখানো হচ্ছে।', 'warn');
      const zipName = await downloadFilesAsZip(parsed.files, `${cfg.repo || 'impotech'}-upload`);
      let uploadUrl = '';
      try { uploadUrl = openGithubUploadPage(which); } catch { /* ignore */ }
      appendLog({
        status: 'fallback',
        which,
        fileCount: parsed.fileCount,
        message: `⚠️ CORS/নেটওয়ার্ক বাধা — ${parsed.fileCount}টি ফাইল ZIP আকারে ডাউনলোড হয়েছে।`,
      });
      return { ok: true, mode: 'fallback', reason: 'cors', fileCount: parsed.fileCount, zipName, uploadUrl, error: e.info };
    }
    appendLog({
      status: 'failed',
      which,
      fileCount: parsed.fileCount,
      message: `❌ পুশ ব্যর্থ: ${e.message}`,
    });
    throw e;
  }
}

/* ============================================================
 * ৯. টোকেন তৈরির নির্দেশনা (UI-তে দেখানোর জন্য)
 * ============================================================ */

export const TOKEN_STEPS = [
  'github.com-এ লগইন করুন।',
  'ডান-উপরে প্রোফাইল ছবি → Settings।',
  'বাম মেনুতে একেবারে নিচে → Developer settings।',
  'Personal access tokens → Tokens (classic) → Generate new token (classic)।',
  'Note-এ নাম দিন (যেমন: impotech-admin-push)।',
  'Expiration — ৯০ দিন বা No expiration বেছে নিন।',
  'Scopes-এ "repo" টিক দিন (প্রাইভেট রিপোতে লেখার জন্য এটাই দরকার)।',
  'Generate token চাপুন → ghp_... দিয়ে শুরু হওয়া টোকেন কপি করুন।',
  'টোকেনটি এখানে পেস্ট করে "সেভ" চাপুন — এটি শুধু আপনার ব্রাউজারে থাকবে।',
];
