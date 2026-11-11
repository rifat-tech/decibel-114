import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LuShieldCheck, LuTruck, LuWrench, LuBuilding2, LuMessageCircle, LuChevronRight } from 'react-icons/lu';
import DeviceArt, { ProductVisual } from '../components/DeviceArt';
import { categoryPhoto } from '../lib/catPhoto';
import Carousel from '../components/Carousel';
import { Reveal, SplitWords, Parallax } from '../components/Motion';
import { useTitle } from '../components/ui';
import { useStore } from '../context/StoreContext';
import { useShopper } from '../context/ShopperContext';
import { asset, discountPct, money, priceText } from '../config';

const local = (p) => p.images?.[0] && !/^https?:/.test(p.images[0]);
const productLink = (b) => b.link || '/shop';

/* ── Full-width headline tile (apple.com style): centred copy, two text links, product below ── */
function HeroTile({ b, size = 'full', eager }) {
  const dark = ['black', 'navy'].includes(b.tone);
  return (
    <Reveal as="section" from="fade" duration={0.9} amount={0.15} className={`ap-tile ${size} ${dark ? 'dark' : 'light'}`}>
      <div className="ap-tile-copy">
        {b.kicker && <span className="ap-eyebrow">{b.kicker}</span>}
        {size === 'full' ? <SplitWords text={b.title} as="h2" /> : <h2>{b.title}</h2>}
        <p>{b.text}</p>
        <div className="ap-tile-links">
          <Link to={productLink(b)} className="ap-btn">{b.cta?.replace(/^Shop /, 'Buy ') || 'Buy'}</Link>
          <Link to={productLink(b)} className="ap-link">Learn more <LuChevronRight /></Link>
        </div>
      </div>
      <Parallax className="ap-tile-art" distance={size === 'full' ? 30 : 18}>
        {b.image ? <img src={asset(b.image)} alt="" loading={eager ? 'eager' : 'lazy'} fetchpriority={eager ? 'high' : 'auto'} /> : <DeviceArt type={b.art || 'phone'} />}
      </Parallax>
    </Reveal>
  );
}

/* ── Two-tone section heading: "The latest. Take a look at what's new." ── */
function Head({ strong, soft, action }) {
  return (
    <Reveal from="up" className="ap-head">
      <h2><b>{strong}</b> {soft}</h2>
      {action}
    </Reveal>
  );
}

/* ── Large store card (apple.com/store shelves) ── */
function StoreCard({ p, category, eyebrow }) {
  const off = discountPct(p);
  return (
    <Link to={`/product/${p.slug}`} className="ap-card">
      <div className="ap-card-top">
        {eyebrow && <span className="ap-new">{eyebrow}</span>}
        <h3>{p.name}</h3>
        <p className="ap-card-price">
          {p.price ? <>{money(p.price)}{off > 0 && <s>{money(p.originalPrice)}</s>}</> : priceText(p)}
        </p>
      </div>
      <div className="ap-card-img"><ProductVisual product={p} category={category} /></div>
    </Link>
  );
}

const WHY = [
  [LuShieldCheck, 'Official warranty', 'Every product is genuine, with the brand’s warranty in Bangladesh.'],
  [LuTruck, 'Delivered to your door', 'Dhaka in 1 to 2 days, anywhere in Bangladesh in 2 to 4.'],
  [LuWrench, 'Set up by engineers', 'Starlink, routers and office networks installed and configured for you.'],
  [LuBuilding2, 'Corporate buying', 'One quote for the whole list, VAT invoices and volume pricing.', '/quote'],
  [LuMessageCircle, 'Real people to help', 'Ask in chat. Our team answers questions before and after you buy.'],
];

export default function Home() {
  useTitle('');
  const { categories, products, catById, settings, loading, error } = useStore();
  const { recent } = useShopper();
  const banners = settings.banners || [];
  const [hero, ...rest] = banners;

  const latest = useMemo(() => products.filter((p) => p.newArrival && p.price && local(p)).slice(0, 10), [products]);
  const deals = useMemo(() => [...products].filter((p) => discountPct(p) > 0 && p.stock > 0 && local(p))
    .sort((a, b) => (b.originalPrice - b.price) - (a.originalPrice - a.price)).slice(0, 10), [products]);
  const popular = useMemo(() => products.filter((p) => p.featured && p.brand !== 'Apple' && p.price && local(p)).slice(0, 10), [products]);
  const viewed = useMemo(() => recent.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 10), [recent, products]);
  const brands = useMemo(() => {
    const count = {}; products.forEach((p) => { count[p.brand] = (count[p.brand] || 0) + 1; });
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 18).map(([b]) => b);
  }, [products]);

  return (
    <div className="ap-home">
      <div className="container ap-intro">
        <Reveal from="up"><h1>Decibel-114. <span>The best way to buy the tech you love.</span></h1></Reveal>
        <Reveal from="up" delay={0.1} className="ap-intro-help">
          <LuMessageCircle />
          <div><b>Need help choosing?</b><Link to="/quote" className="ap-link">Talk to our team <LuChevronRight /></Link></div>
        </Reveal>
      </div>

      {error && <div className="container"><p className="error-box">{error}</p></div>}

      <div className="container">
        <Carousel label="Shop by category" className="ap-cats">
          {(loading ? [] : categories).map((c) => {
            const img = categoryPhoto(products, c.id);
            return (
              <Link key={c.id} to={`/shop?cat=${c.id}`} className="ap-cat">
                <span className="ap-cat-img">{img && <img src={img} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />}</span>
                <span>{c.short || c.name}</span>
              </Link>
            );
          })}
        </Carousel>
      </div>

      {hero && <div className="ap-wide"><HeroTile b={hero} eager /></div>}

      {latest.length > 0 && (
        <section className="ap-section">
          <div className="container"><Head strong="The latest." soft="Take a look at what’s new right now." action={<Link to="/shop?new=1" className="ap-link">See all <LuChevronRight /></Link>} /></div>
          <div className="container ap-shelf"><Carousel label="New arrivals">{latest.map((p) => <StoreCard key={p.id} p={p} category={catById[p.categoryId]} eyebrow="New" />)}</Carousel></div>
        </section>
      )}

      {rest.length > 0 && (
        <div className="ap-wide ap-grid2">
          {rest.slice(0, 2).map((b) => <HeroTile key={b.id} b={b} size="half" />)}
        </div>
      )}

      {deals.length > 0 && (
        <section className="ap-section">
          <div className="container"><Head strong="Deals worth a look." soft="Official warranty, lower prices." action={<Link to="/deals" className="ap-link">All deals <LuChevronRight /></Link>} /></div>
          <div className="container ap-shelf"><Carousel label="Deals">{deals.map((p) => <StoreCard key={p.id} p={p} category={catById[p.categoryId]} eyebrow={`Save ${money(p.originalPrice - p.price)}`} />)}</Carousel></div>
        </section>
      )}

      {rest.length > 2 && (
        <div className="ap-wide ap-grid2">
          {rest.slice(2, 4).map((b) => <HeroTile key={b.id} b={b} size="half" />)}
          {rest.length === 3 && (
            <Reveal as="section" from="fade" className="ap-tile half light">
              <div className="ap-tile-copy">
                <span className="ap-eyebrow">Corporate sales</span>
                <h2>Buying for an office?</h2>
                <p>Send your list and get one price, VAT documents and delivery.</p>
                <div className="ap-tile-links"><Link to="/quote" className="ap-btn">Request a quote</Link></div>
              </div>
              <div className="ap-tile-art"><img src={asset('/img/b/thinkpad-e14.webp')} alt="" loading="lazy" /></div>
            </Reveal>
          )}
        </div>
      )}

      <section className="ap-section">
        <div className="container"><Head strong="The Decibel-114 difference." soft="Even more reasons to buy here." /></div>
        <div className="container ap-shelf">
          <Carousel label="Why buy here">
            {WHY.map(([I, t, d, to]) => {
              const inner = <><I className="ap-why-ico" /><h3>{t}</h3><p>{d}</p></>;
              return to ? <Link key={t} to={to} className="ap-why">{inner}</Link> : <div key={t} className="ap-why">{inner}</div>;
            })}
          </Carousel>
        </div>
      </section>

      {popular.length > 0 && (
        <section className="ap-section">
          <div className="container"><Head strong="Beyond Apple." soft="Samsung, Sony, ASUS, Lenovo and more." action={<Link to="/shop" className="ap-link">Shop all <LuChevronRight /></Link>} /></div>
          <div className="container ap-shelf"><Carousel label="Popular">{popular.map((p) => <StoreCard key={p.id} p={p} category={catById[p.categoryId]} />)}</Carousel></div>
        </section>
      )}

      {viewed.length > 0 && (
        <section className="ap-section">
          <div className="container"><Head strong="Recently viewed." soft="Pick up where you left off." /></div>
          <div className="container ap-shelf"><Carousel label="Recently viewed">{viewed.map((p) => <StoreCard key={p.id} p={p} category={catById[p.categoryId]} />)}</Carousel></div>
        </section>
      )}

      {brands.length > 0 && (
        <section className="ap-section ap-brands-wrap">
          <div className="container"><Head strong="Shop by brand." soft="Official stock from the names you trust." /></div>
          <div className="container ap-brands">{brands.map((b) => <Link key={b} to={b === 'Apple' ? '/brand/apple' : `/shop?brand=${encodeURIComponent(b)}`}>{b}</Link>)}</div>
        </section>
      )}
    </div>
  );
}
