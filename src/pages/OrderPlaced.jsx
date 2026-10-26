import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTitle } from '../components/ui';
import { money } from '../config';

export default function OrderPlaced() {
  useTitle('Order placed');
  const { no } = useParams();
  const { state } = useLocation();
  return (
    <div className="container narrow placed">
      <motion.svg viewBox="0 0 80 80" width="88" height="88" className="placed-mark" aria-hidden="true">
        <motion.circle cx="40" cy="40" r="34" fill="none" stroke="var(--blue)" strokeWidth="5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
        <motion.path d="M25 41 l10 10 l20 -22" fill="none" stroke="var(--blue)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.4 }} />
      </motion.svg>
      <h1>Order placed</h1>
      <p>Your order number is <b className="order-no">{no}</b>. Keep it to track the delivery.</p>
      {state?.total && <p>Total {money(state.total)}. We will call {state.phone} to confirm before dispatch.</p>}
      <div className="row-gap">
        <Link to={`/track?no=${no}`} className="btn btn-primary">Track this order</Link>
        <Link to="/shop" className="btn btn-ghost">Continue shopping</Link>
      </div>
    </div>
  );
}
