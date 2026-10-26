import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaWhatsapp } from 'react-icons/fa6';
import { LuPhone, LuMail } from 'react-icons/lu';
import { Spinner, useTitle } from '../../components/ui';
import { adminListQuotes, errText, updateQuote } from '../../lib/db';
import { telHref } from '../../config';

const STATES = { new: 'New', contacted: 'Contacted', quoted: 'Quote sent', won: 'Won', lost: 'Lost' };

export default function Quotes() {
  useTitle('Quote requests');
  const [items, setItems] = useState(null);
  useEffect(() => { adminListQuotes().then(setItems).catch((e) => { toast.error(errText(e)); setItems([]); }); }, []);
  const set = async (q, status) => {
    try { await updateQuote(q.id, { status }); setItems((cur) => cur.map((x) => (x.id === q.id ? { ...x, status } : x))); } catch (e) { toast.error(errText(e)); }
  };
  if (!items) return <Spinner />;
  return (
    <div className="admin-page">
      <h1>Quote requests</h1>
      {items.length === 0 && <p className="muted">No requests yet. They arrive from the quote form on the home page, product pages and /quote.</p>}
      <div className="quote-list">
        {items.map((q) => (
          <article key={q.id} className="panel quote-card">
            <div className="panel-head">
              <div>{q.status === 'new' && <span className="status s-pending">New</span>} <b>{q.name}</b>{q.company && <span className="muted">, {q.company}</span>}<br /><small>Sent {new Date(q.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}, needed {q.timeline?.toLowerCase()}</small></div>
              <select value={q.status} onChange={(e) => set(q, e.target.value)} aria-label="Quote status">
                {Object.entries(STATES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <p className="quote-items">{q.items}</p>
            <div className="row-gap">
              <a className="btn btn-ghost btn-sm" href={telHref(q.phone)}><LuPhone /> {q.phone}</a>
              <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href={`https://wa.me/88${String(q.phone).replace(/\D/g, '').replace(/^88/, '')}`}><FaWhatsapp /> WhatsApp</a>
              {q.email && <a className="btn btn-ghost btn-sm" href={`mailto:${q.email}?subject=${encodeURIComponent('Your Decibel-114 quote')}`}><LuMail /> Email</a>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
