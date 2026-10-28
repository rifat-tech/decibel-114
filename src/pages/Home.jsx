import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LuChevronLeft, LuChevronRight, LuHeart, LuUserCircle2, LuTimer } from 'react-icons/lu';
import DeviceArt, { ProductVisual } from '../components/DeviceArt';
import { CatIcon } from '../components/CatIcon';
import Carousel from '../components/Carousel';
import { Reveal, SplitWords } from '../components/Motion';
import { useTitle } from '../components/ui';
import { useStore } from '../context/StoreContext';
import { useShopper } from '../context/ShopperContext';
import { useAuth } from '../context/AuthContext';
import { asset, discountPct, money, priceText } from '../config';

const EASE = [0.16, 1, 0.3, 1];
const local = (p) => p.images?.[0] && !/^https?:/.test(p.images[0]);

/* ── Hero: one large rounded stage, copy left, product right ── */
function Hero({ banners }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const n = banners.length;
  useEffect(() => { if (n < 2 || reduce) return undefined; const t = setInterval(() => setI((x) => (x + 1) % n), 6500); return () => clearInterval(t); }, [n, reduce, i]);
  if (!n) return null;
  const b = banners[i % n];
  return (
    <section className="bb-hero" aria-roledescription="carousel" aria-label="Featured">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={b.id} className={`bb-stage tone-${b.tone || 'black'}`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.3 }}>
          <div className="bb-stage-copy">
            {b.kicker && <span className="bb-kicker">{b.kicker}</span>}
            <SplitWords text={b.title} as="h1" />
            <motion.p initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.3, ease: EASE }}>{b.text}</motion.p>
            <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.42, ease: EASE }}>
              <Link to={b.link || '/shop'} className="bb-btn-stage">{b.cta || 'Shop now'}</Link>
            </motion.div>
          </div>
          <motion.div className={`bb-stage-art ${b.photo ? 'photo' : ''}`} initial={reduce ? false : { opacity: 0, x: 50, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.85, delay: 0.08, ease: EASE }}>
            {b.image ? <img src={asset(b.image)} alt="" /> : <DeviceArt type={b.art || 'phone'} />}
          </motion.div>
        </motion.div>
      </AnimatePresence>
      {n > 1 && (
        <div className="bb-hero-nav">
          <button onClick={() => setI((x) => (x - 1 + n) % n)} aria-label="Previous"><LuChevronLeft /></button>
          {banners.map((bb, k) => <button key={k === i % n ? `${bb.id}-${i}` : bb.id} className={`dot ${k === i % n ? 'on' : ''}`} onClick={() => setI(k)} aria-label={`Show ${bb.title}`} aria-current={k === i % n} />)}
          <button onClick={() => setI((x) => (x + 1) % n)} aria-label="Next"><LuChevronRight /></button>
        </div>
      )}
    </section>
  );
}

/* ── Product tile used on every shelf ── */
function Tile({ p, category, rank }) {
  const sh = useShopper();
  const off = discountPct(p);
  const save = off ? p.originalPrice - p.price : 0;
  return (
    <article className="bb-tile">
      <Link to={`/product/${p.slug}`} className="bb-tile-img" aria-label={p.name}>
        <ProductVisual product={p} category={category} />
        {rank && <span className="bb-rank">#{rank}</span>}
      </Link>
      <button className={`bb-wish ${sh.hasWish(p.id) ? 'on' : ''}`} onClick={() => sh.toggleWish(p.id)} aria-label={sh.hasWish(p.id) ? 'Remove from saved items' : 'Save for later'}><LuHeart /></button>
      <Link to={`/product/${p.slug}`} className="bb-tile-name">{p.name}</Link>
      {save > 0 && <span className="bb-deal-tag">Top deal</span>}
      <div className="bb-tile-price">{p.price ? money(p.price) : <span className="soon">{priceText(p)}</span>}</div>
      {save > 0 && <div className="bb-tile-was"><s>{money(p.originalPrice)}</s><b>Save {money(save)}</b></div>}
    </article>
  );
}

function Panel({ title, action, children, className = '' }) {
  return (
    <Reveal as="section" from="up" duration={0.6} amount={0.12} className={`bb-panel ${className}`}>
      {(title || action) && <div className="bb-panel-head">{title && <h2>{title}</h2>}{action}</div>}
      {children}
    </Reveal>
  );
}

/* ── "New" tiles under the hero ── */
function NewTiles({ items, catById }) {
  if (items.length < 2) return null;
  return (
    <Panel className="bb-new">
      <div className="bb-new-grid">
        {items.map((p) => (
          <Link key={p.id} to={`/product/${p.slug}`} className="bb-new-tile">
            <span className="bb-new-word">New</span>
            <span className="bb-new-name">{p.name}</span>
            <span className="bb-new-img"><ProductVisual product={p} category={catById[p.categoryId]} /></span>
            <span className="bb-new-line">{p.price ? <>From <b>{money(p.price)}</b> with official warranty</> : priceText(p)}</span>
            <span className="bb-pill-btn">Shop now</span>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

function useCountdown() {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const tick = () => { const d = new Date(); const end = new Date(d); end.setHours(24, 0, 0, 0); setLeft(end - d); };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);
  const h = Math.floor(left / 36e5), m = Math.floor((left % 36e5) / 6e4), s = Math.floor((left % 6e4) / 1000);
  return [h, m, s].map((x) => String(x).padStart(2, '0')).join(':');
}

/* ── Trending deals: category pills + numbered shelf, deal of the day pinned in the header ── */
function TrendingDeals({ products, categories, catById, dotd }) {
  const clock = useCountdown();
  const byCat = useMemo(() => {
    const m = {};
    products.filter((p) => discountPct(p) > 0 && p.stock > 0 && p.price).forEach((p) => { (m[p.categoryId] ||= []).push(p); });
    Object.values(m).forEach((l) => l.sort((a, b) => (b.originalPrice - b.price) - (a.originalPrice - a.price)));
    return m;
  }, [products]);
  const tabs = categories.filter((c) => byCat[c.id]?.length >= 2).sort((a, b) => byCat[b.id].length - byCat[a.id].length).slice(0, 7);
  const [tab, setTab] = useState(null);
  const cur = tab && byCat[tab] ? tab : tabs[0]?.id;
  if (!cur) return null;
  return (
    <Panel title="Trending deals" action={<Link to="/deals" className="bb-see">See all deals</Link>}>
      {dotd && (
        <Link to={`/product/${dotd.slug}`} className="bb-dotd">
          <span className="bb-dotd-tag"><LuTimer /> Deal of the day</span>
          <span className="bb-dotd-name">{dotd.name}</span>
          <span className="bb-dotd-price">{money(dotd.price)}{discountPct(dotd) > 0 && <s>{money(dotd.originalPrice)}</s>}</span>
          <span className="bb-dotd-clock">Ends in {clock}</span>
        </Link>
      )}
      <div className="bb-pills" role="tablist">
        {tabs.map((c) => <button key={c.id} role="tab" aria-selected={c.id === cur} className={c.id === cur ? 'on' : ''} onClick={() => setTab(c.id)}>{c.short || c.name}</button>)}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={cur} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.3, ease: EASE }}>
          <Carousel label="Trending deals">
            {byCat[cur].slice(0, 12).map((p, k) => <Tile key={p.id} p={p} category={catById[p.categoryId]} rank={k + 1} />)}
          </Carousel>
        </motion.div>
      </AnimatePresence>
    </Panel>
  );
}

/* ── Dark story panel: copy on the left, shelf on the right ── */
const APPLE_TABS = [['iPhone', (p) => p.subcategory === 'iPhone'], ['MacBook', (p) => p.subcategory === 'MacBook'], ['iPad', (p) => p.categoryId === 'tablet'], ['Mac', (p) => p.categoryId === 'desktop'], ['Watch & AirPods', (p) => ['gadget', 'sound'].includes(p.categoryId)]];
function AppleStory({ products, catById }) {
  const apple = useMemo(() => products.filter((p) => p.brand === 'Apple' && p.price), [products]);
  const [tab, setTab] = useState('iPhone');
  const items = apple.filter(APPLE_TABS.find(([t]) => t === tab)[1]).slice(0, 10);
  if (!apple.length) return null;
  return (
    <Reveal as="section" from="up" duration={0.6} amount={0.12} className="bb-story">
      <div className="bb-story-copy">
        <span className="bb-kicker">Apple at Decibel-114</span>
        <h2>The full Apple line-up, with official warranty.</h2>
        <p>iPhone, Mac, iPad, Watch and AirPods, delivered across Bangladesh.</p>
        <div className="bb-pills dark" role="tablist">
          {APPLE_TABS.map(([t]) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}
        </div>
        <Link to="/brand/apple" className="bb-link-light">Visit the Apple store</Link>
      </div>
      <div className="bb-story-shelf">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.32, ease: EASE }}>
            <Carousel label={`Apple ${tab}`}>{items.map((p) => <Tile key={p.id} p={p} category={catById[p.categoryId]} />)}</Carousel>
          </motion.div>
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

/* ── Colour block + circle shortcuts (Best Selling / Top Rated pattern) ── */
function CircleBlock({ tone, title, text, links }) {
  if (!links.length) return null;
  return (
    <Reveal as="section" from="up" duration={0.6} amount={0.12} className="bb-circles-panel">
      <div className={`bb-circles-lead tone-${tone}`}><h2>{title}</h2><p>{text}</p></div>
      <div className="bb-circles">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="bb-circle">
            <span className="bb-circle-img">{l.img ? <img src={l.img} alt="" loading="lazy" /> : <CatIcon id={l.icon} />}</span>
            <span>{l.label}</span>
          </Link>
        ))}
      </div>
    </Reveal>
  );
}

export default function Home() {
  useTitle('');
  const { categories, products, catById, settings, loading, error } = useStore();
  const { recent } = useShopper();
  const { user } = useAuth();

  const newTiles = useMemo(() => {
    const seen = new Set(); const out = [];
    for (const p of products) {
      if (!p.newArrival || !local(p) || !p.price) continue;
      const key = p.subcategory || p.categoryId; if (seen.has(key)) continue;
      seen.add(key); out.push(p); if (out.length === 4) break;
    }
    return out;
  }, [products]);
  const deals = useMemo(() => products.filter((p) => p.deal && p.price && p.stock > 0), [products]);
  const dotd = deals.length ? deals[Math.floor(Date.now() / 864e5) % deals.length] : null;
  const fresh = useMemo(() => products.filter((p) => p.newArrival && p.price).slice(0, 12), [products]);
  const featured = useMemo(() => products.filter((p) => p.featured && p.brand !== 'Apple' && p.price).slice(0, 12), [products]);
  const viewed = useMemo(() => recent.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 10), [recent, products]);

  // First good photo for a filter, ours before the distributor's.
  const photo = (fn) => (products.find((p) => fn(p) && local(p) && p.price) || products.find((p) => fn(p) && p.images?.[0]))?.images?.[0];
  const netLinks = useMemo(() => [
    ['Starlink', (p) => /starlink/i.test(p.name) && /kit/i.test(p.name), '/shop?cat=network&sub=Starlink'],
    ['Routers', (p) => p.categoryId === 'network' && /router/i.test(p.subcategory || p.name), '/shop?cat=network&sub=Router'],
    ['Mesh Wi-Fi', (p) => /mesh|deco/i.test(p.name), '/shop?cat=network&sub=Mesh%20Wi-Fi'],
    ['Switches', (p) => p.categoryId === 'network' && /switch/i.test(p.subcategory || ''), '/shop?cat=network&sub=Switch'],
    ['Access points', (p) => p.categoryId === 'network' && /access point/i.test(p.subcategory || ''), '/shop?cat=network&sub=Access%20point'],
    ['CCTV', (p) => p.categoryId === 'security', '/shop?cat=security'],
  ].map(([label, fn, to]) => ({ label, to, img: photo(fn), icon: 'network' })), [products]); // eslint-disable-line react-hooks/exhaustive-deps
  const workLinks = useMemo(() => ['laptop', 'monitor', 'printer', 'desktop', 'office', 'accessories']
    .filter((id) => catById[id])
    .map((id) => ({ label: catById[id].short || catById[id].name, to: `/shop?cat=${id}`, img: photo((p) => p.categoryId === id && !/cable|adapter/i.test(p.name)), icon: id })), [products, catById]); // eslint-disable-line react-hooks/exhaustive-deps

  const brands = useMemo(() => {
    const count = {}; products.forEach((p) => { count[p.brand] = (count[p.brand] || 0) + 1; });
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 16).map(([b]) => b);
  }, [products]);

  return (
    <div className="bb-home">
      <div className="container bb-stack">
        <Hero banners={settings.banners || []} />
        {error && <p className="error-box">{error}</p>}
        <NewTiles items={newTiles} catById={catById} />

        {!user && (
          <Reveal as="section" from="fade" className="bb-panel bb-signin">
            <LuUserCircle2 aria-hidden="true" />
            <p>Sign in for order tracking, saved items and faster checkout.</p>
            <div className="bb-signin-actions"><Link to="/login" className="bb-btn-blue">Sign in</Link><Link to="/register" className="bb-btn-outline">Create an account</Link></div>
          </Reveal>
        )}

        <div className="bb-two">
          <Reveal from="up" className="bb-promo tone-navy">
            <Link to="/quote">
              <div className="bb-promo-copy"><span className="bb-kicker">Corporate sales</span><h3>Buying for an office?</h3><p>Corporate invoices, volume pricing and VAT documents. Send a list and get one price.</p><span className="bb-btn-stage">Request a quote</span></div>
              <img className="bb-promo-img" src={asset('/img/b/thinkpad-e14.webp')} alt="" loading="lazy" />
            </Link>
          </Reveal>
          <Reveal from="up" delay={0.1} className="bb-promo tone-sun">
            <Link to="/shop?cat=network">
              <div className="bb-promo-copy"><span className="bb-kicker">Network solutions</span><h3>Network and Starlink, set up by engineers.</h3><p>Routers, mesh Wi-Fi, switches and Starlink kits for homes, offices and ISPs.</p><span className="bb-btn-stage dark">Shop network gear</span></div>
              <img className="bb-promo-img" src={asset('/img/b/mikrotik-hex-lite.webp')} alt="" loading="lazy" />
            </Link>
          </Reveal>
        </div>

        <Panel title="Shop by category">
          <Carousel label="Categories" className="cats">
            {(loading ? [] : categories).map((c) => {
              const img = photo((p) => p.categoryId === c.id && !/cable|adapter|converter/i.test(p.name) && (c.id !== 'network' || /router|mikrotik|ruijie/i.test(p.name)));
              return (
                <Link key={c.id} to={`/shop?cat=${c.id}`} className="bb-circle">
                  <span className="bb-circle-img">{img ? <img src={img} alt="" loading="lazy" /> : <CatIcon id={c.id} />}</span>
                  <span>{c.short || c.name}</span>
                </Link>
              );
            })}
          </Carousel>
        </Panel>

        <TrendingDeals products={products} categories={categories} catById={catById} dotd={dotd} />
        <AppleStory products={products} catById={catById} />

        <div className="bb-two">
          <CircleBlock tone="navy" title="Network and Starlink" text="Everything for a fast, reliable connection." links={netLinks.filter((l) => l.img)} />
          <CircleBlock tone="sky" title="Work and study" text="Laptops, screens and printers that get the job done." links={workLinks} />
        </div>

        {fresh.length > 0 && <Panel title="New arrivals" action={<Link to="/shop?new=1" className="bb-see">See all</Link>}><Carousel label="New arrivals">{fresh.map((p) => <Tile key={p.id} p={p} category={catById[p.categoryId]} />)}</Carousel></Panel>}
        {featured.length > 0 && <Panel title="Popular beyond Apple" action={<Link to="/shop" className="bb-see">See all</Link>}><Carousel label="Popular">{featured.map((p) => <Tile key={p.id} p={p} category={catById[p.categoryId]} />)}</Carousel></Panel>}

        {brands.length > 0 && (
          <Panel title="Shop by brand">
            <div className="bb-brands">{brands.map((b) => <Link key={b} to={b === 'Apple' ? '/brand/apple' : `/shop?brand=${encodeURIComponent(b)}`}>{b}</Link>)}</div>
          </Panel>
        )}
        {viewed.length > 0 && <Panel title="Recently viewed"><Carousel label="Recently viewed">{viewed.map((p) => <Tile key={p.id} p={p} category={catById[p.categoryId]} />)}</Carousel></Panel>}
      </div>
    </div>
  );
}
