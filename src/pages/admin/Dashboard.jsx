import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminListOrders, adminListProducts, adminListQuotes, errText, seedCatalog } from '../../lib/db';
import { useCatalog } from '../../context/CatalogContext';
import { Spinner, useTitle } from '../../components/ui';
import { money } from '../../config';

export default function Dashboard() {
  useTitle('Admin');
  const { reload } = useCatalog();
  const [d, setD] = useState(null);
  const load = () => Promise.all([adminListOrders(), adminListProducts(), adminListQuotes()])
    .then(([orders, products, quotes]) => setD({ orders, products, quotes }))
    .catch((e) => { toast.error(errText(e)); setD({ orders: [], products: [], quotes: [] }); });
  useEffect(() => { load(); }, []);

  const s = useMemo(() => {
    if (!d) return null;
    const live = d.orders.filter((o) => o.status !== 'cancelled');
    const dayMs = 864e5;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 14 }, (_, i) => {
      const start = today.getTime() - (13 - i) * dayMs;
      const sum = live.filter((o) => o.createdAt >= start && o.createdAt < start + dayMs).reduce((n, o) => n + o.total, 0);
      return { start, sum };
    });
    return {
      revenue30: live.filter((o) => o.createdAt > Date.now() - 30 * dayMs).reduce((n, o) => n + o.total, 0),
      pending: d.orders.filter((o) => o.status === 'pending').length,
      newQuotes: d.quotes.filter((q) => q.status === 'new').length,
      low: d.products.filter((p) => p.status === 'active' && p.stock <= 3).sort((a, b) => a.stock - b.stock),
      days, peak: Math.max(1, ...days.map((x) => x.sum)),
    };
  }, [d]);

  if (!d) return <Spinner />;

  const seed = async () => {
    if (!window.confirm('Add the starter catalog (10 categories, 21 products)? Products with the same IDs are overwritten.')) return;
    try { await seedCatalog(); await reload(); await load(); toast.success('Starter catalog added'); } catch (e) { toast.error(errText(e)); }
  };

  return (
    <div className="admin-page">
      <h1>Overview</h1>
      {d.products.length === 0 && (
        <div className="panel warn">
          <h2>Your catalog is empty</h2>
          <p>Load the starter catalog to see the store working, then edit prices and add your own photos.</p>
          <button className="btn btn-primary" onClick={seed}>Load starter catalog</button>
        </div>
      )}
      <div className="kpis">
        <div className="kpi"><span>Revenue, last 30 days</span><b>{money(s.revenue30)}</b></div>
        <Link to="/admin/orders?status=pending" className="kpi"><span>Orders to confirm</span><b>{s.pending}</b></Link>
        <Link to="/admin/quotes" className="kpi"><span>New quote requests</span><b>{s.newQuotes}</b></Link>
        <Link to="/admin/products" className="kpi"><span>Active products</span><b>{d.products.filter((p) => p.status === 'active').length}</b></Link>
      </div>

      <div className="admin-grid">
        <section className="panel">
          <h2>Sales, last 14 days</h2>
          <div className="bars" role="img" aria-label="Daily sales for the last 14 days">
            {s.days.map((x) => (
              <div key={x.start} className="bar" title={`${new Date(x.start).toLocaleDateString('en-GB')}: ${money(x.sum)}`}>
                <i style={{ height: `${(x.sum / s.peak) * 100}%` }} />
                <small>{new Date(x.start).getDate()}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Low stock</h2>
          {s.low.length === 0 ? <p className="muted">Every active product has more than 3 units.</p> : (
            <ul className="mini-list">
              {s.low.slice(0, 8).map((p) => <li key={p.id}><Link to={`/admin/products/${p.id}`}>{p.name}</Link><b className={p.stock ? 'warn-text' : 'danger-text'}>{p.stock}</b></li>)}
            </ul>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-head"><h2>Latest orders</h2><Link to="/admin/orders" className="link-strong">All orders</Link></div>
        {d.orders.length === 0 ? <p className="muted">No orders yet. They appear here as soon as a customer checks out.</p> : (
          <table className="table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>
            {d.orders.slice(0, 6).map((o) => (
              <tr key={o.id}><td><b>{o.orderNumber}</b></td><td>{o.customer?.name}<br /><small>{o.customer?.phone}</small></td><td>{money(o.total)}</td><td><span className={`status s-${o.status}`}>{o.status}</span></td><td>{new Date(o.createdAt).toLocaleDateString('en-GB')}</td></tr>
            ))}
          </tbody></table>
        )}
      </section>
      {d.products.length > 0 && <p className="muted small">Need sample data again? <button className="link" onClick={seed}>Reload the starter catalog</button></p>}
    </div>
  );
}
