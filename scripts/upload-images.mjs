// Uploads the product photo folder to Cloudinary and writes public/image-map.json for the website.
//
// Usage (Windows PowerShell, inside the project folder):
//   $env:CLOUDINARY_URL = "cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
//   node scripts/upload-images.mjs "C:\Users\Rifat Ahsan\Pictures\Decibel_Picture\Website Images"
//
// Folder layout: <category>\<NNNN product name>\<NNNN - product name - k>.jpg
// NNNN is the row number in "Decibel-114 full product list with images.xlsx".
// Safe to stop and run again: finished uploads are remembered in scripts/upload-progress.json.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.argv[2];
const url = process.env.CLOUDINARY_URL || '';
const m = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
if (!root || !m) {
  console.error('Set CLOUDINARY_URL and pass the photo folder.\nExample:\n  $env:CLOUDINARY_URL = "cloudinary://KEY:SECRET@CLOUD"\n  node scripts/upload-images.mjs "C:\\Users\\...\\Website Images"');
  process.exit(1);
}
const [, KEY, SECRET, CLOUD] = m;
const here = path.dirname(fileURLToPath(import.meta.url));
const numbers = JSON.parse(await readFile(path.join(here, 'image-numbers.json'), 'utf8'));
const progressFile = path.join(here, 'upload-progress.json');
const done = existsSync(progressFile) ? JSON.parse(await readFile(progressFile, 'utf8')) : {};

// Collect jobs
const jobs = [];
for (const cat of await readdir(root, { withFileTypes: true })) {
  if (!cat.isDirectory()) continue;
  for (const prod of await readdir(path.join(root, cat.name), { withFileTypes: true })) {
    if (!prod.isDirectory()) continue;
    const num = parseInt(prod.name.slice(0, 4), 10);
    const id = numbers[num];
    if (!id) continue; // curated items (1-87) already ship with the site
    for (const f of await readdir(path.join(root, cat.name, prod.name))) {
      const k = f.match(/ - (\d+)\.(jpe?g|png|webp)$/i)?.[1];
      if (!k) continue;
      jobs.push({ id, k: Number(k), file: path.join(root, cat.name, prod.name, f), publicId: `decibel114/${id}-${k}` });
    }
  }
}
const todo = jobs.filter((j) => !done[j.publicId]);
console.log(`${jobs.length} photos found, ${jobs.length - todo.length} already uploaded, ${todo.length} to go.`);

async function upload(j) {
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `overwrite=true&public_id=${j.publicId}&timestamp=${timestamp}${SECRET}`;
  const signature = createHash('sha1').update(toSign).digest('hex');
  const fd = new FormData();
  fd.append('file', new Blob([await readFile(j.file)]), path.basename(j.file));
  fd.append('api_key', KEY);
  fd.append('timestamp', String(timestamp));
  fd.append('public_id', j.publicId);
  fd.append('overwrite', 'true');
  fd.append('signature', signature);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: fd });
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
}

let n = 0, failed = 0, i = 0;
const started = Date.now();
async function worker() {
  while (i < todo.length) {
    const j = todo[i++];
    for (let attempt = 1; attempt <= 3; attempt++) {
      try { await upload(j); done[j.publicId] = 1; break; }
      catch (e) { if (attempt === 3) { failed++; console.warn('Failed:', j.file, e.message); } else await new Promise((r) => setTimeout(r, 1500 * attempt)); }
    }
    if (++n % 50 === 0 || n === todo.length) {
      await writeFile(progressFile, JSON.stringify(done));
      const mins = ((Date.now() - started) / 60000).toFixed(1);
      console.log(`${n}/${todo.length} processed (${mins} min)`);
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
await writeFile(progressFile, JSON.stringify(done));

// Build the map the website reads: { cloud, folder, items: { productId: [1, 2, 3] } }
const items = {};
for (const j of jobs) if (done[j.publicId]) (items[j.id] ||= []).push(j.k);
for (const id in items) items[id].sort((a, b) => a - b);
const out = path.join(here, '..', 'public', 'image-map.json');
await writeFile(out, JSON.stringify({ cloud: CLOUD, folder: 'decibel114', items }));
console.log(`\nDone. ${Object.keys(items).length} products have photos. ${failed} failed (run again to retry).`);
console.log(`Wrote ${out}. Send this file to Claude, or commit and push it.`);
