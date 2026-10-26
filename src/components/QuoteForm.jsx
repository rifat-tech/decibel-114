import { useState } from 'react';
import toast from 'react-hot-toast';
import { createQuote, errText } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { Field } from './ui';

export default function QuoteForm({ initialItems = '', compact = false }) {
  const { user } = useAuth();
  const p = user?.profile || {};
  const [f, setF] = useState({ name: p.name || '', company: p.company || '', phone: p.phone || '', email: user?.email || '', items: initialItems, timeline: 'This month' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || f.phone.replace(/\D/g, '').length < 10 || !f.items.trim()) return toast.error('Add your name, a phone number and what you need.');
    setBusy(true);
    try { await createQuote({ ...f, uid: user?.uid || null }); setDone(true); }
    catch (err) { toast.error(errText(err)); }
    finally { setBusy(false); }
  };

  if (done) return (
    <div className="quote-done">
      <h3>Quote request sent</h3>
      <p>We will call {f.phone} with pricing and availability.</p>
      <button className="btn btn-ghost" onClick={() => { setDone(false); setF({ ...f, items: '' }); }}>Send another request</button>
    </div>
  );

  return (
    <form className={`quote-form ${compact ? 'compact' : ''}`} onSubmit={submit}>
      <div className="grid-2">
        <Field label="Your name"><input required value={f.name} onChange={set('name')} autoComplete="name" /></Field>
        <Field label="Company (optional)"><input value={f.company} onChange={set('company')} autoComplete="organization" /></Field>
        <Field label="Phone"><input required value={f.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" /></Field>
        <Field label="Email (optional)"><input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></Field>
      </div>
      <Field label="What do you need?" hint="Models and quantities, or describe the site: for example, Wi-Fi for a 4-floor office with 60 staff.">
        <textarea required rows={compact ? 3 : 5} value={f.items} onChange={set('items')} />
      </Field>
      <Field label="When do you need it?">
        <select value={f.timeline} onChange={set('timeline')}>
          {['This week', 'This month', 'Next 3 months', 'Just comparing prices'].map((o) => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Sending…' : 'Send quote request'}</button>
    </form>
  );
}
