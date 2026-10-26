import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { LuUserPlus, LuCopy, LuX } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa6';
import { Field, Spinner, useTitle } from '../../components/ui';
import { DEMO, adminCreateUser, adminListUsers, adminSendReset, adminUpdateUser, errText } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { HASH } from '../../config';

const ROLES = { customer: 'Customer', dealer: 'Dealer / corporate', staff: 'Staff', admin: 'Admin' };

function CreateUser({ onClose, onCreated }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', company: '', role: 'customer' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const login = HASH ? `${window.location.origin}${window.location.pathname}#/login` : `${window.location.origin}/login`;
  const message = done ? `Hello ${f.name}, your Decibel-114 account is ready.\nSign in: ${login}\nEmail: ${f.email}\nTemporary password: ${done}\nYou will be asked to set your own password after signing in.` : '';

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const pw = await adminCreateUser({ ...f, email: f.email.trim().toLowerCase() }); setDone(pw); onCreated(); }
    catch (err) { toast.error(errText(err)); } finally { setBusy(false); }
  };

  return (
    <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-card" initial={{ y: 20, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20 }} onClick={(e) => e.stopPropagation()}>
        <div className="panel-head"><h2>{done ? 'Account created' : 'Create an account'}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><LuX /></button></div>
        {done ? (
          <>
            <p>Share these sign-in details with {f.name}. The temporary password is shown only once.</p>
            <pre className="cred">{message}</pre>
            <div className="row-gap">
              <button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(message); toast.success('Copied'); }}><LuCopy /> Copy details</button>
              {f.phone && <a className="btn btn-ghost" target="_blank" rel="noreferrer" href={`https://wa.me/88${f.phone.replace(/\D/g, '').replace(/^88/, '')}?text=${encodeURIComponent(message)}`}><FaWhatsapp /> Send on WhatsApp</a>}
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <div className="grid-2">
              <Field label="Full name"><input required value={f.name} onChange={set('name')} /></Field>
              <Field label="Mobile"><input value={f.phone} onChange={set('phone')} inputMode="tel" /></Field>
              <Field label="Email"><input required type="email" value={f.email} onChange={set('email')} /></Field>
              <Field label="Company (optional)"><input value={f.company} onChange={set('company')} /></Field>
            </div>
            <Field label="Role" hint="Admins can manage the whole store. Dealers are flagged so you can give them corporate pricing.">
              <select value={f.role} onChange={set('role')}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            </Field>
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function People() {
  useTitle('Customers & staff');
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [modal, setModal] = useState(false);
  const load = () => adminListUsers().then(setItems).catch((e) => { toast.error(errText(e)); setItems([]); });
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => (items || []).filter((u) => (!role || u.role === role) && (!q || `${u.name} ${u.email} ${u.phone} ${u.company || ''}`.toLowerCase().includes(q.toLowerCase()))), [items, q, role]);

  const patch = async (u, p) => {
    if (u.id === user.uid && p.role && p.role !== 'admin') return toast.error('You cannot remove your own admin access.');
    try { await adminUpdateUser(u.id, p); setItems((cur) => cur.map((x) => (x.id === u.id ? { ...x, ...p } : x))); toast.success('Saved'); }
    catch (e) { toast.error(errText(e)); }
  };
  const reset = async (u) => {
    if (DEMO) return toast('Password reset emails work after Firebase is connected.');
    try { await adminSendReset(u.email); toast.success(`Reset link sent to ${u.email}`); } catch (e) { toast.error(errText(e)); }
  };

  return (
    <div className="admin-page">
      <div className="panel-head"><h1>Customers & staff</h1><button className="btn btn-primary" onClick={() => setModal(true)}><LuUserPlus /> Create account</button></div>
      <div className="toolbar">
        <input placeholder="Search name, email, phone or company" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={role} onChange={(e) => setRole(e.target.value)}><option value="">Everyone</option>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>
      {!items ? <Spinner /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Contact</th><th>Role</th><th>Joined</th><th>Access</th></tr></thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.id} className={u.disabled ? 'dim' : ''}>
                  <td><b>{u.name || '—'}</b>{u.company && <><br /><small>{u.company}</small></>}{u.mustChangePassword && <><br /><small className="warn-text">Has not set a password yet</small></>}</td>
                  <td>{u.email}<br /><small>{u.phone}</small></td>
                  <td><select value={u.role || 'customer'} onChange={(e) => patch(u, { role: e.target.value })} aria-label="Role">{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : ''}</td>
                  <td className="row-gap">
                    <button className="btn btn-ghost btn-sm" onClick={() => reset(u)}>Send reset link</button>
                    {u.id !== user.uid && <button className="btn btn-ghost btn-sm" onClick={() => patch(u, { disabled: !u.disabled })}>{u.disabled ? 'Enable' : 'Disable'}</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && <p className="muted pad">No accounts match.</p>}
        </div>
      )}
      <AnimatePresence>{modal && <CreateUser onClose={() => setModal(false)} onCreated={load} />}</AnimatePresence>
    </div>
  );
}
