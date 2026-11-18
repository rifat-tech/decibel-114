// Admin → Invoices: every invoice made in the admin, with search and quick actions.
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuCopy, LuDownload, LuEye, LuFilePlus, LuPencil, LuTrash2 } from 'react-icons/lu';
import { Spinner, useTitle } from '../../components/ui';
import { adminDeleteOrder, adminListOrders, errText } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';

const day = (t) => (t ? new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const amt = (n) => (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const STATUS = { draft: 'Draft', sent: 'Sent', unpaid: 'Sent', paid: 'Paid' };

export default function Invoices() {
  useTitle('Invoices');
  const nav = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.profile?.role === 'admin';
  const [list, setList] = useState(null);
  const [q, setQ] = useState('');
  const [st, setSt] = useState('');
  useEffect(() => { adminListOrders().then((all) => setList(all.filter((o) => o.source === 'manual'))).catch((e) => { toast.error(errText(e)); setList([]); }); }, []);

  const statusOf = (o) => o.invoiceStatus || (o.paymentStatus === 'paid' ? 'paid' : 'sent');
  const shown = useMemo(() => (list || [])
    .filter((o) => !st || STATUS[statusOf(o)] === STATUS[st])
    .filter((o) => !q || `${o.invoiceNo} ${o.orderNumber} ${o.customer?.company} ${o.customer?.name} ${o.customer?.phone}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.invoiceDate || b.createdAt) - (a.invoiceDate || a.createdAt)), [list, q, st]);

  async function remove(o) {
    if (!window.confirm(`Delete invoice ${o.invoiceNo || o.orderNumber} for ${o.customer?.company || o.customer?.name}? This cannot be undone.`)) return;
    try { await adminDeleteOrder(o.id); setList((l) => l.filter((x) => x.id !== o.id)); toast.success('Invoice deleted'); } catch (e) { toast.error(errText(e)); }
  }

  if (!list) return <Spinner />;
  const totalOpen = list.filter((o) => statusOf(o) !== 'paid' && statusOf(o) !== 'draft').reduce((n, o) => n + Math.max(0, (o.total || 0) - (o.advance || 0)), 0);
  return (
    <div className="admin-page">
      <div className="page-head">
        <div><h1>Invoices</h1><p className="muted">{list.length} invoices · BDT {amt(totalOpen)} waiting to be paid</p></div>
        <Link className="btn btn-primary" to="/admin/invoices/new"><LuFilePlus /> New invoice</Link>
      </div>
      <div className="toolbar">
        <input placeholder="Search invoice no., customer or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={st} onChange={(e) => setSt(e.target.value)} aria-label="Status"><option value="">All statuses</option><option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option></select>
      </div>
      {shown.length === 0 ? (
        <div className="panel empty-panel"><p>No invoices yet.</p><Link className="btn btn-primary" to="/admin/invoices/new"><LuFilePlus /> Create the first invoice</Link></div>
      ) : (
        <div className="table-wrap"><table className="table">
          <thead><tr><th>Invoice no.</th><th>Date</th><th>Customer</th><th className="num">Total (BDT)</th><th>Status</th><th /></tr></thead>
          <tbody>
            {shown.map((o) => {
              const s = statusOf(o);
              return (
                <tr key={o.id}>
                  <td><Link to={`/admin/invoice/${o.id}`}><b>{o.invoiceNo || o.orderNumber}</b></Link></td>
                  <td>{day(o.invoiceDate || o.createdAt)}</td>
                  <td>{o.customer?.company || o.customer?.name}<br /><small className="muted">{o.customer?.company ? o.customer?.name : o.customer?.phone}</small></td>
                  <td className="num">{amt(o.total)}</td>
                  <td><span className={`inv-status ${s === 'unpaid' ? 'sent' : s}`}>{STATUS[s] || s}</span></td>
                  <td className="inv-actions">
                    <button className="icon-btn" title="View" aria-label="View" onClick={() => nav(`/admin/invoice/${o.id}`)}><LuEye /></button>
                    <button className="icon-btn" title="Edit" aria-label="Edit" onClick={() => nav(`/admin/invoices/${o.id}/edit`)}><LuPencil /></button>
                    <button className="icon-btn" title="Duplicate" aria-label="Duplicate" onClick={() => nav(`/admin/invoices/new?from=${o.id}`)}><LuCopy /></button>
                    <button className="icon-btn" title="Download PDF" aria-label="Download PDF" onClick={() => nav(`/admin/invoice/${o.id}?pdf=1`)}><LuDownload /></button>
                    {isAdmin && <button className="icon-btn danger" title="Delete" aria-label="Delete" onClick={() => remove(o)}><LuTrash2 /></button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      )}
    </div>
  );
}
