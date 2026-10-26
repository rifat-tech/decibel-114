import { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'gx_wish_v2';
const Ctx = createContext(null);
export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } });
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* ignore */ } }, [ids]);
  const toggle = (id) => setIds((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  return <Ctx.Provider value={{ ids, toggle, has: (id) => ids.includes(id) }}>{children}</Ctx.Provider>;
}
export const useWishlist = () => useContext(Ctx);
