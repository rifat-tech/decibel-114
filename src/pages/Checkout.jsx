import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Field, useTitle } from '../components/ui';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, errText } from '../lib/db';
import { PAYMENT_METHODS, SITE, money } from '../config';

export default function Checkout() {
  useTitle('Checkout');
  const cart = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const pr = user?.profile || {};
  const [f, setF] = useState({ name: pr.name || '', phone: pr.phone || '', email: user?.email || '', address: pr.address || '', city: '', zone: 'dhaka', notes: '', payment: 'cod', paymentRef: '' });
  const [busy, setBusy] = useState(false);
  if (!cart.items.length) return <Navigate to="/cart" replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const fee = cart.subtotal >= SITE.freeShippingOver ? 0 : f.zone === 'dhaka' ? SITE.shippingInsideDhaka : SITE.shippingOutsideDhaka;
  const total = cart.subtotal + fee;
  const method = PAYMENT_METHODS.find((m) => m.v === f.payment);

  const submit = async (e) => {
    e.preventDefault();
    if (f.phone.replace(/\D/g, '').length < 11) return toast.error('Enter an 11-digit mobile number so we can confirm the order.');
    if (f.payment !== 'cod' && !f.paymentRef.trim()) return toast.error(`Add the ${method.l} transaction ID.`);
    setBusy(true);
    try {
      const res = await createOrder({
        customer: { name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim() },
        address: { line: f.address.trim(), city: f.city.trim(), zone: f.zone },
        items: cart.items.map((i) => ({ id: i.id, name: i.name, brand: i.brand, price: i.price, quantity: i.quantity, image: i.image || '', art: i.art || '' })),
        subtotal: cart.subtotal, shipping: fee, total,
        paymentMethod: f.payment, paymentRef: f.paymentRef.trim(), notes: f.notes.trim(),
      }, user);
      cart.clear();
      nav(`/order/${res.orderNumber}`, { replace: true, state: { total, phone: f.phone, payment: f.payment } });
    } catch (err) { toast.error(errText(err)); setBusy(false); }
  };

  return (
    <div className="container checkout">
      <h1>Checkout</h1>
      {!user && <p className="muted">Ordering as a guest. <Link to="/login?next=/checkout">Sign in</Link> to see this order in your account later.</p>}
      <form className="checkout-layout" onSubmit={submit}>
        <div className="panel">
          <h2>Delivery details</h2>
          <div className="grid-2">
            <Field label="Full name"><input required value={f.name} onChange={set('name')} autoComplete="name" /></Field>
            <Field label="Mobile number"><input required value={f.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" /></Field>
          </div>
          <Field label="Email (optional)" hint="For the invoice."><input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></Field>
          <Field label="Address"><textarea required rows={2} value={f.address} onChange={set('address')} placeholder="House, road, area" autoComplete="street-address" /></Field>
          <div className="grid-2">
            <Field label="City or district"><input required value={f.city} onChange={set('city')} /></Field>
            <Field label="Delivery zone">
              <select value={f.zone} onChange={set('zone')}>
                <option value="dhaka">Inside Dhaka ({money(SITE.shippingInsideDhaka)})</option>
                <option value="outside">Outside Dhaka ({money(SITE.shippingOutsideDhaka)})</option>
              </select>
            </Field>
          </div>
          <Field label="Order notes (optional)"><input value={f.notes} onChange={set('notes')} placeholder="Delivery time, company name for invoice…" /></Field>

          <h2>Payment</h2>
          <div className="pay-options">
            {PAYMENT_METHODS.map((m) => (
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
        </div>

        <aside className="summary">
          <h2>Your order</h2>
          {cart.items.map((i) => (
            <div key={i.id} className="sum-item"><span>{i.name} × {i.quantity}</span><span>{money(i.price * i.quantity)}</span></div>
          ))}
          <div className="sum-row"><span>Subtotal</span><span>{money(cart.subtotal)}</span></div>
          <div className="sum-row"><span>Delivery</span><span>{fee ? money(fee) : 'Free'}</span></div>
          <div className="sum-row total"><span>Total</span><strong>{money(total)}</strong></div>
          <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Placing order…' : `Place order, ${money(total)}`}</button>
          <p className="muted small">We call to confirm every order before dispatch.</p>
        </aside>
      </form>
    </div>
  );
}
