import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Field, useTitle } from '../components/ui';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { checkCoupon, createOrder, errText } from '../lib/db';
import { money, paymentMethods } from '../config';

export default function Checkout() {
  useTitle('Checkout');
  const cart = useCart();
  const { user } = useAuth();
  const { settings: s } = useStore();
  const nav = useNavigate();
  const pr = user?.profile || {};
  const [f, setF] = useState({ name: pr.name || '', phone: pr.phone || '', email: user?.email || '', address: pr.address || '', city: '', zone: 'dhaka', notes: '', payment: 'cod', paymentRef: '' });
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [busy, setBusy] = useState(false);
  if (!cart.items.length) return <Navigate to="/cart" replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const methods = paymentMethods(s);
  const discount = coupon?.off || 0;
  const fee = cart.subtotal - discount >= s.freeShippingOver ? 0 : f.zone === 'dhaka' ? s.shippingInsideDhaka : s.shippingOutsideDhaka;
  const total = cart.subtotal - discount + fee;
  const method = methods.find((m) => m.v === f.payment);

  const apply = async () => {
    if (!code.trim()) return;
    const r = await checkCoupon(code, cart.subtotal).catch(() => ({ ok: false, msg: 'Could not check the code. Try again.' }));
    if (r.ok) { setCoupon(r); toast.success(`Code applied: ${r.label}`); } else { setCoupon(null); toast.error(r.msg); }
  };
  const submit = async (e) => {
    e.preventDefault();
    if (f.phone.replace(/\D/g, '').length < 11) return toast.error('Enter an 11-digit mobile number so we can confirm the order.');
    if (f.payment !== 'cod' && !f.paymentRef.trim()) return toast.error(`Add the ${method.l} transaction ID.`);
    setBusy(true);
    try {
      const res = await createOrder({
        customer: { name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim() },
        address: { line: f.address.trim(), city: f.city.trim(), zone: f.zone },
        items: cart.items.map((i) => ({ id: i.id, name: i.name, option: i.option || '', brand: i.brand, price: i.price, quantity: i.quantity, image: i.image || '', art: i.art || '' })),
        subtotal: cart.subtotal, discount, coupon: coupon?.code || '', shipping: fee, total,
        paymentMethod: f.payment, paymentRef: f.paymentRef.trim(), notes: f.notes.trim(),
      }, user);
      cart.clear();
      nav(`/order/${res.orderNumber}`, { replace: true, state: { total, phone: f.phone } });
    } catch (err) { toast.error(errText(err)); setBusy(false); }
  };

  return (
    <div className="container checkout">
      <h1>Checkout</h1>
      {!user && <p className="muted">Checking out as a guest. <Link to="/login?next=/checkout">Sign in</Link> to keep this order in your account.</p>}
      <form className="checkout-layout" onSubmit={submit}>
        <div>
          <section className="panel">
            <h2>Delivery details</h2>
            <div className="grid-2">
              <Field label="Full name"><input required value={f.name} onChange={set('name')} autoComplete="name" /></Field>
              <Field label="Mobile number"><input required value={f.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" /></Field>
            </div>
            <Field label="Email (optional)" hint="We send the invoice here."><input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></Field>
            <Field label="Address"><textarea required rows={2} value={f.address} onChange={set('address')} placeholder="House, road, area" autoComplete="street-address" /></Field>
            <div className="grid-2">
              <Field label="City or district"><input required value={f.city} onChange={set('city')} /></Field>
              <Field label="Delivery zone">
                <select value={f.zone} onChange={set('zone')}>
                  <option value="dhaka">Inside Dhaka ({money(s.shippingInsideDhaka)})</option>
                  <option value="outside">Outside Dhaka ({money(s.shippingOutsideDhaka)})</option>
                </select>
              </Field>
            </div>
            <Field label="Order note (optional)"><input value={f.notes} onChange={set('notes')} placeholder="Delivery time, company name for invoice…" /></Field>
          </section>
          <section className="panel">
            <h2>Payment</h2>
            <div className="pay-options">
              {methods.map((m) => (
                <label key={m.v} className={`pay-option ${f.payment === m.v ? 'on' : ''}`}>
                  <input type="radio" name="pay" value={m.v} checked={f.payment === m.v} onChange={set('payment')} />
                  <span><b>{m.l}</b><small>{m.s}</small></span>
                </label>
              ))}
            </div>
            {method?.info && (
              <div className="pay-info">
                {method.info.split('|').map((l, i) => <div key={i}>{l}</div>)}
                <div>Amount: <b>{money(total)}</b></div>
                <Field label="Transaction ID"><input value={f.paymentRef} onChange={set('paymentRef')} /></Field>
              </div>
            )}
          </section>
        </div>
        <aside className="summary">
          <h2>Order summary</h2>
          {cart.items.map((i) => <div key={i.key} className="sum-item"><span>{i.name}{i.option ? ` (${i.option})` : ''} × {i.quantity}</span><span>{money(i.price * i.quantity)}</span></div>)}
          <div className="coupon">
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Promo code" aria-label="Promo code" />
            <button type="button" className="btn btn-ghost btn-sm" onClick={apply}>Apply</button>
          </div>
          <div className="sum-row"><span>Subtotal</span><span>{money(cart.subtotal)}</span></div>
          {discount > 0 && <div className="sum-row ok"><span>Promo {coupon.code}</span><span>−{money(discount)}</span></div>}
          <div className="sum-row"><span>Delivery</span><span>{fee ? money(fee) : 'Free'}</span></div>
          <div className="sum-row total"><span>Total</span><strong>{money(total)}</strong></div>
          <button className="btn btn-cart btn-lg btn-block" disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button>
          <p className="muted small">We call to confirm every order before dispatch.</p>
        </aside>
      </form>
    </div>
  );
}
