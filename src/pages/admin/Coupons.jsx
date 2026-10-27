import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { LuTrash2 } from 'react-icons/lu';
import { Field, Spinner, useTitle } from '../../components/ui';
import { C, errText } from '../../lib/db';
import { money } from '../../config';

const BLANK = { code: '', type: 'percent', value: 5, minOrder: 0, maxOff: 0, expires: '', active: true, note: '' };

export default function Coupons() {
  useTitle('Promo codes');
  const [items, setItems] = useState(null);
  const [f, setF] = useState(BLANK);
  const load = () => C('coupons').list().then(setItems).catch((e) => { toast.error(errText(e)); setItems([]); });
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const save = async (e) => {
    e.preventDefault();
    const code = f.code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!code) return toast.error('Give the code a name, like EID10.');
    try {
      await C('coupons').set(code, { type: f.type, value: Number(f.value) || 0, minOrder: Number(f.minOrder) || 0, maxOff: Number(f.maxOff) || 0, expiresAt: f.expires ? Date.parse(f.expires + 'T23:59:59') : null, active: f.active, note: f.note, createdAt: Date.now() });
      toast.success(`${code} saved`); setF(BLANK); load();
    } catch (err) { toast.error(errText(err)); }
  };
  const toggle = async (c) => { await C('coupons').update(c.id, { active: !c.active }); load(); };
  const remove = async (c) => { await C('coupons').remove(c.id); load(); };
  if (!items) return <Spinner />;
  return (
    <div className="admin-page">
      <div className="page-head"><div><h1>Promo codes</h1><p className="muted">Customers enter these at checkout.</p></div></div>
      <div className="admin-grid">
        <section className="panel">
          {items.length === 0 ? <p className="muted">No codes yet. Create your first one on the right.</p> : (
            <table className="table"><thead><tr><th>Code</th><th>Discount</th><th>Rules</th><th>Status</th><th /></tr></thead><tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.id}</b>{c.note && <><br /><small>{c.note}</small></>}</td>
                  <td>{c.type === 'percent' ? `${c.value}%` : money(c.value)}{c.maxOff ? <><br /><small>up to {money(c.maxOff)}</small></> : null}</td>
                  <td><small>{c.minOrder ? `Min ${money(c.minOrder)}` : 'Any order'}{c.expiresAt ? `, ends ${new Date(c.expiresAt).toLocaleDateString('en-GB')}` : ''}</small></td>
                  <td><button className={`status ${c.active && !(c.expiresAt && c.expiresAt < Date.now()) ? 's-delivered' : 's-cancelled'}`} onClick={() => toggle(c)}>{c.active ? (c.expiresAt && c.expiresAt < Date.now() ? 'Expired' : 'Active') : 'Paused'}</button></td>
                  <td><button className="icon-btn" onClick={() => remove(c)} aria-label={`Delete ${c.id}`}><LuTrash2 /></button></td>
                </tr>
              ))}
            </tbody></table>
          )}
        </section>
        <form className="panel" onSubmit={save}>
          <h2>New code</h2>
          <Field label="Code"><input value={f.code} onChange={set('code')} placeholder="EID10" /></Field>
          <div className="grid-2">
            <Field label="Type"><select value={f.type} onChange={set('type')}><option value="percent">Percent off</option><option value="fixed">Fixed taka off</option></select></Field>
            <Field label={f.type === 'percent' ? 'Percent' : 'Taka'}><input inputMode="numeric" value={f.value} onChange={set('value')} /></Field>
            <Field label="Minimum order (৳)"><input inputMode="numeric" value={f.minOrder} onChange={set('minOrder')} /></Field>
            <Field label="Maximum discount (৳)" hint="0 = no cap"><input inputMode="numeric" value={f.maxOff} onChange={set('maxOff')} /></Field>
          </div>
          <Field label="Ends on (optional)"><input type="date" value={f.expires} onChange={set('expires')} /></Field>
          <Field label="Internal note"><input value={f.note} onChange={set('note')} placeholder="Facebook campaign, Eid…" /></Field>
          <label className="check"><input type="checkbox" checked={f.active} onChange={set('active')} /> Active now</label>
          <button className="btn btn-primary">Save code</button>
        </form>
      </div>
    </div>
  );
}
