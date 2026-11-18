// A4 invoice for an order, in an international layout: brand header with the amount due,
// "Billed to" / "From" cards, a numbered item table, totals, payment instructions with a QR
// code to track the order, terms, and a dark footer. Company details and terms come from
// Admin → Store settings (Store details and Invoice tabs).
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Seal from './Seal';

// Amounts print as figures in Indian grouping; headers and totals carry the currency.
const amt = (n) => (Math.round((Number(n) || 0) * 100) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const day = (t) => (t ? new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
const lines = (s) => String(s || '').split('|').map((x) => x.trim()).filter(Boolean);
const METHOD = { cod: 'Cash on delivery', bkash: 'bKash', nagad: 'Nagad', bank: 'Bank transfer', card: 'Card', cash: 'Cash' };

export default function Invoice({ order: o, settings: s, base = '' }) {
  const items = o.items || [];
  const subtotal = o.subtotal ?? items.reduce((n, i) => n + i.price * i.quantity, 0);
  const vat = o.vat || 0;
  const paid = o.paymentStatus === 'paid';
  const due = o.dueDate || (o.createdAt ? o.createdAt + Number(s.invoiceDueDays ?? 7) * 864e5 : 0);
  const method = METHOD[o.paymentMethod] || o.paymentMethod || 'Cash on delivery';
  const payLines = o.paymentMethod === 'bkash' ? lines(s.bkash) : o.paymentMethod === 'nagad' ? lines(s.nagad) : o.paymentMethod === 'bank' ? lines(s.bank) : [];
  const site = (s.website || 'decibel-114.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const trackUrl = `https://${site}/track?no=${encodeURIComponent(o.orderNumber || '')}`;
  const [qr, setQr] = useState('');
  useEffect(() => { QRCode.toDataURL(trackUrl, { margin: 0, width: 220, color: { dark: '#0B1B33', light: '#FFFFFF' } }).then(setQr).catch(() => setQr('')); }, [trackUrl]);
  const status = paid ? 'Paid' : o.status === 'cancelled' ? 'Cancelled' : 'Unpaid';

  return (
    <article className="iv" aria-label={`Invoice ${o.orderNumber}`}>
      <div className="iv-stripe" />
      <header className="iv-head">
        <div className="iv-brand">
          <img src={`${base}/brand/logo-dark.png`} alt={s.storeName || 'Decibel-114'} />
          {s.tagline && <span>{s.tagline}</span>}
        </div>
        <div className="iv-titlebox">
          <h1>Invoice</h1>
          <span className="iv-no"># {o.orderNumber}</span>
          <span className={`iv-pill ${paid ? 'paid' : o.status === 'cancelled' ? 'void' : 'due'}`}>{status}</span>
        </div>
      </header>

      <section className="iv-overview">
        <div className="iv-card">
          <h4>Billed to</h4>
          <b>{o.customer?.name}</b>
          {o.customer?.company && <span className="iv-co-name">{o.customer.company}</span>}
          {o.address?.line && <span>{o.address.line}</span>}
          {o.address?.city && <span>{o.address.city}, Bangladesh</span>}
          {o.customer?.phone && <span>{o.customer.phone}</span>}
          {o.customer?.email && <span>{o.customer.email}</span>}
        </div>
        <div className="iv-card">
          <h4>From</h4>
          <b>{s.storeName || 'Decibel-114'}</b>
          {lines(s.address).map((l) => <span key={l}>{l}</span>)}
          {s.phone && <span>{s.phone}</span>}
          {s.email && <span>{s.email}</span>}
          {s.binNumber && <span>BIN: {s.binNumber}</span>}
        </div>
        <div className={`iv-due ${paid ? 'is-paid' : ''}`}>
          <h4>{paid ? 'Amount paid' : 'Amount to pay'}</h4>
          <strong><small>BDT</small> {amt(o.total)}</strong>
          <dl>
            <div><dt>Issue date</dt><dd>{day(o.createdAt)}</dd></div>
            {!paid && due > 0 && <div><dt>Due date</dt><dd>{day(due)}</dd></div>}
            {paid && o.paidAt && <div><dt>Paid on</dt><dd>{day(o.paidAt)}</dd></div>}
          </dl>
        </div>
      </section>

      <table className="iv-table">
        <thead><tr><th className="iv-n">#</th><th>Description</th><th className="c">Qty</th><th className="r">Unit price</th><th className="r">Amount (BDT)</th></tr></thead>
        <tbody>
          {items.map((i, k) => (
            <tr key={k}>
              <td className="iv-n">{String(k + 1).padStart(2, '0')}</td>
              <td><b>{i.name}</b>{(i.option || i.note || i.brand) && <small>{[i.option, i.note].filter(Boolean).join(' · ') || i.brand}</small>}</td>
              <td className="c">{i.quantity}</td>
              <td className="r">{amt(i.price)}</td>
              <td className="r strong">{amt(i.price * i.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="iv-bottom">
        <div className="iv-pay">
          <div className="iv-paybox">
            <div>
              <h4>Payment</h4>
              <p><b>{method}</b>{o.paymentRef && <> · Ref {o.paymentRef}</>}</p>
              {!paid && payLines.map((l) => <p key={l}>{l}</p>)}
              {!paid && <p className="iv-muted">Please quote invoice # {o.orderNumber} with your payment.</p>}
            </div>
            {qr && <figure><img src={qr} alt="QR code to track this order" /><figcaption>Scan to track</figcaption></figure>}
          </div>
          {s.tradeLicense && <p className="iv-muted">Trade licence: {s.tradeLicense}</p>}
        </div>
        <dl className="iv-sum">
          <div><dt>Subtotal</dt><dd>{amt(subtotal)}</dd></div>
          {o.discount > 0 && <div><dt>Discount{o.coupon ? ` (${o.coupon})` : ''}</dt><dd>− {amt(o.discount)}</dd></div>}
          {o.shipping > 0 && <div><dt>{o.source === 'manual' ? 'Delivery & installation' : 'Delivery'}</dt><dd>{amt(o.shipping)}</dd></div>}
          {vat > 0 && <div><dt>VAT{o.vatRate ? ` (${o.vatRate}%)` : ''}</dt><dd>{amt(vat)}</dd></div>}
          <div className="iv-total"><dt>Total</dt><dd>BDT {amt(o.total)}</dd></div>
          {paid && <div className="iv-paidrow"><dt>Paid</dt><dd>− {amt(o.total)}</dd></div>}
          {paid && <div className="iv-balance"><dt>Balance due</dt><dd>BDT 0</dd></div>}
        </dl>
      </section>

      <section className="iv-notes">
        {s.invoiceTerms && <div><h4>Terms &amp; conditions</h4><p>{s.invoiceTerms}</p></div>}
        <div className="iv-sign">
          <div className="iv-sign-art">
            {s.invoiceSeal !== false && (s.invoiceSealImage
              ? <img className="iv-seal iv-seal-img" src={s.invoiceSealImage} alt="Company seal" />
              : <Seal name={s.storeName || 'Decibel-114'} place={s.sealPlace || 'Dhaka • Bangladesh'} base={base} />)}
            {s.invoiceSignature && <img className="iv-signature" src={s.invoiceSignature} alt="Signature" />}
          </div>
          <span className="iv-sign-line" />
          <span>{s.signatoryName ? <><b>{s.signatoryName}</b>{s.signatoryTitle ? `, ${s.signatoryTitle}` : ''}</> : 'Authorised signature'}</span>
        </div>
      </section>

      <footer className="iv-foot">
        <span className="iv-thanks">{s.invoiceNote || 'Thank you for your business.'}</span>
        <span className="iv-contact">{[site, s.email, s.phone].filter(Boolean).join('   •   ')}</span>
      </footer>
    </article>
  );
}
