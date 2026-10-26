// One data layer for the whole app. With Firebase keys it talks to Firestore/Auth;
// without them it runs a "demo" store in localStorage so the site still works.
import { DEMO, auth, fs, withSecondaryAuth } from './firebase';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from './demoData';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, writeBatch,
} from 'firebase/firestore';
import {
  onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, updatePassword, updateProfile,
} from 'firebase/auth';

export { DEMO };

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const now = () => Date.now();
const digits = (s) => String(s || '').replace(/\D/g, '');
const list = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

/* ───────────── demo store ───────────── */
const DKEY = 'gx_demo_v2';
function demoLoad() {
  try {
    const s = JSON.parse(localStorage.getItem(DKEY));
    if (s && s.products) return s;
  } catch { /* fresh store */ }
  const fresh = {
    categories: DEMO_CATEGORIES, products: DEMO_PRODUCTS, orders: [], quotes: [], tracking: {},
    users: [{ id: 'demo-admin', name: 'Demo Admin', email: 'admin@decibel114.demo', password: 'admin123', role: 'admin', createdAt: now() }],
  };
  demoSave(fresh);
  return fresh;
}
function demoSave(s) { try { localStorage.setItem(DKEY, JSON.stringify(s)); } catch { /* storage full or blocked */ } }
function demoMut(fn) { const s = demoLoad(); const r = fn(s); demoSave(s); return r; }
const wait = (v) => new Promise((r) => setTimeout(() => r(v), 120));

/* ───────────── catalog cache (saves free Firestore reads) ───────────── */
const CKEY = 'gx_catalog_cache_v2';
const CACHE_MS = 10 * 60 * 1000;
let mem = null;
function cacheGet() {
  if (mem && now() - mem.t < CACHE_MS) return mem;
  try {
    const c = JSON.parse(sessionStorage.getItem(CKEY));
    if (c && now() - c.t < CACHE_MS) return (mem = c);
  } catch { /* ignore */ }
  return null;
}
function cacheSet(data) { mem = { t: now(), ...data }; try { sessionStorage.setItem(CKEY, JSON.stringify(mem)); } catch { /* ignore */ } }
export function invalidateCatalog() { mem = null; try { sessionStorage.removeItem(CKEY); } catch { /* ignore */ } }

/* ───────────── catalog ───────────── */
export async function getCatalog({ fresh = false } = {}) {
  if (!fresh) { const c = cacheGet(); if (c) return { categories: c.categories, products: c.products }; }
  let categories, products;
  if (DEMO) {
    const s = demoLoad();
    categories = s.categories; products = s.products.filter((p) => p.status === 'active');
    await wait();
  } else {
    const [c, p] = await Promise.all([
      getDocs(collection(fs, 'categories')),
      getDocs(query(collection(fs, 'products'), where('status', '==', 'active'))),
    ]);
    categories = list(c); products = list(p);
  }
  categories.sort((a, b) => (a.order || 0) - (b.order || 0));
  products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  cacheSet({ categories, products });
  return { categories, products };
}

export async function getProductBySlug(slug) {
  const { products } = await getCatalog();
  const hit = products.find((p) => p.slug === slug);
  if (hit || DEMO) return hit || null;
  const snap = await getDocs(query(collection(fs, 'products'), where('slug', '==', slug), where('status', '==', 'active'), limit(1)));
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

/* admin catalog */
export async function adminListProducts() {
  if (DEMO) return wait([...demoLoad().products].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
  const snap = await getDocs(query(collection(fs, 'products'), orderBy('createdAt', 'desc')));
  return list(snap);
}
export async function adminGetProduct(id) {
  if (DEMO) return wait(demoLoad().products.find((p) => p.id === id) || null);
  const d = await getDoc(doc(fs, 'products', id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}
export async function saveProduct(p) {
  const id = p.id || uid();
  const data = { ...p, id: undefined, updatedAt: now(), createdAt: p.createdAt || now() };
  delete data.id;
  invalidateCatalog();
  if (DEMO) return demoMut((s) => {
    const i = s.products.findIndex((x) => x.id === id);
    if (i >= 0) s.products[i] = { id, ...data }; else s.products.unshift({ id, ...data });
    return id;
  });
  await setDoc(doc(fs, 'products', id), data);
  return id;
}
export async function deleteProduct(id) {
  invalidateCatalog();
  if (DEMO) return demoMut((s) => { s.products = s.products.filter((p) => p.id !== id); });
  await deleteDoc(doc(fs, 'products', id));
}
export async function saveCategory(c) {
  const id = c.id || uid();
  const data = { ...c }; delete data.id;
  invalidateCatalog();
  if (DEMO) return demoMut((s) => {
    const i = s.categories.findIndex((x) => x.id === id);
    if (i >= 0) s.categories[i] = { id, ...data }; else s.categories.push({ id, ...data });
    return id;
  });
  await setDoc(doc(fs, 'categories', id), data);
  return id;
}
export async function deleteCategory(id) {
  invalidateCatalog();
  if (DEMO) return demoMut((s) => { s.categories = s.categories.filter((c) => c.id !== id); });
  await deleteDoc(doc(fs, 'categories', id));
}

/** Writes the starter categories + products into Firestore (admin only). */
export async function seedCatalog() {
  invalidateCatalog();
  if (DEMO) { localStorage.removeItem(DKEY); demoLoad(); return; }
  const batch = writeBatch(fs);
  DEMO_CATEGORIES.forEach(({ id, ...c }) => batch.set(doc(fs, 'categories', id), c));
  DEMO_PRODUCTS.forEach(({ id, ...p }) => batch.set(doc(fs, 'products', id), { ...p, createdAt: now() - Math.floor(Math.random() * 9e8) }));
  await batch.commit();
}

/* ───────────── orders ───────────── */
const orderNo = () => 'DB' + Date.now().toString().slice(-7) + Math.floor(100 + Math.random() * 900);

export async function createOrder(o, user) {
  const order = { ...o, uid: user?.uid || null, orderNumber: orderNo(), status: 'pending', paymentStatus: 'pending', createdAt: now(), updatedAt: now() };
  const tracking = {
    status: 'pending', phoneTail: digits(o.customer.phone).slice(-4), total: o.total,
    itemCount: o.items.reduce((n, i) => n + i.quantity, 0), createdAt: order.createdAt, updatedAt: order.createdAt,
  };
  if (DEMO) return demoMut((s) => {
    const id = uid();
    s.orders.unshift({ id, ...order });
    s.tracking[order.orderNumber] = tracking;
    return { id, orderNumber: order.orderNumber };
  });
  const ref = doc(collection(fs, 'orders'));
  const batch = writeBatch(fs);
  batch.set(ref, order);
  batch.set(doc(fs, 'tracking', order.orderNumber), tracking);
  await batch.commit();
  return { id: ref.id, orderNumber: order.orderNumber };
}
export async function trackOrder(orderNumber, phone) {
  const no = String(orderNumber || '').trim().toUpperCase();
  let t = null;
  if (DEMO) t = demoLoad().tracking[no] || null;
  else { const d = await getDoc(doc(fs, 'tracking', no)); t = d.exists() ? d.data() : null; }
  if (!t || t.phoneTail !== digits(phone).slice(-4)) return null;
  return { orderNumber: no, ...t };
}
export async function myOrders(userId) {
  if (DEMO) return wait(demoLoad().orders.filter((o) => o.uid === userId));
  const snap = await getDocs(query(collection(fs, 'orders'), where('uid', '==', userId)));
  return list(snap).sort((a, b) => b.createdAt - a.createdAt);
}
export async function adminListOrders() {
  if (DEMO) return wait(demoLoad().orders);
  const snap = await getDocs(query(collection(fs, 'orders'), orderBy('createdAt', 'desc'), limit(500)));
  return list(snap);
}
export async function updateOrder(order, patch) {
  const p = { ...patch, updatedAt: now() };
  if (DEMO) return demoMut((s) => {
    const o = s.orders.find((x) => x.id === order.id); if (o) Object.assign(o, p);
    if (p.status && s.tracking[order.orderNumber]) Object.assign(s.tracking[order.orderNumber], { status: p.status, updatedAt: p.updatedAt });
  });
  const batch = writeBatch(fs);
  batch.update(doc(fs, 'orders', order.id), p);
  if (p.status) batch.update(doc(fs, 'tracking', order.orderNumber), { status: p.status, updatedAt: p.updatedAt });
  await batch.commit();
}

/* ───────────── quotes (B2B) ───────────── */
export async function createQuote(q) {
  const data = { ...q, status: 'new', createdAt: now() };
  if (DEMO) return demoMut((s) => { s.quotes.unshift({ id: uid(), ...data }); });
  await setDoc(doc(collection(fs, 'quotes')), data);
}
export async function adminListQuotes() {
  if (DEMO) return wait(demoLoad().quotes);
  const snap = await getDocs(query(collection(fs, 'quotes'), orderBy('createdAt', 'desc'), limit(300)));
  return list(snap);
}
export async function updateQuote(id, patch) {
  if (DEMO) return demoMut((s) => { const q = s.quotes.find((x) => x.id === id); if (q) Object.assign(q, patch); });
  await updateDoc(doc(fs, 'quotes', id), patch);
}

/* ───────────── users & auth ───────────── */
const DSESSION = 'gx_demo_session';
const demoListeners = new Set();
function demoCurrent() {
  try { const id = localStorage.getItem(DSESSION); return id ? demoLoad().users.find((u) => u.id === id) || null : null; } catch { return null; }
}
const toDemoUser = (u) => (u ? { uid: u.id, email: u.email, profile: { ...u, password: undefined } } : null);
function demoEmit() { const u = toDemoUser(demoCurrent()); demoListeners.forEach((cb) => cb(u)); }

async function loadProfile(fbUser) {
  const ref = doc(fs, 'users', fbUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  const profile = { name: fbUser.displayName || '', email: fbUser.email || '', phone: '', role: 'customer', createdAt: now() };
  await setDoc(ref, profile);
  return profile;
}

/** cb receives { uid, email, profile } or null */
export function onUser(cb) {
  if (DEMO) { demoListeners.add(cb); cb(toDemoUser(demoCurrent())); return () => demoListeners.delete(cb); }
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
    demoMut((s) => {
      if (s.users.some((u) => u.email === email)) throw new Error('An account with this email already exists.');
      const u = { id: uid(), name, email, phone, password, role: 'customer', createdAt: now() };
      s.users.push(u); localStorage.setItem(DSESSION, u.id);
    });
    return demoEmit();
  }
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(fs, 'users', cred.user.uid), { name, email, phone, role: 'customer', createdAt: now() });
}

export async function login(email, password) {
  if (DEMO) {
    const u = demoLoad().users.find((x) => x.email === email && x.password === password);
    if (!u) throw new Error('Email or password is incorrect.');
    if (u.disabled) throw new Error('This account is disabled. Contact Decibel-114.');
    localStorage.setItem(DSESSION, u.id); return demoEmit();
  }
  await signInWithEmailAndPassword(auth, email, password);
}
export async function loginWithGoogle() {
  if (DEMO) throw new Error('Google sign-in works after Firebase is connected.');
  await signInWithPopup(auth, new GoogleAuthProvider());
}
export async function logout() {
  if (DEMO) { localStorage.removeItem(DSESSION); return demoEmit(); }
  await signOut(auth);
}
export async function resetPassword(email) {
  if (DEMO) return;
  await sendPasswordResetEmail(auth, email);
}
export async function changeMyPassword(user, newPassword) {
  if (DEMO) { demoMut((s) => { const u = s.users.find((x) => x.id === user.uid); if (u) { u.password = newPassword; u.mustChangePassword = false; } }); return demoEmit(); }
  await updatePassword(auth.currentUser, newPassword);
  await updateDoc(doc(fs, 'users', user.uid), { mustChangePassword: false });
}
export async function updateMyProfile(user, patch) {
  const safe = { name: patch.name, phone: patch.phone, address: patch.address || '' };
  if (DEMO) { demoMut((s) => { const u = s.users.find((x) => x.id === user.uid); if (u) Object.assign(u, safe); }); return demoEmit(); }
  await updateDoc(doc(fs, 'users', user.uid), safe);
}

/* admin: people */
export async function adminListUsers() {
  if (DEMO) return wait(demoLoad().users.map((u) => ({ ...u, password: undefined })));
  return list(await getDocs(query(collection(fs, 'users'), orderBy('createdAt', 'desc'), limit(1000))));
}
const tempPassword = () => {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  return Array.from(crypto.getRandomValues(new Uint32Array(10)), (n) => a[n % a.length]).join('');
};
/** Creates a login for someone else. Returns the temporary password to share with them. */
export async function adminCreateUser({ name, email, phone, role = 'customer', company = '' }) {
  const password = tempPassword();
  if (DEMO) {
    demoMut((s) => {
      if (s.users.some((u) => u.email === email)) throw new Error('An account with this email already exists.');
      s.users.unshift({ id: uid(), name, email, phone, company, role, password, mustChangePassword: true, createdAt: now() });
    });
    return password;
  }
  const newUid = await withSecondaryAuth(async (a2) => {
    const cred = await createUserWithEmailAndPassword(a2, email, password);
    await updateProfile(cred.user, { displayName: name });
    return cred.user.uid;
  });
  await setDoc(doc(fs, 'users', newUid), { name, email, phone, company, role, mustChangePassword: true, createdBy: auth.currentUser?.uid || '', createdAt: now() });
  return password;
}
export async function adminUpdateUser(id, patch) {
  if (DEMO) return demoMut((s) => { const u = s.users.find((x) => x.id === id); if (u) Object.assign(u, patch); });
  await updateDoc(doc(fs, 'users', id), patch);
}
export async function adminSendReset(email) { return resetPassword(email); }

/* friendly Firebase error text */
export function errText(e) {
  const c = e?.code || '';
  const map = {
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/user-not-found': 'No account uses this email.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Use at least 6 characters for the password.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
    'auth/requires-recent-login': 'Sign in again, then change your password.',
    'auth/popup-closed-by-user': 'Google sign-in was closed before finishing.',
    'permission-denied': 'Your account does not have permission for this.',
  };
  return map[c] || e?.message || 'Something went wrong. Try again.';
}
