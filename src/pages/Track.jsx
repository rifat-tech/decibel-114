import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Field, useTitle } from '../components/ui';
import { trackOrder } from '../lib/db';
import { ORDER_STATUSES, money } from '../config';

const LABEL = { pending: 'Received', confirmed: 'Confirmed', processing: 'Packing', shipped: 'On the way', delivered: 'Delivered', cancelled: 'Cancelled' };

export function StatusSteps({ status }) {
  if (status === 'cancelled') return <p className="status-cancel">This order was cancelled. Call us if that is unexpected.</p>;
  const flow = ORDER_STATUSES.filter((s) => s !== 'cancelled');
  const at = flow.indexOf(status);
  return (
    <ol className="status-steps">
      {flow.map((s, i) => <li key={s} className={i <= at ? 'done' : ''}><i />{LABEL[s]}</li>)}
    </ol>
  );
}

export default function Track() {
  useTitle('Track order');
  const [sp] = useSearchParams();
  const [no, setNo] = useState(sp.get('no') || '');
  const [phone, setPhone] = useState('');
  const [res, setRes] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const go = async (e) => {
    e.preventDefault(); setBusy(true);
    try { setRes(await trackOrder(no, phone)); } catch { setRes(null); } finally { setBusy(false); }
  };
  return (
    <div className="container narrow">
      <h1>Track your order</h1>
      <p className="muted">Use the order number from your confirmation and the phone number you ordered with.</p>
      <form className="panel" onSubmit={go}>
        <div className="grid-2">
          <Field label="Order number"><input required value={no} onChange={(e) => setNo(e.target.value)} placeholder="DB…" /></Field>
          <Field label="Phone number"><input required value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" /></Field>
        </div>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Checking…' : 'Check status'}</button>
      </form>
      {res === null && <p className="error-box">No order matches that number and phone. Check both and try again.</p>}
      {res && (
        <div className="panel">
          <h2>Order {res.orderNumber}</h2>
          <p className="muted">{res.itemCount} {res.itemCount === 1 ? 'item' : 'items'}, {money(res.total)}, placed {new Date(res.createdAt).toLocaleDateString('en-GB')}</p>
          <StatusSteps status={res.status} />
        </div>
      )}
    </div>
  );
}
