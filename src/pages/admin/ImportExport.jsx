import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { LuDownload, LuUpload } from 'react-icons/lu';
import { Spinner, useTitle } from '../../components/ui';
import { adminListProducts, bulkSet, errText, invalidateCatalog, rid } from '../../lib/db';
import { useStore } from '../../context/StoreContext';
import { slugify } from '../../config';

const COLS = ['sku', 'name', 'brand', 'category', 'type', 'price', 'regular_price', 'stock', 'warranty', 'short_description', 'description', 'specs', 'image_urls', 'variants', 'tags', 'featured', 'new', 'deal', 'status'];
const SAMPLE = ['MU7A3', 'iPhone 17 Pro Max', 'Apple', 'phone', 'iPhone', '195000', '249999', '5', '1 year Apple warranty', 'Flagship iPhone with triple 48MP cameras.', '', 'Display: 6.9" OLED 120Hz; Chip: A19 Pro', 'https://example.com/iphone-front.jpg|https://example.com/iphone-back.jpg', 'Storage: 256GB=195000|512GB=220000', 'iphone 17, pro max', 'yes', 'no', 'yes', 'active'];

function parseCSV(text) {
  const rows = []; let row = []; let cell = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}
const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const yes = (v) => /^(1|y|yes|true)$/i.test(String(v || '').trim());
const num = (v) => Number(String(v || '').replace(/[^\d.]/g, '')) || 0;
function download(name, text) {
  const url = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }));
  Object.assign(document.createElement('a'), { href: url, download: name }).click();
}

export default function ImportExport() {
  useTitle('Import & export');
  const { categories, reload } = useStore();
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  const catOf = useMemo(() => { const m = {}; categories.forEach((c) => { m[c.id.toLowerCase()] = c.id; m[c.name.toLowerCase()] = c.id; }); return (v) => m[String(v || '').trim().toLowerCase()] || ''; }, [categories]);

  const onFile = async (file) => {
    if (!file) return;
    const data = parseCSV(await file.text());
    if (data.length < 2) return toast.error('The file has no product rows.');
    const head = data[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const existing = await adminListProducts().catch(() => []);
    const bySku = Object.fromEntries(existing.filter((p) => p.sku).map((p) => [p.sku.toLowerCase(), p]));
    const bySlug = Object.fromEntries(existing.map((p) => [p.slug, p]));
    const parsed = data.slice(1).map((r, i) => {
      const o = Object.fromEntries(head.map((h, k) => [h, (r[k] || '').trim()]));
      const slug = slugify(o.name);
      const prev = (o.sku && bySku[o.sku.toLowerCase()]) || bySlug[slug];
      const errors = [];
      if (!o.name) errors.push('name missing');
      const categoryId = catOf(o.category);
      if (!categoryId) errors.push(`unknown category “${o.category}”`);
      const [vName, vList] = String(o.variants || '').includes(':') ? o.variants.split(/:(.+)/) : ['Option', o.variants];
      const values = String(vList || '').split('|').map((x) => x.split('=')).filter(([a, b]) => a && num(b)).map(([a, b]) => ({ label: a.trim(), price: num(b) }));
      return {
        line: i + 2, errors, update: !!prev,
        product: {
          ...(prev || {}),
          id: prev?.id || rid(12), name: o.name, slug: prev?.slug || slug, sku: o.sku || prev?.sku || '', brand: o.brand || prev?.brand || '', categoryId, subcategory: o.type || '',
          price: num(o.price), originalPrice: num(o.regular_price), stock: o.stock === '' ? prev?.stock ?? 0 : num(o.stock), warranty: o.warranty || prev?.warranty || '',
          shortDescription: o.short_description || prev?.shortDescription || '', description: o.description || o.short_description || prev?.description || '',
          specs: o.specs ? o.specs.split(';').map((x) => x.split(/:(.+)/)).filter(([k, v]) => k && v).map(([k, v]) => ({ key: k.trim(), value: v.trim() })) : prev?.specs || [],
          images: o.image_urls ? o.image_urls.split('|').map((x) => x.trim()).filter((x) => /^https?:\/\//.test(x)) : prev?.images || [],
          options: values.length ? [{ name: vName.trim() || 'Option', values }] : prev?.options || [],
          tags: o.tags ? o.tags.split(',').map((x) => x.trim()).filter(Boolean) : prev?.tags || [],
          featured: o.featured ? yes(o.featured) : !!prev?.featured, newArrival: o.new ? yes(o.new) : !!prev?.newArrival, deal: o.deal ? yes(o.deal) : !!prev?.deal,
          status: ['active', 'draft', 'inactive'].includes(o.status) ? o.status : prev?.status || 'active',
          createdAt: prev?.createdAt || Date.now(), updatedAt: Date.now(),
        },
      };
    });
    setRows(parsed);
  };

  const run = async () => {
    const ok = rows.filter((r) => !r.errors.length).map((r) => r.product);
    setBusy(true);
    try { await bulkSet('products', ok); invalidateCatalog(); await reload(); toast.success(`${ok.length} products imported`); setRows(null); }
    catch (e) { toast.error(errText(e)); } finally { setBusy(false); }
  };
  const exportAll = async () => {
    const ps = await adminListProducts();
    const lines = ps.map((p) => [p.sku, p.name, p.brand, p.categoryId, p.subcategory, p.price, p.originalPrice, p.stock, p.warranty, p.shortDescription, p.description,
      (p.specs || []).map((s) => `${s.key}: ${s.value}`).join('; '), (p.images || []).join('|'),
      p.options?.[0] ? `${p.options[0].name}: ${p.options[0].values.map((v) => `${v.label}=${v.price}`).join('|')}` : '',
      (p.tags || []).join(', '), p.featured ? 'yes' : 'no', p.newArrival ? 'yes' : 'no', p.deal ? 'yes' : 'no', p.status].map(cell).join(','));
    download(`decibel-114-products-${new Date().toISOString().slice(0, 10)}.csv`, [COLS.join(','), ...lines].join('\n'));
  };

  const good = rows?.filter((r) => !r.errors.length) || [];
  return (
    <div className="admin-page">
      <div className="page-head"><div><h1>Import & export</h1><p className="muted">Add or update hundreds of products at once with a spreadsheet. Rows match existing products by SKU, then by name.</p></div></div>
      <div className="admin-grid even">
        <section className="panel">
          <h2>1. Get the template</h2>
          <p className="muted">Open it in Excel or Google Sheets, fill one product per row, then save as CSV.</p>
          <div className="row-gap">
            <button className="btn btn-ghost" onClick={() => download('decibel-114-template.csv', [COLS.join(','), SAMPLE.map(cell).join(',')].join('\n'))}><LuDownload /> Download template</button>
            <button className="btn btn-ghost" onClick={exportAll}><LuDownload /> Export all products</button>
          </div>
          <ul className="help-list">
            <li><b>category</b>: one of {categories.map((c) => c.id).join(', ')}</li>
            <li><b>specs</b>: “Key: Value; Key: Value”</li>
            <li><b>image_urls</b>: full links separated by “|” (Cloudinary, Google Drive public links or your brand’s press kit)</li>
            <li><b>variants</b>: “Storage: 256GB=195000|512GB=220000”</li>
            <li><b>featured, new, deal</b>: yes or no. <b>status</b>: active, draft or inactive</li>
          </ul>
        </section>
        <section className="panel">
          <h2>2. Upload the CSV</h2>
          <label className="img-drop wide"><LuUpload /><span>Choose a CSV file</span><input type="file" accept=".csv,text/csv" hidden onChange={(e) => onFile(e.target.files[0])} /></label>
          {busy && <Spinner />}
        </section>
      </div>
      {rows && (
        <section className="panel">
          <div className="panel-head">
            <h2>3. Check and import</h2>
            <div className="row-gap"><span className="muted">{good.filter((r) => r.update).length} updates, {good.filter((r) => !r.update).length} new, {rows.length - good.length} with errors</span>
              <button className="btn btn-primary" disabled={!good.length || busy} onClick={run}>Import {good.length} products</button></div>
          </div>
          <div className="table-wrap flat">
            <table className="table compact"><thead><tr><th>Row</th><th>Product</th><th>Category</th><th className="num">Price</th><th className="num">Stock</th><th>Result</th></tr></thead><tbody>
              {rows.map((r) => (
                <tr key={r.line} className={r.errors.length ? 'error-row' : ''}>
                  <td>{r.line}</td><td>{r.product.name}<br /><small>{r.product.brand}</small></td><td>{r.product.categoryId || '—'}</td>
                  <td className="num">{r.product.price || '—'}</td><td className="num">{r.product.stock}</td>
                  <td>{r.errors.length ? <span className="danger-text">{r.errors.join(', ')}</span> : r.update ? 'Update' : 'New'}</td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </section>
      )}
    </div>
  );
}
