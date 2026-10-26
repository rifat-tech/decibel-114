import { Link } from 'react-router-dom';
import { LuHeart, LuPlus } from 'react-icons/lu';
import { ProductVisual } from './DeviceArt';
import { StockTag } from './ui';
import { money } from '../config';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product: p, category }) {
  const cart = useCart();
  const wish = useWishlist();
  const off = p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
  return (
    <article className="pcard">
      <Link to={`/product/${p.slug}`} className="pcard-media" aria-label={p.name}>
        <ProductVisual product={p} category={category} />
        {off > 0 && <span className="pcard-off">−{off}%</span>}
        {p.newArrival && !off && <span className="pcard-new">New</span>}
      </Link>
      <button className={`pcard-wish ${wish.has(p.id) ? 'on' : ''}`} onClick={() => wish.toggle(p.id)} aria-label={wish.has(p.id) ? 'Remove from wishlist' : 'Save to wishlist'}>
        <LuHeart />
      </button>
      <div className="pcard-body">
        <div className="pcard-brand">{p.brand}</div>
        <Link to={`/product/${p.slug}`} className="pcard-name">{p.name}</Link>
        {p.shortDescription && <p className="pcard-desc">{p.shortDescription}</p>}
        <div className="pcard-foot">
          <div>
            <div className="pcard-price">{money(p.price)}</div>
            {off > 0 && <s className="pcard-was">{money(p.originalPrice)}</s>}
          </div>
          <button className="pcard-add" onClick={() => cart.add(p)} aria-label={`Add ${p.name} to cart`} disabled={p.stock <= 0}>
            <LuPlus />
          </button>
        </div>
        <StockTag stock={p.stock} />
      </div>
    </article>
  );
}
