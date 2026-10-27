import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import ProductCard from '../components/ProductCard';
import DeviceArt, { artFor, ProductVisual } from '../components/DeviceArt';
import { useTitle } from '../components/ui';
import { useStore } from '../context/StoreContext';
import { useShopper } from '../context/ShopperContext';
import { useCart } from '../context/CartContext';
import { discountPct, money } from '../config';

function Banners({ banners }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const n = banners.length;
  useEffect(() => { if (n < 2 || reduce) return undefined; const t = setInterval(() => setI((x) => (x + 1) % n), 6500); return () => clearInterval(t); }, [n, reduce]);
  if (!n) return null;
  const b = banners[i % n];
  return (
    <section className="banners" aria-roledescription="carousel">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={b.id} className={`banner tone-${b.tone || 'blue'}`} initial={reduce ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
          <div className="banner-copy">
            <h1>{b.title}</h1>
            <p>{b.text}</p>
            <Link to={b.link || '/shop'} className="btn btn-lg banner-cta">{b.cta || 'Shop now'}</Link>
          </div>
          <div className="banner-art">{b.image ? <img src={b.image} alt="" /> : <DeviceArt type={b.art || 'phone'} />}</div>
        </motion.div>
      </AnimatePresence>
      {n > 1 && (
        <div className="banner-nav">
          <button onClick={() => setI((x) => (x - 1 + n) % n)} aria-label="Previous banner"><LuChevronLeft /></button>
          {banners.map((bb, k) => <button key={bb.id} className={`dot ${k === i % n ? 'on' : ''}`} onClick={() => setI(k)} aria-label={`Banner ${k + 1}`} />)}
          <button onClick={() => setI((x) => (x + 1) % n)} aria-label="Next banner"><LuChevronRight /></button>
        </div>
      )}
    </section>
  );
}

function useCountdown() {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const tick = () => { const d = new Date(); const end = new Date(d); end.setHours(24, 0, 0, 0); setLeft(end - d); };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);
  const h = Math.floor(left / 36e5), m = Math.floor((left % 36e5) / 6e4), s = Math.floor((left % 6e4) / 1000);
  return [h, m, s].map((x) => String(x).padStart(2, '0'));
}

function DealOfDay({ deals, catById }) {
  const cart = useCart();
  const [h, m, s] = useCountdown();
  const day = Math.floor(Date.now() / 864e5);
  const p = deals.length ? deals[day % deals.length] : null;
  if (!p) return null;
  const off = discountPct(p);
  return (
    <div className="dotd">
      <div className="dotd-head"><h2>Deal of the day</h2><span className="dotd-clock" aria-label="Time left today">Ends in <b>{h}</b>:<b>{m}</b>:<b>{s}</b></span></div>
      <Link to={`/product/${p.slug}`} className="dotd-img"><ProductVisual product={p} category={catById[p.categoryId]} /></Link>
      <Link to={`/product/${p.slug}`} className="dotd-name">{p.name}</Link>
      <div className="dotd-price"><strong>{money(p.price)}</strong>{off > 0 && <><span className="save-pill">Save {money(p.originalPrice - p.price)}</span><s>{money(p.originalPrice)}</s></>}</div>
      <button className="btn btn-cart btn-block" onClick={() => cart.add(p)} disabled={p.stock <= 0}>Add to cart</button>
    </div>
  );
}

const APPLE_TABS = [['iPhone', 'phone'], ['MacBook', 'laptop'], ['iPad', 'tablet'], ['Apple Watch', 'wearable'], ['AirPods', 'sound'], ['Mac', 'desktop'], ['Apple accessories', 'accessories']];

function AppleStore({ products, catById }) {
  const [tab, setTab] = useState('iPhone');
  const items = useMemo(() => products.filter((p) => p.brand === 'Apple' && (p.subcategory === tab || (tab === 'Mac' && p.categoryId === 'desktop') || (tab === 'iPad' && p.subcategory === 'Stylus'))).slice(0, 8), [products, tab]);
  return (
    <section className="section apple-band">
      <div className="container">
        <div className="section-head">
          <div><h2>Shop Apple</h2><p>Official warranty on every iPhone, Mac, iPad and Watch.</p></div>
          <Link to="/brand/apple" className="link-strong">Visit the Apple store</Link>
        </div>
        <div className="tabs-pill" role="tablist">
          {APPLE_TABS.map(([t]) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}
        </div>
        <motion.div layout className="prow">
          {items.map((p) => <ProductCard key={p.id} product={p} category={catById[p.categoryId]} />)}
        </motion.div>
      </div>
    </section>
  );
}

function Row({ title, sub, link, items, catById }) {
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="container">
        <div className="section-head"><div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>{link && <Link to={link} className="link-strong">See all</Link>}</div>
        <div className="prow">{items.map((p) => <ProductCard key={p.id} product={p} category={catById[p.categoryId]} />)}</div>
      </div>
    </section>
  );
}

export default function Home() {
  useTitle('');
  const { categories, products, catById, settings, loading, error } = useStore();
  const { recent } = useShopper();
  const deals = useMemo(() => products.filter((p) => p.deal && p.price && p.stock > 0), [products]);
  const topDeals = useMemo(() => [...products].filter((p) => discountPct(p) > 0 && p.stock > 0).sort((a, b) => (b.originalPrice - b.price) - (a.originalPrice - a.price)).slice(0, 6), [products]);
  const fresh = useMemo(() => products.filter((p) => p.newArrival).slice(0, 8), [products]);
  const featured = useMemo(() => products.filter((p) => p.featured && p.brand !== 'Apple').slice(0, 8), [products]);
  const viewed = useMemo(() => recent.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 6), [recent, products]);
  const brands = useMemo(() => {
    const count = {}; products.forEach((p) => { count[p.brand] = (count[p.brand] || 0) + 1; });
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([b]) => b);
  }, [products]);

  return (
    <>
      <div className="container"><Banners banners={settings.banners || []} /></div>

      <section className="section tight">
        <div className="container">
          <h2 className="h-sm">Shop by category</h2>
          {error && <p className="error-box">{error}</p>}
          <div className="cat-rail">
            {(loading ? Array.from({ length: 10 }, (_, k) => ({ id: 'sk' + k })) : categories).map((c) => (
              c.name
                ? <Link key={c.id} to={`/shop?cat=${c.id}`} className="cat-chip"><span className="cat-chip-art"><DeviceArt type={artFor({ categoryId: c.id }, c)} /></span><span>{c.name}</span></Link>
                : <div key={c.id} className="cat-chip"><span className="cat-chip-art skeleton" /></div>
            ))}
          </div>
        </div>
      </section>

      {(deals.length > 0 || topDeals.length > 0) && (
        <section className="section">
          <div className="container deals-grid">
            <DealOfDay deals={deals} catById={catById} />
            <div className="deals-list">
              <div className="section-head"><div><h2>Top deals</h2><p>The biggest savings in the store right now.</p></div><Link to="/deals" className="link-strong">All deals</Link></div>
              <div className="pgrid three">{topDeals.map((p) => <ProductCard key={p.id} product={p} category={catById[p.categoryId]} />)}</div>
            </div>
          </div>
        </section>
      )}

      <AppleStore products={products} catById={catById} />
      <Row title="New arrivals" sub="Just landed in Dhaka." link="/shop?new=1" items={fresh} catById={catById} />
      <Row title="Popular beyond Apple" link="/shop" items={featured} catById={catById} />

      <section className="section">
        <div className="container promo-pair">
          <Link to="/quote" className="promo promo-ink">
            <div><h3>Buying for an office?</h3><p>Corporate invoices, volume pricing and VAT documents. Send a list and get one price.</p><span className="btn btn-yellow">Request a quote</span></div>
            <DeviceArt type="laptop" />
          </Link>
          <Link to="/shop?cat=network" className="promo promo-blue">
            <div><h3>Network and Starlink</h3><p>Routers, mesh Wi-Fi, switches and Starlink kits, with setup by engineers.</p><span className="btn btn-white">Shop network gear</span></div>
            <DeviceArt type="dish" />
          </Link>
        </div>
      </section>

      {brands.length > 0 && (
        <section className="section tight">
          <div className="container">
            <h2 className="h-sm">Shop by brand</h2>
            <div className="brand-rail">{brands.map((b) => <Link key={b} to={b === 'Apple' ? '/brand/apple' : `/shop?brand=${encodeURIComponent(b)}`} className="brand-chip">{b}</Link>)}</div>
          </div>
        </section>
      )}

      <Row title="Recently viewed" items={viewed} catById={catById} />
    </>
  );
}
