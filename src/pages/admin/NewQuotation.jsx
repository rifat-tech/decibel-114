// Admin → Quotations → New / Edit / Duplicate: form on the left, the quotation on the pad updates live on the right.
// Saved in the orders collection with source: 'quotation' (kept out of Orders and sales totals).
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuPlus, LuTrash2, LuArrowUp, LuArrowDown } from 'react-icons/lu';
import Quotation from '../../components/Quotation';
import { Preview } from './NewInvoice';
import { Field, Spinner, useTitle } from '../../components/ui';
import { adminGetOrder, adminListOrders, adminListQuotations, createOrder, errText, getSettings, updateOrder } from '../../lib/db';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

const UNITS = ['', 'Pcs', 'Set', 'Box', 'Pair', 'Roll', 'Metre', 'Feet', 'Kg', 'Litre', 'Hour', 'Day', 'Month', 'Year', 'Lot', 'Job'];
const blankItem = () => ({ name: '', note: '', unit: 'Pcs', price: '', quantity: 1 });
const num = (v) => Number(String(v ?? '').replace(/[^\d.]/g, '')) || 0;
const toDateInput = (t) => new Date(t - new Date(t).getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const fromDateInput = (v) => { const [y, m, d] = String(v).split('-').map(Number); return y ? new Date(y, m - 1, d, 12).getTime() : Date.now(); };
const move = (a, i, d) => { const b = [...a]; const j = i + d; if (j < 0 || j >= b.length) return b; [b[i], b[j]] = [b[j], b[i]]; return b; };
const lines = (t) => String(t || '').split('\n').map((x) => x.trim()).filter(Boolean);

const nextNumber = (list, year) => {
  const prefix = `D114-QT-${year}-`;
  const max = list.map((o) => o.quoteNo || '').filter((n) => n.startsWith(prefix)).map((n) => Number(n.slice(prefix.length)) || 0).reduce((a, b) => Math.max(a, b), 0);
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
};

function toForm(o, s, { duplicate } = {}) {
  return {
    head: { no: duplicate ? '' : (o.quoteNo || ''), date: toDateInput(duplicate || !o.quoteDate ? Date.now() : o.quoteDate), status: duplicate ? 'draft' : (o.quoteStatus || 'draft'), poRef: o.poRef || '' },
    c: { company: o.customer?.company || '', name: o.customer?.name || '', designation: o.customer?.designation || '', phone: o.customer?.phone || '', email: o.customer?.email || '', line: o.address?.line || '', city: o.address?.city || '' },
    subject: o.subject || '', salutation: o.salutation || 'Dear Sir/Madam,',
    intro: o.intro ?? s.quoteIntro ?? '', closing: o.closing ?? s.quoteClosing ?? '',
    priceTable: o.priceTable !== false, docTitle: o.docTitle || '',
    items: (o.items || []).length ? o.items.map((i) => ({ name: i.name || '', note: i.note || '', unit: i.unit ?? 'Pcs', price: String(i.price ?? ''), quantity: String(i.quantity ?? 1) })) : [blankItem()],
    rows: { discount: !!(o.toggles?.discount ?? o.discount > 0), vat: !!(o.toggles?.vat ?? o.vat > 0), delivery: !!(o.toggles?.delivery ?? o.shipping > 0) },
    amounts: { discount: o.discount ? String(o.discount) : '', vatRate: o.vatRate ? String(o.vatRate) : '', shipping: o.shipping ? String(o.shipping) : '' },
    shippingLabel: o.shippingLabel || 'Delivery & installation',
    terms: (o.terms || lines(s.quoteTerms)).join('\n'),
    showSeal: o.showSeal !== false, showSignature: o.showSignature !== false,
    signatory: {
      name: o.signatory?.name || s.quoteSignName || '', title: o.signatory?.title || s.quoteSignTitle || '',
      phone: o.signatory?.phone || s.quoteSignPhone || '', email: o.signatory?.email || s.quoteSignEmail || '',
    },
  };
}

export default function NewQuotation() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const dupFrom = sp.get('from');
  useTitle(id ? 'Edit quotation' : 'New quotation');
  const nav = useNavigate();
  const { products, content } = useStore();
  const { user } = useAuth();
  const by = user?.profile?.name || user?.email || 'staff';
  const [settings, setSettings] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [original, setOriginal] = useState(null);
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    (async () => {
      const [s, qs, os] = await Promise.all([getSettings(), adminListQuotations().catch(() => []), adminListOrders().catch(() => [])]);
      setSettings(s); setQuotes(qs); setOrders(os);
      if (id || dupFrom) {
        const o = await adminGetOrder(id || dupFrom);
        if (!o) { toast.error('Quotation not found'); nav('/admin/quotations'); return; }
        const form = toForm(o, s, { duplicate: !!dupFrom });
        if (dupFrom) form.head.no = nextNumber(qs, year);
        setOriginal(id ? o : null); setF(form);
      } else {
        const form = toForm({}, s);
        form.head.no = nextNumber(qs, year);
        setF(form);
      }
    })().catch((e) => toast.error(errText(e)));
  }, [id, dupFrom, year, nav]);

  // Customers from earlier quotations, invoices and orders, newest first, one per phone or company.
  const customers = useMemo(() => {
    const seen = new Map();
    [...quotes, ...orders].sort((a, b) => b.createdAt - a.createdAt).forEach((o) => {
      const k = o.phoneKey || o.customer?.phone || o.customer?.company;
      if (k && !seen.has(k)) seen.set(k, { ...o.customer, line: o.address?.line || '', city: o.address?.city || '' });
    });
    return [...seen.values()];
  }, [quotes, orders]);
  const catalog = useMemo(() => {
    const m = new Map();
    products.forEach((p) => p.name && m.set(p.name, { price: p.price || 0, note: p.brand || '' }));
    [...(content.it.services || []), ...(content.agri.services || [])].forEach((x) => x.t && !m.has(x.t) && m.set(x.t, { price: 0, note: 'Service', unit: 'Job' }));
    return m;
  }, [products, content]);

  if (!f || !settings) return <Spinner />;

  const up = (k, v) => setF((x) => ({ ...x, [k]: typeof v === 'function' ? v(x[k]) : v }));
  const upIn = (k) => (field) => (e) => { const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setF((x) => ({ ...x, [k]: { ...x[k], [field]: v } })); };
  const setItem = (i, patch) => up('items', (a) => a.map((x, j) => {
    if (j !== i) return x;
    const next = { ...x, ...patch };
    const hit = patch.name !== undefined && catalog.get(patch.name);
    if (hit) { if (!num(x.price) && hit.price) next.price = String(hit.price); if (!x.note && hit.note) next.note = hit.note; if (hit.unit) next.unit = hit.unit; }
    return next;
  }));

  const rows = f.priceTable ? f.items.filter((i) => i.name.trim() && num(i.quantity) > 0).map((i) => ({ name: i.name.trim(), note: i.note.trim(), unit: i.unit, price: num(i.price), quantity: num(i.quantity) })) : [];
  const subtotal = rows.reduce((n, i) => n + i.price * i.quantity, 0);
  const discount = f.priceTable && f.rows.discount ? num(f.amounts.discount) : 0;
  const vatRate = f.priceTable && f.rows.vat ? num(f.amounts.vatRate) : 0;
  const vat = Math.round((subtotal - discount) * vatRate) / 100;
  const shipping = f.priceTable && f.rows.delivery ? num(f.amounts.shipping) : 0;
  const total = Math.max(0, subtotal - discount + vat + shipping);

  const doc = {
    source: 'quotation', quoteNo: f.head.no.trim(), quoteDate: fromDateInput(f.head.date), quoteStatus: f.head.status, poRef: f.head.poRef.trim(),
    customer: { company: f.c.company.trim(), name: f.c.name.trim(), designation: f.c.designation.trim(), phone: f.c.phone.trim(), email: f.c.email.trim() },
    address: { line: f.c.line.trim(), city: f.c.city.trim(), zone: /dhaka/i.test(f.c.city) ? 'dhaka' : 'outside' },
    subject: f.subject.trim(), salutation: f.salutation.trim(), intro: f.intro.trim(), closing: f.closing.trim(),
    priceTable: f.priceTable, docTitle: f.docTitle.trim(),
    items: rows, subtotal, discount, vat, vatRate, shipping, shippingLabel: f.shippingLabel.trim() || 'Delivery & installation', total,
    toggles: f.rows, terms: lines(f.terms),
    showSeal: f.showSeal, showSignature: f.showSignature,
    signatory: { name: f.signatory.name.trim(), title: f.signatory.title.trim(), phone: f.signatory.phone.trim(), email: f.signatory.email.trim() },
  };

  async function save() {
    if (!(doc.customer.company || doc.customer.name)) return toast.error('Add the customer or company name.');
    if (f.priceTable && !rows.length) return toast.error('Add at least one item, or untick “Price table” for a letter.');
    if (!doc.quoteNo) return toast.error('Add the quotation number.');
    if (quotes.some((o) => o.quoteNo === doc.quoteNo && o.id !== original?.id)) return toast.error(`Quotation no. ${doc.quoteNo} is already used.`);
    setBusy(true);
    try {
      if (original) {
        await updateOrder(original, doc, by);
        toast.success('Quotation updated');
        nav(`/admin/quotation/${original.id}`);
      } else {
        const { id: newId } = await createOrder({ ...doc, createdBy: by }, null);
        toast.success(`Quotation ${doc.quoteNo} saved`);
        nav(`/admin/quotation/${newId}`);
      }
    } catch (e) { toast.error(errText(e)); } finally { setBusy(false); }
  }

  const pick = (k) => { const x = customers[Number(k)]; if (x) up('c', { company: x.company || '', name: x.name || '', designation: x.designation || '', phone: x.phone || '', email: x.email || '', line: x.line || '', city: x.city || '' }); };
  const optRows = [
    ['discount', 'Discount', 'discount', 'Amount (BDT)'],
    ['vat', 'VAT / Tax', 'vatRate', 'Rate (%)'],
    ['delivery', 'Delivery / installation', 'shipping', 'Amount (BDT)'],
  ];
  const head = original ? 'Edit quotation' : dupFrom ? 'Duplicate quotation' : 'New quotation';

  return (
    <div className="ni-wrap">
      <div className="ni-form">
        <div className="page-head">
          <div><h1>{head}</h1><p className="muted">Fill in the form; the pad on the right updates as you type.</p></div>
          <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save quotation'}</button>
        </div>

        <section className="panel">
          <h2>Quotation</h2>
          <div className="ni-3">
            <Field label="Quotation no. (Ref.)"><input value={f.head.no} onChange={upIn('head')('no')} /></Field>
            <Field label="Date"><input type="date" value={f.head.date} onChange={upIn('head')('date')} /></Field>
            <Field label="Status"><select value={f.head.status} onChange={upIn('head')('status')}><option value="draft">Draft</option><option value="sent">Sent</option><option value="accepted">Accepted</option><option value="rejected">Not accepted</option></select></Field>
          </div>
          <Field label="Customer’s reference" hint="Optional, e.g. their RFQ or tender number."><input value={f.head.poRef} onChange={upIn('head')('poRef')} /></Field>
        </section>

        <section className="panel">
          <h2>To</h2>
          {customers.length > 0 && (
            <Field label="Pick a saved customer"><select value="" onChange={(e) => pick(e.target.value)}>
              <option value="">— choose —</option>
              {customers.map((x, k) => <option key={k} value={k}>{[x.company, x.name, x.phone].filter(Boolean).join(' · ')}</option>)}
            </select></Field>
          )}
          <Field label="Company / organisation" hint="Leave empty for a person."><input value={f.c.company} onChange={upIn('c')('company')} /></Field>
          <div className="grid-2">
            <Field label="Contact person"><input value={f.c.name} onChange={upIn('c')('name')} /></Field>
            <Field label="Designation" hint="e.g. Head of IT"><input value={f.c.designation} onChange={upIn('c')('designation')} /></Field>
            <Field label="Phone"><input inputMode="tel" value={f.c.phone} onChange={upIn('c')('phone')} /></Field>
            <Field label="Email"><input type="email" value={f.c.email} onChange={upIn('c')('email')} /></Field>
          </div>
          <Field label="Address"><textarea rows={2} value={f.c.line} onChange={upIn('c')('line')} /></Field>
          <Field label="City"><input value={f.c.city} onChange={upIn('c')('city')} /></Field>
        </section>

        <section className="panel">
          <h2>Letter</h2>
          <Field label="Subject"><input value={f.subject} onChange={(e) => up('subject', e.target.value)} placeholder="Quotation for CCTV system at your Gulshan office" /></Field>
          <Field label="Greeting"><input value={f.salutation} onChange={(e) => up('salutation', e.target.value)} /></Field>
          <Field label="Opening text" hint="Starts from Store settings → Pad & quotation."><textarea rows={3} value={f.intro} onChange={(e) => up('intro', e.target.value)} /></Field>
          <label className="check big"><input type="checkbox" checked={f.priceTable} onChange={(e) => up('priceTable', e.target.checked)} /> Price table (untick to write a plain letter on the pad)</label>
          {!f.priceTable && <Field label="Title on the page (optional)" hint="e.g. Offer Letter, Work Completion Certificate. Leave empty for no title."><input value={f.docTitle} onChange={(e) => up('docTitle', e.target.value)} /></Field>}
        </section>

        {f.priceTable && (
          <>
            <section className="panel">
              <div className="ni-items-head"><h2>Items</h2><button type="button" className="btn btn-ghost btn-sm" onClick={() => up('items', (a) => [...a, blankItem()])}><LuPlus /> Add item</button></div>
              <datalist id="qt-catalog">{[...catalog.keys()].slice(0, 6000).map((n) => <option key={n} value={n} />)}</datalist>
              {f.items.map((it, i) => (
                <div key={i} className="ni-item">
                  <div className="ni-item-top">
                    <b>Item {i + 1}</b>
                    <div className="pair-tools">
                      <button type="button" className="icon-btn" onClick={() => up('items', (a) => move(a, i, -1))} disabled={!i} aria-label="Move up"><LuArrowUp /></button>
                      <button type="button" className="icon-btn" onClick={() => up('items', (a) => move(a, i, 1))} disabled={i === f.items.length - 1} aria-label="Move down"><LuArrowDown /></button>
                      <button type="button" className="icon-btn" onClick={() => up('items', (a) => (a.length > 1 ? a.filter((_, j) => j !== i) : [blankItem()]))} aria-label="Remove item"><LuTrash2 /></button>
                    </div>
                  </div>
                  <Field label="Description" hint="Type to pick a product or service from your store."><input list="qt-catalog" value={it.name} onChange={(e) => setItem(i, { name: e.target.value })} /></Field>
                  <Field label="Details under the item" hint="Brand, model, serial no., warranty… Each new line prints on its own line."><textarea rows={3} value={it.note} onChange={(e) => setItem(i, { note: e.target.value })} /></Field>
                  <div className="ni-3">
                    <Field label="Unit"><select value={it.unit} onChange={(e) => setItem(i, { unit: e.target.value })}>{UNITS.map((u) => <option key={u} value={u}>{u || '—'}</option>)}</select></Field>
                    <Field label="Qty"><input inputMode="numeric" value={it.quantity} onChange={(e) => setItem(i, { quantity: e.target.value })} /></Field>
                    <Field label="Unit price (BDT)"><input inputMode="decimal" value={it.price} onChange={(e) => setItem(i, { price: e.target.value })} /></Field>
                  </div>
                </div>
              ))}
            </section>

            <section className="panel">
              <h2>Optional rows</h2>
              <p className="muted small">Tick a row to show it under the table.</p>
              {optRows.map(([k, label, field, ph]) => (
                <div key={k} className="ni-opt">
                  <label className="check"><input type="checkbox" checked={f.rows[k]} onChange={(e) => up('rows', (r) => ({ ...r, [k]: e.target.checked }))} /> {label}</label>
                  {f.rows[k] && <input inputMode="decimal" value={f.amounts[field]} placeholder={ph} aria-label={`${label} ${ph}`} onChange={(e) => up('amounts', (a) => ({ ...a, [field]: e.target.value }))} />}
                </div>
              ))}
              {f.rows.delivery && <Field label="Name of that row"><input value={f.shippingLabel} onChange={(e) => up('shippingLabel', e.target.value)} /></Field>}
            </section>
          </>
        )}

        <section className="panel">
          <h2>Terms &amp; conditions</h2>
          <Field label="One point per line" hint="Leave empty to hide the box. Starts from Store settings → Pad & quotation."><textarea rows={5} value={f.terms} onChange={(e) => up('terms', e.target.value)} /></Field>
          <Field label="Closing text"><textarea rows={3} value={f.closing} onChange={(e) => up('closing', e.target.value)} /></Field>
        </section>

        <section className="panel">
          <h2>Signature</h2>
          <div className="row-gap">
            <label className="check big"><input type="checkbox" checked={f.showSeal} onChange={(e) => up('showSeal', e.target.checked)} /> Show seal</label>
            <label className="check big"><input type="checkbox" checked={f.showSignature} onChange={(e) => up('showSignature', e.target.checked)} /> Show signature</label>
          </div>
          <div className="grid-2">
            <Field label="Name"><input value={f.signatory.name} onChange={upIn('signatory')('name')} /></Field>
            <Field label="Designation"><input value={f.signatory.title} onChange={upIn('signatory')('title')} /></Field>
            <Field label="Phone"><input value={f.signatory.phone} onChange={upIn('signatory')('phone')} /></Field>
            <Field label="Email"><input value={f.signatory.email} onChange={upIn('signatory')('email')} /></Field>
          </div>
          {!settings.quoteSignature && <p className="muted small">No signature saved yet. Draw or upload it once in Store settings → Pad &amp; quotation; until then the pad leaves space to sign by hand.</p>}
        </section>

        <div className="ni-save"><button className="btn btn-primary btn-lg" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save quotation'}</button></div>
      </div>

      <aside className="ni-side">
        <Preview><Quotation q={doc} settings={settings} base={import.meta.env.BASE_URL.replace(/\/$/, '')} /></Preview>
      </aside>
    </div>
  );
}
