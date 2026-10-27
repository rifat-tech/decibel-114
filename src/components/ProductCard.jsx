import { Link } from 'react-router-dom';
import { LuHeart } from 'react-icons/lu';
import { ProductVisual } from './DeviceArt';
import { StockTag } from './ui';
import { discountPct, money, priceText, quoteLink } from '../config';
import { useCart } from '../context/CartContext';
import { useShopper } from '../context/ShopperContext';

export default function ProductCard({ product: p, category, compact = false }) {
  const cart = useCart();
  const sh = useShopper();
  const off = discountPct(p);
  const save = off ? p.originalPrice - p.price : 0;
  return (
    <article className={`pcard ${compact ? 'compact' : ''}`}>
      <Link to={`/product/${p.slug}`} className="pcard-media" aria-label={p.name}>
        <ProductVisual product={p} category={category} />
      </Link>
      <button className={`pcard-wish ${sh.hasWish(p.id) ? 'on' : ''}`} onClick={() => sh.toggleWish(p.id)} aria-label={sh.hasWish(p.id) ? 'Remove from saved items' : 'Save for later'}><LuHeart /></button>
      <div className="pcard-body">
        <Link to={`/product/${p.slug}`} className="pcard-name">{p.name}</Link>
        <div className="pcard-meta">{p.brand}{p.subcategory ? ` / ${p.subcategory}` : ''}</div>
        <div className="pcard-price">
          {p.price ? <strong>{money(p.price)}</strong> : <strong className="soon">{priceText(p)}</strong>}
          {save > 0 && <div className="pcard-save"><span className="save-pill">Save {money(save)}</span><s>{money(p.originalPrice)}</s></div>}
        </div>
        <StockTag p={p} />
        {!compact && (
          <div className="pcard-actions">
            {!p.price && !p.soon
              ? <Link to={quoteLink(p)} className="btn btn-ghost btn-block">Request price</Link>
              : <button className="btn btn-cart btn-block" onClick={() => cart.add(p)} disabled={!p.price || p.stock <= 0}>{!p.price ? 'Coming soon' : p.stock <= 0 ? 'Sold out' : 'Add to cart'}</button>}
            <label className="compare-check"><input type="checkbox" checked={sh.inCompare(p.id)} onChange={() => sh.toggleCompare(p.id)} /> Compare</label>
          </div>
        )}
      </div>
    </article>
  );
}
