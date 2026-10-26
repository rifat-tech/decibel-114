import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Field, Spinner, useTitle } from '../components/ui';
import { StatusSteps } from './Track';
import { useAuth } from '../context/AuthContext';
import { changeMyPassword, errText, logout, myOrders, updateMyProfile } from '../lib/db';
import { money } from '../config';

export default function Account() {
  useTitle('My account');
  const { user, isAdmin } = useAuth();
  const p = user.profile || {};
  const [orders, setOrders] = useState(null);
  const [f, setF] = useState({ name: p.name || '', phone: p.phone || '', address: p.address || '' });
  const [pw, setPw] = useState('');
  useEffect(() => { myOrders(user.uid).then(setOrders).catch(() => setOrders([])); }, [user.uid]);

  const save = async (e) => { e.preventDefault(); try { await updateMyProfile(user, f); toast.success('Profile saved'); } catch (err) { toast.error(errText(err)); } };
  const changePw = async (e) => {
    e.preventDefault();
    if (pw.length < 6) return toast.error('Use at least 6 characters.');
    try { await changeMyPassword(user, pw); setPw(''); toast.success('Password changed'); } catch (err) { toast.error(errText(err)); }
  };

  return (
    <div className="container account">
      <div className="account-head">
        <div><h1>Hello{p.name ? `, ${p.name.split(' ')[0]}` : ''}</h1><p className="muted">{user.email}{p.company ? `, ${p.company}` : ''}</p></div>
        <div className="row-gap">
          {isAdmin && <Link to="/admin" className="btn btn-dark">Admin panel</Link>}
          <button className="btn btn-ghost" onClick={logout}>Sign out</button>
        </div>
      </div>

      {p.mustChangePassword && (
        <form className="panel warn" onSubmit={changePw}>
          <h2>Set your own password</h2>
          <p>Your account was created by Decibel-114 with a temporary password. Choose a new one to finish setting it up.</p>
          <div className="row-gap"><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" autoComplete="new-password" /><button className="btn btn-primary">Save password</button></div>
        </form>
      )}

      <div className="account-grid">
        <section className="panel">
          <h2>My orders</h2>
          {orders === null ? <Spinner /> : orders.length === 0 ? <p className="muted">No orders yet. <Link to="/shop">Browse products</Link></p> : orders.map((o) => (
            <div key={o.id} className="order-card">
              <div className="order-top"><b>{o.orderNumber}</b><span>{new Date(o.createdAt).toLocaleDateString('en-GB')}</span><strong>{money(o.total)}</strong></div>
              <p className="muted small">{o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</p>
              <StatusSteps status={o.status} />
            </div>
          ))}
        </section>
        <div>
          <form className="panel" onSubmit={save}>
            <h2>Profile</h2>
            <Field label="Name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Mobile"><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
            <Field label="Default delivery address"><textarea rows={2} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>
            <button className="btn btn-primary">Save profile</button>
          </form>
          {!p.mustChangePassword && (
            <form className="panel" onSubmit={changePw}>
              <h2>Change password</h2>
              <Field label="New password"><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></Field>
              <button className="btn btn-ghost">Change password</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
