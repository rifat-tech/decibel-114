import { Link } from 'react-router-dom';
import { LuX } from 'react-icons/lu';
import { ProductVisual } from '../components/DeviceArt';
import { Empty, useTitle } from '../components/ui';
import { useStore } from '../context/StoreContext';
import { useShopper } from '../context/ShopperContext';
import { useCart } from '../context/CartContext';
import { money, priceText } from '../config';

export default function Compare() {
  useTitle('Compare');
  const { products, catById } = useStore();
  const sh = useShopper();
  const cart = useCart();
  const items = sh.compare.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  if (!items.length) return <div className="container narrow"><Empty title="Nothing to compare yet" action="Browse products" to="/shop">Tick “Compare” on up to four products to see them side by side.</Empty></div>;
  const keys = [...new Set(items.flatMap((p) => (p.specs || []).map((s) => s.key)))];
  const val = (p, k) => (p.specs || []).find((s) => s.key === k)?.value || '—';
  return (
    <div className="container compare">
      <div className="section-head"><h1>Compare products</h1><button className="btn btn-ghost" onClick={sh.clearCompare}>Clear all</button></div>
      <div className="table-scroll">
        <table className="compare-table">
          <thead><tr><th />{items.map((p) => (
            <th key={p.id}>
              <button className="icon-btn" onClick={() => sh.toggleCompare(p.id)} aria-label={`Remove ${p.name}`}><LuX /></button>
              <Link to={`/product/${p.slug}`} className="cmp-img"><ProductVisual product={p} category={catById[p.categoryId]} /></Link>
              <Link to={`/product/${p.slug}`} className="cmp-name">{p.name}</Link>
              <strong className="cmp-price">{priceText(p)}</strong>
              <button className="btn btn-cart btn-sm btn-block" disabled={!p.price || p.stock <= 0} onClick={() => cart.add(p)}>Add to cart</button>
            </th>))}</tr></thead>
          <tbody>
            <tr><th>Brand</th>{items.map((p) => <td key={p.id}>{p.brand}</td>)}</tr>
            <tr><th>Availability</th>{items.map((p) => <td key={p.id}>{p.stock > 0 ? 'In stock' : p.price ? 'Out of stock' : 'Coming soon'}</td>)}</tr>
            {keys.map((k) => <tr key={k}><th>{k}</th>{items.map((p) => <td key={p.id}>{val(p, k)}</td>)}</tr>)}
            <tr><th>Warranty</th>{items.map((p) => <td key={p.id}>{p.warranty}</td>)}</tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
