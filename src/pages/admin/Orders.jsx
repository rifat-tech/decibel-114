import { Fragment, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaWhatsapp } from 'react-icons/fa6';
import { LuPhone, LuPrinter } from 'react-icons/lu';
import { Spinner, useTitle } from '../../components/ui';
import { adminListOrders, errText, updateOrder } from '../../lib/db';
import { ORDER_STATUSES, money, telHref } from '../../config';

const wa = (phone, text) => `https://wa.me/88${String(phone).replace(/\D/g, '').replace(/^88/, '')}?text=${encodeURIComponent(text)}`;

export default function Orders() {
  useTitle('Orders');
  const [sp, setSp] = useSearchParams();
  const status = sp.get('status') || '';
  const [orders, setOrders] = useState(null);
  const [open, setOpen] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => { adminListOrders().then(setOrders).catch((e) => { toast.error(errText(e)); setOrders([]); }); }, []);

  const shown = useMemo(() => (orders || []).filter((o) => (!status || o.status === status) && (!q || `${o.orderNumber} ${o.customer?.name} ${o.customer?.phone}`.toLowerCase().includes(q.toLowerCase()))), [orders, status, q]);
  const counts = useMemo(() => (orders || []).reduce((m, o) => ((m[o.status] = (m[o.status] || 0) + 1), m), {}), [orders]);

  const patch = async (o, p) => {
    try { await updateOrder(o, p); setOrders((cur) => cur.map((x) => (x.id === o.id ? { ...x, ...p } : x))); toast.success('Order updated'); }
    catch (e) { toast.error(errText(e)); }
  };

  if (!orders) return <Spinner />;
  return (
    <div className="admin-page">
      <h1>Orders</h1>
      <div className="toolbar">
        <div className="seg">
          <button className={!status ? 'on' : ''} onClick={() => setSp({})}>All {orders.length}</button>
          {ORDER_STATUSES.map((s) => <button key={s} className={status === s ? 'on' : ''} onClick={() => setSp({ status: s })}>{s} {counts[s] || 0}</button>)}
        </div>
        <input placeholder="Search order, name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {shown.map((o) => (
              <Fragment key={o.id}>
                <tr className="clickable" onClick={() => setOpen(open === o.id ? '' : o.id)}>
                  <td><b>{o.orderNumber}</b></td>
                  <td>{o.customer?.name}<br /><small>{o.customer?.phone}</small></td>
                  <td>{money(o.total)}</td>
                  <td>{o.paymentMethod.toUpperCase()}<br /><small className={o.paymentStatus === 'paid' ? 'ok-text' : ''}>{o.paymentStatus}</small></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select className={`status-select s-${o.status}`} value={o.status} onChange={(e) => patch(o, { status: e.target.value })} aria-label="Order status">
                      {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</td>
                </tr>
                {open === o.id && (
                  <tr className="detail"><td colSpan={6}>
                    <div className="order-detail">
                      <div>
                        <h4>Items</h4>
                        {o.items.map((i) => <div key={i.id} className="sum-item"><span>{i.name} × {i.quantity}</span><span>{money(i.price * i.quantity)}</span></div>)}
                        <div className="sum-item"><span>Delivery</span><span>{money(o.shipping)}</span></div>
                        <div className="sum-item"><b>Total</b><b>{money(o.total)}</b></div>
                      </div>
                      <div>
                        <h4>Deliver to</h4>
                        <p>{o.customer?.name}<br />{o.address?.line}<br />{o.address?.city} ({o.address?.zone === 'dhaka' ? 'inside Dhaka' : 'outside Dhaka'})</p>
                        {o.customer?.email && <p><small>{o.customer.email}</small></p>}
                        {o.notes && <p><b>Note:</b> {o.notes}</p>}
                        {o.paymentRef && <p><b>Transaction ID:</b> {o.paymentRef}</p>}
                      </div>
                      <div className="order-actions">
                        <a className="btn btn-ghost btn-sm" href={telHref(o.customer?.phone)}><LuPhone /> Call</a>
                        <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href={wa(o.customer?.phone, `Hello ${o.customer?.name}, this is Decibel-114 about order ${o.orderNumber}.`)}><FaWhatsapp /> WhatsApp</a>
                        <button className="btn btn-ghost btn-sm" onClick={() => patch(o, { paymentStatus: o.paymentStatus === 'paid' ? 'pending' : 'paid' })}>{o.paymentStatus === 'paid' ? 'Mark unpaid' : 'Mark paid'}</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => window.print()}><LuPrinter /> Print</button>
                      </div>
                    </div>
                  </td></tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="muted pad">No orders in this view.</p>}
      </div>
    </div>
  );
}
