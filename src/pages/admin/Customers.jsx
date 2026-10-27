import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaWhatsapp } from 'react-icons/fa6';
import { LuPhone, LuDownload, LuX } from 'react-icons/lu';
import Drawer from './Drawer';
import { Spinner, useTitle } from '../../components/ui';
import { adminListOrders, adminListQuotes, adminListUsers, chatCol, errText, listCrm, phoneKey, saveCrm } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { STATUS_LABEL, money, telHref, waLink } from '../../config';

const fmt = (t) => (t ? new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const SEGMENTS = [['all', 'Everyone'], ['vip', 'Spent ৳2 lakh+'], ['repeat', 'Repeat buyers'], ['lapsed', 'No order in 90 days'], ['leads', 'Leads, never ordered'], ['accounts', 'Has an account']];

function buildIndex({ orders, users, quotes, chats, crm }) {
  const m = new Map();
  const get = (key, seed) => { if (!m.has(key)) m.set(key, { key, name: '', phone: '', email: '', orders: [], quotes: [], chats: [], account: null, ...seed }); return m.get(key); };
  orders.forEach((o) => { const k = phoneKey(o.customer?.phone) || `o:${o.id}`; const c = get(k); c.orders.push(o); c.name ||= o.customer?.name; c.phone ||= o.customer?.phone; c.email ||= o.customer?.email; c.city ||= o.address?.city; });
  users.filter((u) => !['admin', 'manager', 'sales', 'support'].includes(u.role)).forEach((u) => { const k = phoneKey(u.phone) || `u:${u.id}`; const c = get(k); c.account = u; c.name ||= u.name; c.phone ||= u.phone; c.email ||= u.email; c.company ||= u.company; });
  quotes.forEach((q) => { const k = phoneKey(q.phone) || `q:${q.id}`; const c = get(k); c.quotes.push(q); c.name ||= q.name; c.phone ||= q.phone; c.email ||= q.email; c.company ||= q.company; });
  chats.filter((ch) => ch.phone).forEach((ch) => { const k = phoneKey(ch.phone); const c = get(k); c.chats.push(ch); c.name ||= ch.name; c.phone ||= ch.phone; });
  const crmBy = Object.fromEntries(crm.map((x) => [x.id, x]));
  return [...m.values()].map((c) => {
    const live = c.orders.filter((o) => o.status !== 'cancelled');
    const ltv = live.reduce((n, o) => n + o.total, 0);
    const last = Math.max(0, ...c.orders.map((o) => o.createdAt));
    return { ...c, ltv, orderCount: live.length, last, crm: crmBy[c.key] || { tags: [], notes: [] } };
  });
}

function Profile({ c, onCrm }) {
  const { user } = useAuth();
  const [tag, setTag] = useState('');
  const [note, setNote] = useState('');
  const by = user?.profile?.name || user?.email;
  const tags = c.crm.tags || [];
  return (
    <div className="c360">
      <div className="row-gap">
        {c.phone && <a className="btn btn-ghost btn-sm" href={telHref(c.phone)}><LuPhone /> {c.phone}</a>}
        {c.phone && <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href={waLink(c.phone, `Hello ${c.name}, this is Decibel-114.`)}><FaWhatsapp /> WhatsApp</a>}
        {c.email && <a className="btn btn-ghost btn-sm" href={`mailto:${c.email}`}>{c.email}</a>}
      </div>
      <div className="kpis three">
        <div className="kpi"><span>Lifetime value</span><b>{money(c.ltv)}</b></div>
        <div className="kpi"><span>Orders</span><b>{c.orderCount}</b></div>
        <div className="kpi"><span>Last order</span><b className="sm">{fmt(c.last)}</b></div>
      </div>
      <h3>Tags</h3>
      <div className="tags">
        {tags.map((t) => <span key={t} className="tag">{t}<button onClick={() => onCrm({ tags: tags.filter((x) => x !== t) })} aria-label={`Remove ${t}`}><LuX /></button></span>)}
        <input className="tag-input" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Add tag, press Enter" onKeyDown={(e) => { if (e.key === 'Enter' && tag.trim()) { onCrm({ tags: [...new Set([...tags, tag.trim()])] }); setTag(''); } }} />
      </div>
      <h3>Notes</h3>
      {(c.crm.notes || []).slice().reverse().map((n, k) => <div key={k} className="note"><p>{n.text}</p><small>{n.by}, {fmt(n.at)}</small></div>)}
      <div className="row-gap"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Preferences, follow-ups, warranty history…" onKeyDown={(e) => { if (e.key === 'Enter' && note.trim()) { onCrm({ notes: [...(c.crm.notes || []), { text: note.trim(), at: Date.now(), by }] }); setNote(''); } }} />
        <button className="btn btn-ghost" onClick={() => { if (note.trim()) { onCrm({ notes: [...(c.crm.notes || []), { text: note.trim(), at: Date.now(), by }] }); setNote(''); } }}>Add</button></div>
      <h3>Orders ({c.orders.length})</h3>
      {c.orders.length === 0 ? <p className="muted">No orders yet.</p> : (
        <table className="table compact"><tbody>{c.orders.sort((a, b) => b.createdAt - a.createdAt).map((o) => (
          <tr key={o.id}><td><Link to={`/admin/orders?open=${o.id}`}>{o.orderNumber}</Link></td><td>{fmt(o.createdAt)}</td><td><span className={`status s-${o.status}`}>{STATUS_LABEL[o.status]}</span></td><td className="num">{money(o.total)}</td></tr>
        ))}</tbody></table>
      )}
      {c.quotes.length > 0 && <><h3>Quote requests ({c.quotes.length})</h3>{c.quotes.map((q) => <div key={q.id} className="note"><p>{String(q.items).slice(0, 160)}</p><small>{q.status}, {fmt(q.createdAt)}</small></div>)}</>}
      {c.chats.length > 0 && <><h3>Chats</h3>{c.chats.map((ch) => <Link key={ch.id} to={`/admin/inbox?chat=${ch.id}`} className="note link-row"><p>{ch.lastMessage}</p><small>{ch.status}, {fmt(ch.updatedAt)}</small></Link>)}</>}
      {c.account ? <p className="muted small">Has a website account ({c.account.email}).</p> : <p className="muted small">No website account. <Link to="/admin/team">Create one</Link> from Team & accounts.</p>}
    </div>
  );
}

export default function Customers() {
  useTitle('Customers');
  const [sp, setSp] = useSearchParams();
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [seg, setSeg] = useState('all');
  const [tagF, setTagF] = useState('');
  useEffect(() => {
    Promise.all([adminListOrders(), adminListUsers().catch(() => []), adminListQuotes().catch(() => []), chatCol().list({ limit: 500 }).catch(() => []), listCrm().catch(() => [])])
      .then(([orders, users, quotes, chats, crm]) => setData(buildIndex({ orders, users, quotes, chats, crm })))
      .catch((e) => { toast.error(errText(e)); setData([]); });
  }, []);
  const allTags = useMemo(() => [...new Set((data || []).flatMap((c) => c.crm.tags || []))].sort(), [data]);
  const shown = useMemo(() => {
    const t90 = Date.now() - 90 * 864e5;
    return (data || []).filter((c) => {
      if (q && !`${c.name} ${c.phone} ${c.email} ${c.company || ''}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (tagF && !(c.crm.tags || []).includes(tagF)) return false;
      return { all: true, vip: c.ltv >= 200000, repeat: c.orderCount >= 2, lapsed: c.orderCount > 0 && c.last < t90, leads: c.orderCount === 0 && c.quotes.length > 0, accounts: !!c.account }[seg];
    }).sort((a, b) => b.ltv - a.ltv || b.last - a.last);
  }, [data, q, seg, tagF]);
  if (!data) return <Spinner />;
  const open = data.find((c) => c.key === sp.get('open'));
  const onCrm = async (patch) => {
    try {
      await saveCrm(open.key, patch);
      setData((cur) => cur.map((c) => (c.key === open.key ? { ...c, crm: { ...c.crm, ...patch } } : c)));
    } catch (e) { toast.error(errText(e)); }
  };
  const exportCsv = () => {
    const rows = [['Name', 'Phone', 'Email', 'Company', 'Orders', 'Lifetime value', 'Last order', 'Tags'], ...shown.map((c) => [c.name, c.phone, c.email, c.company || '', c.orderCount, c.ltv, fmt(c.last), (c.crm.tags || []).join(' ')])];
    const url = URL.createObjectURL(new Blob([rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: 'customers.csv' }).click();
  };
  return (
    <div className="admin-page">
      <div className="page-head"><div><h1>Customers</h1><p className="muted">Everyone who ordered, asked for a quote, chatted or signed up, matched by phone number.</p></div><button className="btn btn-ghost" onClick={exportCsv}><LuDownload /> Export CSV</button></div>
      <div className="seg scroll">{SEGMENTS.map(([k, l]) => <button key={k} className={seg === k ? 'on' : ''} onClick={() => setSeg(k)}>{l}</button>)}</div>
      <div className="toolbar">
        <input placeholder="Search name, phone, email or company" value={q} onChange={(e) => setQ(e.target.value)} />
        {allTags.length > 0 && <select value={tagF} onChange={(e) => setTagF(e.target.value)} aria-label="Filter by tag"><option value="">Any tag</option>{allTags.map((t) => <option key={t}>{t}</option>)}</select>}
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Customer</th><th>Contact</th><th className="num">Orders</th><th className="num">Lifetime value</th><th>Last order</th><th>Tags</th></tr></thead>
          <tbody>{shown.map((c) => (
            <tr key={c.key} className="clickable" onClick={() => setSp({ open: c.key })}>
              <td><b>{c.name || 'Unknown'}</b>{c.company && <><br /><small>{c.company}</small></>}</td>
              <td>{c.phone}<br /><small>{c.email}</small></td>
              <td className="num">{c.orderCount}</td>
              <td className="num">{money(c.ltv)}</td>
              <td>{fmt(c.last)}</td>
              <td>{(c.crm.tags || []).map((t) => <span key={t} className="tag sm">{t}</span>)}</td>
            </tr>
          ))}</tbody>
        </table>
        {shown.length === 0 && <p className="muted pad">No customers match.</p>}
      </div>
      <Drawer open={!!open} onClose={() => setSp({})} title={open?.name || 'Customer'} sub={open?.company || open?.city} wide>{open && <Profile c={open} onCrm={onCrm} />}</Drawer>
    </div>
  );
}
