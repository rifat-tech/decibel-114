// A4 invoice. Used for website orders (Admin → Orders → Invoice) and for invoices made in
// Admin → New invoice, where it shows as a live preview beside the form.
// Company details, terms, seal and signature come from Admin → Store settings.
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Seal from './Seal';
import { takaInWords } from '../lib/words';

// Amounts print as figures in Indian grouping with two decimals; headers and totals carry the currency.
const amt = (n) => (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const day = (t) => (t ? new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '');
const lines = (s) => String(s || '').split('|').map((x) => x.trim()).filter(Boolean);
const METHOD = { cod: 'Cash on delivery', bkash: 'bKash', nagad: 'Nagad', bank: 'Bank transfer', card: 'Card', cash: 'Cash', cheque: 'Cheque' };
const STATUS = { draft: 'Draft', unpaid: 'Unpaid', paid: 'Paid', cancelled: 'Cancelled' };

function Party({ title, p }) {
  if (!p) return null;
  return (
    <div className="iv-card">
      <h4>{title}</h4>
      <b>{p.company || p.name || '—'}</b>
      {p.company && p.name && <span>Attn: {p.name}</span>}
      {p.phone && <span>{p.phone}</span>}
      {p.email && <span>{p.email}</span>}
      {p.line && <span className="iv-pre">{p.line}</span>}
      {p.city && <span>{p.city}</span>}
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
  const payLines = o.paymentMethod === 'bkash' ? lines(s.bkash) : o.paymentMethod === 'nagad' ? lines(s.nagad) : o.paymentMethod === 'bank' || o.paymentMethod === 'cheque' ? lines(s.bank) : [];
  const site = (s.website || 'decibel-114.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const trackUrl = `https://${site}/track?no=${encodeURIComponent(o.orderNumber || '')}`;
  const [qr, setQr] = useState('');
  useEffect(() => {
    if (!o.orderNumber) { setQr(''); return; }
    QRCode.toDataURL(trackUrl, { margin: 0, width: 220, color: { dark: '#0B1B33', light: '#FFFFFF' } }).then(setQr).catch(() => setQr(''));
  }, [trackUrl, o.orderNumber]);

  const showUnit = items.some((i) => i.unit);
  const qty = items.reduce((n, i) => n + (Number(i.quantity) || 0), 0);
  const unitWord = items.length && items.every((i) => i.unit && i.unit === items[0].unit) ? ` ${items[0].unit.toLowerCase()}` : '';
  const bill = { ...o.customer, line: o.address?.line, city: o.address?.city };
  const ship = o.shipTo && !o.shipTo.same ? o.shipTo : null;
  const terms = Array.isArray(o.terms) ? o.terms.filter(Boolean) : String(s.invoiceTerms || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const adv = Number(o.advancePct) || 0;

  return (
    <article className="iv" aria-label={`Invoice ${no}`}>
      <div className="iv-stripe" />
      <header className="iv-head">
        <div className="iv-brand">
          <img src={`${base}/brand/logo-dark.png`} alt={s.storeName || 'Decibel-114'} />
          <div className="iv-from">
            {s.tagline && <span>{s.tagline}</span>}
            {lines(s.address).map((l) => <span key={l}>{l}</span>)}
            {[s.phone, s.email].filter(Boolean).length > 0 && <span>{[s.phone, s.email].filter(Boolean).join('  ·  ')}</span>}
            {s.binNumber && <span>BIN: {s.binNumber}</span>}
          </div>
        </div>
        <div className="iv-titlebox">
          <h1>Invoice</h1>
          <dl className="iv-ids">
            <div><dt>Invoice no.</dt><dd>{no}</dd></div>
            <div><dt>Invoice date</dt><dd>{day(date)}</dd></div>
            {!paid && status !== 'draft' && due > 0 && <div><dt>Due date</dt><dd>{day(due)}</dd></div>}
          </dl>
          <span className={`iv-pill ${status}`}>{STATUS[status] || status}</span>
        </div>
      </header>

      <section className="iv-overview">
        <Party title="Bill to" p={bill} />
        {ship ? <Party title="Ship to" p={ship} /> : <div />}
        <div className={`iv-due ${paid ? 'is-paid' : ''}`}>
          <h4>{paid ? 'Amount paid' : 'Amount to pay'}</h4>
          <strong><small>BDT</small> {amt(o.total)}</strong>
          {method && <span className="iv-due-method">{method}{o.paymentRef ? ` · Ref ${o.paymentRef}` : ''}</span>}
        </div>
      </section>

      <table className="iv-table">
        <thead><tr><th className="iv-n">No.</th><th>Description</th>{showUnit && <th className="c">Unit</th>}<th className="c">Qty</th><th className="r">Unit price (BDT)</th><th className="r">Amount (BDT)</th></tr></thead>
        <tbody>
          {items.map((i, k) => (
            <tr key={k}>
              <td className="iv-n">{String(k + 1).padStart(2, '0')}</td>
              <td><b>{i.name}</b>{(i.option || i.note || i.brand) && <small>{[i.option, i.note].filter(Boolean).join(' · ') || i.brand}</small>}</td>
              {showUnit && <td className="c">{i.unit || ''}</td>}
              <td className="c strong">{i.quantity}</td>
              <td className="r">{amt(i.price)}</td>
              <td className="r strong">{amt(i.price * i.quantity)}</td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={showUnit ? 6 : 5} className="iv-empty">Items you add appear here.</td></tr>}
        </tbody>
      </table>

      <section className="iv-bottom">
        <div className="iv-summary">
          <h4>Order summary</h4>
          <p>Total items: {items.length} · Total quantity: {qty}{unitWord}</p>
          <h4>Amount in words</h4>
          <p className="iv-words">{takaInWords(o.total)}</p>
        </div>
        <dl className="iv-sum">
          <div><dt>Subtotal</dt><dd>{amt(subtotal)}</dd></div>
          {o.discount > 0 && <div><dt>Discount{o.coupon ? ` (${o.coupon})` : ''}</dt><dd>− {amt(o.discount)}</dd></div>}
          {o.shipping > 0 && <div><dt>{o.source === 'manual' ? 'Delivery & installation' : 'Delivery'}</dt><dd>{amt(o.shipping)}</dd></div>}
          {vat > 0 && <div><dt>VAT{o.vatRate ? ` (${o.vatRate}%)` : ''}</dt><dd>{amt(vat)}</dd></div>}
          <div className="iv-total"><dt>{paid ? 'Total paid' : 'Total due'}</dt><dd>BDT {amt(o.total)}</dd></div>
        </dl>
      </section>

      <section className="iv-terms2">
        <div className="iv-box">
          <h4>Payment terms</h4>
          {adv > 0 && adv < 100 && (
            <div className="iv-split">
              <div><strong>{adv}%</strong><small>Advance</small><p>{o.advanceNote || 'With the confirmed work order / PO'}</p></div>
              <div><strong>{100 - adv}%</strong><small>Balance</small><p>{o.balanceNote || `Within ${s.invoiceDueDays ?? 7} days of delivery`}</p></div>
            </div>
          )}
          <div className="iv-payrow">
            <div>
              {method && <p><b>{method}</b>{o.paymentRef && <> · Ref {o.paymentRef}</>}</p>}
              {!paid && payLines.map((l) => <p key={l}>{l}</p>)}
              {!paid && <p className="iv-muted">Please quote invoice no. {no} with every payment.</p>}
              {s.tradeLicense && <p className="iv-muted">Trade licence: {s.tradeLicense}</p>}
            </div>
            {qr && <figure><img src={qr} alt="QR code to track this order" /><figcaption>Scan to track</figcaption></figure>}
          </div>
        </div>
        <div className="iv-box">
          <h4>Terms &amp; conditions</h4>
          {terms.length > 0 ? <ol className="iv-terms-list">{terms.map((t, k) => <li key={k}>{t}</li>)}</ol> : <p className="iv-muted">No terms.</p>}
        </div>
      </section>

      <section className="iv-notes">
        <div className="iv-thanks-big">{s.invoiceNote || 'Thank you for your business.'}</div>
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
        <span className="iv-thanks">{s.storeName || 'Decibel-114'}</span>
        <span className="iv-contact">{[site, s.email, s.phone].filter(Boolean).join('   •   ')}</span>
      </footer>
    </article>
  );
}
