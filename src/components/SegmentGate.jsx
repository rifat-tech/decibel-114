import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LuArrowRight, LuServer, LuShoppingBag, LuSprout, LuX } from 'react-icons/lu';
import Logo from './Logo';
import { useStore } from '../context/StoreContext';

const KEY = 'd114-segment-seen';
const ICON = { products: LuShoppingBag, it: LuServer, agri: LuSprout };
const seen = () => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } };
const markSeen = () => { try { sessionStorage.setItem(KEY, '1'); } catch { /* private mode */ } };

/** Opens once per visit: shoppers stay in the store, everyone else goes to their segment. */
export default function SegmentGate() {
  const loc = useLocation();
  const nav = useNavigate();
  const { content } = useStore();
  const popup = content.site.popup;
  const options = (popup.options || []).filter((s) => s.id === 'products' || content[s.id]?.enabled !== false);
  const [open, setOpen] = useState(false);
  // Opens once the saved settings have loaded, so a popup turned off in the admin never flashes.
  useEffect(() => {
    if (content.loaded && popup.enabled !== false && options.length > 1 && !seen() && !/^\/(it-solutions|agriculture|login|register|account|cart|checkout|order|track)/.test(loc.pathname)) setOpen(true);
  }, [content.loaded]); // eslint-disable-line react-hooks/exhaustive-deps

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
            <h2 id="seg-title">{popup.title}</h2>
            {popup.lead && <p className="seg-lead">{popup.lead}</p>}
            <div className="seg-options">
              {options.map((s, i) => {
                const Icon = ICON[s.id] || LuShoppingBag;
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
