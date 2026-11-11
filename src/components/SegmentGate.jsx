import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LuArrowRight, LuServer, LuShoppingBag, LuSprout, LuX } from 'react-icons/lu';
import Logo from './Logo';
import { SEGMENTS } from '../segments';

const KEY = 'd114-segment-seen';
const ICON = { products: LuShoppingBag, it: LuServer, agri: LuSprout };
const seen = () => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } };
const markSeen = () => { try { sessionStorage.setItem(KEY, '1'); } catch { /* private mode */ } };

/** Opens once per visit: shoppers stay in the store, everyone else goes to their segment. */
export default function SegmentGate() {
  const loc = useLocation();
  const nav = useNavigate();
  const [open, setOpen] = useState(() => !seen() && !['/it-solutions', '/agriculture'].includes(loc.pathname));

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  function close() { markSeen(); setOpen(false); }
  function pick(s) {
    close();
    if (s.id !== 'products') nav(s.to); // Products: stay on the page they opened
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="seg-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <motion.div className="seg-modal" role="dialog" aria-modal="true" aria-labelledby="seg-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            <button className="seg-close" onClick={close} aria-label="Close and continue to products"><LuX /></button>
            <div className="seg-logo"><Logo /></div>
            <h2 id="seg-title">Welcome to Decibel-114.</h2>
            <p className="seg-lead">What are you looking for today?</p>
            <div className="seg-options">
              {SEGMENTS.map((s, i) => {
                const Icon = ICON[s.id];
                return (
                  <motion.button key={s.id} className={`seg-opt seg-${s.id}`} onClick={() => pick(s)}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.07, duration: 0.35 }}>
                    <span className="seg-ico"><Icon /></span>
                    <span className="seg-txt"><b>{s.title}</b><small>{s.sub}</small></span>
                    <LuArrowRight className="seg-go" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
