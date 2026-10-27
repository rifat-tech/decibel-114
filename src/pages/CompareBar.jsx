import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LuX } from 'react-icons/lu';
import { ProductVisual } from '../components/DeviceArt';
import { useStore } from '../context/StoreContext';
import { useShopper } from '../context/ShopperContext';

export default function CompareBar() {
  const sh = useShopper();
  const { products } = useStore();
  const loc = useLocation();
  const items = sh.compare.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const show = items.length > 0 && loc.pathname !== '/compare';
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="compare-bar" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}>
          <div className="container compare-bar-row">
            <b>Compare ({items.length}/4)</b>
            <div className="compare-thumbs">{items.map((p) => (
              <span key={p.id} className="compare-thumb"><ProductVisual product={p} /><button onClick={() => sh.toggleCompare(p.id)} aria-label={`Remove ${p.name}`}><LuX /></button></span>
            ))}</div>
            <button className="btn btn-ghost btn-sm" onClick={sh.clearCompare}>Clear</button>
            <Link to="/compare" className="btn btn-primary btn-sm">Compare now</Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
