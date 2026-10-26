import { lazy, Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import DeviceArt, { artFor } from '../components/DeviceArt';
import QuoteForm from '../components/QuoteForm';
import { useTitle } from '../components/ui';
import { useCatalog } from '../context/CatalogContext';

const HeroRack = lazy(() => import('../three/HeroRack'));


function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

function Hero({ brands }) {
  const reduce = useReducedMotion();
  const [gl, setGl] = useState(false);
  useEffect(() => { setGl(webglOK()); }, []);
  const words = ['Networks', 'that', 'stay', 'up.'];

  return (
    <section className="hero">
      <div className="hero-grid-bg" aria-hidden="true" />
      <div className="container hero-inner">
        <div className="hero-copy">
          <h1 className="hero-title" aria-label="Networks that stay up.">
            {words.map((w, i) => (
              <motion.span key={w} className="hero-word" initial={reduce ? false : { y: '105%' }} animate={{ y: 0 }} transition={{ delay: 0.15 + i * 0.09, duration: 0.7, ease: [0.2, 0.7, 0.1, 1] }}>
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.p className="hero-sub" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.6 }}>
            Routers, switches, Wi-Fi, firewalls and Starlink, configured by engineers in Dhaka.
          </motion.p>
          <motion.div className="hero-cta" initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.5 }}>
            <Link to="/shop" className="btn btn-signal btn-lg">Shop products</Link>
            <Link to="/quote" className="btn btn-outline-light btn-lg">Get a business quote</Link>
          </motion.div>
        </div>
        <div className="hero-visual">
          {gl ? (
            <Suspense fallback={<DeviceArt type="switch" className="hero-fallback" />}>
              <HeroRack still={!!reduce} />
            </Suspense>
          ) : <DeviceArt type="switch" className="hero-fallback" />}
        </div>
      </div>
      {brands.length > 3 && (
        <div className="marquee" aria-label="Brands in the catalog">
          <div className={`marquee-track ${reduce ? 'paused' : ''}`}>
            {[...brands, ...brands].map((b, i) => <span key={i} aria-hidden={i >= brands.length}>{b}</span>)}
          </div>
        </div>
      )}
    </section>
  );
}

function Row({ title, sub, link, items, catById }) {
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>
          <Link to={link} className="link-strong">See all</Link>
        </div>
        <div className="pgrid scroll-row">
          {items.map((p) => <ProductCard key={p.id} product={p} category={catById[p.categoryId]} />)}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { t: 'Site survey', d: 'We visit or video-call, check coverage, cabling and power, and count the users and devices.' },
  { t: 'Design and quote', d: 'You get a bill of materials with model numbers, a network diagram and one price.' },
  { t: 'Supply and install', d: 'Original-warranty equipment, racked, cabled, labelled and configured on site.' },
  { t: 'Support', d: 'Remote monitoring options, firmware updates and a direct line to the engineer who built it.' },
];

function Process() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const fill = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  return (
    <section className="process" ref={ref}>
      <div className="container process-inner">
        <div className="process-intro">
          <h2>From survey to support</h2>
          <p>Ordering one router is a click. A full office network is a project, and we run it like one.</p>
          <Link to="/solutions" className="btn btn-outline-light">How business orders work</Link>
        </div>
        <ol className="process-steps">
          <motion.span className="process-line" style={{ height: fill }} aria-hidden="true" />
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <span className="process-num">{i + 1}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default function Home() {
  useTitle('');
  const { categories, products, catById, brands, loading, error } = useCatalog();
  const fit = (a) => (a.length > 4 ? a.slice(0, a.length >= 8 ? 8 : 4) : a);
  const featured = useMemo(() => fit(products.filter((p) => p.featured)), [products]);
  const fresh = useMemo(() => fit(products.filter((p) => p.newArrival)), [products]);
  const counts = useMemo(() => products.reduce((m, p) => ((m[p.categoryId] = (m[p.categoryId] || 0) + 1), m), {}), [products]);

  return (
    <>
      <Hero brands={brands} />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div><h2>Find the right gear</h2><p>Each panel is a category. The number is how many products it holds today.</p></div>
            <Link to="/shop" className="link-strong">All products</Link>
          </div>
          {error && <p className="error-box">{error}</p>}
          <div className="rack" aria-busy={loading}>
            {(loading ? Array.from({ length: 10 }, (_, i) => ({ id: 'sk' + i })) : categories).map((c) => (
              c.name ? (
                <Link key={c.id} to={`/shop?cat=${c.id}`} className="ru">
                  <span className="ru-ear" aria-hidden="true"><i /><i /></span>
                  <span className="ru-art"><DeviceArt type={artFor({ categoryId: c.id }, c)} /></span>
                  <span className="ru-text"><b>{c.name}</b><small>{c.description}</small></span>
                  <span className="ru-count">{counts[c.id] || 0}</span>
                  <span className="ru-ear" aria-hidden="true"><i /><i /></span>
                </Link>
              ) : <div key={c.id} className="ru ru-empty" />
            ))}
          </div>
        </div>
      </section>

      <Row title="Engineers’ picks" sub="What we install most often, and why it works." link="/shop?sort=featured" items={featured} catById={catById} />
      <Process />
      <Row title="New arrivals" link="/shop?new=1" items={fresh} catById={catById} />

      <section className="section quote-band">
        <div className="container quote-band-inner">
          <div>
            <h2>Buying for an office, ISP or project?</h2>
            <p>Send a list or describe the site. You get model numbers, quantities and one price.</p>
            <ul className="ticks">
              <li>Corporate invoices and VAT documents</li>
              <li>Volume pricing on 5+ units</li>
              <li>Installation and configuration on request</li>
            </ul>
          </div>
          <QuoteForm compact />
        </div>
      </section>
    </>
  );
}
