// Data layer. One small collection API (`C(name)`) works on Firestore or, in demo mode,
// on localStorage. Everything else (orders, CRM, chat, coupons…) is built on top of it.
import { DEMO, auth, fs, withSecondaryAuth } from './firebase';
import { CATEGORIES, PRODUCTS } from './catalog';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, limit as qLimit,
  writeBatch, onSnapshot, increment,
} from 'firebase/firestore';
import {
  onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, updatePassword, updateProfile,
} from 'firebase/auth';

export { DEMO };
export const now = () => Date.now();
export const rid = (n = 20) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('');
const digits = (s) => String(s || '').replace(/\D/g, '');
export const phoneKey = (p) => { const d = digits(p); return d.length >= 10 ? d.slice(-10) : d; };

/* ═════════════ generic collection API ═════════════ */
const DKEY = 'd114_demo_v1';
let demoCache = null;
const demoListeners = new Set();
function demoDB() {
  if (demoCache) return demoCache;
  try { demoCache = JSON.parse(localStorage.getItem(DKEY)); } catch { demoCache = null; }
  if (!demoCache) {
    demoCache = { categories: {}, products: {}, users: {}, settings: {} };
    CATEGORIES.forEach(({ id, ...c }) => (demoCache.categories[id] = c));
    PRODUCTS.forEach(({ id, ...p }) => (demoCache.products[id] = p));
    demoCache.users['demo-admin'] = { name: 'Demo Admin', email: 'admin@decibel114.demo', password: 'admin123', role: 'admin', createdAt: now() };
    demoSave();
  }
  return demoCache;
}
function demoSave() { try { localStorage.setItem(DKEY, JSON.stringify(demoCache)); } catch { /* full or blocked */ } demoListeners.forEach((f) => f()); }
const demoCol = (path) => { const db = demoDB(); return (db[path] ||= {}); };

function matchDemo(rows, { where: w = [], order, limit } = {}) {
  let r = rows.filter((x) => w.every(([f, op, v]) => (op === '==' ? x[f] === v : op === 'in' ? v.includes(x[f]) : op === '>=' ? x[f] >= v : op === 'array-contains' ? (x[f] || []).includes(v) : true)));
  if (order) { const [f, dir] = order; r = r.sort((a, b) => ((a[f] ?? 0) > (b[f] ?? 0) ? 1 : -1) * (dir === 'desc' ? -1 : 1)); }
  return limit ? r.slice(0, limit) : r;
}
function fsQuery(path, { where: w = [], order, limit } = {}) {
  const parts = w.map(([f, op, v]) => where(f, op, v));
  if (order) parts.push(orderBy(order[0], order[1] || 'asc'));
  if (limit) parts.push(qLimit(limit));
  return query(collection(fs, ...path.split('/')), ...parts);
}
const rows = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

export function C(path) {
  return {
    async list(q) {
      if (DEMO) return matchDemo(Object.entries(demoCol(path)).map(([id, v]) => ({ id, ...v })), q);
      return rows(await getDocs(fsQuery(path, q)));
    },
    async get(id) {
      if (DEMO) { const v = demoCol(path)[id]; return v ? { id, ...v } : null; }
      const d = await getDoc(doc(fs, ...path.split('/'), id));
      return d.exists() ? { id: d.id, ...d.data() } : null;
    },
    async set(id, data, merge = false) {
      if (DEMO) { const c = demoCol(path); c[id] = merge ? { ...(c[id] || {}), ...data } : { ...data }; demoSave(); return id; }
      await setDoc(doc(fs, ...path.split('/'), id), data, { merge }); return id;
    },
    async add(data) {
      if (DEMO) { const id = rid(16); demoCol(path)[id] = { ...data }; demoSave(); return id; }
      return (await addDoc(collection(fs, ...path.split('/')), data)).id;
    },
    async update(id, patch) {
      if (DEMO) {
        const c = demoCol(path); const cur = c[id] || {};
        Object.entries(patch).forEach(([k, v]) => { cur[k] = v && v.__inc !== undefined ? (cur[k] || 0) + v.__inc : v; });
        c[id] = cur; demoSave(); return;
      }
      const p = Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, v && v.__inc !== undefined ? increment(v.__inc) : v]));
      await updateDoc(doc(fs, ...path.split('/'), id), p);
    },
    async remove(id) {
      if (DEMO) { delete demoCol(path)[id]; demoSave(); return; }
      await deleteDoc(doc(fs, ...path.split('/'), id));
    },
    watch(q, cb, onErr) {
      if (DEMO) { const run = () => this.list(q).then(cb); run(); demoListeners.add(run); return () => demoListeners.delete(run); }
      return onSnapshot(fsQuery(path, q), (s) => cb(rows(s)), (e) => { console.error(path, e); onErr && onErr(e); });
    },
    watchDoc(id, cb) {
      if (DEMO) { const run = () => this.get(id).then(cb); run(); demoListeners.add(run); return () => demoListeners.delete(run); }
      return onSnapshot(doc(fs, ...path.split('/'), id), (d) => cb(d.exists() ? { id: d.id, ...d.data() } : null), () => cb(null));
    },
  };
}
export const inc = (n) => ({ __inc: n });

/** Writes many docs in chunks (Firestore batches max 500 ops). */
export async function bulkSet(path, items) {
  if (DEMO) { const c = demoCol(path); items.forEach(({ id, ...v }) => (c[id] = v)); demoSave(); return; }
  for (let i = 0; i < items.length; i += 400) {
    const b = writeBatch(fs);
    items.slice(i, i + 400).forEach(({ id, ...v }) => b.set(doc(fs, path, id), v));
    await b.commit();
  }
}

/* ═════════════ store settings ═════════════ */
export const DEFAULT_SETTINGS = {
  storeName: 'Decibel-114', tagline: 'Apple, gadgets and network gear in Bangladesh',
  phone: '', whatsapp: '', email: '', address: '', hours: 'Sat–Thu, 10am to 8pm',
  shippingInsideDhaka: 80, shippingOutsideDhaka: 150, freeShippingOver: 10000, returnDays: 7,
  bkash: '', nagad: '', bank: '',
  banners: [
    { id: 'b1', title: 'iPhone 18 Pro Max in Burgundy', text: 'A20 Pro chip and three 48MP cameras. Official warranty, delivered across Bangladesh.', cta: 'Shop iPhone 18 Pro Max', link: '/product/iphone-18-pro-max', tone: 'sky', image: '/img/b/iphone-18-pro-max-burgundy.webp' },
    { id: 'b2', title: 'MacBook Neo from ৳97,000', text: 'The most affordable MacBook, in four colours. Built for students and everyday work.', cta: 'Shop MacBook Neo', link: '/shop?cat=laptop&sub=MacBook', tone: 'sun', image: '/img/b/macbook-neo.webp' },
    { id: 'b3', title: 'MikroTik for ISPs and offices', text: 'RouterOS routers and switches, preconfigured by our network team on request.', cta: 'Shop MikroTik', link: '/shop?cat=network&brand=MikroTik', tone: 'mist', image: '/img/b/mikrotik-hex-lite.webp' },
    { id: 'b4', title: 'Starlink, delivered and set up', text: 'High-speed satellite internet anywhere in Bangladesh. Standard, Mini and accessories in stock.', cta: 'Shop Starlink', link: '/shop?cat=network&sub=Starlink', tone: 'sky', image: '/img/b/starlink-standard.webp', photo: true },
  ],
  ai: {
    enabled: true, model: 'gemini-2.5-flash', name: 'Decibel Assistant',
    instructions: 'Be friendly and brief. Reply in the customer’s language (Bangla or English). Recommend products from the catalog only, with prices in taka. If you are not sure, offer to connect a human.',
  },
};
export async function getSettings() {
  try { const s = await C('settings').get('store'); return { ...DEFAULT_SETTINGS, ...(s || {}), ai: { ...DEFAULT_SETTINGS.ai, ...(s?.ai || {}) } }; }
  catch { return DEFAULT_SETTINGS; }
}
export const saveSettings = (s) => { const { id, ...rest } = s; return C('settings').set('store', rest, true); };

/* ═════════════ catalog ═════════════
   Base catalog = curated products (catalog.js) + the distributor price list (public/catalog.json, ~5,900 items,
   served from the CDN so it costs no database reads). The Firestore `products` collection only holds
   overrides: price/stock edits, hidden or deleted items and products added by staff. */
const IMG_CDN = 'https://e4b4vq9ke3.tenbytecdn.com/image/cache/catalog/';
const CACHE_MS = 10 * 60 * 1000;
let mem = {};
let listPromise = null;
export function invalidateCatalog() { mem = {}; }
const expand = (p) => {
  const specs = (p.specs || []).map((x) => ({ key: x.key || '', value: x.value }));
  return {
    status: 'active', warranty: 'Official brand warranty', tags: [], options: [], featured: false, createdAt: 0,
    ...p,
    soon: !!p.soon, newArrival: !!p.newArrival, deal: !!p.deal, specs,
    images: (p.images || []).map((u) => (u.startsWith('~') ? IMG_CDN + u.slice(1) : u)),
    shortDescription: p.shortDescription || specs.slice(0, 3).map((x) => x.value).join(' · '),
  };
};
function loadPriceList() {
  if (!listPromise) {
    const base = import.meta.env.BASE_URL || '/';
    const get = (f, empty) => fetch(base + f).then((r) => (r.ok ? r.json() : empty)).catch(() => empty);
    listPromise = Promise.all([get('catalog.json', { products: [] }), get('image-map.json', null)])
      .then(([d, map]) => d.products.map((p) => {
        const x = expand(p);
        const ks = map?.items?.[p.id];
        // Own photo gallery (Cloudinary) replaces the single distributor photo when available.
        if (ks?.length) x.images = ks.map((k) => `https://res.cloudinary.com/${map.cloud}/image/upload/f_auto,q_auto,c_limit,w_1200/${map.folder}/${p.id}-${k}`);
        return x;
      }))
      .catch((e) => { console.warn('Price list not available', e); listPromise = null; return []; });
  }
  return listPromise;
}
const withTimeout = (pr, ms) => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
async function readOverrides() {
  try { return await withTimeout(C('products').list(), 8000); }
  catch (e) { console.warn('Product overrides not available', e); return []; }
}
async function readCategories() {
  let extra = [];
  try { extra = await withTimeout(C('categories').list(), 6000); } catch { /* use built-in */ }
  const map = new Map(CATEGORIES.map((c) => [c.id, { ...c }]));
  extra.forEach((c) => map.set(c.id, { ...(map.get(c.id) || {}), ...c }));
  return [...map.values()].sort((a, b) => (a.order || 0) - (b.order || 0));
}
async function merged({ full, all }) {
  const [categories, overrides, list] = await Promise.all([readCategories(), readOverrides(), full ? loadPriceList() : []]);
  const byId = new Map();
  if (!DEMO) PRODUCTS.forEach((p) => byId.set(p.id, { ...p, base: true })); // in demo the curated set lives in the local store
  list.forEach((p) => { if (!byId.has(p.id)) byId.set(p.id, { ...p, base: true }); });
  overrides.forEach((o) => byId.set(o.id, { ...(byId.get(o.id) || {}), ...o }));
  let products = [...byId.values()].filter((p) => p.status !== 'deleted');
  if (!all) products = products.filter((p) => (p.status || 'active') === 'active');
  products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return { t: now(), categories, products, full };
}
/** full=false returns the small curated set fast; full=true adds the whole price list. */
export async function getCatalog({ fresh = false, full = true } = {}) {
  const k = full ? 'full' : 'quick';
  if (!fresh && mem[k] && now() - mem[k].t < CACHE_MS) return mem[k];
  mem[k] = await merged({ full });
  return mem[k];
}
export async function getProductBySlug(slug) {
  const quick = await getCatalog({ full: false });
  return quick.products.find((p) => p.slug === slug) || (await getCatalog()).products.find((p) => p.slug === slug) || null;
}
export const adminListProducts = async () => (await merged({ full: true, all: true })).products;
export const adminGetProduct = async (id) => (await merged({ full: true, all: true })).products.find((p) => p.id === id) || null;
export async function saveProduct(p) {
  const { id, base, ...data } = p; invalidateCatalog(); // eslint-disable-line no-unused-vars
  return C('products').set(id || rid(12), { ...data, updatedAt: now(), createdAt: data.createdAt || now() });
}
export async function deleteProduct(id) {
  invalidateCatalog();
  const inBase = PRODUCTS.some((p) => p.id === id) || (await loadPriceList()).some((p) => p.id === id);
  return inBase ? C('products').set(id, { status: 'deleted', updatedAt: now() }) : C('products').remove(id);
}
export async function saveCategory(c) { const { id, ...data } = c; invalidateCatalog(); return C('categories').set(id, data); }
export async function deleteCategory(id) { invalidateCatalog(); return C('categories').remove(id); }
export async function seedCatalog() { invalidateCatalog(); await bulkSet('categories', CATEGORIES); }

/* ═════════════ coupons ═════════════ */
export async function checkCoupon(code, subtotal) {
  const c = await C('coupons').get(String(code || '').trim().toUpperCase());
  if (!c || !c.active) return { ok: false, msg: 'This code is not valid.' };
  if (c.expiresAt && c.expiresAt < now()) return { ok: false, msg: 'This code has expired.' };
  if (c.minOrder && subtotal < c.minOrder) return { ok: false, msg: `Spend ৳${c.minOrder.toLocaleString('en-IN')} or more to use this code.` };
  const off = c.type === 'percent' ? Math.round((subtotal * c.value) / 100) : c.value;
  return { ok: true, code: c.id, off: Math.min(off, c.maxOff || off, subtotal), label: c.type === 'percent' ? `${c.value}% off` : `৳${c.value} off` };
}

/* ═════════════ orders ═════════════ */
const orderNo = () => 'DB' + Date.now().toString().slice(-7) + Math.floor(100 + Math.random() * 900);
export async function createOrder(o, user) {
  const t = now();
  const order = { ...o, uid: user?.uid || null, phoneKey: phoneKey(o.customer.phone), orderNumber: orderNo(), status: 'pending', paymentStatus: 'pending', createdAt: t, updatedAt: t, history: [{ status: 'pending', at: t, by: 'customer' }] };
  const tracking = { status: 'pending', phoneTail: digits(o.customer.phone).slice(-4), total: o.total, itemCount: o.items.reduce((n, i) => n + i.quantity, 0), createdAt: t, updatedAt: t };
  if (DEMO) { const id = await C('orders').add(order); await C('tracking').set(order.orderNumber, tracking); return { id, orderNumber: order.orderNumber }; }
  const ref = doc(collection(fs, 'orders'));
  const b = writeBatch(fs);
  b.set(ref, order); b.set(doc(fs, 'tracking', order.orderNumber), tracking);
  await b.commit();
  return { id: ref.id, orderNumber: order.orderNumber };
}
export async function trackOrder(no, phone) {
  const n = String(no || '').trim().toUpperCase();
  const t = await C('tracking').get(n);
  if (!t || t.phoneTail !== digits(phone).slice(-4)) return null;
  return { orderNumber: n, ...t };
}
export const myOrders = (uid) => C('orders').list({ where: [['uid', '==', uid]] }).then((r) => r.sort((a, b) => b.createdAt - a.createdAt));
export const adminListOrders = () => C('orders').list({ order: ['createdAt', 'desc'], limit: 1000 });
export async function updateOrder(order, patch, by = 'staff') {
  const t = now();
  const p = { ...patch, updatedAt: t };
  if (patch.status && patch.status !== order.status) p.history = [...(order.history || []), { status: patch.status, at: t, by }];
  await C('orders').update(order.id, p);
  if (patch.status) await C('tracking').update(order.orderNumber, { status: patch.status, updatedAt: t }).catch(() => {});
  return p;
}

/* ═════════════ leads (quote requests) ═════════════ */
export const createQuote = (q) => C('quotes').add({ ...q, phoneKey: phoneKey(q.phone), status: 'new', value: 0, createdAt: now(), updatedAt: now() });
export const adminListQuotes = () => C('quotes').list({ order: ['createdAt', 'desc'], limit: 500 });
export const updateQuote = (id, patch) => C('quotes').update(id, { ...patch, updatedAt: now() });

/* ═════════════ CRM ═════════════ */
// crm/{phoneKey}: { tags:[], notes:[{text, at, by}], owner } — staff only.
export const getCrm = (key) => C('crm').get(key);
export const saveCrm = (key, data) => C('crm').set(key, { ...data, updatedAt: now() }, true);
export const listCrm = () => C('crm').list();

/* ═════════════ chat ═════════════ */
// chats/{id}: { name, phone, uid, status: ai|waiting|open|closed, lastMessage, lastFrom, updatedAt, unreadStaff, assignee }
// chats/{id}/messages: { from: customer|ai|agent|system, text, products:[slug], at, agent }
export const chatCol = () => C('chats');
export const msgCol = (chatId) => C(`chats/${chatId}/messages`);
export async function ensureChat(chatId, info) {
  const cur = await C('chats').get(chatId).catch(() => null);
  if (!cur) await C('chats').set(chatId, { name: info.name || 'Guest', phone: info.phone || '', uid: info.uid || null, status: 'ai', lastMessage: '', lastFrom: '', updatedAt: now(), createdAt: now(), unreadStaff: 0, assignee: '' });
  return chatId;
}
export async function postMessage(chatId, m, chatPatch = {}) {
  const at = now();
  await msgCol(chatId).add({ ...m, at });
  await C('chats').update(chatId, { lastMessage: String(m.text || '').slice(0, 140), lastFrom: m.from, updatedAt: at, ...(m.from === 'customer' ? { unreadStaff: inc(1) } : {}), ...chatPatch });
}

/* ═════════════ users & auth ═════════════ */
export const STAFF_ROLES = ['admin', 'manager', 'sales', 'support'];
const DSESSION = 'd114_demo_session';
const authListeners = new Set();
function demoUser() {
  try { const id = localStorage.getItem(DSESSION); const u = id && demoDB().users[id]; return u ? { uid: id, email: u.email, profile: { ...u, password: undefined } } : null; } catch { return null; }
}
const emitAuth = () => { const u = demoUser(); authListeners.forEach((cb) => cb(u)); };

async function loadProfile(fbUser) {
  const p = await C('users').get(fbUser.uid);
  if (p) return p;
  const profile = { name: fbUser.displayName || '', email: fbUser.email || '', phone: '', role: 'customer', createdAt: now() };
  await C('users').set(fbUser.uid, profile);
  return profile;
}
export function onUser(cb) {
  if (DEMO) { authListeners.add(cb); cb(demoUser()); return () => authListeners.delete(cb); }
  return onAuthStateChanged(auth, async (u) => {
    if (!u) return cb(null);
    try {
      const profile = await loadProfile(u);
      if (profile.disabled) { await signOut(auth); return cb(null); }
      cb({ uid: u.uid, email: u.email, profile });
    } catch { cb({ uid: u.uid, email: u.email, profile: { role: 'customer' } }); }
  });
}
export async function register({ name, email, phone, password }) {
  if (DEMO) {
    const db = demoDB();
    if (Object.values(db.users).some((u) => u.email === email)) throw new Error('An account with this email already exists.');
    const id = rid(12); db.users[id] = { name, email, phone, password, role: 'customer', createdAt: now() };
    localStorage.setItem(DSESSION, id); demoSave(); return emitAuth();
  }
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await C('users').set(cred.user.uid, { name, email, phone, role: 'customer', createdAt: now() });
}
export async function login(email, password) {
  if (DEMO) {
    const hit = Object.entries(demoDB().users).find(([, u]) => u.email === email && u.password === password);
    if (!hit) throw new Error('Email or password is incorrect.');
    if (hit[1].disabled) throw new Error('This account is disabled. Contact Decibel-114.');
    localStorage.setItem(DSESSION, hit[0]); return emitAuth();
  }
  await signInWithEmailAndPassword(auth, email, password);
}
export async function loginWithGoogle() {
  if (DEMO) throw new Error('Google sign-in works on the live site.');
  await signInWithPopup(auth, new GoogleAuthProvider());
}
export async function logout() { if (DEMO) { localStorage.removeItem(DSESSION); return emitAuth(); } await signOut(auth); }
export async function resetPassword(email) { if (!DEMO) await sendPasswordResetEmail(auth, email); }
export async function changeMyPassword(user, pw) {
  if (DEMO) { const u = demoDB().users[user.uid]; if (u) { u.password = pw; u.mustChangePassword = false; demoSave(); } return emitAuth(); }
  await updatePassword(auth.currentUser, pw);
  await C('users').update(user.uid, { mustChangePassword: false });
}
export async function updateMyProfile(user, patch) {
  await C('users').update(user.uid, { name: patch.name || '', phone: patch.phone || '', address: patch.address || '' });
  if (DEMO) emitAuth();
}
export const adminListUsers = () => C('users').list({ order: ['createdAt', 'desc'], limit: 2000 }).then((r) => r.map(({ password, ...u }) => u));
export const adminUpdateUser = (id, patch) => C('users').update(id, patch);
const tempPw = () => rid(10);
export async function adminCreateUser({ name, email, phone, role = 'customer', company = '' }) {
  const password = tempPw();
  if (DEMO) {
    const db = demoDB();
    if (Object.values(db.users).some((u) => u.email === email)) throw new Error('An account with this email already exists.');
    db.users[rid(12)] = { name, email, phone, company, role, password, mustChangePassword: true, createdAt: now() }; demoSave();
    return password;
  }
  const uid = await withSecondaryAuth(async (a2) => {
    const cred = await createUserWithEmailAndPassword(a2, email, password);
    await updateProfile(cred.user, { displayName: name });
    return cred.user.uid;
  });
  await C('users').set(uid, { name, email, phone, company, role, mustChangePassword: true, createdBy: auth.currentUser?.uid || '', createdAt: now() });
  return password;
}

export function errText(e) {
  const map = {
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/user-not-found': 'No account uses this email.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Use at least 6 characters for the password.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
    'auth/requires-recent-login': 'Sign in again, then change your password.',
    'auth/popup-closed-by-user': 'Google sign-in was closed before it finished.',
    'auth/unauthorized-domain': 'Google sign-in is not enabled for this web address yet.',
    'permission-denied': 'Your account does not have permission for this.',
  };
  return map[e?.code] || e?.message || 'Something went wrong. Try again.';
}
export const adminSendReset = (email) => resetPassword(email);
