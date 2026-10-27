import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const KEY = 'd114_cart_v1';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const Ctx = createContext(null);
export const lineKey = (id, option) => (option ? `${id}::${option}` : id);

export function CartProvider({ children }) {
  const [items, setItems] = useState(read);
  const [bump, setBump] = useState(0);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ } }, [items]);
  const api = useMemo(() => ({
    items, bump,
    count: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: items.reduce((n, i) => n + i.price * i.quantity, 0),
    add(p, qty = 1, option = null) {
      if (!p.price) return toast('This product is coming soon. Chat with us to pre-order.');
      if (p.stock <= 0) return toast.error('Out of stock right now. Chat with us for the next shipment.');
      const price = option?.price || p.price;
      const key = lineKey(p.id, option?.label);
      setItems((cur) => {
        const ex = cur.find((i) => i.key === key);
        const max = p.stock || 99;
        if (ex) return cur.map((i) => (i.key === key ? { ...i, quantity: Math.min(max, i.quantity + qty) } : i));
        return [...cur, { key, id: p.id, slug: p.slug, name: p.name, option: option?.label || '', brand: p.brand, price, image: p.images?.[0] || '', art: p.art || '', stock: max, quantity: Math.min(max, qty) }];
      });
      setBump((b) => b + 1);
      toast.success('Added to cart');
    },
    setQty(key, q) { setItems((cur) => cur.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(i.stock || 99, q)) } : i))); },
    remove(key) { setItems((cur) => cur.filter((i) => i.key !== key)); },
    clear() { setItems([]); },
  }), [items, bump]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
export const useCart = () => useContext(Ctx);
