import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LuSearch, LuShoppingBag, LuUser, LuMenu, LuX, LuHeart, LuFileText, LuChevronDown } from 'react-icons/lu';
import Logo from './Logo';
import DeviceArt, { artFor } from './DeviceArt';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCatalog } from '../context/CatalogContext';

export default function Navbar() {
  const cart = useCart();
  const { user, isAdmin } = useAuth();
  const { categories } = useCatalog();
  const [q, setQ] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [mega, setMega] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const megaTimer = useRef();

  useEffect(() => { setDrawer(false); setMega(false); }, [loc.pathname, loc.search]);
  useEffect(() => { document.body.style.overflow = drawer ? 'hidden' : ''; }, [drawer]);

  const search = (e) => { e.preventDefault(); nav(`/shop${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`); };
  const openMega = () => { clearTimeout(megaTimer.current); setMega(true); };
  const closeMega = () => { megaTimer.current = setTimeout(() => setMega(false), 140); };

  return (
    <header className="nav">
      <div className="container nav-row">
        <button className="icon-btn only-mobile" onClick={() => setDrawer(true)} aria-label="Open menu"><LuMenu /></button>
        <Link to="/" aria-label="Decibel-114 home"><Logo /></Link>

        <nav className="nav-links only-desktop">
          <div className="mega-anchor" onMouseEnter={openMega} onMouseLeave={closeMega}>
            <button className="nav-link" aria-expanded={mega} onClick={() => setMega((m) => !m)}>Products <LuChevronDown /></button>
            <AnimatePresence>
              {mega && (
                <motion.div className="mega" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}>
                  {categories.map((c) => (
                    <Link key={c.id} to={`/shop?cat=${c.id}`} className="mega-item">
                      <DeviceArt type={artFor({ categoryId: c.id }, c)} />
                      <span><b>{c.name}</b><small>{c.description}</small></span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <NavLink to="/solutions" className="nav-link">For business</NavLink>
          <NavLink to="/track" className="nav-link">Track order</NavLink>
        </nav>

        <form className="nav-search" onSubmit={search} role="search">
          <LuSearch />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search routers, switches, Starlink…" aria-label="Search products" />
        </form>

        <div className="nav-actions">
          <Link to="/quote" className="btn btn-signal btn-sm only-desktop"><LuFileText /> Get a quote</Link>
          <Link to="/wishlist" className="icon-btn only-desktop" aria-label="Wishlist"><LuHeart /></Link>
          <Link to={user ? (isAdmin ? '/admin' : '/account') : '/login'} className="icon-btn" aria-label="Account"><LuUser /></Link>
          <Link to="/cart" className="icon-btn cart-btn" aria-label={`Cart, ${cart.count} items`}>
            <LuShoppingBag />
            {cart.count > 0 && (
              <motion.span key={cart.bump} className="cart-count" initial={{ scale: 1.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
                {cart.count}
              </motion.span>
            )}
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div className="scrim" onClick={() => setDrawer(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside className="drawer" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.24 }}>
              <div className="drawer-head"><Logo /><button className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close menu"><LuX /></button></div>
              <Link to="/quote" className="btn btn-signal btn-block">Get a business quote</Link>
              <div className="drawer-label">Shop by category</div>
              {categories.map((c) => <Link key={c.id} to={`/shop?cat=${c.id}`} className="drawer-link">{c.name}</Link>)}
              <div className="drawer-label">More</div>
              <Link to="/shop" className="drawer-link">All products</Link>
              <Link to="/solutions" className="drawer-link">For business</Link>
              <Link to="/track" className="drawer-link">Track order</Link>
              <Link to="/wishlist" className="drawer-link">Wishlist</Link>
              <Link to={user ? '/account' : '/login'} className="drawer-link">{user ? 'My account' : 'Sign in'}</Link>
              {isAdmin && <Link to="/admin" className="drawer-link">Admin panel</Link>}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
