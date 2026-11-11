import { Link, useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import QuoteForm from '../components/QuoteForm';
import { Empty, useTitle } from '../components/ui';
import { useCatalog } from '../context/StoreContext';
import { useShopper } from '../context/ShopperContext';
import { money, telHref } from '../config';

export function Wishlist() {
  useTitle('Saved items');
  const { products, catById } = useCatalog();
  const { wish: ids } = useShopper();
  const items = products.filter((p) => ids.includes(p.id));
  return (
    <div className="container">
      <h1 className="page-title">Saved items</h1>
      {items.length ? <div className="pgrid">{items.map((p) => <ProductCard key={p.id} product={p} category={catById[p.categoryId]} />)}</div>
        : <Empty title="Nothing saved yet" action="Browse products" to="/shop">Tap the heart on any product to keep it here.</Empty>}
    </div>
  );
}

export function Quote() {
  useTitle('Request a quote');
  const { settings: SITE } = useCatalog();
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

const pagesFor = (SITE) => ({
  delivery: { t: 'Delivery', b: [`Inside Dhaka delivery costs ${money(SITE.shippingInsideDhaka)} and usually takes 1 to 2 working days. Outside Dhaka costs ${money(SITE.shippingOutsideDhaka)} and takes 2 to 4 working days.`, `Orders of ${money(SITE.freeShippingOver)} or more ship free.`, 'We call every customer to confirm the order and address before dispatch. Keep your phone reachable.'] },
  warranty: { t: 'Warranty', b: ['Each product page shows its warranty period. Warranty is provided through the official distributor or brand service centre.', 'To claim, contact us with your order number and a description of the fault. Keep the box, accessories and invoice.', 'Physical damage, liquid damage, power surges and unauthorized repairs are not covered.'] },
  returns: { t: 'Returns and refunds', b: [`You can return an unused product in its original packaging within ${SITE.returnDays} days of delivery.`, 'If an item arrives damaged or wrong, tell us within 48 hours with photos and we will replace it.', 'Software licences, opened consumables and products without original packaging cannot be returned.'] },
  privacy: { t: 'Privacy', b: ['We collect your name, phone, email, address and order details to process and deliver orders and to reply to quote requests.', 'We share only what a courier or payment provider needs to complete your order. We do not sell personal information.', `To correct or delete your data, contact us${SITE.email ? ` at ${SITE.email}` : ''}.`] },
  terms: { t: 'Terms', b: ['Prices and stock can change without notice. If a price on the site is clearly wrong, we will contact you before processing the order.', 'An order is confirmed only after our team calls you.'] },
});

export function InfoPage() {
  const { slug } = useParams();
  const { settings } = useCatalog();
  const pg = pagesFor(settings)[slug];
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
