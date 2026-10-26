const env = import.meta.env;

export const SITE = {
  name: 'Decibel-114',
  phone: env.VITE_PHONE || '',
  whatsapp: (env.VITE_WHATSAPP || env.VITE_PHONE || '').replace(/[^\d]/g, ''),
  email: env.VITE_EMAIL || '',
  address: env.VITE_ADDRESS || '',
  hours: env.VITE_HOURS || '',
  freeShippingOver: 10000,
  shippingInsideDhaka: 80,
  shippingOutsideDhaka: 150,
  returnDays: 7,
  payments: { bkash: env.VITE_BKASH || '', nagad: env.VITE_NAGAD || '', bank: env.VITE_BANK || '' },
};

export const CLOUDINARY = { cloud: env.VITE_CLOUDINARY_CLOUD || '', preset: env.VITE_CLOUDINARY_PRESET || '' };

export const PAYMENT_METHODS = [
  { v: 'cod', l: 'Cash on delivery', s: 'Pay when the parcel arrives', info: '' },
  { v: 'bkash', l: 'bKash', s: 'Send money, then add the transaction ID', info: SITE.payments.bkash },
  { v: 'nagad', l: 'Nagad', s: 'Send money, then add the transaction ID', info: SITE.payments.nagad },
  { v: 'bank', l: 'Bank transfer', s: 'For corporate orders', info: SITE.payments.bank },
].filter((m) => m.v === 'cod' || m.info);

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export const money = (n) => '৳' + Math.round(Number(n || 0)).toLocaleString('en-IN');
export const telHref = (p) => 'tel:' + String(p || '').replace(/[^\d+]/g, '');
export const waHref = (text = '') =>
  SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}` : '';
export const slugify = (s) =>
  String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

// Hash URLs (#/shop) are only for static previews; Vercel uses normal URLs.
export const HASH = import.meta.env.VITE_HASH_ROUTER === '1';
