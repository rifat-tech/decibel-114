// Lightweight first-party visitor stats. One Firestore document per day (stats/YYYY-MM-DD) holds
// counters, so tracking costs one small write per event and the admin panel reads ~30 docs.
// Nothing personal is stored: no names, emails, IPs or full URLs; search terms only.
import { doc, getDoc, increment, setDoc } from 'firebase/firestore';
import { DEMO, fs } from './firebase';

const DKEY = 'd114_demo_stats';
const day = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
// Map keys: short, lowercase, no dots or slashes (Firestore field-path safe).
const key = (s, n = 60) => String(s || '').toLowerCase().normalize('NFKC').replace(/[.\/#$\[\]`~*]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n) || '(empty)';

let staff = false;
export const setTrackingStaff = (v) => { staff = !!v; };
const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch { /* private mode */ } return null; };
const ss = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch { /* ignore */ } return null; };

// Combine bursts (typing, quick navigation) into one write every couple of seconds.
let pending = {};
let timer = null;
function add(path, n = 1) {
  if (staff || typeof window === 'undefined') return;
  if (/bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent)) return;
  const parts = path.split('.');
  let o = pending;
  for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]] ||= {};
  o[parts[parts.length - 1]] = (o[parts[parts.length - 1]] || 0) + n;
  clearTimeout(timer);
  timer = setTimeout(flush, 1500);
}
function toIncrements(o) {
  const out = {};
  for (const [k, v] of Object.entries(o)) out[k] = typeof v === 'number' ? increment(v) : toIncrements(v);
  return out;
}
function mergeDemo(target, o) {
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === 'number') target[k] = (target[k] || 0) + v;
    else mergeDemo(target[k] ||= {}, v);
  }
}
async function flush() {
  const batch = pending; pending = {};
  if (!Object.keys(batch).length) return;
  const id = day();
  if (DEMO) {
    let all = {}; try { all = JSON.parse(ls(DKEY) || '{}'); } catch { all = {}; }
    mergeDemo(all[id] ||= {}, batch); ls(DKEY, JSON.stringify(all)); return;
  }
  try { await setDoc(doc(fs, 'stats', id), toIncrements(batch), { merge: true }); } catch { /* stats are best effort */ }
}
if (typeof window !== 'undefined') window.addEventListener('pagehide', () => { clearTimeout(timer); flush(); });

/** Call on every route change. */
export function trackPage(pathname) {
  if (staff || /^\/(admin|login|register|account)/.test(pathname)) return;
  const today = day();
  if (!ss('d114_sess')) {
    ss('d114_sess', '1');
    add('sessions');
    if (ls('d114_seen') !== today) { add('visitors'); if (!ls('d114_seen')) add('newVisitors'); ls('d114_seen', today); }
    const mobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    add(`device.${mobile ? 'mobile' : 'desktop'}`);
    let src = 'direct';
    try {
      const r = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : '';
      if (r && r !== location.hostname) src = /google\./.test(r) ? 'google' : /facebook|fb\.|messenger/.test(r) ? 'facebook' : /instagram/.test(r) ? 'instagram' : /bing\./.test(r) ? 'bing' : /youtube/.test(r) ? 'youtube' : r;
      const utm = new URLSearchParams(location.search).get('utm_source'); if (utm) src = utm;
    } catch { /* ignore */ }
    add(`source.${key(src, 40)}`);
  }
  add('views');
  const page = pathname === '/' ? 'home' : pathname.startsWith('/product/') ? 'product page' : pathname.split('/')[1] || 'home';
  add(`page.${key(page, 30)}`);
}
/** Search box, shop query or chat question. results = how many products matched. */
export function trackSearch(term, results, where = 'search') {
  const t = key(term, 50);
  if (t.length < 2) return;
  add('searches');
  add(`${where === 'chat' ? 'chat' : 'search'}.${t}`);
  if (!results) add(`noResult.${t}`);
}
export const trackProduct = (slug) => add(`product.${key(slug, 80)}`);
export const trackCart = (slug) => { add('addToCart'); add(`cart.${key(slug, 80)}`); };
export const trackOrder = () => add('orders');

/** Admin: last n days of stats, oldest first. */
export async function loadStats(n = 30) {
  const ids = Array.from({ length: n }, (_, i) => day(new Date(Date.now() - (n - 1 - i) * 864e5)));
  if (DEMO) { let all = {}; try { all = JSON.parse(ls(DKEY) || '{}'); } catch { all = {}; } return ids.map((id) => ({ id, ...(all[id] || {}) })); }
  const snaps = await Promise.all(ids.map((id) => getDoc(doc(fs, 'stats', id)).catch(() => null)));
  return snaps.map((s, i) => ({ id: ids[i], ...(s?.exists() ? s.data() : {}) }));
}
