import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LuMinus, LuPlus, LuTrash2 } from 'react-icons/lu';
import DeviceArt from '../components/DeviceArt';
import { Empty, useTitle } from '../components/ui';
import { useCart } from '../context/CartContext';
import { SITE, money } from '../config';

export default function Cart() {
  useTitle('Cart');
  const cart = useCart();
  if (!cart.items.length) return <div className="container narrow"><Empty title="Your cart is empty" action="Browse products" to="/shop">Add products here, or request a quote for larger orders.</Empty></div>;
  const left = SITE.freeShippingOver - cart.subtotal;
  return (
    <div className="container cart">
      <h1>Cart</h1>
      <div className="cart-layout">
        <ul className="cart-list">
          <AnimatePresence initial={false}>
            {cart.items.map((i) => (
              <motion.li key={i.id} layout exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }} transition={{ duration: 0.2 }} className="cart-item">
                <Link to={`/product/${i.slug}`} className="cart-thumb">{i.image ? <img src={i.image} alt="" /> : <DeviceArt type={i.art || 'router'} />}</Link>
                <div className="cart-info">
                  <small>{i.brand}</small>
                  <Link to={`/product/${i.slug}`}>{i.name}</Link>
                  <span>{money(i.price)} each</span>
                </div>
                <div className="qty small">
                  <button onClick={() => cart.setQty(i.id, i.quantity - 1)} aria-label="Decrease"><LuMinus /></button>
                  <span>{i.quantity}</span>
                  <button onClick={() => cart.setQty(i.id, i.quantity + 1)} aria-label="Increase"><LuPlus /></button>
                </div>
                <strong className="cart-line">{money(i.price * i.quantity)}</strong>
                <button className="icon-btn" onClick={() => cart.remove(i.id)} aria-label={`Remove ${i.name}`}><LuTrash2 /></button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <aside className="summary">
          <div className="sum-row"><span>Subtotal</span><strong>{money(cart.subtotal)}</strong></div>
          <div className="ship-meter">
            <div style={{ transform: `scaleX(${Math.min(1, cart.subtotal / SITE.freeShippingOver)})` }} />
          </div>
          <p className="muted small">{left > 0 ? `Add ${money(left)} more for free delivery.` : 'Your order ships free.'}</p>
          <Link to="/checkout" className="btn btn-primary btn-lg btn-block">Go to checkout</Link>
          <Link to="/quote" className="btn btn-ghost btn-block">Need 5+ units? Get a quote</Link>
        </aside>
      </div>
    </div>
  );
}
