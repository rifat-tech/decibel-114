import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaWhatsapp } from 'react-icons/fa6';
import { LuPhone, LuPrinter, LuDownload } from 'react-icons/lu';
import Drawer from './Drawer';
import { Spinner, useTitle } from '../../components/ui';
import { adminListOrders, errText, phoneKey, updateOrder } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { ORDER_STATUSES, STATUS_LABEL, money, telHref, waLink } from '../../config';

const fmt = (t) => new Date(t).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

function OrderDetail({ o, onPatch }) {
  const { user } = useAuth();
  const [note, setNote] = useState('');
  const by = user?.profile?.name || user?.email || 'staff';
  const next = { pending: 'confirmed', confirmed: 'processing', processing: 'shipped', shipped: 'delivered' }[o.status];
  const addNote = () => { if (!note.trim()) return; onPatch({ internalNotes: [...(o.internalNotes || []), { text: note.trim(), at: Date.now(), by }] }); setNote(''); };
  return (
    <div className="order-detail" id="print-area">
      <div className="od-actions no-print">
        {next && <button className="btn btn-primary" onClick={() => onPatch({ status: next })}>Mark as {STATUS_LABEL[next].toLowerCase()}</button>}
        <select value={o.status} onChange={(e) => onPatch({ status: e.target.value })} aria-label="Order status">{ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
        <button className="btn btn-ghost" onClick={() => onPatch({ paymentStatus: o.paymentStatus === 'paid' ? 'pending' : 'paid' })}>{o.paymentStatus === 'paid' ? 'Mark unpaid' : 'Mark paid'}</button>
      </div>
      <div className="od-grid">
        <section>
          <h3>Customer</h3>
          <p><b>{o.customer?.name}</b><br />{o.customer?.phone}{o.customer?.email && <><br />{o.customer.email}</>}</p>
          <p>{o.address?.line}<br />{o.address?.city} ({o.address?.zone === 'dhaka' ? 'inside Dhaka' : 'outside Dhaka'})</p>
          <div className="row-gap no-print">
            <a className="btn btn-ghost btn-sm" href={telHref(o.customer?.phone)}><LuPhone /> Call</a>
            <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href={waLink(o.customer?.phone, `Hello ${o.customer?.name}, this is Decibel-114 about your order ${o.orderNumber}.`)}><FaWhatsapp /> WhatsApp</a>
            <Link className="btn btn-ghost btn-sm" to={`/admin/customers?open=${phoneKey(o.customer?.phone)}`}>Customer profile</Link>
          </div>
        </section>
        <section>
          <h3>Payment</h3>
          <p>{o.paymentMethod?.toUpperCase()} · <span className={o.paymentStatus === 'paid' ? 'ok-text' : 'warn-text'}>{o.paymentStatus}</span>{o.paymentRef && <><br />Transaction ID: <b>{o.paymentRef}</b></>}</p>
          {o.notes && <p><b>Customer note:</b> {o.notes}</p>}
        </section>
      </div>
      <h3>Items</h3>
      <table className="table compact"><tbody>
        {o.items.map((i, k) => <tr key={k}><td>{i.name}{i.option ? ` (${i.option})` : ''}</td><td>× {i.quantity}</td><td className="num">{money(i.price * i.quantity)}</td></tr>)}
        {o.discount > 0 && <tr><td>Promo {o.coupon}</td><td /><td className="num">−{money(o.discount)}</td></tr>}
        <tr><td>Delivery</td><td /><td className="num">{o.shipping ? money(o.shipping) : 'Free'}</td></tr>
        <tr className="total"><td>Total</td><td /><td className="num">{money(o.total)}</td></tr>
      </tbody></table>
      <h3>Timeline</h3>
      <ol className="timeline">
        {[...(o.history || [{ status: 'pending', at: o.createdAt, by: 'customer' }])].reverse().map((h, k) => <li key={k}><b>{STATUS_LABEL[h.status]}</b><span>{fmt(h.at)} by {h.by}</span></li>)}
      </ol>
      <div className="no-print">
        <h3>Internal notes</h3>
        {(o.internalNotes || []).map((n, k) => <div key={k} className="note"><p>{n.text}</p><small>{n.by}, {fmt(n.at)}</small></div>)}
        <div className="row-gap"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note only staff can see" onKeyDown={(e) => e.key === 'Enter' && addNote()} /><button className="btn btn-ghost" onClick={addNote}>Add note</button></div>
        <button className="btn btn-ghost" onClick={() => window.print()}><LuPrinter /> Print invoice</button>
      </div>
    </div>
  );
}

export default function Orders() {
  useTitle('Orders');
  const { user } = useAuth();
  const [sp, setSp] = useSearchParams();
  const status = sp.get('status') || '';
  const openId = sp.get('open') || '';
  const [orders, setOrders] = useState(null);
  const [q, setQ] = useState('');
  const [pay, setPay] = useState('');
  useEffect(() => { adminListOrders().then(setOrders).catch((e) => { toast.error(errText(e)); setOrders([]); }); }, []);

  const shown = useMemo(() => (orders || []).filter((o) => (!status || o.status === status) && (!pay || o.paymentStatus === pay) && (!q || `${o.orderNumber} ${o.customer?.name} ${o.customer?.phone} ${o.items.map((i) => i.name).join(' ')}`.toLowerCase().includes(q.toLowerCase()))), [orders, status, q, pay]);
  const counts = useMemo(() => (orders || []).reduce((m, o) => ((m[o.status] = (m[o.status] || 0) + 1), m), {}), [orders]);
  const open = (orders || []).find((o) => o.id === openId);
  const setParam = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n, { replace: true }); };

  const patch = async (o, p) => {
    try {
      const applied = await updateOrder(o, p, user?.profile?.name || user?.email);
      setOrders((cur) => cur.map((x) => (x.id === o.id ? { ...x, ...applied } : x)));
      toast.success('Order updated');
    } catch (e) { toast.error(errText(e)); }
  };
  const exportCsv = () => {
    const head = ['Order', 'Date', 'Customer', 'Phone', 'City', 'Items', 'Subtotal', 'Discount', 'Delivery', 'Total', 'Payment', 'Paid', 'Status'];
    const lines = shown.map((o) => [o.orderNumber, fmt(o.createdAt), o.customer?.name, o.customer?.phone, o.address?.city, o.items.map((i) => `${i.name} x${i.quantity}`).join('; '), o.subtotal, o.discount || 0, o.shipping, o.total, o.paymentMethod, o.paymentStatus, STATUS_LABEL[o.status]].map(csvCell).join(','));
    const url = URL.createObjectURL(new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: `orders-${new Date().toISOString().slice(0, 10)}.csv` }).click();
  };

  if (!orders) return <Spinner />;
  return (
    <div className="admin-page">
      <div className="page-head"><h1>Orders</h1><button className="btn btn-ghost" onClick={exportCsv}><LuDownload /> Export CSV</button></div>
      <div className="seg scroll">
        <button className={!status ? 'on' : ''} onClick={() => setParam('status', '')}>All <b>{orders.length}</b></button>
        {ORDER_STATUSES.map((s) => <button key={s} className={status === s ? 'on' : ''} onClick={() => setParam('status', s)}>{STATUS_LABEL[s]} <b>{counts[s] || 0}</b></button>)}
      </div>
      <div className="toolbar">
        <input placeholder="Search order number, customer, phone or product" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={pay} onChange={(e) => setPay(e.target.value)} aria-label="Payment status"><option value="">Any payment</option><option value="pending">Unpaid</option><option value="paid">Paid</option></select>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th className="num">Total</th><th>Payment</th><th>Status</th><th>Placed</th></tr></thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o.id} className="clickable" onClick={() => setParam('open', o.id)}>
                <td><b>{o.orderNumber}</b></td>
                <td>{o.customer?.name}<br /><small>{o.customer?.phone}</small></td>
                <td><small>{o.items.map((i) => `${i.name} ×${i.quantity}`).join(', ').slice(0, 70)}</small></td>
                <td className="num">{money(o.total)}</td>
                <td>{o.paymentMethod?.toUpperCase()}<br /><small className={o.paymentStatus === 'paid' ? 'ok-text' : 'warn-text'}>{o.paymentStatus}</small></td>
                <td><span className={`status s-${o.status}`}>{STATUS_LABEL[o.status]}</span></td>
                <td><small>{fmt(o.createdAt)}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="muted pad">No orders in this view.</p>}
      </div>
      <Drawer open={!!open} onClose={() => setParam('open', '')} title={open ? `Order ${open.orderNumber}` : ''} sub={open ? `Placed ${fmt(open.createdAt)}` : ''} wide>
        {open && <OrderDetail o={open} onPatch={(p) => patch(open, p)} />}
      </Drawer>
    </div>
  );
}
