// Admin → New invoice: fill the form on the left, the finished invoice updates on the right.
// Saved as an order (source: manual), so it also appears in Orders and the customer profile.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuPlus, LuTrash2, LuArrowUp, LuArrowDown } from 'react-icons/lu';
import Invoice from '../../components/Invoice';
import { Field, useTitle } from '../../components/ui';
import { adminGetOrder, adminListOrders, createOrder, errText, getSettings, updateOrder } from '../../lib/db';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

const UNITS = ['', 'Pcs', 'Set', 'Box', 'Pair', 'Roll', 'Metre', 'Feet', 'Kg', 'Litre', 'Hour', 'Day', 'Month', 'Year', 'Lot', 'Job'];
const blankItem = () => ({ name: '', note: '', unit: 'Pcs', price: '', quantity: 1 });
const num = (v) => Number(String(v ?? '').replace(/[^\d.]/g, '')) || 0;
const toDateInput = (t) => new Date(t - new Date(t).getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const fromDateInput = (v) => { const [y, m, d] = String(v).split('-').map(Number); return y ? new Date(y, m - 1, d, 12).getTime() : Date.now(); };
const move = (a, i, d) => { const b = [...a]; const j = i + d; if (j < 0 || j >= b.length) return b; [b[i], b[j]] = [b[j], b[i]]; return b; };

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

export default function NewInvoice() {
  useTitle('New invoice');
  const nav = useNavigate();
  const { products, content } = useStore();
  const { user } = useAuth();
  const by = user?.profile?.name || user?.email || 'staff';
  const [settings, setSettings] = useState(null);
  const [orders, setOrders] = useState([]);
  const year = new Date().getFullYear();
  const [inv, setInv] = useState({ no: '', date: toDateInput(Date.now()), status: 'unpaid' });
  const [c, setC] = useState({ company: '', name: '', phone: '', email: '', line: '', city: 'Dhaka' });
  const [ship, setShip] = useState({ same: true, company: '', name: '', phone: '', line: '', city: '' });
  const [items, setItems] = useState([blankItem()]);
  const [money, setMoney] = useState({ vatRate: '', shipping: '', discount: '' });
  const [pay, setPay] = useState({ method: 'bank', ref: '' });
  const [terms, setTerms] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSettings().then((s) => { setSettings(s); setTerms(String(s.invoiceTerms || '').split(/\n|(?<=\.)\s+(?=[A-Z])/).map((x) => x.trim()).filter(Boolean).join('\n')); });
    adminListOrders().then((list) => {
      setOrders(list);
      const prefix = `D114-INV-${year}-`;
      const max = list.map((o) => o.invoiceNo || '').filter((n) => n.startsWith(prefix)).map((n) => Number(n.slice(prefix.length)) || 0).reduce((a, b) => Math.max(a, b), 0);
      setInv((v) => (v.no ? v : { ...v, no: `${prefix}${String(max + 1).padStart(4, '0')}` }));
    }).catch(() => setInv((v) => (v.no ? v : { ...v, no: `D114-INV-${year}-0001` })));
  }, [year]);

  // Customers from earlier orders and invoices, newest first, one per phone number.
  const customers = useMemo(() => {
    const seen = new Map();
    orders.forEach((o) => { const k = o.phoneKey || o.customer?.phone; if (k && !seen.has(k)) seen.set(k, { ...o.customer, line: o.address?.line || '', city: o.address?.city || '' }); });
    return [...seen.values()];
  }, [orders]);
  const catalog = useMemo(() => {
    const m = new Map();
    products.forEach((p) => p.name && m.set(p.name, { price: p.price || 0, note: p.brand || '' }));
    [...(content.it.services || []), ...(content.agri.services || [])].forEach((s) => s.t && !m.has(s.t) && m.set(s.t, { price: 0, note: 'Service', unit: 'Job' }));
    return m;
  }, [products, content]);

  const setItem = (i, patch) => setItems((a) => a.map((x, j) => {
    if (j !== i) return x;
    const next = { ...x, ...patch };
    const hit = patch.name !== undefined && catalog.get(patch.name);
    if (hit) { if (!num(x.price) && hit.price) next.price = String(hit.price); if (!x.note && hit.note) next.note = hit.note; if (hit.unit) next.unit = hit.unit; }
    return next;
  }));

  const rows = items.filter((i) => i.name.trim() && num(i.quantity) > 0).map((i) => ({ name: i.name.trim(), note: i.note.trim(), unit: i.unit, price: num(i.price), quantity: num(i.quantity) }));
  const subtotal = rows.reduce((n, i) => n + i.price * i.quantity, 0);
  const vatRate = num(money.vatRate), shipping = num(money.shipping), discount = num(money.discount);
  const vat = Math.round(subtotal * vatRate) / 100;
  const total = Math.max(0, subtotal + vat + shipping - discount);

  const draft = {
    source: 'manual', invoiceNo: inv.no.trim(), invoiceDate: fromDateInput(inv.date), invoiceStatus: inv.status,
    customer: { company: c.company.trim(), name: c.name.trim(), phone: c.phone.trim(), email: c.email.trim() },
    address: { line: c.line.trim(), city: c.city.trim(), zone: /dhaka/i.test(c.city) ? 'dhaka' : 'outside' },
    shipTo: ship.same ? { same: true } : { same: false, company: ship.company.trim(), name: ship.name.trim(), phone: ship.phone.trim(), line: ship.line.trim(), city: ship.city.trim() },
    items: rows, subtotal, vat, vatRate, shipping, discount, total,
    paymentMethod: pay.method, paymentRef: pay.ref.trim(),
    terms: terms.split('\n').map((x) => x.trim()).filter(Boolean),
  };

  async function save() {
    if (!c.phone.trim() || !(c.company.trim() || c.name.trim())) return toast.error('Add the customer (company or name) and phone.');
    if (!rows.length) return toast.error('Add at least one item.');
    setBusy(true);
    try {
      const { id } = await createOrder({ ...draft, createdBy: by }, null);
      const saved = await adminGetOrder(id);
      if (inv.status !== 'draft') await updateOrder(saved, { status: 'confirmed', ...(inv.status === 'paid' ? { paymentStatus: 'paid', paidAt: Date.now() } : {}) }, by);
      toast.success(`Invoice ${draft.invoiceNo || saved.orderNumber} saved`);
      nav(`/admin/invoice/${id}`);
    } catch (e) { toast.error(errText(e)); } finally { setBusy(false); }
  }

  const pick = (k) => { const x = customers[Number(k)]; if (x) setC({ company: x.company || '', name: x.name || '', phone: x.phone || '', email: x.email || '', line: x.line || '', city: x.city || '' }); };
  const setF = (setter, obj, k) => (e) => setter({ ...obj, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <div className="ni-wrap">
      <div className="ni-form">
        <div className="page-head">
          <div><h1>New invoice</h1><p className="muted">Fill in the form; the invoice on the right updates as you type.</p></div>
          <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save invoice'}</button>
        </div>

        <section className="panel">
          <h2>Invoice</h2>
          <div className="ni-3">
            <Field label="Invoice no."><input value={inv.no} onChange={setF(setInv, inv, 'no')} /></Field>
            <Field label="Invoice date"><input type="date" value={inv.date} onChange={setF(setInv, inv, 'date')} /></Field>
            <Field label="Status"><select value={inv.status} onChange={setF(setInv, inv, 'status')}><option value="draft">Draft</option><option value="unpaid">Unpaid</option><option value="paid">Paid</option></select></Field>
          </div>
        </section>

        <section className="panel">
          <h2>Bill to</h2>
          {customers.length > 0 && (
            <Field label="Pick a saved customer"><select defaultValue="" onChange={(e) => pick(e.target.value)}>
              <option value="">— choose —</option>
              {customers.map((x, k) => <option key={k} value={k}>{[x.company, x.name, x.phone].filter(Boolean).join(' · ')}</option>)}
            </select></Field>
          )}
          <Field label="Company name" hint="Leave empty for a person."><input value={c.company} onChange={setF(setC, c, 'company')} /></Field>
          <div className="grid-2">
            <Field label="Contact person (Attn)"><input value={c.name} onChange={setF(setC, c, 'name')} /></Field>
            <Field label="Phone"><input inputMode="tel" value={c.phone} onChange={setF(setC, c, 'phone')} /></Field>
            <Field label="Email"><input type="email" value={c.email} onChange={setF(setC, c, 'email')} /></Field>
            <Field label="City"><input value={c.city} onChange={setF(setC, c, 'city')} /></Field>
          </div>
          <Field label="Address"><textarea rows={2} value={c.line} onChange={setF(setC, c, 'line')} /></Field>
        </section>

        <section className="panel">
          <h2>Ship to</h2>
          <label className="check big"><input type="checkbox" checked={ship.same} onChange={setF(setShip, ship, 'same')} /> Same as Bill to</label>
          {!ship.same && (
            <>
              <Field label="Company name"><input value={ship.company} onChange={setF(setShip, ship, 'company')} /></Field>
              <div className="grid-2">
                <Field label="Receiver"><input value={ship.name} onChange={setF(setShip, ship, 'name')} /></Field>
                <Field label="Phone"><input value={ship.phone} onChange={setF(setShip, ship, 'phone')} /></Field>
              </div>
              <Field label="Address"><textarea rows={2} value={ship.line} onChange={setF(setShip, ship, 'line')} /></Field>
              <Field label="City"><input value={ship.city} onChange={setF(setShip, ship, 'city')} /></Field>
            </>
          )}
        </section>

        <section className="panel">
          <div className="ni-items-head"><h2>Items</h2><button type="button" className="btn btn-ghost btn-sm" onClick={() => setItems([...items, blankItem()])}><LuPlus /> Add item</button></div>
          <datalist id="inv-catalog">{[...catalog.keys()].slice(0, 6000).map((n) => <option key={n} value={n} />)}</datalist>
          {items.map((it, i) => (
            <div key={i} className="ni-item">
              <div className="ni-item-top">
                <b>Item {i + 1}</b>
                <div className="pair-tools">
                  <button type="button" className="icon-btn" onClick={() => setItems(move(items, i, -1))} disabled={!i} aria-label="Move up"><LuArrowUp /></button>
                  <button type="button" className="icon-btn" onClick={() => setItems(move(items, i, 1))} disabled={i === items.length - 1} aria-label="Move down"><LuArrowDown /></button>
                  <button type="button" className="icon-btn" onClick={() => setItems(items.length > 1 ? items.filter((_, j) => j !== i) : [blankItem()])} aria-label="Remove item"><LuTrash2 /></button>
                </div>
              </div>
              <Field label="Description" hint="Type to pick a product or service from your store."><input list="inv-catalog" value={it.name} onChange={(e) => setItem(i, { name: e.target.value })} /></Field>
              <Field label="Detail (model, warranty, scope)"><input value={it.note} onChange={(e) => setItem(i, { note: e.target.value })} /></Field>
              <div className="ni-3">
                <Field label="Unit"><select value={it.unit} onChange={(e) => setItem(i, { unit: e.target.value })}>{UNITS.map((u) => <option key={u} value={u}>{u || '—'}</option>)}</select></Field>
                <Field label="Qty"><input inputMode="numeric" value={it.quantity} onChange={(e) => setItem(i, { quantity: e.target.value })} /></Field>
                <Field label="Unit price (BDT)"><input inputMode="decimal" value={it.price} onChange={(e) => setItem(i, { price: e.target.value })} /></Field>
              </div>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Totals</h2>
          <div className="ni-3">
            <Field label="Discount (BDT)"><input inputMode="decimal" value={money.discount} onChange={setF(setMoney, money, 'discount')} /></Field>
            <Field label="Delivery / installation (BDT)"><input inputMode="decimal" value={money.shipping} onChange={setF(setMoney, money, 'shipping')} /></Field>
            <Field label="VAT (%)" hint="Empty = no VAT"><input inputMode="decimal" value={money.vatRate} onChange={setF(setMoney, money, 'vatRate')} /></Field>
          </div>
        </section>

        <section className="panel">
          <h2>Payment</h2>
          <div className="grid-2">
            <Field label="Payment method"><select value={pay.method} onChange={setF(setPay, pay, 'method')}>
              <option value="bank">Bank transfer</option><option value="cheque">Cheque</option><option value="cash">Cash</option><option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="card">Card</option><option value="cod">Cash on delivery</option>
            </select></Field>
            <Field label="Transaction ID / cheque no." hint="Optional"><input value={pay.ref} onChange={setF(setPay, pay, 'ref')} /></Field>
          </div>
        </section>

        <section className="panel">
          <h2>Terms &amp; conditions</h2>
          <Field label="One point per line" hint="Starts from the terms in Store settings → Invoice. Change them for this invoice only."><textarea rows={5} value={terms} onChange={(e) => setTerms(e.target.value)} /></Field>
          <p className="muted small">Seal, signature and company details come from Store settings → Invoice.</p>
        </section>

        <div className="ni-save"><button className="btn btn-primary btn-lg" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save invoice'}</button></div>
      </div>

      <aside className="ni-side">
        {settings ? <Preview><Invoice order={draft} settings={settings} base={import.meta.env.BASE_URL.replace(/\/$/, '')} /></Preview> : null}
      </aside>
    </div>
  );
}
