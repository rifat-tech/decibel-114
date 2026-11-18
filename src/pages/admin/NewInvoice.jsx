// Admin → Orders → New invoice: bill a customer directly (IT projects, corporate sales, walk-ins).
// It is saved as an order, so it appears in Orders, the customer profile and reports.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuPlus, LuTrash2 } from 'react-icons/lu';
import { Field, useTitle } from '../../components/ui';
import { adminGetOrder, createOrder, errText, updateOrder } from '../../lib/db';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { money } from '../../config';

const blankItem = () => ({ name: '', note: '', price: '', quantity: 1 });
const num = (v) => Number(String(v).replace(/[^\d.]/g, '')) || 0;

export default function NewInvoice() {
  useTitle('New invoice');
  const nav = useNavigate();
  const { products, content } = useStore();
  const { user } = useAuth();
  const by = user?.profile?.name || user?.email || 'staff';
  const [c, setC] = useState({ name: '', company: '', phone: '', email: '', line: '', city: 'Dhaka' });
  const [items, setItems] = useState([blankItem()]);
  const [extra, setExtra] = useState({ vatRate: '', shipping: '', discount: '', paymentMethod: 'cash', paid: false, paymentRef: '', notes: '' });
  const [busy, setBusy] = useState(false);

  // Products and solution services to pick from, by name.
  const catalog = useMemo(() => {
    const m = new Map();
    products.forEach((p) => p.name && m.set(p.name, { price: p.price || 0, note: p.brand || '' }));
    [...(content.it.services || []), ...(content.agri.services || [])].forEach((s) => s.t && !m.has(s.t) && m.set(s.t, { price: 0, note: 'Service' }));
    return m;
  }, [products, content]);

  const setItem = (i, patch) => setItems((a) => a.map((x, j) => {
    if (j !== i) return x;
    const next = { ...x, ...patch };
    const hit = patch.name !== undefined && catalog.get(patch.name);
    if (hit) { if (!num(x.price) && hit.price) next.price = String(hit.price); if (!x.note && hit.note) next.note = hit.note; }
    return next;
  }));
  const rows = items.filter((i) => i.name.trim() && num(i.quantity) > 0);
  const subtotal = rows.reduce((n, i) => n + num(i.price) * num(i.quantity), 0);
  const vatRate = num(extra.vatRate);
  const vat = Math.round(subtotal * vatRate / 100);
  const shipping = num(extra.shipping), discount = num(extra.discount);
  const total = Math.max(0, subtotal + vat + shipping - discount);

  async function save() {
    if (!c.name.trim() || !c.phone.trim()) return toast.error('Add the customer name and phone.');
    if (!rows.length) return toast.error('Add at least one item.');
    setBusy(true);
    try {
      const order = {
        source: 'manual', createdBy: by,
        customer: { name: c.name.trim(), phone: c.phone.trim(), email: c.email.trim(), company: c.company.trim() },
        address: { line: c.line.trim(), city: c.city.trim(), zone: /dhaka/i.test(c.city) ? 'dhaka' : 'outside' },
        items: rows.map((i) => ({ name: i.name.trim(), note: i.note.trim(), price: num(i.price), quantity: num(i.quantity) })),
        subtotal, vat, vatRate, shipping, discount, total,
        paymentMethod: extra.paymentMethod, paymentRef: extra.paymentRef.trim(), notes: extra.notes.trim(),
      };
      const { id } = await createOrder(order, null);
      const saved = await adminGetOrder(id);
      await updateOrder(saved, { status: 'confirmed', ...(extra.paid ? { paymentStatus: 'paid' } : {}) }, by);
      toast.success(`Invoice ${saved.orderNumber} created`);
      nav(`/admin/invoice/${id}`);
    } catch (e) { toast.error(errText(e)); } finally { setBusy(false); }
  }

  const set = (k) => (e) => setC({ ...c, [k]: e.target.value });
  const setX = (k) => (e) => setExtra({ ...extra, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  return (
    <div className="admin-page">
      <div className="page-head">
        <div><h1>New invoice</h1><p className="muted">For IT projects, corporate orders and walk-in sales. It is saved under Orders.</p></div>
        <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Creating…' : 'Create invoice'}</button>
      </div>

      <section className="panel narrow-panel">
        <h2>Bill to</h2>
        <div className="grid-2">
          <Field label="Customer name"><input value={c.name} onChange={set('name')} /></Field>
          <Field label="Company" hint="Optional"><input value={c.company} onChange={set('company')} /></Field>
          <Field label="Phone"><input inputMode="tel" value={c.phone} onChange={set('phone')} /></Field>
          <Field label="Email" hint="Optional"><input type="email" value={c.email} onChange={set('email')} /></Field>
          <Field label="Address"><input value={c.line} onChange={set('line')} /></Field>
          <Field label="City"><input value={c.city} onChange={set('city')} /></Field>
        </div>
      </section>

      <section className="panel">
        <h2>Items</h2>
        <p className="muted small">Start typing a product or service name to pick it; the price fills in for products. Prices in taka.</p>
        <datalist id="inv-catalog">{[...catalog.keys()].slice(0, 6000).map((n) => <option key={n} value={n} />)}</datalist>
        <div className="ni-head"><span>Item</span><span>Detail</span><span>Price (৳)</span><span>Qty</span><span>Total</span><span /></div>
        {items.map((it, i) => (
          <div key={i} className="ni-row">
            <input list="inv-catalog" value={it.name} onChange={(e) => setItem(i, { name: e.target.value })} placeholder="Product or service" aria-label="Item" />
            <input value={it.note} onChange={(e) => setItem(i, { note: e.target.value })} placeholder="Model, warranty, scope…" aria-label="Detail" />
            <input inputMode="numeric" value={it.price} onChange={(e) => setItem(i, { price: e.target.value })} aria-label="Price" />
            <input inputMode="numeric" value={it.quantity} onChange={(e) => setItem(i, { quantity: e.target.value })} aria-label="Quantity" />
            <span className="num">{money(num(it.price) * num(it.quantity))}</span>
            <button type="button" className="icon-btn" onClick={() => setItems(items.length > 1 ? items.filter((_, j) => j !== i) : [blankItem()])} aria-label="Remove item"><LuTrash2 /></button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setItems([...items, blankItem()])}><LuPlus /> Add item</button>
      </section>

      <section className="panel narrow-panel">
        <h2>Totals and payment</h2>
        <div className="grid-2">
          <Field label="VAT (%)" hint="Leave empty for no VAT."><input inputMode="decimal" value={extra.vatRate} onChange={setX('vatRate')} /></Field>
          <Field label="Delivery / installation (৳)"><input inputMode="numeric" value={extra.shipping} onChange={setX('shipping')} /></Field>
          <Field label="Discount (৳)"><input inputMode="numeric" value={extra.discount} onChange={setX('discount')} /></Field>
          <Field label="Payment method"><select value={extra.paymentMethod} onChange={setX('paymentMethod')}>
            <option value="cash">Cash</option><option value="bank">Bank transfer</option><option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="card">Card</option><option value="cod">Cash on delivery</option>
          </select></Field>
          <Field label="Transaction ID / cheque no." hint="Optional"><input value={extra.paymentRef} onChange={setX('paymentRef')} /></Field>
        </div>
        <label className="check big"><input type="checkbox" checked={extra.paid} onChange={setX('paid')} /> Already paid (prints a PAID stamp)</label>
        <Field label="Internal note" hint="Not printed."><input value={extra.notes} onChange={setX('notes')} /></Field>
        <dl className="ni-sum">
          <div><dt>Sub total</dt><dd>{money(subtotal)}</dd></div>
          {vat > 0 && <div><dt>VAT {vatRate}%</dt><dd>{money(vat)}</dd></div>}
          {shipping > 0 && <div><dt>Delivery / installation</dt><dd>{money(shipping)}</dd></div>}
          {discount > 0 && <div><dt>Discount</dt><dd>−{money(discount)}</dd></div>}
          <div className="tot"><dt>Total</dt><dd>{money(total)}</dd></div>
        </dl>
      </section>
    </div>
  );
}
