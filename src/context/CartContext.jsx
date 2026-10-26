import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const KEY = 'gx_cart_v2';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const Ctx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(read);
  const [bump, setBump] = useState(0);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ } }, [items]);

  const api = useMemo(() => ({
    items,
    bump,
    count: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: items.reduce((n, i) => n + i.price * i.quantity, 0),
    add(p, qty = 1) {
      if (p.stock <= 0) return toast.error('This item is out of stock. Request a quote instead.');
      setItems((cur) => {
        const ex = cur.find((i) => i.id === p.id);
        const max = p.stock || 99;
        if (ex) return cur.map((i) => (i.id === p.id ? { ...i, quantity: Math.min(max, i.quantity + qty) } : i));
        return [...cur, { id: p.id, slug: p.slug, name: p.name, brand: p.brand, price: p.price, image: p.images?.[0] || '', art: p.art || '', stock: max, quantity: Math.min(max, qty) }];
      });
      setBump((b) => b + 1);
      toast.success('Added to cart');
    },
    setQty(id, q) { setItems((cur) => cur.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(i.stock || 99, q)) } : i))); },
    remove(id) { setItems((cur) => cur.filter((i) => i.id !== id)); },
    clear() { setItems([]); },
  }), [items, bump]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
export const useCart = () => useContext(Ctx);
