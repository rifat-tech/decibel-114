import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FaWhatsapp } from 'react-icons/fa6';
import { LuPhone, LuMail, LuPlus, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import Drawer from './Drawer';
import { Field, Spinner, useTitle } from '../../components/ui';
import { adminListQuotes, createQuote, errText, updateQuote } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { LEAD_STAGES, money, telHref, waLink } from '../../config';

const fmt = (t) => new Date(t).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
const stageIdx = (s) => LEAD_STAGES.findIndex(([k]) => k === s);

function LeadDetail({ lead, onSave }) {
  const { user } = useAuth();
  const [f, setF] = useState({ value: lead.value || '', assignee: lead.assignee || '', followUp: lead.followUp ? new Date(lead.followUp).toISOString().slice(0, 10) : '' });
  const [note, setNote] = useState('');
  const by = user?.profile?.name || user?.email;
  return (
    <div className="lead-detail">
      <div className="row-gap">
        <a className="btn btn-ghost btn-sm" href={telHref(lead.phone)}><LuPhone /> {lead.phone}</a>
        <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href={waLink(lead.phone, `Hello ${lead.name}, this is Decibel-114 about your quote request.`)}><FaWhatsapp /> WhatsApp</a>
        {lead.email && <a className="btn btn-ghost btn-sm" href={`mailto:${lead.email}?subject=${encodeURIComponent('Your Decibel-114 quote')}`}><LuMail /> Email</a>}
      </div>
      <h3>Request</h3>
      <p className="quote-items">{lead.items}</p>
      <p className="muted small">Needed: {lead.timeline || 'not given'}. Received {fmt(lead.createdAt)}.</p>
      <div className="grid-2">
        <Field label="Stage"><select value={lead.status} onChange={(e) => onSave({ status: e.target.value })}>{LEAD_STAGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
        <Field label="Estimated value (৳)"><input inputMode="numeric" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value.replace(/\D/g, '') })} onBlur={() => onSave({ value: Number(f.value) || 0 })} /></Field>
        <Field label="Owner"><input value={f.assignee} onChange={(e) => setF({ ...f, assignee: e.target.value })} onBlur={() => onSave({ assignee: f.assignee })} placeholder={by} /></Field>
        <Field label="Follow up on"><input type="date" value={f.followUp} onChange={(e) => { setF({ ...f, followUp: e.target.value }); onSave({ followUp: e.target.value ? Date.parse(e.target.value) : null }); }} /></Field>
      </div>
      <h3>Activity</h3>
      {(lead.notes || []).map((n, k) => <div key={k} className="note"><p>{n.text}</p><small>{n.by}, {fmt(n.at)}</small></div>)}
      <div className="row-gap"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Log a call, quote sent, objection…" onKeyDown={(e) => { if (e.key === 'Enter' && note.trim()) { onSave({ notes: [...(lead.notes || []), { text: note.trim(), at: Date.now(), by }] }); setNote(''); } }} />
        <button className="btn btn-ghost" onClick={() => { if (note.trim()) { onSave({ notes: [...(lead.notes || []), { text: note.trim(), at: Date.now(), by }] }); setNote(''); } }}>Add</button></div>
    </div>
  );
}

function NewLead({ onDone }) {
  const [f, setF] = useState({ name: '', company: '', phone: '', email: '', items: '', timeline: 'This month' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <form onSubmit={async (e) => { e.preventDefault(); try { await createQuote({ ...f, source: 'staff' }); onDone(); } catch (err) { toast.error(errText(err)); } }}>
      <div className="grid-2">
        <Field label="Name"><input required value={f.name} onChange={set('name')} /></Field>
        <Field label="Company"><input value={f.company} onChange={set('company')} /></Field>
        <Field label="Phone"><input required value={f.phone} onChange={set('phone')} /></Field>
        <Field label="Email"><input type="email" value={f.email} onChange={set('email')} /></Field>
      </div>
      <Field label="What they need"><textarea required rows={4} value={f.items} onChange={set('items')} /></Field>
      <button className="btn btn-primary">Add lead</button>
    </form>
  );
}

export default function Leads() {
  useTitle('Leads pipeline');
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState('');
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState('');
  const load = () => adminListQuotes().then(setItems).catch((e) => { toast.error(errText(e)); setItems([]); });
  useEffect(() => { load(); }, []);
  const save = async (id, patch) => {
    try { await updateQuote(id, patch); setItems((cur) => cur.map((x) => (x.id === id ? { ...x, ...patch } : x))); } catch (e) { toast.error(errText(e)); }
  };
  const shown = useMemo(() => (items || []).filter((l) => !q || `${l.name} ${l.company} ${l.phone} ${l.items}`.toLowerCase().includes(q.toLowerCase())), [items, q]);
  if (!items) return <Spinner />;
  const lead = items.find((l) => l.id === open);
  return (
    <div className="admin-page wide">
      <div className="page-head"><div><h1>Leads pipeline</h1><p className="muted">Quote requests from the website, chat handoffs and leads you add by hand.</p></div><button className="btn btn-primary" onClick={() => setAdding(true)}><LuPlus /> New lead</button></div>
      <div className="toolbar"><input placeholder="Search leads" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="kanban">
        {LEAD_STAGES.map(([k, label]) => {
          const col = shown.filter((l) => (l.status || 'new') === k);
          return (
            <section key={k} className={`kcol k-${k}`}>
              <header><b>{label}</b><span>{col.length}</span><small>{money(col.reduce((n, l) => n + (l.value || 0), 0))}</small></header>
              {col.map((l) => (
                <article key={l.id} className="kcard" onClick={() => setOpen(l.id)}>
                  <b>{l.name}</b>{l.company && <small>{l.company}</small>}
                  <p>{String(l.items).slice(0, 90)}</p>
                  <div className="kcard-foot">
                    <span>{l.value ? money(l.value) : 'No value yet'}</span>
                    <span className="kmove" onClick={(e) => e.stopPropagation()}>
                      <button disabled={stageIdx(k) === 0} onClick={() => save(l.id, { status: LEAD_STAGES[stageIdx(k) - 1][0] })} aria-label="Move back"><LuChevronLeft /></button>
                      <button disabled={stageIdx(k) === LEAD_STAGES.length - 1} onClick={() => save(l.id, { status: LEAD_STAGES[stageIdx(k) + 1][0] })} aria-label="Move forward"><LuChevronRight /></button>
                    </span>
                  </div>
                  {l.followUp && <small className={l.followUp < Date.now() ? 'danger-text' : 'muted'}>Follow up {new Date(l.followUp).toLocaleDateString('en-GB')}</small>}
                </article>
              ))}
            </section>
          );
        })}
      </div>
      <Drawer open={!!lead} onClose={() => setOpen('')} title={lead ? lead.name : ''} sub={lead?.company}>{lead && <LeadDetail lead={lead} onSave={(p) => save(lead.id, p)} />}</Drawer>
      <Drawer open={adding} onClose={() => setAdding(false)} title="New lead"><NewLead onDone={() => { setAdding(false); load(); }} /></Drawer>
    </div>
  );
}
