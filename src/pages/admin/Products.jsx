import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuPlus, LuTrash2, LuUpload, LuX, LuArrowUp } from 'react-icons/lu';
import DeviceArt, { ART_TYPES, ProductVisual } from '../../components/DeviceArt';
import { Field, Spinner, useTitle } from '../../components/ui';
import { adminGetProduct, adminListProducts, deleteProduct, errText, saveProduct } from '../../lib/db';
import { useCatalog } from '../../context/StoreContext';
import { CLOUDINARY, money, slugify } from '../../config';

export function AdminProducts() {
  useTitle('Products');
  const { catById, categories, reload } = useCatalog();
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [sel, setSel] = useState([]);
  const [limit, setLimit] = useState(100);
  const bulk = async (patch) => {
    const list = (items || []).filter((p) => sel.includes(p.id));
    try { for (const p of list) await saveProduct({ ...p, ...patch }); setItems((cur) => cur.map((x) => (sel.includes(x.id) ? { ...x, ...patch } : x))); reload(); toast.success(`${list.length} products updated`); setSel([]); }
    catch (e) { toast.error(errText(e)); }
  };
  const load = () => adminListProducts().then(setItems).catch((e) => { toast.error(errText(e)); setItems([]); });
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => (items || []).filter((p) => (!cat || p.categoryId === cat) && (!q || `${p.name} ${p.brand} ${p.sku || ''}`.toLowerCase().includes(q.toLowerCase()))), [items, q, cat]);

  const quick = async (p, patch) => {
    try { await saveProduct({ ...p, ...patch }); setItems((cur) => cur.map((x) => (x.id === p.id ? { ...x, ...patch } : x))); reload(); }
    catch (e) { toast.error(errText(e)); }
  };
  const remove = async (p) => {
    if (!window.confirm(`Delete “${p.name}”? This cannot be undone. To hide it instead, set it to Hidden.`)) return;
    try { await deleteProduct(p.id); setItems((cur) => cur.filter((x) => x.id !== p.id)); reload(); toast.success('Product deleted'); }
    catch (e) { toast.error(errText(e)); }
  };

  return (
    <div className="admin-page">
      <div className="panel-head"><h1>Products</h1><div className="row-gap"><Link to="/admin/import" className="btn btn-ghost">Import CSV</Link><Link to="/admin/products/new" className="btn btn-primary"><LuPlus /> Add product</Link></div></div>
      <div className="toolbar">
        <input placeholder="Search name, brand or SKU" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {sel.length > 0 && (
        <div className="bulkbar">
          <b>{sel.length} selected</b>
          <button className="btn btn-ghost btn-sm" onClick={() => bulk({ status: 'active' })}>Make live</button>
          <button className="btn btn-ghost btn-sm" onClick={() => bulk({ status: 'inactive' })}>Hide</button>
          <button className="btn btn-ghost btn-sm" onClick={() => bulk({ deal: true })}>Mark as deal</button>
          <button className="btn btn-ghost btn-sm" onClick={() => bulk({ deal: false })}>Remove deal</button>
          <button className="btn btn-ghost btn-sm" onClick={() => bulk({ featured: true })}>Feature</button>
          <button className="link" onClick={() => setSel([])}>Clear</button>
        </div>
      )}
      {!items ? <Spinner /> : (
        <div className="table-wrap">
          <table className="table products-table">
            <thead><tr><th><input type="checkbox" aria-label="Select all" checked={sel.length > 0 && sel.length === Math.min(limit, shown.length)} onChange={(e) => setSel(e.target.checked ? shown.slice(0, limit).map((p) => p.id) : [])} /></th><th /><th>Product</th><th>Price (৳)</th><th>Stock</th><th>Flags</th><th>Visibility</th><th /></tr></thead>
            <tbody>
              {shown.slice(0, limit).map((p) => (
                <tr key={p.id} className={sel.includes(p.id) ? 'selected' : ''}>
                  <td><input type="checkbox" aria-label={`Select ${p.name}`} checked={sel.includes(p.id)} onChange={(e) => setSel((c) => (e.target.checked ? [...c, p.id] : c.filter((x) => x !== p.id)))} /></td>
                  <td className="t-thumb"><ProductVisual product={p} category={catById[p.categoryId]} /></td>
                  <td><Link to={`/admin/products/${p.id}`}><b>{p.name}</b></Link><br /><small>{p.brand}, {catById[p.categoryId]?.name || 'no category'}</small></td>
                  <td><input className="stock-input wide" inputMode="numeric" defaultValue={p.price} onBlur={(e) => Number(e.target.value) !== p.price && quick(p, { price: Number(e.target.value) || 0 })} aria-label={`Price for ${p.name}`} />{p.originalPrice > p.price && <><br /><small className="muted">was {money(p.originalPrice)}</small></>}</td>
                  <td><input className="stock-input" type="number" min="0" defaultValue={p.stock} onBlur={(e) => Number(e.target.value) !== p.stock && quick(p, { stock: Math.max(0, Number(e.target.value)) })} aria-label={`Stock for ${p.name}`} /></td>
                  <td>
                    <label className="check"><input type="checkbox" checked={!!p.featured} onChange={(e) => quick(p, { featured: e.target.checked })} /> Pick</label>
                    <label className="check"><input type="checkbox" checked={!!p.newArrival} onChange={(e) => quick(p, { newArrival: e.target.checked })} /> New</label>
                    <label className="check"><input type="checkbox" checked={!!p.deal} onChange={(e) => quick(p, { deal: e.target.checked })} /> Deal</label>
                  </td>
                  <td>
                    <select value={p.status} onChange={(e) => quick(p, { status: e.target.value })} aria-label="Visibility">
                      <option value="active">Live</option><option value="draft">Draft</option><option value="inactive">Hidden</option>
                    </select>
                  </td>
                  <td><button className="icon-btn" onClick={() => remove(p)} aria-label={`Delete ${p.name}`}><LuTrash2 /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length > limit && <div className="more-row"><p className="muted small">Showing {limit} of {shown.length.toLocaleString('en-IN')}. Search or filter to narrow down.</p><button className="btn btn-ghost btn-sm" onClick={() => setLimit((n) => n + 200)}>Show 200 more</button></div>}
          {shown.length === 0 && <p className="muted pad">No products match. <Link to="/admin/products/new">Add one</Link>.</p>}
        </div>
      )}
    </div>
  );
}

async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY.preset);
  fd.append('folder', 'decibel114');
  const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY.cloud}/image/upload`, { method: 'POST', body: fd });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || 'Upload failed');
  return j.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_1200/');
}

function parseOptions(text, name) {
  const values = String(text || '').split('\n').map((l) => l.split('=').map((x) => x.trim())).filter(([a, b]) => a && Number(b?.replace(/[^\d]/g, ''))).map(([label, price]) => ({ label, price: Number(price.replace(/[^\d]/g, '')) }));
  return values.length ? [{ name: name || 'Option', values }] : [];
}

const EMPTY = { name: '', slug: '', sku: '', brand: '', categoryId: '', subcategory: '', price: '', originalPrice: '', stock: 10, warranty: '1 year', shortDescription: '', description: '', images: [], specs: [{ key: '', value: '' }], tags: [], featured: false, newArrival: true, deal: false, status: 'active', art: '', options: [] };

export function ProductForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  useTitle(isNew ? 'Add product' : 'Edit product');
  const nav = useNavigate();
  const { categories, catById, reload, brands } = useCatalog();
  const [f, setF] = useState(isNew ? EMPTY : null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [url, setUrl] = useState('');
  const [optName, setOptName] = useState('Storage');
  const [optText, setOptText] = useState('');
  useEffect(() => { const o = f?.options?.[0]; if (o) { setOptName(o.name); setOptText(o.values.map((v) => `${v.label} = ${v.price}`).join('\n')); } }, [f?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isNew) return;
    adminGetProduct(id).then((p) => (p ? setF({ ...EMPTY, ...p, specs: p.specs?.length ? p.specs : [{ key: '', value: '' }] }) : nav('/admin/products')));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!f) return <Spinner />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const subs = catById[f.categoryId]?.subs || [];

  const onFiles = async (files) => {
    if (!CLOUDINARY.cloud || !CLOUDINARY.preset) return toast.error('Add VITE_CLOUDINARY_CLOUD and VITE_CLOUDINARY_PRESET to upload photos, or paste an image link below.');
    const list = [...files].slice(0, 8);
    setUploading(list.length);
    try {
      const urls = [];
      for (const file of list) { urls.push(await uploadToCloudinary(file)); setUploading((n) => n - 1); }
      setF((cur) => ({ ...cur, images: [...cur.images, ...urls] }));
    } catch (e) { toast.error(e.message); } finally { setUploading(0); }
  };
  const addUrl = () => { if (/^https?:\/\//.test(url)) { setF({ ...f, images: [...f.images, url.trim()] }); setUrl(''); } else toast.error('Paste a full image link starting with https://'); };
  const moveFirst = (i) => setF({ ...f, images: [f.images[i], ...f.images.filter((_, j) => j !== i)] });

  const submit = async (e) => {
    e.preventDefault();
    if (!f.categoryId) return toast.error('Choose a category.');
    setBusy(true);
    try {
      const clean = {
        ...f,
        slug: slugify(f.slug || f.name),
        price: Number(f.price) || 0,
        originalPrice: Number(f.originalPrice) || 0,
        stock: Math.max(0, Number(f.stock) || 0),
        specs: f.specs.filter((s) => s.key.trim() && s.value.trim()),
        tags: typeof f.tags === 'string' ? f.tags.split(',').map((t) => t.trim()).filter(Boolean) : f.tags,
        options: parseOptions(optText, optName),
      };
      await saveProduct(clean);
      await reload();
      toast.success(isNew ? 'Product added' : 'Product saved');
      nav('/admin/products');
    } catch (err) { toast.error(errText(err)); setBusy(false); }
  };

  return (
    <form className="admin-page product-form" onSubmit={submit}>
      <div className="panel-head">
        <h1>{isNew ? 'Add product' : f.name}</h1>
        <div className="row-gap">
          <Link to="/admin/products" className="btn btn-ghost">Cancel</Link>
          <button className="btn btn-primary" disabled={busy || uploading > 0}>{busy ? 'Saving…' : isNew ? 'Add product' : 'Save changes'}</button>
        </div>
      </div>

      <div className="admin-grid wide-left">
        <div>
          <section className="panel">
            <h2>Basics</h2>
            <Field label="Product name"><input required value={f.name} onChange={set('name')} placeholder="UniFi U7 Pro" /></Field>
            <div className="grid-2">
              <Field label="Brand"><input required value={f.brand} onChange={set('brand')} list="brand-list" /><datalist id="brand-list">{brands.map((b) => <option key={b} value={b} />)}</datalist></Field>
              <Field label="SKU / model (optional)"><input value={f.sku} onChange={set('sku')} /></Field>
              <Field label="Category">
                <select required value={f.categoryId} onChange={set('categoryId')}>
                  <option value="">Choose…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Type">
                <input value={f.subcategory} onChange={set('subcategory')} list="sub-list" placeholder={subs[0] || 'e.g. PoE switch'} />
                <datalist id="sub-list">{subs.map((s) => <option key={s} value={s} />)}</datalist>
              </Field>
            </div>
            <Field label="One-line summary" hint="Shown on product cards."><input value={f.shortDescription} onChange={set('shortDescription')} maxLength={110} /></Field>
            <Field label="Full description"><textarea rows={5} value={f.description} onChange={set('description')} /></Field>
          </section>

          <section className="panel">
            <h2>Photos</h2>
            <div className="img-grid">
              {f.images.map((src, i) => (
                <div key={src} className="img-tile">
                  <img src={src} alt="" />
                  {i === 0 ? <span className="img-main">Main</span> : <button type="button" onClick={() => moveFirst(i)} aria-label="Make main photo"><LuArrowUp /></button>}
                  <button type="button" className="img-del" onClick={() => setF({ ...f, images: f.images.filter((_, j) => j !== i) })} aria-label="Remove photo"><LuX /></button>
                </div>
              ))}
              <label className="img-drop">
                <LuUpload />
                <span>{uploading ? `Uploading ${uploading}…` : 'Upload photos'}</span>
                <input type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
              </label>
            </div>
            <div className="row-gap"><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an image link" /><button type="button" className="btn btn-ghost" onClick={addUrl}>Add link</button></div>
            {!f.images.length && (
              <>
                <p className="muted small">No photo yet, so the store shows this illustration:</p>
                <div className="art-pick">
                  {ART_TYPES.map((t) => (
                    <button type="button" key={t} className={(f.art || '') === t ? 'on' : ''} onClick={() => setF({ ...f, art: t })} aria-label={t}><DeviceArt type={t} /></button>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="panel">
            <h2>Specifications</h2>
            {f.specs.map((s, i) => (
              <div key={i} className="spec-row">
                <input placeholder="Ports" value={s.key} onChange={(e) => setF({ ...f, specs: f.specs.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)) })} />
                <input placeholder="24 × GbE PoE+" value={s.value} onChange={(e) => setF({ ...f, specs: f.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
                <button type="button" className="icon-btn" onClick={() => setF({ ...f, specs: f.specs.filter((_, j) => j !== i) })} aria-label="Remove row"><LuX /></button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setF({ ...f, specs: [...f.specs, { key: '', value: '' }] })}><LuPlus /> Add row</button>
          </section>
        </div>

        <div>
          <section className="panel">
            <h2>Price and stock</h2>
            <Field label="Selling price (৳)"><input required inputMode="numeric" value={f.price} onChange={set('price')} /></Field>
            <Field label="Regular price (৳)" hint="Optional. Higher than the selling price shows a discount."><input inputMode="numeric" value={f.originalPrice || ''} onChange={set('originalPrice')} /></Field>
            <Field label="Units in stock" hint="0 shows “On order” and turns off Add to cart."><input type="number" min="0" value={f.stock} onChange={set('stock')} /></Field>
            <Field label="Warranty"><input value={f.warranty} onChange={set('warranty')} placeholder="1 year" /></Field>
          </section>
          <section className="panel">
            <h2>Variants</h2>
            <p className="muted small">Optional. One per line as “label = price”, for example “256GB = 195000”. Customers pick one on the product page.</p>
            <Field label="Variant name"><input value={optName} onChange={(e) => setOptName(e.target.value)} placeholder="Storage, Colour, Size…" /></Field>
            <Field label="Values"><textarea rows={4} value={optText} onChange={(e) => setOptText(e.target.value)} placeholder={'256GB = 195000\n512GB = 220000\n1TB = 250000'} /></Field>
          </section>
          <section className="panel">
            <h2>Visibility</h2>
            <Field label="Status">
              <select value={f.status} onChange={set('status')}><option value="active">Live on the store</option><option value="draft">Draft</option><option value="inactive">Hidden</option></select>
            </Field>
            <label className="check"><input type="checkbox" checked={f.featured} onChange={set('featured')} /> Featured on the home page</label>
            <label className="check"><input type="checkbox" checked={!!f.deal} onChange={set('deal')} /> Eligible for Deal of the day</label>
            <label className="check"><input type="checkbox" checked={f.newArrival} onChange={set('newArrival')} /> Mark as new arrival</label>
            <Field label="Search keywords" hint="Comma-separated, e.g. wifi 7, ceiling, office"><input value={Array.isArray(f.tags) ? f.tags.join(', ') : f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></Field>
            <Field label="Web address"><input value={f.slug} onChange={set('slug')} placeholder={slugify(f.name) || 'auto from name'} /></Field>
          </section>
        </div>
      </div>
    </form>
  );
}
