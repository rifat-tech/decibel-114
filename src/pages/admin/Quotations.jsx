// Admin → Quotations: every quotation and pad letter, with search and quick actions.
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuCopy, LuDownload, LuEye, LuFilePlus, LuPencil, LuTrash2, LuFileText } from 'react-icons/lu';
import { Spinner, useTitle } from '../../components/ui';
import { adminDeleteOrder, adminListQuotations, errText } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';

const day = (t) => (t ? new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const amt = (n) => (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const STATUS = { draft: 'Draft', sent: 'Sent', accepted: 'Accepted', rejected: 'Not accepted' };

export default function Quotations() {
  useTitle('Quotations');
  const nav = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.profile?.role === 'admin';
  const [list, setList] = useState(null);
  const [q, setQ] = useState('');
  const [st, setSt] = useState('');
  useEffect(() => { adminListQuotations().then(setList).catch((e) => { toast.error(errText(e)); setList([]); }); }, []);

  const shown = useMemo(() => (list || [])
    .filter((o) => !st || (o.quoteStatus || 'draft') === st)
    .filter((o) => !q || `${o.quoteNo} ${o.subject} ${o.customer?.company} ${o.customer?.name} ${o.customer?.phone}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.quoteDate || b.createdAt) - (a.quoteDate || a.createdAt)), [list, q, st]);

  async function remove(o) {
    if (!window.confirm(`Delete quotation ${o.quoteNo} for ${o.customer?.company || o.customer?.name}? This cannot be undone.`)) return;
    try { await adminDeleteOrder(o.id); setList((l) => l.filter((x) => x.id !== o.id)); toast.success('Quotation deleted'); } catch (e) { toast.error(errText(e)); }
  }

  if (!list) return <Spinner />;
  const open = list.filter((o) => o.quoteStatus === 'sent').reduce((n, o) => n + (o.total || 0), 0);
  return (
    <div className="admin-page">
      <div className="page-head">
        <div><h1>Quotations</h1><p className="muted">{list.length} on the pad · BDT {amt(open)} sent and waiting for an answer</p></div>
        <div className="row-gap">
          <Link className="btn btn-ghost" to="/admin/quotation/blank"><LuFileText /> Blank pad</Link>
          <Link className="btn btn-primary" to="/admin/quotations/new"><LuFilePlus /> New quotation</Link>
        </div>
      </div>
      <div className="toolbar">
        <input placeholder="Search ref., subject, customer or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={st} onChange={(e) => setSt(e.target.value)} aria-label="Status"><option value="">All statuses</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>
      {shown.length === 0 ? (
        <div className="panel empty-panel"><p>No quotations yet.</p><Link className="btn btn-primary" to="/admin/quotations/new"><LuFilePlus /> Make the first quotation</Link></div>
      ) : (
        <div className="table-wrap"><table className="table">
          <thead><tr><th>Ref.</th><th>Date</th><th>To</th><th>Subject</th><th className="num">Total (BDT)</th><th>Status</th><th /></tr></thead>
          <tbody>
            {shown.map((o) => {
              const s = o.quoteStatus || 'draft';
              return (
                <tr key={o.id}>
                  <td><Link to={`/admin/quotation/${o.id}`}><b>{o.quoteNo}</b></Link></td>
                  <td>{day(o.quoteDate || o.createdAt)}</td>
                  <td>{o.customer?.company || o.customer?.name}<br /><small className="muted">{o.customer?.company ? o.customer?.name : o.customer?.phone}</small></td>
                  <td className="qt-subj-cell">{o.subject || (o.priceTable === false ? 'Letter' : '—')}</td>
                  <td className="num">{o.priceTable === false ? '—' : amt(o.total)}</td>
                  <td><span className={`inv-status q-${s}`}>{STATUS[s] || s}</span></td>
                  <td className="inv-actions">
                    <button className="icon-btn" title="View" aria-label="View" onClick={() => nav(`/admin/quotation/${o.id}`)}><LuEye /></button>
                    <button className="icon-btn" title="Edit" aria-label="Edit" onClick={() => nav(`/admin/quotations/${o.id}/edit`)}><LuPencil /></button>
                    <button className="icon-btn" title="Duplicate" aria-label="Duplicate" onClick={() => nav(`/admin/quotations/new?from=${o.id}`)}><LuCopy /></button>
                    <button className="icon-btn" title="Download PDF" aria-label="Download PDF" onClick={() => nav(`/admin/quotation/${o.id}?pdf=1`)}><LuDownload /></button>
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
