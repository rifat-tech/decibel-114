import { AnimatePresence, motion } from 'framer-motion';
import { LuX } from 'react-icons/lu';

export default function Drawer({ open, onClose, title, sub, children, wide }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className={`drawer ${wide ? 'wide' : ''}`} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.22 }} role="dialog" aria-label={title}>
            <header className="drawer-head"><div><h2>{title}</h2>{sub && <p className="muted small">{sub}</p>}</div><button className="icon-btn" onClick={onClose} aria-label="Close"><LuX /></button></header>
            <div className="drawer-body">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
