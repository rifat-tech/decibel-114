import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LuHeart, LuMinus, LuPlus, LuShieldCheck, LuTruck, LuFileText, LuRotateCcw, LuStore } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa6';
import DeviceArt, { artFor } from '../components/DeviceArt';
import ProductCard from '../components/ProductCard';
import ZoomImage from '../components/ZoomImage';
import { Empty, Spinner, StockTag, useTitle } from '../components/ui';
import { getProductBySlug } from '../lib/db';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useShopper } from '../context/ShopperContext';
import { discountPct, money, priceText, quoteLink, waLink } from '../config';

export default function Product() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { products, catById, settings: st } = useStore();
  const cart = useCart();
  const sh = useShopper();
  const [p, setP] = useState(undefined);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [opt, setOpt] = useState(null);

  useEffect(() => { setP(undefined); setImg(0); setQty(1); setOpt(null); getProductBySlug(slug).then(setP).catch(() => setP(null)); }, [slug]);
  useEffect(() => { if (p?.id) sh.viewed(p.id); }, [p?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useTitle(p?.name || 'Product');
  const related = useMemo(() => (p ? products.filter((x) => x.categoryId === p.categoryId && x.id !== p.id).sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price)).slice(0, 4) : []), [p, products]);

  if (p === undefined) return <Spinner full />;
  if (!p) return <div className="container"><Empty title="This product is no longer listed" action="Browse all products" to="/shop">It may have been renamed or sold out.</Empty></div>;

  const cat = catById[p.categoryId];
  const images = p.images || [];
  const price = opt?.price || p.price;
  const off = discountPct(p);
  const options = p.options?.[0];
  const wa = waLink(st.whatsapp || st.phone, `Hi Decibel-114, I'm interested in ${p.name}${opt ? ` (${opt.label})` : ''}.`);
  const fee = st.freeShippingOver && price >= st.freeShippingOver ? 'Free delivery' : `Delivery from ${money(st.shippingInsideDhaka)}`;

  return (
    <div className="container product">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span>/</span>
        {cat && <><Link to={`/shop?cat=${cat.id}`}>{cat.name}</Link><span>/</span></>}
        {p.subcategory && <Link to={`/shop?cat=${cat?.id || ''}&sub=${encodeURIComponent(p.subcategory)}`}>{p.subcategory}</Link>}
      </nav>

      <div className="product-top">
        <h1>{p.name}</h1>
        <div className="product-ids"><span>Brand: <Link to={p.brand === 'Apple' ? '/brand/apple' : `/shop?brand=${encodeURIComponent(p.brand)}`}>{p.brand}</Link></span>{p.sku && <span>Model: {p.sku}</span>}<span>Item: {p.id.toUpperCase()}</span></div>
      </div>

      <div className="product-grid">
        <div className="gallery">
          <div className="gallery-main">
            <AnimatePresence mode="wait">
              <motion.div key={img} className="gallery-frame" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {images.length ? <ZoomImage images={images} index={img} alt={p.name} onIndex={setImg} /> : <DeviceArt type={artFor(p, cat)} />}
              </motion.div>
            </AnimatePresence>
          </div>
          {images.length > 1 && <div className="thumbs">{images.map((s, i) => <button key={s} className={i === img ? 'on' : ''} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`}><img src={s} alt="" /></button>)}</div>}
          <section className="pd-section">
            <h2>Overview</h2>
            <div className="prose">{String(p.description || p.shortDescription).split('\n').filter(Boolean).map((t, i) => <p key={i}>{t}</p>)}</div>
          </section>
          {p.specs?.length > 0 && (
            <section className="pd-section">
              <h2>Specifications</h2>
              <table className="specs"><tbody>
                {p.specs.map((s, i) => <tr key={i}><th>{s.key}</th><td>{s.value}</td></tr>)}
                <tr><th>Brand</th><td>{p.brand}</td></tr>
                <tr><th>Warranty</th><td>{p.warranty || 'Ask us'}</td></tr>
              </tbody></table>
            </section>
          )}
        </div>

        <aside className="buybox">
          <div className="buy-price">
            {price ? <strong>{money(price)}</strong> : <strong>{priceText(p)}</strong>}
            {off > 0 && !opt && <div className="buy-save"><span className="save-pill big">Save {money(p.originalPrice - p.price)}</span><span>Was <s>{money(p.originalPrice)}</s></span></div>}
          </div>
          {options && (
            <div className="buy-options">
              <div className="buy-label">{options.name}: <b>{opt?.label || options.values[0]?.label}</b></div>
              <div className="opt-row">
                {options.values.map((v, i) => (
                  <button key={v.label} className={`opt ${(opt?.label || (i === 0 && !opt && options.values[0].label)) === v.label ? 'on' : ''}`} onClick={() => setOpt(v)}>
                    <b>{v.label}</b><small>{money(v.price)}</small>
                  </button>
                ))}
              </div>
            </div>
          )}
          <StockTag p={p} />
          <ul className="buy-points">
            <li><LuTruck /><span><b>{fee}</b> across Bangladesh. Dhaka in 1 to 2 days.</span></li>
            <li><LuStore /><span>Cash on delivery{st.bkash ? ', bKash' : ''}{st.nagad ? ', Nagad' : ''} or bank transfer.</span></li>
            <li><LuShieldCheck /><span>{p.warranty || 'Warranty details on request'}</span></li>
            <li><LuRotateCcw /><span>{st.returnDays}-day return if unused and sealed.</span></li>
          </ul>
          <div className="buy-row">
            <div className="qty" aria-label="Quantity">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease"><LuMinus /></button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(p.stock || 99, q + 1))} aria-label="Increase"><LuPlus /></button>
            </div>
            {!p.price && !p.soon
              ? <Link to={quoteLink(p)} className="btn btn-cart btn-lg grow">Request price</Link>
              : <button className="btn btn-cart btn-lg grow" disabled={!p.price || p.stock <= 0} onClick={() => cart.add(p, qty, opt || options?.values?.[0] || null)}>{!p.price ? 'Coming soon' : p.stock <= 0 ? 'Sold out' : 'Add to cart'}</button>}
          </div>
          {p.price > 0 && p.stock > 0 && <button className="btn btn-yellow btn-lg btn-block" onClick={() => { cart.add(p, qty, opt || options?.values?.[0] || null); nav('/checkout'); }}>Buy now</button>}
          <div className="buy-alt">
            <button className={`btn btn-ghost ${sh.hasWish(p.id) ? 'on' : ''}`} onClick={() => sh.toggleWish(p.id)}><LuHeart /> {sh.hasWish(p.id) ? 'Saved' : 'Save'}</button>
            <label className="btn btn-ghost compare-btn"><input type="checkbox" checked={sh.inCompare(p.id)} onChange={() => sh.toggleCompare(p.id)} /> Compare</label>
            <Link to={`/quote?items=${encodeURIComponent(`${p.name} × ${Math.max(qty, 5)}`)}`} className="btn btn-ghost"><LuFileText /> Bulk quote</Link>
            {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn btn-ghost"><FaWhatsapp /> WhatsApp</a>}
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section flush">
          <div className="section-head"><h2>Compare similar products</h2><Link to={`/shop?cat=${p.categoryId}`} className="link-strong">See all {cat?.name}</Link></div>
          <div className="prow">{related.map((r) => <ProductCard key={r.id} product={r} category={cat} />)}</div>
        </section>
      )}
    </div>
  );
}
