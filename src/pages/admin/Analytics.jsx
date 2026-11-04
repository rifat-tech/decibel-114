import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuEye, LuUsers, LuSearch, LuShoppingCart, LuReceipt, LuSearchX, LuSmartphone, LuMonitor } from 'react-icons/lu';
import { useTitle } from '../../components/ui';
import { useStore } from '../../context/StoreContext';
import { loadStats } from '../../lib/analytics';

const RANGES = [[1, 'Today'], [7, '7 days'], [30, '30 days']];
const n = (v) => Number(v || 0).toLocaleString('en-IN');

// Add up the nested counters of several days.
function sum(days, field) {
  const out = {};
  for (const d of days) for (const [k, v] of Object.entries(d[field] || {})) out[k] = (out[k] || 0) + (Number(v) || 0);
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
}
const total = (days, f) => days.reduce((a, d) => a + (Number(d[f]) || 0), 0);

function Top({ title, rows, empty, render, max = 10, icon }) {
  const top = rows.slice(0, max);
  const peak = top[0]?.[1] || 1;
  return (
    <section className="an-card">
      <h3>{icon}{title}</h3>
      {top.length ? (
        <ol className="an-list">
          {top.map(([k, v]) => (
            <li key={k}>
              <span className="an-bar" style={{ width: `${Math.max(4, (v / peak) * 100)}%` }} aria-hidden="true" />
              <span className="an-k">{render ? render(k) : k}</span>
              <b>{n(v)}</b>
            </li>
          ))}
        </ol>
      ) : <p className="muted small">{empty}</p>}
    </section>
  );
}

export default function Analytics() {
  useTitle('Visitors & searches');
  const { products } = useStore();
  const [days, setDays] = useState(null);
  const [range, setRange] = useState(7);
  useEffect(() => { loadStats(30).then(setDays).catch(() => setDays([])); }, []);
  const sel = useMemo(() => (days || []).slice(-range), [days, range]);
  const bySlug = useMemo(() => Object.fromEntries(products.map((p) => [p.slug, p])), [products]);
  const prodName = (slug) => (bySlug[slug] ? <Link to={`/product/${slug}`} target="_blank">{bySlug[slug].name}</Link> : slug);

  const kpi = [
    ['Visitors', total(sel, 'visitors'), <LuUsers key="i" />, `${n(total(sel, 'newVisitors'))} new`],
    ['Page views', total(sel, 'views'), <LuEye key="i" />, `${n(total(sel, 'sessions'))} visits`],
    ['Searches', total(sel, 'searches'), <LuSearch key="i" />, `${n(sum(sel, 'noResult').reduce((a, [, v]) => a + v, 0))} found nothing`],
    ['Added to cart', total(sel, 'addToCart'), <LuShoppingCart key="i" />, ''],
    ['Orders placed', total(sel, 'orders'), <LuReceipt key="i" />, total(sel, 'sessions') ? `${((total(sel, 'orders') / total(sel, 'sessions')) * 100).toFixed(1)}% of visits` : ''],
  ];
  const chart = (days || []).slice(-Math.max(range, 7));
  const peak = Math.max(1, ...chart.map((d) => Number(d.visitors) || 0));
  const dev = Object.fromEntries(sum(sel, 'device'));
  const devTotal = (dev.mobile || 0) + (dev.desktop || 0);

  return (
    <div className="admin-page an">
      <div className="page-head">
        <div><h1>Visitors & searches</h1><p className="muted">Who visits the store and what they look for. Staff visits are not counted.</p></div>
        <div className="seg" role="tablist">{RANGES.map(([v, l]) => <button key={v} role="tab" aria-selected={range === v} className={range === v ? 'on' : ''} onClick={() => setRange(v)}>{l}</button>)}</div>
      </div>
      {!days ? <p className="muted">Loading…</p> : (
        <>
          <div className="an-kpis">
            {kpi.map(([l, v, i, sub]) => <div key={l} className="an-kpi"><span className="an-ico">{i}</span><span className="an-l">{l}</span><b>{n(v)}</b>{sub && <small>{sub}</small>}</div>)}
          </div>

          <section className="an-card">
            <h3>Visitors per day</h3>
            <div className="an-chart" role="img" aria-label="Visitors per day">
              {chart.map((d) => (
                <div key={d.id} className="an-col" title={`${d.id}: ${n(d.visitors)} visitors, ${n(d.views)} page views`}>
                  <span className="an-num">{d.visitors ? n(d.visitors) : ''}</span>
                  <span className="an-colbar" style={{ height: `${((Number(d.visitors) || 0) / peak) * 100}%` }} />
                  <span className="an-day">{new Date(d.id).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="an-grid">
            <Top title="What people search for" icon={<LuSearch />} rows={sum(sel, 'search')} empty="No searches yet." />
            <Top title="Searches that found nothing" icon={<LuSearchX />} rows={sum(sel, 'noResult')} empty="Every search found something." render={(k) => <>{k} <Link className="an-add" to={`/admin/products/new?name=${encodeURIComponent(k)}`}>Add product</Link></>} />
            <Top title="Questions asked in chat" rows={sum(sel, 'chat')} empty="No chat questions yet." />
            <Top title="Most viewed products" rows={sum(sel, 'product')} empty="No product views yet." render={prodName} />
            <Top title="Most added to cart" rows={sum(sel, 'cart')} empty="Nothing added to cart yet." render={prodName} />
            <Top title="Where visitors come from" rows={sum(sel, 'source')} empty="No visits yet." />
            <Top title="Pages visited" rows={sum(sel, 'page')} empty="No visits yet." />
            <section className="an-card">
              <h3>Phone or computer</h3>
              {devTotal ? (
                <div className="an-dev">
                  <div><LuSmartphone /><b>{Math.round(((dev.mobile || 0) / devTotal) * 100)}%</b><span>Phone ({n(dev.mobile)})</span></div>
                  <div><LuMonitor /><b>{Math.round(((dev.desktop || 0) / devTotal) * 100)}%</b><span>Computer ({n(dev.desktop)})</span></div>
                </div>
              ) : <p className="muted small">No visits yet.</p>}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
