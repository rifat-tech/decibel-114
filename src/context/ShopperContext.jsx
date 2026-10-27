// Per-browser shopping helpers: wishlist, compare list and recently viewed.
import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const load = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
const useStored = (k) => {
  const [v, setV] = useState(() => load(k));
  useEffect(() => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } }, [k, v]);
  return [v, setV];
};
const Ctx = createContext(null);
export function ShopperProvider({ children }) {
  const [wish, setWish] = useStored('d114_wish');
  const [compare, setCompare] = useStored('d114_compare');
  const [recent, setRecent] = useStored('d114_recent');
  const value = {
    wish, compare, recent,
    hasWish: (id) => wish.includes(id),
    toggleWish: (id) => setWish((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id])),
    inCompare: (id) => compare.includes(id),
    toggleCompare: (id) => setCompare((c) => {
      if (c.includes(id)) return c.filter((x) => x !== id);
      if (c.length >= 4) { toast('You can compare up to 4 products.'); return c; }
      return [...c, id];
    }),
    clearCompare: () => setCompare([]),
    viewed: (id) => setRecent((c) => [id, ...c.filter((x) => x !== id)].slice(0, 12)),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useShopper = () => useContext(Ctx);
