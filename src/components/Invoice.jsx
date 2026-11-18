// A4 invoice, black-and-white with one brand accent: bold title, From / Bill to / Ship to
// columns, black table header, black "Total due" box, Payment and Terms boxes, seal and
// signature. Used for website orders (Admin → Orders → Invoice) and as the live preview in
// Admin → New invoice. Company details, terms, seal and signature come from Store settings.
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Seal from './Seal';
import { takaInWords } from '../lib/words';

const amt = (n) => (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const day = (t) => (t ? new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
const lines = (s) => String(s || '').split('|').map((x) => x.trim()).filter(Boolean);
const METHOD = { cod: 'Cash on delivery', bkash: 'bKash', nagad: 'Nagad', bank: 'Bank transfer', card: 'Card', cash: 'Cash', cheque: 'Cheque' };
const STATUS = { draft: 'Draft', unpaid: 'Unpaid', paid: 'Paid', cancelled: 'Cancelled' };

function Party({ title, name, rows }) {
  return (
    <div className="ix-party">
      <h4>{title}</h4>
      <b>{name || '—'}</b>
      {rows.filter(Boolean).map((r, k) => <span key={k}>{r}</span>)}
    </div>
  );
}

export default function Invoice({ order: o, settings: s, base = '' }) {
  const items = (o.items || []).filter((i) => i.name);
  const subtotal = o.subtotal ?? items.reduce((n, i) => n + i.price * i.quantity, 0);
  const vat = o.vat || 0;
  const status = o.invoiceStatus || (o.status === 'cancelled' ? 'cancelled' : o.paymentStatus === 'paid' ? 'paid' : 'unpaid');
  const paid = status === 'paid';
  const no = o.invoiceNo || o.orderNumber || '—';
  const date = o.invoiceDate || o.createdAt;
  const due = o.dueDate || (date ? date + Number(s.invoiceDueDays ?? 7) * 864e5 : 0);
  const method = METHOD[o.paymentMethod] || o.paymentMethod || '';
  const payLines = o.paymentMethod === 'bkash' ? lines(s.bkash) : o.paymentMethod === 'nagad' ? lines(s.nagad) : ['bank', 'cheque'].includes(o.paymentMethod) ? lines(s.bank) : [];
  const site = (s.website || 'decibel-114.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const store = s.storeName || 'Decibel-114';
  const [qr, setQr] = useState('');
  useEffect(() => {
    if (!o.orderNumber) { setQr(''); return; }
    QRCode.toDataURL(`https://${site}/track?no=${encodeURIComponent(o.orderNumber)}`, { margin: 0, width: 200, color: { dark: '#0A0A0A', light: '#FFFFFF' } }).then(setQr).catch(() => setQr(''));
  }, [site, o.orderNumber]);

  const showUnit = items.some((i) => i.unit);
  const qty = items.reduce((n, i) => n + (Number(i.quantity) || 0), 0);
  const unitWord = items.length && items.every((i) => i.unit && i.unit === items[0].unit) ? ` ${items[0].unit.toLowerCase()}` : '';
  const cu = o.customer || {};
  const bill = { name: cu.company || cu.name, rows: [cu.company && cu.name ? `Attn: ${cu.name}` : '', cu.phone, cu.email, o.address?.line, o.address?.city] };
  const sh = o.shipTo && !o.shipTo.same ? o.shipTo : null;
  const ship = sh
    ? { name: sh.company || sh.name, rows: [sh.company && sh.name ? `Receiver: ${sh.name}` : '', sh.phone, sh.line, sh.city] }
    : { name: bill.name, rows: [cu.company && cu.name ? `Receiver: ${cu.name}` : '', cu.phone, o.address?.line, o.address?.city] };
  const from = { name: store, rows: [...lines(s.address), s.phone, s.email, s.binNumber ? `BIN: ${s.binNumber}` : ''] };
  const terms = Array.isArray(o.terms) ? o.terms.filter(Boolean) : String(s.invoiceTerms || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const payPoints = [
    ...(method ? [`Payment by ${method.toLowerCase()}${o.paymentRef ? ` (ref. ${o.paymentRef})` : ''}.`] : []),
    ...(!paid ? payLines : []),
    ...(!paid ? [`Please quote invoice no. ${no} with every payment.`] : ['Paid in full. Thank you.']),
    'Prices are in BDT.',
  ];

  return (
    <article className="ix" aria-label={`Invoice ${no}`}>
      <div className="ix-bar"><span /></div>
      <header className="ix-head">
        <div className="ix-brand">
          <img src={`${base}/brand/logo-dark.png`} alt={store} />
          {s.tagline && <p>{s.tagline}</p>}
        </div>
        <div className="ix-title">
          <h1>INVOICE</h1>
          <dl>
            <div><dt>Invoice no.</dt><dd>{no}</dd></div>
            <div><dt>Invoice date</dt><dd>{day(date)}</dd></div>
            {!paid && status !== 'draft' && due > 0 && <div><dt>Due date</dt><dd>{day(due)}</dd></div>}
            <div><dt>Status</dt><dd className={`ix-st ${status}`}>{STATUS[status] || status}</dd></div>
          </dl>
        </div>
      </header>

      <section className="ix-parties">
        <Party title="From" {...from} />
        <Party title="Bill to" {...bill} />
        <Party title="Ship to" {...ship} />
      </section>

      <table className="ix-table">
        <thead><tr><th className="n">No.</th><th>Description</th>{showUnit && <th className="c">Unit</th>}<th className="c">Qty</th><th className="r">Unit price (BDT)</th><th className="r">Amount (BDT)</th></tr></thead>
        <tbody>
          {items.map((i, k) => (
            <tr key={k}>
              <td className="n">{String(k + 1).padStart(2, '0')}</td>
              <td><b>{i.name}</b>{(i.option || i.note || i.brand) && <small>{[i.option, i.note].filter(Boolean).join(' · ') || i.brand}</small>}</td>
              {showUnit && <td className="c">{i.unit || ''}</td>}
              <td className="c"><b>{i.quantity}</b></td>
              <td className="r">{amt(i.price)}</td>
              <td className="r"><b>{amt(i.price * i.quantity)}</b></td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={showUnit ? 6 : 5} className="ix-empty">Items you add appear here.</td></tr>}
        </tbody>
      </table>

      <section className="ix-mid">
        <div className="ix-summary">
          <h4>Order summary</h4>
          <p>Total items: {items.length} · Total quantity: {qty}{unitWord}</p>
          <h4>Amount in words</h4>
          <p className="ix-words">{takaInWords(o.total)}</p>
        </div>
        <div className="ix-totals">
          <dl>
            <div><dt>Subtotal</dt><dd>{amt(subtotal)}</dd></div>
            {o.discount > 0 && <div><dt>Discount{o.coupon ? ` (${o.coupon})` : ''}</dt><dd>– {amt(o.discount)}</dd></div>}
            {o.shipping > 0 && <div><dt>{o.source === 'manual' ? 'Delivery & installation' : 'Delivery'}</dt><dd>{amt(o.shipping)}</dd></div>}
            {vat > 0 && <div><dt>VAT{o.vatRate ? ` (${o.vatRate}%)` : ''}</dt><dd>{amt(vat)}</dd></div>}
          </dl>
          <div className="ix-due"><span>{paid ? 'Total paid' : 'Total due'}</span><strong>BDT {amt(o.total)}</strong></div>
        </div>
      </section>

      <section className="ix-boxes">
        <div className="ix-box">
          <h4>Payment</h4>
          <div className="ix-box-in ix-pay">
            <ol>{payPoints.map((t, k) => <li key={k}>{t}</li>)}</ol>
            {qr && <figure><img src={qr} alt="QR code to track this order" /><figcaption>Scan to track</figcaption></figure>}
          </div>
        </div>
        <div className="ix-right">
          <div className="ix-box">
            <h4>Terms &amp; conditions</h4>
            <div className="ix-box-in">
              {terms.length ? <ol>{terms.map((t, k) => <li key={k}>{t}</li>)}</ol> : <p className="ix-muted">No terms.</p>}
            </div>
          </div>
          <div className="ix-sign">
            <div className="ix-sign-art">
              {s.invoiceSeal !== false && (s.invoiceSealImage
                ? <img className="ix-seal" src={s.invoiceSealImage} alt="Company seal" />
                : <Seal name={store} place={s.sealPlace || 'Dhaka • Bangladesh'} base={base} />)}
              {s.invoiceSignature && <img className="ix-signature" src={s.invoiceSignature} alt="Signature" />}
            </div>
            <div className="ix-sign-name">
              <b>{s.signatoryName || 'Authorised signature'}</b>
              {s.signatoryTitle && <span>{s.signatoryTitle}</span>}
            </div>
          </div>
        </div>
      </section>

      <footer className="ix-foot">
        <b>{s.invoiceNote || 'Thank you for your business.'}</b>
        <span>{[site, s.email, s.phone].filter(Boolean).join('  ·  ')}</span>
      </footer>
    </article>
  );
}
