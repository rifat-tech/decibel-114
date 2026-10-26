import { Link, useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import QuoteForm from '../components/QuoteForm';
import DeviceArt from '../components/DeviceArt';
import { Empty, useTitle } from '../components/ui';
import { useCatalog } from '../context/CatalogContext';
import { useWishlist } from '../context/WishlistContext';
import { SITE, money, telHref } from '../config';

export function Wishlist() {
  useTitle('Wishlist');
  const { products, catById } = useCatalog();
  const { ids } = useWishlist();
  const items = products.filter((p) => ids.includes(p.id));
  return (
    <div className="container">
      <h1 className="page-title">Wishlist</h1>
      {items.length ? <div className="pgrid">{items.map((p) => <ProductCard key={p.id} product={p} category={catById[p.categoryId]} />)}</div>
        : <Empty title="Nothing saved yet" action="Browse products" to="/shop">Tap the heart on any product to keep it here.</Empty>}
    </div>
  );
}

export function Quote() {
  useTitle('Request a quote');
  const [sp] = useSearchParams();
  return (
    <div className="container quote-page">
      <div className="quote-aside">
        <h1>Request a business quote</h1>
        <p>For offices, ISPs, hotels, schools and projects. Send a list of models or describe the site, and an engineer replies with a priced bill of materials.</p>
        <ul className="ticks">
          <li>Volume pricing on 5+ units</li>
          <li>Corporate invoice, VAT and warranty documents</li>
          <li>Optional installation and configuration</li>
        </ul>
        {SITE.phone && <p>Prefer to talk? Call <a href={telHref(SITE.phone)}>{SITE.phone}</a>.</p>}
      </div>
      <div className="panel"><QuoteForm initialItems={sp.get('items') || ''} /></div>
    </div>
  );
}

const SOLUTIONS = [
  { art: 'ap', t: 'Office Wi-Fi', d: 'Seamless roaming across floors with UniFi, Ruijie or Ruckus, planned from a coverage survey so there are no dead zones.' },
  { art: 'switch', t: 'Structured cabling and switching', d: 'Cat6 and fibre runs, patch panels and PoE switching for cameras, phones and access points, labelled end to end.' },
  { art: 'firewall', t: 'Firewall and security', d: 'WatchGuard or Fortinet at the edge, VPN for remote staff, and Panda endpoint protection on every PC.' },
  { art: 'dish', t: 'Backup internet', d: 'Starlink or 5G as a second link with automatic failover, for sites that cannot go offline.' },
  { art: 'server', t: 'Servers and storage', d: 'NAS for shared files and backups, rack servers for ERP, and UPS sized for clean shutdowns.' },
  { art: 'camera', t: 'Surveillance', d: 'IP cameras on their own VLAN with NVR recording and remote viewing on your phone.' },
];

export function Solutions() {
  useTitle('For business');
  const { products } = useCatalog();
  const from = (cat) => { const ps = products.filter((p) => p.categoryId === cat); return ps.length ? Math.min(...ps.map((p) => p.price)) : 0; };
  const map = { ap: 'wifi', switch: 'switches', firewall: 'security', dish: 'connectivity', server: 'servers', camera: 'surveillance' };
  return (
    <div className="container">
      <div className="solutions-head">
        <h1>Networks for business</h1>
        <p>Tell us about the site and the people using it. We specify, supply, install and support the whole network, so one team answers for it.</p>
        <Link to="/quote" className="btn btn-primary btn-lg">Start with a quote</Link>
      </div>
      <div className="solutions-grid">
        {SOLUTIONS.map((s) => (
          <article key={s.t} className="solution">
            <DeviceArt type={s.art} />
            <h3>{s.t}</h3>
            <p>{s.d}</p>
            <Link to={`/shop?cat=${map[s.art]}`} className="link-strong">{from(map[s.art]) ? `Products from ${money(from(map[s.art]))}` : 'See products'}</Link>
          </article>
        ))}
      </div>
    </div>
  );
}

const PAGES = {
  delivery: { t: 'Delivery', b: [`Inside Dhaka delivery costs ${money(SITE.shippingInsideDhaka)} and usually takes 1 to 2 working days. Outside Dhaka costs ${money(SITE.shippingOutsideDhaka)} and takes 2 to 4 working days.`, `Orders of ${money(SITE.freeShippingOver)} or more ship free.`, 'We call every customer to confirm the order and address before dispatch. Keep your phone reachable.'] },
  warranty: { t: 'Warranty', b: ['Each product page shows its warranty period. Warranty is provided through the official distributor or brand service centre.', 'To claim, contact us with your order number and a description of the fault. Keep the box, accessories and invoice.', 'Physical damage, liquid damage, power surges and unauthorized repairs are not covered.'] },
  returns: { t: 'Returns and refunds', b: [`You can return an unused product in its original packaging within ${SITE.returnDays} days of delivery.`, 'If an item arrives damaged or wrong, tell us within 48 hours with photos and we will replace it.', 'Software licences, opened consumables and products without original packaging cannot be returned.'] },
  privacy: { t: 'Privacy', b: ['We collect your name, phone, email, address and order details to process and deliver orders and to reply to quote requests.', 'We share only what a courier or payment provider needs to complete your order. We do not sell personal information.', `To correct or delete your data, email ${SITE.email}.`] },
  terms: { t: 'Terms', b: ['Prices and stock can change without notice. If a price on the site is clearly wrong, we will contact you before processing the order.', 'An order is confirmed only after our team calls you.'] },
};

export function InfoPage() {
  const { slug } = useParams();
  const pg = PAGES[slug];
  useTitle(pg?.t || 'Page');
  if (!pg) return <NotFound />;
  return (
    <div className="container narrow prose-page">
      <h1>{pg.t}</h1>
      {pg.b.map((t, i) => <p key={i}>{t}</p>)}
    </div>
  );
}

export function NotFound() {
  useTitle('Page not found');
  return <div className="container narrow"><Empty title="This page does not exist" action="Go to the home page" to="/">The link may be old or mistyped.</Empty></div>;
}
