import { LuEye, LuEyeOff } from 'react-icons/lu';
import { useEffect , useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';

export function useTitle(t, description) {
  useSeo({ title: t, description });
}
export const Spinner = ({ full }) => <div className={full ? 'spinner-wrap full' : 'spinner-wrap'}><div className="spinner" aria-label="Loading" /></div>;
export function Empty({ title, children, action, to, onAction }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action && (to ? <Link className="btn btn-primary" to={to}>{action}</Link> : <button className="btn btn-primary" onClick={onAction}>{action}</button>)}
    </div>
  );
}
export const Field = ({ label, hint, children, className = '' }) => (
  <label className={`field ${className}`}>
    <span className="field-label">{label}</span>
    {children}
    {hint && <span className="field-hint">{hint}</span>}
  </label>
);
export const StockTag = ({ p }) => {
  if (!p.price) return <span className="stock soon">{p.soon ? 'Coming soon' : 'Call or request a quote'}</span>;
  if (p.stock <= 0) return <span className="stock out">Out of stock</span>;
  if (p.stock <= 3) return <span className="stock low">Only {p.stock} left</span>;
  return <span className="stock in">In stock, ships in 24 hours</span>;
};

/** Password box with a show/hide eye, so people can check what they typed. */
export function PasswordInput({ className = '', ...props }) {
  const [show, setShow] = useState(false);
  return (
    <span className={`pw-field ${className}`}>
      <input {...props} type={show ? 'text' : 'password'} />
      <button type="button" className="pw-eye" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
        {show ? <LuEyeOff /> : <LuEye />}
      </button>
    </span>
  );
}
