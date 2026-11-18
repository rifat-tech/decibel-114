// Admin → Invoices → New / Edit / Duplicate: form on the left, the A4 invoice updates live on the right.
// Invoices are stored in the orders collection (source: 'manual'), so they need no extra
// database rules and also show in Orders and the customer profile.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuPlus, LuTrash2, LuArrowUp, LuArrowDown } from 'react-icons/lu';
import Invoice from '../../components/Invoice';
import { Field, Spinner, useTitle } from '../../components/ui';
import { adminGetOrder, adminListOrders, createOrder, errText, getSettings, updateOrder } from '../../lib/db';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

const UNITS = ['', 'Pcs', 'Set', 'Box', 'Pair', 'Roll', 'Metre', 'Feet', 'Kg', 'Litre', 'Hour', 'Day', 'Month', 'Year', 'Lot', 'Job'];
const DEFAULT_PAYMENT_TERMS = [
  'Payment by bank transfer, account-payee cheque or pay order in favour of “Decibel-114”.',
  'Prices are in BDT, excluding VAT & AIT unless shown above.',
  'Please quote the invoice number with every payment.',
];
const blankItem = () => ({ name: '', note: '', unit: 'Pcs', price: '', quantity: 1 });
const num = (v) => Number(String(v ?? '').replace(/[^\d.]/g, '')) || 0;
const toDateInput = (t) => new Date(t - new Date(t).getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const fromDateInput = (v) => { const [y, m, d] = String(v).split('-').map(Number); return y ? new Date(y, m - 1, d, 12).getTime() : Date.now(); };
const move = (a, i, d) => { const b = [...a]; const j = i + d; if (j < 0 || j >= b.length) return b; [b[i], b[j]] = [b[j], b[i]]; return b; };
const lines = (t) => t.split('\n').map((x) => x.trim()).filter(Boolean);

/** Scales the A4 invoice to fit the preview column. */
function Preview({ children }) {
  const box = useRef(); const inner = useRef();
  const [scale, setScale] = useState(0.7); const [h, setH] = useState(800);
  useEffect(() => {
    const fit = () => { if (!box.current || !inner.current) return; const s = Math.min(1, box.current.clientWidth / 794); setScale(s); setH(inner.current.offsetHeight * s); };
    const ro = new ResizeObserver(fit); ro.observe(box.current); if (inner.current) ro.observe(inner.current); fit();
    return () => ro.disconnect();
  }, []);
  return <div className="ni-preview" ref={box} style={{ height: h }}><div ref={inner} style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 794 }}>{children}</div></div>;
}

const nextNumber = (list, year) => {
  const prefix = `D114-INV-${year}-`;
  const max = list.map((o) => o.invoiceNo || '').filter((n) => n.startsWith(prefix)).map((n) => Number(n.slice(prefix.length)) || 0).reduce((a, b) => Math.max(a, b), 0);
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
};

/** Turns a saved invoice (order document) back into form state. */
function toForm(o, { duplicate } = {}) {
  return {
    inv: { no: duplicate ? '' : (o.invoiceNo || o.orderNumber || ''), date: toDateInput(duplicate ? Date.now() : (o.invoiceDate || o.createdAt || Date.now())), status: duplicate ? 'draft' : (o.invoiceStatus || (o.paymentStatus === 'paid' ? 'paid' : 'sent')), poRef: o.poRef || '' },
    c: { company: o.customer?.company || '', name: o.customer?.name || '', designation: o.customer?.designation || '', phone: o.customer?.phone || '', email: o.customer?.email || '', line: o.address?.line || '', city: o.address?.city || '' },
    ship: o.shipTo && !o.shipTo.same ? { same: false, company: o.shipTo.company || '', name: o.shipTo.name || '', designation: o.shipTo.designation || '', phone: o.shipTo.phone || '', line: o.shipTo.line || '', city: o.shipTo.city || '' } : { same: true, company: '', name: '', designation: '', phone: '', line: '', city: '' },
    items: (o.items || []).length ? o.items.map((i) => ({ name: i.name || '', note: i.note || i.option || '', unit: i.unit ?? 'Pcs', price: String(i.price ?? ''), quantity: String(i.quantity ?? 1) })) : [blankItem()],
    rows: { discount: !!(o.toggles?.discount ?? o.discount > 0), vat: !!(o.toggles?.vat ?? o.vat > 0), delivery: !!(o.toggles?.delivery ?? o.shipping > 0), advance: !!(o.toggles?.advance ?? o.advance > 0) },
    amounts: { discount: o.discount ? String(o.discount) : '', vatRate: o.vatRate ? String(o.vatRate) : '', shipping: o.shipping ? String(o.shipping) : '', advance: o.advance ? String(o.advance) : '' },
    paymentTerms: (o.paymentTerms || DEFAULT_PAYMENT_TERMS).join('\n'),
    terms: (o.terms || []).join('\n'),
    showSeal: o.showSeal !== false, showSignature: o.showSignature !== false,
    signatory: { name: o.signatory?.name || '', title: o.signatory?.title || '' },
  };
}

export default function NewInvoice() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const dupFrom = sp.get('from');
  useTitle(id ? 'Edit invoice' : 'New invoice');
  const nav = useNavigate();
  const { products, content } = useStore();
  const { user } = useAuth();
  const by = user?.profile?.name || user?.email || 'staff';
  const [settings, setSettings] = useState(null);
  const [orders, setOrders] = useState([]);
  const [original, setOriginal] = useState(null);
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    (async () => {
      const [s, list] = await Promise.all([getSettings(), adminListOrders().catch(() => [])]);
      setSettings(s); setOrders(list);
      const defaultTerms = String(s.invoiceTerms || '').split(/\n|(?<=\.)\s+(?=[A-Z])/).map((x) => x.trim()).filter(Boolean);
      const sign = { name: s.signatoryName || '', title: s.signatoryTitle || '' };
      if (id || dupFrom) {
        const o = await adminGetOrder(id || dupFrom);
        if (!o) { toast.error('Invoice not found'); nav('/admin/invoices'); return; }
        const form = toForm(o, { duplicate: !!dupFrom });
        if (!form.terms) form.terms = defaultTerms.join('\n');
        if (!form.signatory.name) form.signatory = sign;
        if (dupFrom) form.inv.no = nextNumber(list, year);
        setOriginal(id ? o : null); setF(form);
      } else {
        setF({ ...toForm({}), inv: { no: nextNumber(list, year), date: toDateInput(Date.now()), status: 'draft', poRef: '' }, terms: defaultTerms.join('\n'), signatory: sign });
      }
    })().catch((e) => toast.error(errText(e)));
  }, [id, dupFrom, year, nav]);

  // Customers from earlier invoices and orders, newest first, one per phone number.
  const customers = useMemo(() => {
    const seen = new Map();
    orders.forEach((o) => { const k = o.phoneKey || o.customer?.phone; if (k && !seen.has(k)) seen.set(k, { ...o.customer, line: o.address?.line || '', city: o.address?.city || '' }); });
    return [...seen.values()];
  }, [orders]);
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

  // Totals: discount, then VAT on the discounted amount, then delivery; advance is taken off at the end.
  const rows = f.items.filter((i) => i.name.trim() && num(i.quantity) > 0).map((i) => ({ name: i.name.trim(), note: i.note.trim(), unit: i.unit, price: num(i.price), quantity: num(i.quantity) }));
  const subtotal = rows.reduce((n, i) => n + i.price * i.quantity, 0);
  const discount = f.rows.discount ? num(f.amounts.discount) : 0;
  const vatRate = f.rows.vat ? num(f.amounts.vatRate) : 0;
  const vat = Math.round((subtotal - discount) * vatRate) / 100;
  const shipping = f.rows.delivery ? num(f.amounts.shipping) : 0;
  const advance = f.rows.advance ? num(f.amounts.advance) : 0;
  const total = Math.max(0, subtotal - discount + vat + shipping);

  const doc = {
    source: 'manual', invoiceNo: f.inv.no.trim(), invoiceDate: fromDateInput(f.inv.date), invoiceStatus: f.inv.status, poRef: f.inv.poRef.trim(),
    customer: { company: f.c.company.trim(), name: f.c.name.trim(), designation: f.c.designation.trim(), phone: f.c.phone.trim(), email: f.c.email.trim() },
    address: { line: f.c.line.trim(), city: f.c.city.trim(), zone: /dhaka/i.test(f.c.city) ? 'dhaka' : 'outside' },
    shipTo: f.ship.same ? { same: true } : { same: false, company: f.ship.company.trim(), name: f.ship.name.trim(), designation: (f.ship.designation || '').trim(), phone: f.ship.phone.trim(), line: f.ship.line.trim(), city: f.ship.city.trim() },
    items: rows, subtotal, discount, vat, vatRate, shipping, advance, total, balance: Math.max(0, total - advance),
    toggles: f.rows, paymentTerms: lines(f.paymentTerms), terms: lines(f.terms),
    showSeal: f.showSeal, showSignature: f.showSignature, signatory: { name: f.signatory.name.trim(), title: f.signatory.title.trim() },
    paymentMethod: 'bank',
  };

  async function save() {
    if (!(doc.customer.company || doc.customer.name)) return toast.error('Add the customer name.');
    if (!doc.customer.phone) return toast.error('Add the customer phone number.');
    if (!rows.length) return toast.error('Add at least one item with a quantity.');
    if (orders.some((o) => o.invoiceNo === doc.invoiceNo && o.id !== original?.id)) return toast.error(`Invoice no. ${doc.invoiceNo} is already used.`);
    setBusy(true);
    try {
      const pay = doc.invoiceStatus === 'paid' ? { paymentStatus: 'paid', paidAt: original?.paidAt || Date.now() } : { paymentStatus: 'pending', paidAt: null };
      if (original) {
        await updateOrder(original, { ...doc, ...pay, status: doc.invoiceStatus === 'draft' ? original.status : (original.status === 'pending' ? 'confirmed' : original.status) }, by);
        toast.success('Invoice updated');
        nav(`/admin/invoice/${original.id}`);
      } else {
        const { id: newId } = await createOrder({ ...doc, createdBy: by }, null);
        const saved = await adminGetOrder(newId);
        if (doc.invoiceStatus !== 'draft' || pay.paymentStatus === 'paid') await updateOrder(saved, { status: 'confirmed', ...pay }, by);
        toast.success(`Invoice ${doc.invoiceNo} saved`);
        nav(`/admin/invoice/${newId}`);
      }
    } catch (e) { toast.error(errText(e)); } finally { setBusy(false); }
  }

  const pick = (k) => { const x = customers[Number(k)]; if (x) up('c', { company: x.company || '', name: x.name || '', designation: x.designation || '', phone: x.phone || '', email: x.email || '', line: x.line || '', city: x.city || '' }); };
  const optRows = [
    ['discount', 'Discount', 'discount', 'Amount (BDT)'],
    ['vat', 'VAT / Tax', 'vatRate', 'Rate (%)'],
    ['delivery', 'Delivery charge', 'shipping', 'Amount (BDT)'],
    ['advance', 'Advance paid', 'advance', 'Amount (BDT)'],
  ];

  return (
    <div className="ni-wrap">
      <div className="ni-form">
        <div className="page-head">
          <div><h1>{original ? 'Edit invoice' : dupFrom ? 'Duplicate invoice' : 'New invoice'}</h1><p className="muted">Fill in the form; the invoice on the right updates as you type.</p></div>
          <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save invoice'}</button>
        </div>

        <section className="panel">
          <h2>Invoice</h2>
          <div className="ni-3">
            <Field label="Invoice no."><input value={f.inv.no} onChange={upIn('inv')('no')} /></Field>
            <Field label="Invoice date"><input type="date" value={f.inv.date} onChange={upIn('inv')('date')} /></Field>
            <Field label="Status"><select value={f.inv.status} onChange={upIn('inv')('status')}><option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option></select></Field>
          </div>
          <Field label="PO / reference" hint="Optional. Printed under the date."><input value={f.inv.poRef} onChange={upIn('inv')('poRef')} /></Field>
        </section>

        <section className="panel">
          <h2>Bill to</h2>
          {customers.length > 0 && (
            <Field label="Pick a saved customer"><select value="" onChange={(e) => pick(e.target.value)}>
              <option value="">— choose —</option>
              {customers.map((x, k) => <option key={k} value={k}>{[x.company, x.name, x.phone].filter(Boolean).join(' · ')}</option>)}
            </select></Field>
          )}
          <Field label="Company name" hint="Leave empty for a person."><input value={f.c.company} onChange={upIn('c')('company')} /></Field>
          <div className="grid-2">
            <Field label="Contact person (Attn)"><input value={f.c.name} onChange={upIn('c')('name')} /></Field>
            <Field label="Designation" hint="e.g. IT Manager"><input value={f.c.designation} onChange={upIn('c')('designation')} /></Field>
            <Field label="Phone"><input inputMode="tel" value={f.c.phone} onChange={upIn('c')('phone')} /></Field>
            <Field label="Email"><input type="email" value={f.c.email} onChange={upIn('c')('email')} /></Field>
            <Field label="City"><input value={f.c.city} onChange={upIn('c')('city')} /></Field>
          </div>
          <Field label="Address"><textarea rows={2} value={f.c.line} onChange={upIn('c')('line')} /></Field>
        </section>

        <section className="panel">
          <h2>Ship to</h2>
          <label className="check big"><input type="checkbox" checked={f.ship.same} onChange={upIn('ship')('same')} /> Same as Bill to</label>
          {!f.ship.same && (
            <>
              <Field label="Company name"><input value={f.ship.company} onChange={upIn('ship')('company')} /></Field>
              <div className="grid-2">
                <Field label="Receiver"><input value={f.ship.name} onChange={upIn('ship')('name')} /></Field>
                <Field label="Designation"><input value={f.ship.designation || ''} onChange={upIn('ship')('designation')} /></Field>
                <Field label="Phone"><input value={f.ship.phone} onChange={upIn('ship')('phone')} /></Field>
              </div>
              <Field label="Address"><textarea rows={2} value={f.ship.line} onChange={upIn('ship')('line')} /></Field>
              <Field label="City"><input value={f.ship.city} onChange={upIn('ship')('city')} /></Field>
            </>
          )}
        </section>

        <section className="panel">
          <div className="ni-items-head"><h2>Items</h2><button type="button" className="btn btn-ghost btn-sm" onClick={() => up('items', (a) => [...a, blankItem()])}><LuPlus /> Add item</button></div>
          <datalist id="inv-catalog">{[...catalog.keys()].slice(0, 6000).map((n) => <option key={n} value={n} />)}</datalist>
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
              <Field label="Description" hint="Type to pick a product or service from your store."><input list="inv-catalog" value={it.name} onChange={(e) => setItem(i, { name: e.target.value })} /></Field>
              <Field label="Sub-line (model, warranty, scope)"><input value={it.note} onChange={(e) => setItem(i, { note: e.target.value })} /></Field>
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
          <p className="muted small">Tick a row to show it on the invoice. Unticked rows are left out.</p>
          {optRows.map(([k, label, field, ph]) => (
            <div key={k} className="ni-opt">
              <label className="check"><input type="checkbox" checked={f.rows[k]} onChange={(e) => up('rows', (r) => ({ ...r, [k]: e.target.checked }))} /> {label}</label>
              {f.rows[k] && <input inputMode="decimal" value={f.amounts[field]} placeholder={ph} aria-label={`${label} ${ph}`} onChange={(e) => up('amounts', (a) => ({ ...a, [field]: e.target.value }))} />}
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Payment terms</h2>
          <Field label="One point per line"><textarea rows={4} value={f.paymentTerms} onChange={(e) => up('paymentTerms', e.target.value)} /></Field>
          <h2>Terms &amp; conditions</h2>
          <Field label="One point per line" hint="Starts from Store settings → Invoice; changes here apply to this invoice only."><textarea rows={4} value={f.terms} onChange={(e) => up('terms', e.target.value)} /></Field>
        </section>

        <section className="panel">
          <h2>Seal and signature</h2>
          <div className="row-gap">
            <label className="check big"><input type="checkbox" checked={f.showSeal} onChange={(e) => up('showSeal', e.target.checked)} /> Show seal</label>
            <label className="check big"><input type="checkbox" checked={f.showSignature} onChange={(e) => up('showSignature', e.target.checked)} /> Show signature</label>
          </div>
          <div className="grid-2">
            <Field label="Signatory name"><input value={f.signatory.name} onChange={upIn('signatory')('name')} /></Field>
            <Field label="Title"><input value={f.signatory.title} onChange={upIn('signatory')('title')} placeholder="e.g. Founder & Authorised Signatory" /></Field>
          </div>
          {!settings.invoiceSignature && <p className="muted small">No signature saved yet. Draw or upload it once in Store settings → Invoice.</p>}
        </section>

        <div className="ni-save"><button className="btn btn-primary btn-lg" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save invoice'}</button></div>
      </div>

      <aside className="ni-side">
        <Preview><Invoice order={{ ...doc, orderNumber: original?.orderNumber }} settings={settings} base={import.meta.env.BASE_URL.replace(/\/$/, '')} /></Preview>
      </aside>
    </div>
  );
}
