import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LuMinus, LuPlus, LuTrash2 } from 'react-icons/lu';
import DeviceArt from '../components/DeviceArt';
import { Empty, useTitle } from '../components/ui';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { money } from '../config';

export default function Cart() {
  useTitle('Cart');
  const cart = useCart();
  const { settings: s } = useStore();
  if (!cart.items.length) return <div className="container narrow"><Empty title="Your cart is empty" action="Start shopping" to="/">Add products here, or ask our assistant for a recommendation.</Empty></div>;
  const left = s.freeShippingOver - cart.subtotal;
  return (
    <div className="container cart">
      <h1>Your cart</h1>
      <div className="cart-layout">
        <ul className="cart-list">
          <AnimatePresence initial={false}>
            {cart.items.map((i) => (
              <motion.li key={i.key} layout exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={{ duration: 0.18 }} className="cart-item">
                <Link to={`/product/${i.slug}`} className="cart-thumb">{i.image ? <img src={i.image} alt="" /> : <DeviceArt type={i.art || 'phone'} />}</Link>
                <div className="cart-info">
                  <Link to={`/product/${i.slug}`}>{i.name}</Link>
                  <span>{[i.brand, i.option].filter(Boolean).join(', ')}</span>
                  <button className="link small" onClick={() => cart.remove(i.key)}><LuTrash2 /> Remove</button>
                </div>
                <div className="qty small">
                  <button onClick={() => cart.setQty(i.key, i.quantity - 1)} aria-label="Decrease"><LuMinus /></button>
                  <span>{i.quantity}</span>
                  <button onClick={() => cart.setQty(i.key, i.quantity + 1)} aria-label="Increase"><LuPlus /></button>
                </div>
                <strong className="cart-line">{money(i.price * i.quantity)}</strong>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <aside className="summary">
          <h2>Order summary</h2>
          <div className="sum-row"><span>Subtotal ({cart.count} items)</span><strong>{money(cart.subtotal)}</strong></div>
          {s.freeShippingOver > 0 && <>
            <div className="ship-meter"><div style={{ transform: `scaleX(${Math.min(1, cart.subtotal / s.freeShippingOver)})` }} /></div>
            <p className="muted small">{left > 0 ? `Add ${money(left)} more for free delivery.` : 'Your order qualifies for free delivery.'}</p>
          </>}
          <Link to="/checkout" className="btn btn-cart btn-lg btn-block">Checkout</Link>
          <Link to="/quote" className="btn btn-ghost btn-block">Buying 5+ units? Get a quote</Link>
        </aside>
      </div>
    </div>
  );
}
