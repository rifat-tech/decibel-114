// Image uploads from the admin panel. With Cloudinary configured, photos go there. Without it,
// the photo is resized and compressed in the browser and stored inline (a data: URL), which
// works with no extra service. Inline photos are kept small so a Firestore document stays
// well under its 1 MB limit.
import { CLOUDINARY } from '../config';

function readImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('That file is not an image the browser can read.')); };
    img.src = url;
  });
}

/** Resize to fit `max` px and encode as WebP. Returns a data: URL. */
export async function compressImage(file, { max = 1200, quality = 0.78, square = false } = {}) {
  const img = await readImage(file);
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
  const S = square ? Math.max(w, h) : 0;
  const c = document.createElement('canvas');
  c.width = S || w; c.height = S || h;
  const g = c.getContext('2d');
  if (square) { g.fillStyle = '#fff'; g.fillRect(0, 0, S, S); }
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, square ? (S - w) / 2 : 0, square ? (S - h) / 2 : 0, w, h);
  return c.toDataURL('image/webp', quality);
}

async function toCloudinary(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY.preset);
  fd.append('folder', 'decibel114');
  const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY.cloud}/image/upload`, { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || 'Upload failed');
  return j.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_1200/');
}

/** Upload one image. `kind` sets the size: 'product' (square, white), 'photo' (cards), 'hero' (wide banners). */
export async function uploadImage(file, kind = 'photo') {
  if (CLOUDINARY.cloud && CLOUDINARY.preset) return toCloudinary(file);
  if (kind === 'product') return compressImage(file, { max: 1000, quality: 0.8, square: true });
  if (kind === 'hero') return compressImage(file, { max: 1600, quality: 0.66 });
  return compressImage(file, { max: 900, quality: 0.72 });
}

export const sizeKB = (obj) => Math.round(new Blob([JSON.stringify(obj)]).size / 1024);
