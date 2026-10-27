import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LuSearch, LuShoppingCart, LuUser, LuMenu, LuX, LuTruck, LuChevronRight, LuHeart } from 'react-icons/lu';
import Logo from './Logo';
import DeviceArt, { artFor } from './DeviceArt';
import { ProductVisual } from './DeviceArt';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useShopper } from '../context/ShopperContext';
import { searchCatalog } from '../lib/ai';
import { money } from '../config';

const QUICK = [
  ['Apple', '/brand/apple'], ['iPhone', '/shop?cat=phone&sub=iPhone'], ['MacBook', '/shop?cat=laptop&sub=MacBook'], ['iPad', '/shop?cat=tablet&sub=iPad'],
  ['Top deals', '/deals'], ['Starlink', '/shop?cat=network&sub=Starlink'], ['Business quote', '/quote'],
];

function Search() {
  const { products } = useStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const box = useRef();
  const hits = useMemo(() => (q.trim().length > 1 ? searchCatalog(products, q, 6) : []), [q, products]);
  useEffect(() => {
    const off = (e) => { if (!box.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', off); return () => document.removeEventListener('pointerdown', off);
  }, []);
  const go = (e) => { e.preventDefault(); setOpen(false); nav(`/shop${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`); };
  return (
    <form className="hsearch" onSubmit={go} role="search" ref={box}>
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="Search Decibel-114" aria-label="Search products" />
      {q && <button type="button" className="hsearch-clear" onClick={() => setQ('')} aria-label="Clear search"><LuX /></button>}
      <button className="hsearch-go" aria-label="Search"><LuSearch /></button>
      {open && hits.length > 0 && (
        <div className="suggest">
          {hits.map((p) => (
            <Link key={p.id} to={`/product/${p.slug}`} className="suggest-row" onClick={() => { setOpen(false); setQ(''); }}>
              <span className="suggest-img"><ProductVisual product={p} /></span>
              <span className="suggest-name">{p.name}</span>
              <b>{p.price ? money(p.price) : 'Soon'}</b>
            </Link>
          ))}
          <button className="suggest-all" onClick={go}>See all results for “{q}”</button>
        </div>
      )}
    </form>
  );
}

function MenuDrawer({ onClose }) {
  const { categories, products } = useStore();
  const [active, setActive] = useState(categories[0]?.id);
  const cat = categories.find((c) => c.id === active);
  const brands = useMemo(() => [...new Set(products.filter((p) => p.categoryId === active).map((p) => p.brand))].slice(0, 8), [active, products]);
  return (
    <>
      <motion.div className="scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.aside className="menu" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.22 }} aria-label="Shop by department">
        <div className="menu-head"><Logo /><button className="icon-btn" onClick={onClose} aria-label="Close menu"><LuX /></button></div>
        <div className="menu-cols">
          <nav className="menu-cats">
            <Link to="/brand/apple" className="menu-cat featured"><DeviceArt type="laptop" /> Apple store <LuChevronRight /></Link>
            <Link to="/deals" className="menu-cat featured"><DeviceArt type="tag" /> Top deals <LuChevronRight /></Link>
            {categories.map((c) => (
              <button key={c.id} className={`menu-cat ${active === c.id ? 'on' : ''}`} onMouseEnter={() => setActive(c.id)} onClick={() => setActive(c.id)}>
                <DeviceArt type={artFor({ categoryId: c.id }, c)} /> {c.name} <LuChevronRight />
              </button>
            ))}
          </nav>
          {cat && (
            <div className="menu-sub">
              <h3>{cat.name}</h3>
              <Link to={`/shop?cat=${cat.id}`} className="menu-link strong">Shop all {cat.name.toLowerCase()}</Link>
              {(cat.subs || []).map((s) => <Link key={s} to={`/shop?cat=${cat.id}&sub=${encodeURIComponent(s)}`} className="menu-link">{s}</Link>)}
              {brands.length > 0 && <><h4>Brands</h4>{brands.map((b) => <Link key={b} to={`/shop?cat=${cat.id}&brand=${encodeURIComponent(b)}`} className="menu-link">{b}</Link>)}</>}
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}

export default function Header() {
  const cart = useCart();
  const { user, isStaff } = useAuth();
  const sh = useShopper();
  const [menu, setMenu] = useState(false);
  const loc = useLocation();
  useEffect(() => { setMenu(false); }, [loc.pathname, loc.search]);
  useEffect(() => { document.body.style.overflow = menu ? 'hidden' : ''; }, [menu]);
  return (
    <header className="hdr">
      <div className="hdr-main">
        <div className="container hdr-row">
          <Link to="/" className="hdr-logo" aria-label="Decibel-114 home"><Logo onBlue /></Link>
          <button className="hdr-menu" onClick={() => setMenu(true)} aria-label="Open menu"><LuMenu /><span>Menu</span></button>
          <Search />
          <nav className="hdr-actions">
            <Link to="/track" className="hdr-act only-desktop"><LuTruck /><span>Track order</span></Link>
            <Link to={user ? (isStaff ? '/admin' : '/account') : '/login'} className="hdr-act"><LuUser /><span className="only-desktop">{user ? (user.profile?.name?.split(' ')[0] || 'Account') : 'Sign in'}</span></Link>
            <Link to="/cart" className="hdr-act cart" aria-label={`Cart, ${cart.count} items`}>
              <LuShoppingCart />
              {cart.count > 0 && <motion.span key={cart.bump} className="cart-count" initial={{ scale: 1.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>{cart.count}</motion.span>}
              <span className="only-desktop">Cart</span>
            </Link>
          </nav>
        </div>
      </div>
      <div className="hdr-sub">
        <div className="container hdr-sub-row">
          {QUICK.map(([l, to]) => <NavLink key={l} to={to} className="hdr-chip">{l}</NavLink>)}
          <span className="grow" />
          {sh.compare.length > 0 && <Link to="/compare" className="hdr-chip strong">Compare ({sh.compare.length})</Link>}
          <Link to="/saved" className="hdr-chip"><LuHeart /> Saved</Link>
        </div>
      </div>
      <AnimatePresence>{menu && <MenuDrawer onClose={() => setMenu(false)} />}</AnimatePresence>
    </header>
  );
}
