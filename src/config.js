const env = import.meta.env;

export const CLOUDINARY = { cloud: env.VITE_CLOUDINARY_CLOUD || '', preset: env.VITE_CLOUDINARY_PRESET || '' };
export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
export const STATUS_LABEL = { pending: 'New', confirmed: 'Confirmed', processing: 'Packing', shipped: 'On the way', delivered: 'Delivered', cancelled: 'Cancelled' };
export const LEAD_STAGES = [['new', 'New'], ['contacted', 'Contacted'], ['quoted', 'Quote sent'], ['won', 'Won'], ['lost', 'Lost']];

export const money = (n) => '৳' + Math.round(Number(n || 0)).toLocaleString('en-IN');
export const telHref = (p) => 'tel:' + String(p || '').replace(/[^\d+]/g, '');
export const waLink = (number, text = '') => {
  const d = String(number || '').replace(/\D/g, '');
  if (!d) return '';
  const full = d.length === 11 && d.startsWith('0') ? '88' + d : d;
  return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};
export const slugify = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
export const paymentMethods = (s) => [
  { v: 'cod', l: 'Cash on delivery', s: 'Pay when the parcel arrives', info: '' },
  { v: 'bkash', l: 'bKash', s: 'Send money, then add the transaction ID', info: s.bkash },
  { v: 'nagad', l: 'Nagad', s: 'Send money, then add the transaction ID', info: s.nagad },
  { v: 'bank', l: 'Bank transfer', s: 'For corporate orders', info: s.bank },
].filter((m) => m.v === 'cod' || m.info);
export const discountPct = (p) => (p.originalPrice > p.price && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0);

// Hash URLs (#/shop) are only for static previews; the live site uses normal URLs.
export const HASH = env.VITE_HASH_ROUTER === '1';

/** No price + not flagged "soon" means the price is given on request (corporate/project items). */
export const priceText = (p) => (p.price ? money(p.price) : p.soon ? 'Coming soon' : 'Price on request');
export const quoteLink = (p) => `/quote?items=${encodeURIComponent(`${p.name} x 1`)}`;
