import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function useTitle(t) {
  useEffect(() => { document.title = t ? `${t} | Decibel-114` : 'Decibel-114 | Network and technology store'; }, [t]);
}
export const Spinner = ({ full }) => (
  <div className={full ? 'spinner-wrap full' : 'spinner-wrap'}><div className="spinner" aria-label="Loading" /></div>
);
export function Empty({ title, children, action, to }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action && <Link className="btn btn-primary" to={to}>{action}</Link>}
    </div>
  );
}
export const Field = ({ label, hint, children }) => (
  <label className="field">
    <span className="field-label">{label}</span>
    {children}
    {hint && <span className="field-hint">{hint}</span>}
  </label>
);
export const StockTag = ({ stock }) => (
  <span className={`stock ${stock > 0 ? (stock <= 3 ? 'low' : 'in') : 'out'}`}>
    {stock > 0 ? (stock <= 3 ? `Only ${stock} left` : 'In stock') : 'On order'}
  </span>
);
