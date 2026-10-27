import { Link } from 'react-router-dom';
import Logo from './Logo';
import { telHref } from '../config';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { categories, settings: s } = useStore();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo onBlue />
          <p>{s.tagline}. Official-warranty products, honest prices and delivery across Bangladesh.</p>
          {s.phone && <a href={telHref(s.phone)} className="footer-strong">{s.phone}</a>}
          {s.email && <a href={`mailto:${s.email}`} className="footer-strong">{s.email}</a>}
          {s.address && <p className="footer-muted">{s.address}</p>}
          {s.hours && <p className="footer-muted">{s.hours}</p>}
        </div>
        <div><h4>Shop</h4>{categories.slice(0, 8).map((c) => <Link key={c.id} to={`/shop?cat=${c.id}`}>{c.name}</Link>)}</div>
        <div><h4>Apple</h4><Link to="/shop?cat=phone&sub=iPhone">iPhone</Link><Link to="/shop?cat=laptop&sub=MacBook">MacBook</Link><Link to="/shop?cat=tablet&sub=iPad">iPad</Link><Link to="/shop?cat=wearable&sub=Apple Watch">Apple Watch</Link><Link to="/shop?cat=sound&sub=AirPods">AirPods</Link><Link to="/shop?cat=accessories&sub=Apple accessories">Accessories</Link></div>
        <div><h4>Help</h4><Link to="/track">Track your order</Link><Link to="/page/delivery">Delivery</Link><Link to="/page/warranty">Warranty</Link><Link to="/page/returns">Returns</Link><Link to="/quote">Corporate quotes</Link><Link to="/page/privacy">Privacy</Link></div>
      </div>
      <div className="container footer-base">© {new Date().getFullYear()} {s.storeName}. Prices in Bangladeshi taka and may change without notice.</div>
    </footer>
  );
}
