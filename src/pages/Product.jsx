import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LuHeart, LuMinus, LuPlus, LuShieldCheck, LuTruck, LuFileText } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa6';
import DeviceArt, { artFor } from '../components/DeviceArt';
import ProductCard from '../components/ProductCard';
import { Empty, Spinner, StockTag, useTitle } from '../components/ui';
import { getProductBySlug } from '../lib/db';
import { useCatalog } from '../context/CatalogContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { SITE, money, waHref } from '../config';

export default function Product() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { products, catById } = useCatalog();
  const cart = useCart();
  const wish = useWishlist();
  const [p, setP] = useState(undefined);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('specs');

  useEffect(() => { setP(undefined); setImg(0); setQty(1); getProductBySlug(slug).then(setP).catch(() => setP(null)); }, [slug]);
  useTitle(p?.name || 'Product');

  const related = useMemo(() => (p ? products.filter((x) => x.categoryId === p.categoryId && x.id !== p.id).slice(0, 4) : []), [p, products]);

  if (p === undefined) return <Spinner full />;
  if (!p) return <div className="container"><Empty title="This product is no longer listed" action="Browse all products" to="/shop">It may have been renamed or sold out.</Empty></div>;

  const cat = catById[p.categoryId];
  const images = p.images?.length ? p.images : [];
  const off = p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
  const wa = waHref(`Hi Decibel-114, I'm interested in ${p.name} (${money(p.price)}).`);
  const tabs = [
    ['specs', 'Specifications', p.specs?.length],
    ['about', 'Overview', p.description],
    ['warranty', 'Warranty & delivery', true],
  ].filter((t) => t[2]);

  return (
    <div className="container product">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/shop">Products</Link>
        {cat && <><span>/</span><Link to={`/shop?cat=${cat.id}`}>{cat.name}</Link></>}
        {p.subcategory && <><span>/</span><Link to={`/shop?cat=${cat?.id || ''}&sub=${encodeURIComponent(p.subcategory)}`}>{p.subcategory}</Link></>}
      </nav>

      <div className="product-grid">
        <div className="gallery">
          <div className="gallery-main">
            <AnimatePresence mode="wait">
              <motion.div key={img} className="gallery-frame" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {images.length ? <img src={images[img]} alt={p.name} /> : <DeviceArt type={artFor(p, cat)} />}
              </motion.div>
            </AnimatePresence>
            {off > 0 && <span className="pcard-off big">−{off}%</span>}
          </div>
          {images.length > 1 && (
            <div className="thumbs">
              {images.map((s, i) => (
                <button key={s} className={i === img ? 'on' : ''} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`}><img src={s} alt="" /></button>
              ))}
            </div>
          )}
        </div>

        <div className="buybox">
          <div className="buy-brand">{p.brand}</div>
          <h1>{p.name}</h1>
          {p.shortDescription && <p className="buy-lede">{p.shortDescription}</p>}
          <div className="buy-price">
            <strong>{money(p.price)}</strong>
            {off > 0 && <s>{money(p.originalPrice)}</s>}
          </div>
          <StockTag stock={p.stock} />

          <div className="buy-row">
            <div className="qty" aria-label="Quantity">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease"><LuMinus /></button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(p.stock || 99, q + 1))} aria-label="Increase"><LuPlus /></button>
            </div>
            <button className="btn btn-primary btn-lg grow" disabled={p.stock <= 0} onClick={() => cart.add(p, qty)}>Add to cart</button>
            <button className={`icon-btn bordered ${wish.has(p.id) ? 'on' : ''}`} onClick={() => wish.toggle(p.id)} aria-label="Save to wishlist"><LuHeart /></button>
          </div>
          {p.stock > 0 && <button className="btn btn-dark btn-lg btn-block" onClick={() => { cart.add(p, qty); nav('/checkout'); }}>Buy now</button>}

          <div className="buy-alt">
            <Link to={`/quote?items=${encodeURIComponent(`${p.name} × ${Math.max(qty, 5)}`)}`} className="btn btn-ghost"><LuFileText /> Bulk quote</Link>
            {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn btn-ghost"><FaWhatsapp /> Ask on WhatsApp</a>}
          </div>

          <ul className="buy-points">
            <li><LuShieldCheck /> {p.warranty ? `${p.warranty} official warranty` : 'Warranty details on request'}</li>
            <li><LuTruck /> Delivery across Bangladesh, free over {money(SITE.freeShippingOver)}</li>
          </ul>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {tabs.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {l}
            {tab === k && <motion.span layoutId="tab-ink" className="tab-ink" />}
          </button>
        ))}
      </div>
      <div className="tab-body">
        {tab === 'specs' && (
          <table className="specs"><tbody>
            {p.specs.map((s, i) => <tr key={i}><th>{s.key}</th><td>{s.value}</td></tr>)}
            <tr><th>Brand</th><td>{p.brand}</td></tr>
            {p.subcategory && <tr><th>Type</th><td>{p.subcategory}</td></tr>}
          </tbody></table>
        )}
        {tab === 'about' && <div className="prose">{String(p.description).split('\n').filter(Boolean).map((t, i) => <p key={i}>{t}</p>)}</div>}
        {tab === 'warranty' && (
          <div className="prose">
            <p>{p.warranty ? `This product carries ${p.warranty} of official warranty from the distributor.` : 'Ask us for the warranty terms of this product before ordering.'} Keep the box and invoice for claims.</p>
            <p>Dhaka orders usually arrive in 1 to 2 working days and orders outside Dhaka in 2 to 4. We call to confirm every order before dispatch.</p>
            <p>Read the <Link to="/page/warranty">warranty policy</Link> and <Link to="/page/returns">returns policy</Link>.</p>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="section flush">
          <div className="section-head"><h2>More in {cat?.name || 'this category'}</h2></div>
          <div className="pgrid">{related.map((r) => <ProductCard key={r.id} product={r} category={cat} />)}</div>
        </section>
      )}
    </div>
  );
}
