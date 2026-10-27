import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminListOrders, adminListProducts, adminListQuotes, chatCol, errText, seedCatalog } from '../../lib/db';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Spinner, useTitle } from '../../components/ui';
import { STATUS_LABEL, money } from '../../config';

const DAY = 864e5;
const startOfDay = (t = Date.now()) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };

export default function Dashboard() {
  useTitle('Overview');
  const { reload } = useStore();
  const { can, user } = useAuth();
  const [d, setD] = useState(null);
  const [range, setRange] = useState(30);
  const load = () => Promise.all([
    can('sales') ? adminListOrders() : [], can('catalog') ? adminListProducts() : [], can('sales') ? adminListQuotes() : [],
    chatCol().list({ where: [['status', 'in', ['waiting', 'open']]] }).catch(() => []),
  ]).then(([orders, products, quotes, chats]) => setD({ orders, products, quotes, chats })).catch((e) => { toast.error(errText(e)); setD({ orders: [], products: [], quotes: [], chats: [] }); });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const s = useMemo(() => {
    if (!d) return null;
    const live = d.orders.filter((o) => o.status !== 'cancelled');
    const since = startOfDay() - (range - 1) * DAY;
    const prevSince = since - range * DAY;
    const inRange = live.filter((o) => o.createdAt >= since);
    const prev = live.filter((o) => o.createdAt >= prevSince && o.createdAt < since);
    const rev = inRange.reduce((n, o) => n + o.total, 0);
    const prevRev = prev.reduce((n, o) => n + o.total, 0);
    const days = Array.from({ length: range }, (_, i) => {
      const t0 = since + i * DAY;
      return { t0, sum: live.filter((o) => o.createdAt >= t0 && o.createdAt < t0 + DAY).reduce((n, o) => n + o.total, 0) };
    });
    const top = {};
    inRange.forEach((o) => o.items.forEach((i) => { top[i.name] = (top[i.name] || 0) + i.price * i.quantity; }));
    const customers = new Set(inRange.map((o) => o.phoneKey || o.customer?.phone));
    const pipeline = Object.keys(STATUS_LABEL).map((k) => [k, d.orders.filter((o) => o.status === k).length]);
    return {
      rev, prevRev, orders: inRange.length, aov: inRange.length ? rev / inRange.length : 0, customers: customers.size,
      today: live.filter((o) => o.createdAt >= startOfDay()).reduce((n, o) => n + o.total, 0),
      days, peak: Math.max(1, ...days.map((x) => x.sum)),
      top: Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 6),
      low: d.products.filter((p) => p.status === 'active' && p.price && p.stock <= 2).sort((a, b) => a.stock - b.stock).slice(0, 8),
      pipeline,
      openLeads: d.quotes.filter((q) => !['won', 'lost'].includes(q.status)),
      leadValue: d.quotes.filter((q) => !['won', 'lost'].includes(q.status)).reduce((n, q) => n + (q.value || 0), 0),
      waiting: d.chats.filter((c) => c.status === 'waiting').length,
    };
  }, [d, range]);

  if (!d) return <Spinner />;
  const change = s.prevRev ? Math.round(((s.rev - s.prevRev) / s.prevRev) * 100) : null;
  const seed = async () => {
    try { await seedCatalog(); await reload(); await load(); toast.success('Starter catalog loaded'); } catch (e) { toast.error(errText(e)); }
  };

  return (
    <div className="admin-page">
      <div className="page-head">
        <div><h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}{user?.profile?.name ? `, ${user.profile.name.split(' ')[0]}` : ''}</h1><p className="muted">Here is how the store is doing.</p></div>
        <div className="seg">{[7, 30, 90].map((r) => <button key={r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r} days</button>)}</div>
      </div>

      {can('catalog') && d.products.length === 0 && (
        <div className="panel warn">
          <h2>Your catalog is empty</h2>
          <p>Load the starter catalog (Apple lineup plus popular gadgets and network gear with today’s market prices), then edit prices and add photos.</p>
          <button className="btn btn-primary" onClick={seed}>Load starter catalog</button>
        </div>
      )}

      <div className="kpis">
        <div className="kpi"><span>Revenue</span><b>{money(s.rev)}</b>{change !== null && <small className={change >= 0 ? 'up' : 'down'}>{change >= 0 ? '+' : ''}{change}% vs previous {range} days</small>}</div>
        <div className="kpi"><span>Orders</span><b>{s.orders}</b><small>Average {money(s.aov)}</small></div>
        <div className="kpi"><span>Customers</span><b>{s.customers}</b><small>Ordered in this period</small></div>
        <div className="kpi"><span>Sales today</span><b>{money(s.today)}</b></div>
        <Link to="/admin/leads" className="kpi"><span>Open leads</span><b>{s.openLeads.length}</b><small>{money(s.leadValue)} estimated</small></Link>
        <Link to="/admin/inbox" className={`kpi ${s.waiting ? 'alert' : ''}`}><span>Chats waiting</span><b>{s.waiting}</b><small>{s.waiting ? 'Customers need a reply' : 'All caught up'}</small></Link>
      </div>

      <div className="admin-grid">
        <section className="panel">
          <div className="panel-head"><h2>Revenue by day</h2><span className="muted small">Peak {money(s.peak)}</span></div>
          <div className="bars" role="img" aria-label={`Daily revenue for the last ${range} days`}>
            {s.days.map((x) => (
              <div key={x.t0} className="bar" title={`${new Date(x.t0).toLocaleDateString('en-GB')}: ${money(x.sum)}`}>
                <i style={{ transform: `scaleY(${x.sum / s.peak})` }} />
              </div>
            ))}
          </div>
          <div className="bars-axis"><span>{new Date(s.days[0].t0).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span><span>Today</span></div>
        </section>
        <section className="panel">
          <h2>Order pipeline</h2>
          <ul className="pipe">
            {s.pipeline.map(([k, n]) => <li key={k}><Link to={`/admin/orders?status=${k}`}><span className={`status s-${k}`}>{STATUS_LABEL[k]}</span><b>{n}</b></Link></li>)}
          </ul>
        </section>
      </div>

      <div className="admin-grid even">
        <section className="panel">
          <h2>Best sellers</h2>
          {s.top.length === 0 ? <p className="muted">No sales in this period yet.</p> : (
            <ul className="mini-list">{s.top.map(([name, v]) => <li key={name}><span>{name}</span><b>{money(v)}</b></li>)}</ul>
          )}
        </section>
        <section className="panel">
          <div className="panel-head"><h2>Low stock</h2>{can('catalog') && <Link to="/admin/products" className="link-strong">Products</Link>}</div>
          {s.low.length === 0 ? <p className="muted">Every product has 3 or more units.</p> : (
            <ul className="mini-list">{s.low.map((p) => <li key={p.id}><Link to={`/admin/products/${p.id}`}>{p.name}</Link><b className={p.stock ? 'warn-text' : 'danger-text'}>{p.stock}</b></li>)}</ul>
          )}
        </section>
      </div>

      {can('sales') && (
        <section className="panel">
          <div className="panel-head"><h2>Latest orders</h2><Link to="/admin/orders" className="link-strong">All orders</Link></div>
          {d.orders.length === 0 ? <p className="muted">No orders yet. They appear here as soon as a customer checks out.</p> : (
            <div className="table-wrap flat"><table className="table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Placed</th></tr></thead><tbody>
              {d.orders.slice(0, 8).map((o) => (
                <tr key={o.id}><td><Link to={`/admin/orders?open=${o.id}`}><b>{o.orderNumber}</b></Link></td><td>{o.customer?.name}<br /><small>{o.customer?.phone}</small></td><td>{money(o.total)}</td><td><span className={`status s-${o.status}`}>{STATUS_LABEL[o.status]}</span></td><td>{new Date(o.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</td></tr>
              ))}
            </tbody></table></div>
          )}
        </section>
      )}
      {can('catalog') && d.products.length > 0 && <p className="muted small">Need the starter products again? <button className="link" onClick={seed}>Reload the starter catalog</button> (overwrites the starter items, keeps products you added).</p>}
    </div>
  );
}
