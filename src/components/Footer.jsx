import { Link } from 'react-router-dom';
import Logo from './Logo';
import { SITE, telHref } from '../config';
import { useCatalog } from '../context/CatalogContext';

export default function Footer() {
  const { categories } = useCatalog();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo light />
          <p className="footer-about">Networking, security and technology products for offices, ISPs and homes across Bangladesh, with setup support from engineers.</p>
          {SITE.phone && <a className="footer-contact" href={telHref(SITE.phone)}>{SITE.phone}</a>}
          {SITE.email && <a className="footer-contact" href={`mailto:${SITE.email}`}>{SITE.email}</a>}
          {SITE.address && <p className="footer-muted">{SITE.address}</p>}
          {SITE.hours && <p className="footer-muted">{SITE.hours}</p>}
        </div>
        <div>
          <h4>Shop</h4>
          {categories.slice(0, 7).map((c) => <Link key={c.id} to={`/shop?cat=${c.id}`}>{c.name}</Link>)}
        </div>
        <div>
          <h4>Business</h4>
          <Link to="/quote">Request a quote</Link>
          <Link to="/solutions">Network setup</Link>
          <Link to="/register">Create an account</Link>
        </div>
        <div>
          <h4>Help</h4>
          <Link to="/track">Track your order</Link>
          <Link to="/page/delivery">Delivery</Link>
          <Link to="/page/warranty">Warranty</Link>
          <Link to="/page/returns">Returns</Link>
          <Link to="/page/privacy">Privacy</Link>
        </div>
      </div>
      <div className="container footer-base">© {new Date().getFullYear()} {SITE.name}. Prices in Bangladeshi taka, VAT included where applicable.</div>
    </footer>
  );
}
