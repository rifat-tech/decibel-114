import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LuSearch, LuShoppingBag, LuUser, LuMenu, LuX, LuChevronRight, LuHeart, LuArrowLeftRight, LuBadgePercent,
  LuPhone, LuTruck, LuBuilding2, LuLayoutGrid, LuShieldCheck,
} from 'react-icons/lu';
import Logo from './Logo';
import { ProductVisual } from './DeviceArt';
import { CatIcon } from './CatIcon';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useShopper } from '../context/ShopperContext';
import { searchCatalog } from '../lib/ai';
import { money, telHref } from '../config';

/* Counts of types and brands per category, built once per catalog load. */
function useMenuIndex() {
  const { categories, products } = useStore();
  return useMemo(() => {
    const idx = {};
    for (const p of products) {
      const c = (idx[p.categoryId] ||= { subs: {}, brands: {}, n: 0 });
      c.n += 1;
      if (p.subcategory) c.subs[p.subcategory] = (c.subs[p.subcategory] || 0) + 1;
      if (p.brand) c.brands[p.brand] = (c.brands[p.brand] || 0) + 1;
    }
    return categories.filter((c) => idx[c.id]?.n).map((c) => {
      const i = idx[c.id];
      const order = c.subs || [];
      const subs = Object.entries(i.subs).sort((a, b) => {
        const ia = order.indexOf(a[0]); const ib = order.indexOf(b[0]);
        if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        return b[1] - a[1];
      });
      const brands = Object.entries(i.brands).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([b]) => b);
      return { ...c, count: i.n, subs: subs.map(([s, n]) => ({ name: s, n })), brands };
    });
  }, [categories, products]);
}

function Search() {
  const { products } = useStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const box = useRef();
  const hits = useMemo(() => (q.trim().length > 1 ? searchCatalog(products, q, 7) : []), [q, products]);
  useEffect(() => {
    const off = (e) => { if (!box.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', off); return () => document.removeEventListener('pointerdown', off);
  }, []);
  const go = (e) => { e.preventDefault(); setOpen(false); nav(`/shop${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`); };
  return (
    <form className="hsearch" onSubmit={go} role="search" ref={box}>
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="Search laptops, phones, routers, brands…" aria-label="Search products" />
      {q && <button type="button" className="hsearch-clear" onClick={() => setQ('')} aria-label="Clear search"><LuX /></button>}
      <button className="hsearch-go" aria-label="Search"><LuSearch /></button>
      {open && hits.length > 0 && (
        <div className="suggest">
          {hits.map((p) => (
            <Link key={p.id} to={`/product/${p.slug}`} className="suggest-row" onClick={() => { setOpen(false); setQ(''); }}>
              <span className="suggest-img"><ProductVisual product={p} /></span>
              <span className="suggest-name">{p.name}</span>
              <b>{p.price ? money(p.price) : 'Ask'}</b>
            </Link>
          ))}
          <button className="suggest-all" onClick={go}>See all results for “{q}”</button>
        </div>
      )}
    </form>
  );
}

/* Desktop category bar with hover mega panels. */
function CategoryBar({ menu, onAll }) {
  const [open, setOpen] = useState(null);
  const t = useRef();
  const enter = (id) => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(id), 90); };
  const leave = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(null), 140); };
  const loc = useLocation();
  useEffect(() => setOpen(null), [loc.pathname, loc.search]);
  const cat = menu.find((c) => c.id === open);
  return (
    <div className="catbar" onMouseLeave={leave}>
      <div className="container catbar-row">
        <button className="catbar-all" onClick={onAll}><LuLayoutGrid /> All categories</button>
        <nav className="catbar-list" aria-label="Product categories">
          {menu.map((c) => (
            <Link key={c.id} to={`/shop?cat=${c.id}`} className={`catbar-item ${open === c.id ? 'on' : ''}`}
              onMouseEnter={() => enter(c.id)} onFocus={() => setOpen(c.id)} aria-expanded={open === c.id}>
              {c.short || c.name}
            </Link>
          ))}
        </nav>
      </div>
      <AnimatePresence>
        {cat && (
          <motion.div className="mega" onMouseEnter={() => clearTimeout(t.current)}
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}>
            <div className="container mega-grid">
              <div className="mega-head">
                <span className="mega-icon"><CatIcon id={cat.id} /></span>
                <div><h3>{cat.name}</h3><p>{cat.count.toLocaleString('en-IN')} products</p></div>
                <Link to={`/shop?cat=${cat.id}`} className="mega-all">Shop all {cat.name} <LuChevronRight /></Link>
              </div>
              <div className="mega-cols">
                <div className="mega-types">
                  <h4>Shop by type</h4>
                  <ul>{cat.subs.slice(0, 24).map((s) => <li key={s.name}><Link to={`/shop?cat=${cat.id}&sub=${encodeURIComponent(s.name)}`}>{s.name}<span>{s.n}</span></Link></li>)}</ul>
                </div>
                <div className="mega-brands">
                  <h4>Top brands</h4>
                  <ul>{cat.brands.map((b) => <li key={b}><Link to={`/shop?cat=${cat.id}&brand=${encodeURIComponent(b)}`}>{b}</Link></li>)}</ul>
                </div>
                <div className="mega-side">
                  <Link to="/deals" className="mega-card"><LuBadgePercent /><b>Today’s offers</b><span>Price drops across {cat.name.toLowerCase()}</span></Link>
                  <Link to="/quote" className="mega-card"><LuBuilding2 /><b>Corporate & bulk</b><span>Quotations for offices, ISPs and projects</span></Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuDrawer({ menu, onClose }) {
  const [active, setActive] = useState(null);
  const cat = menu.find((c) => c.id === active);
  return (
    <>
      <motion.div className="scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.aside className="menu" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.24, ease: [0.16, 1, 0.3, 1] }} aria-label="All categories">
        <div className="menu-head">
          {cat ? <button className="menu-back" onClick={() => setActive(null)}><LuChevronRight style={{ transform: 'rotate(180deg)' }} /> All categories</button> : <Logo />}
          <button className="icon-btn" onClick={onClose} aria-label="Close menu"><LuX /></button>
        </div>
        <div className={`menu-cols ${cat ? 'sub-open' : ''}`}>
          <nav className="menu-cats">
            <Link to="/brand/apple" className="menu-cat featured"><span className="mc-ico"><CatIcon id="apple" /></span> Apple store <LuChevronRight /></Link>
            <Link to="/deals" className="menu-cat featured"><span className="mc-ico"><LuBadgePercent /></span> Offers <LuChevronRight /></Link>
            {menu.map((c) => (
              <button key={c.id} className={`menu-cat ${active === c.id ? 'on' : ''}`} onMouseEnter={() => matchMedia('(min-width: 640px)').matches && setActive(c.id)} onClick={() => setActive(c.id)}>
                <span className="mc-ico"><CatIcon id={c.id} /></span> {c.name} <LuChevronRight />
              </button>
            ))}
            <Link to="/quote" className="menu-cat"><span className="mc-ico"><LuBuilding2 /></span> Corporate & bulk <LuChevronRight /></Link>
            <Link to="/track" className="menu-cat"><span className="mc-ico"><LuTruck /></span> Track order <LuChevronRight /></Link>
          </nav>
          {cat && (
            <div className="menu-sub">
              <h3>{cat.name}</h3>
              <Link to={`/shop?cat=${cat.id}`} className="menu-link strong">Shop all {cat.name.toLowerCase()} ({cat.count})</Link>
              {cat.subs.map((s) => <Link key={s.name} to={`/shop?cat=${cat.id}&sub=${encodeURIComponent(s.name)}`} className="menu-link">{s.name}</Link>)}
              {cat.brands.length > 0 && <><h4>Brands</h4>{cat.brands.map((b) => <Link key={b} to={`/shop?cat=${cat.id}&brand=${encodeURIComponent(b)}`} className="menu-link">{b}</Link>)}</>}
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
  const { settings: st } = useStore();
  const sh = useShopper();
  const menu = useMenuIndex();
  const [drawer, setDrawer] = useState(false);
  // The masthead tightens once the page moves: utility strip folds away, a hairline shadow appears.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 48);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const loc = useLocation();
  useEffect(() => { setDrawer(false); }, [loc.pathname, loc.search]);
  useEffect(() => { document.body.style.overflow = drawer ? 'hidden' : ''; }, [drawer]);
  const name = user ? (user.profile?.name?.split(' ')[0] || 'Account') : null;
  return (
    <header className={`hdr ${scrolled ? 'scrolled' : ''}`}>
      <div className="hdr-util">
        <div className="container util-row">
          <span className="util-note"><LuShieldCheck /> Official warranty on every product</span>
          <span className="util-note only-desktop"><LuTruck /> Delivery across Bangladesh</span>
          <span className="grow" />
          {st.phone && <a href={telHref(st.phone)} className="util-link"><LuPhone /> {st.phone}</a>}
          <Link to="/track" className="util-link only-desktop">Track order</Link>
          <Link to="/quote" className="util-link only-desktop">Corporate sales</Link>
          <Link to="/solutions" className="util-link only-desktop">Network solutions</Link>
        </div>
      </div>
      <div className="hdr-main">
        <div className="container hdr-row">
          <button className="icon-btn on-blue only-mobile" onClick={() => setDrawer(true)} aria-label="Open categories"><LuMenu /></button>
          <Link to="/" className="hdr-logo" aria-label="Decibel-114 home"><Logo onYellow /></Link>
          <Search />
          <nav className="hdr-actions" aria-label="Your shopping">
            <Link to="/deals" className="hdr-act only-desktop"><LuBadgePercent /><span className="act-txt"><b>Offers</b><small>Latest deals</small></span></Link>
            <Link to="/compare" className="hdr-act only-desktop" aria-label={`Compare, ${sh.compare.length} items`}><span className="act-ico"><LuArrowLeftRight />{sh.compare.length > 0 && <i className="badge">{sh.compare.length}</i>}</span></Link>
            <Link to="/saved" className="hdr-act" aria-label={`Saved, ${sh.wish.length} items`}><span className="act-ico"><LuHeart />{sh.wish.length > 0 && <i className="badge">{sh.wish.length}</i>}</span></Link>
            <Link to={user ? (isStaff ? '/admin' : '/account') : '/login'} className="hdr-act"><LuUser /><span className="act-txt only-desktop"><b>{name || 'Account'}</b><small>{user ? (isStaff ? 'Admin panel' : 'Orders & profile') : 'Sign in or register'}</small></span></Link>
            <Link to="/cart" className="hdr-act cart" aria-label={`Cart, ${cart.count} items`}>
              <span className="act-ico"><LuShoppingBag />{cart.count > 0 && <motion.i key={cart.bump} className="badge gold" initial={{ scale: 1.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>{cart.count}</motion.i>}</span>
              <span className="act-txt only-desktop"><b>Cart</b><small>{cart.count ? money(cart.subtotal) : 'Empty'}</small></span>
            </Link>
          </nav>
        </div>
      </div>
      <div className="only-desktop-block"><CategoryBar menu={menu} onAll={() => setDrawer(true)} /></div>
      <div className="mcats only-mobile-block">
        <div className="container mcats-row">
          {menu.map((c) => <Link key={c.id} to={`/shop?cat=${c.id}`} className="mcat"><CatIcon id={c.id} />{c.short || c.name}</Link>)}
        </div>
      </div>
      <AnimatePresence>{drawer && <MenuDrawer menu={menu} onClose={() => setDrawer(false)} />}</AnimatePresence>
    </header>
  );
}
