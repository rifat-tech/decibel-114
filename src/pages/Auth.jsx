import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { Field, useTitle } from '../components/ui';
import { DEMO, errText, login, loginWithGoogle, register, resetPassword } from '../lib/db';
import { useAuth } from '../context/AuthContext';

function useNext() { const [sp] = useSearchParams(); return sp.get('next') || '/account'; }

export function Login() {
  useTitle('Sign in');
  const { user, isAdmin } = useAuth();
  const next = useNext();
  const [f, setF] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={isAdmin && next === '/account' ? '/admin' : next} replace />;

  // After sign-in the <Navigate> above sends admins to /admin and everyone else to `next`.
  const go = async (fn) => { setBusy(true); try { await fn(); } catch (e) { toast.error(errText(e)); setBusy(false); } };
  const forgot = async () => {
    if (!f.email) return toast.error('Type your email first, then choose “Forgot password”.');
    try { await resetPassword(f.email); toast.success('Password reset link sent. Check your inbox.'); } catch (e) { toast.error(errText(e)); }
  };
  return (
    <div className="container auth">
      <form className="panel auth-card" onSubmit={(e) => { e.preventDefault(); go(() => login(f.email.trim(), f.password)); }}>
        <h1>Sign in</h1>
        {DEMO && <p className="demo-note">Demo mode: sign in as <b>admin@decibel114.demo</b> / <b>admin123</b> to open the admin panel.</p>}
        <Field label="Email"><input type="email" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password"><input type="password" required autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        {!DEMO && <button type="button" className="btn btn-ghost btn-block" onClick={() => go(loginWithGoogle)}><FcGoogle /> Continue with Google</button>}
        <div className="auth-foot">
          <button type="button" className="link" onClick={forgot}>Forgot password</button>
          <Link to="/register">Create an account</Link>
        </div>
      </form>
    </div>
  );
}

export function Register() {
  useTitle('Create account');
  const { user } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', phone: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/account" replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (f.password.length < 6) return toast.error('Use at least 6 characters for the password.');
    setBusy(true);
    try { await register({ ...f, email: f.email.trim(), name: f.name.trim() }); toast.success('Account created'); nav('/account'); }
    catch (err) { toast.error(errText(err)); } finally { setBusy(false); }
  };
  return (
    <div className="container auth">
      <form className="panel auth-card" onSubmit={submit}>
        <h1>Create an account</h1>
        <p className="muted">Track orders, save addresses and get quotes faster.</p>
        <Field label="Full name"><input required value={f.name} onChange={set('name')} autoComplete="name" /></Field>
        <Field label="Mobile number"><input required value={f.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" /></Field>
        <Field label="Email"><input type="email" required value={f.email} onChange={set('email')} autoComplete="email" /></Field>
        <Field label="Password" hint="At least 6 characters."><input type="password" required value={f.password} onChange={set('password')} autoComplete="new-password" /></Field>
        <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        {!DEMO && <button type="button" className="btn btn-ghost btn-block" onClick={async () => { try { await loginWithGoogle(); nav('/account'); } catch (e) { toast.error(errText(e)); } }}><FcGoogle /> Sign up with Google</button>}
        <div className="auth-foot"><span>Already have one?</span><Link to="/login">Sign in</Link></div>
      </form>
    </div>
  );
}
