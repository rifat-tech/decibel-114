// A4 invoice for an order. Layout follows a clean two-band design: white header with the
// title, customer and company details, then a grey band with the dates, items, totals,
// payment details and terms. Company details and terms come from Admin → Store settings → Invoice.
// Amounts print as plain figures in Indian grouping; the column headers and total say BDT.
const amt = (n) => Math.round(Number(n) || 0).toLocaleString('en-IN');

const day = (t) => (t ? new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
const lines = (s) => String(s || '').split('|').map((x) => x.trim()).filter(Boolean);
const METHOD = { cod: 'Cash on delivery', bkash: 'bKash', nagad: 'Nagad', bank: 'Bank transfer', card: 'Card', cash: 'Cash' };

export default function Invoice({ order: o, settings: s, base = '' }) {
  const items = o.items || [];
  const subtotal = o.subtotal ?? items.reduce((n, i) => n + i.price * i.quantity, 0);
  const vat = o.vat || 0;
  const due = o.dueDate || (o.createdAt ? o.createdAt + (Number(s.invoiceDueDays ?? 7) * 864e5) : 0);
  const paid = o.paymentStatus === 'paid';
  const method = METHOD[o.paymentMethod] || o.paymentMethod || 'Cash on delivery';
  const payLines = o.paymentMethod === 'bkash' ? lines(s.bkash) : o.paymentMethod === 'nagad' ? lines(s.nagad) : o.paymentMethod === 'bank' ? lines(s.bank) : [];
  const site = s.website || 'decibel-114.com';
  return (
    <article className="inv" aria-label={`Invoice ${o.orderNumber}`}>
      <header className="inv-top">
        <div className="inv-left">
          <h1 className="inv-title">INVOICE</h1>
          {paid && <span className="inv-stamp">PAID</span>}
          <div className="inv-bill">
            <h4>Bill to:</h4>
            <b>{o.customer?.name}</b>
            {o.customer?.company && <span>{o.customer.company}</span>}
            {o.address?.line && <span>{o.address.line}</span>}
            {o.address?.city && <span>{o.address.city}</span>}
            {o.customer?.phone && <span>{o.customer.phone}</span>}
            {o.customer?.email && <span>{o.customer.email}</span>}
          </div>
        </div>
        <div className="inv-co">
          <img src={`${base}/brand/logo-dark.png`} alt={s.storeName || 'Decibel-114'} />
          {lines(s.address).map((l) => <span key={l}>{l}</span>)}
          {s.phone && <span>{s.phone}</span>}
          {s.email && <span>{s.email}</span>}
        </div>
      </header>

      <section className="inv-body">
        <aside className="inv-meta">
          <div><h4>Invoice no:</h4><span>{o.orderNumber}</span></div>
          <div><h4>Date:</h4><span>{day(o.createdAt)}</span></div>
          {!paid && due > 0 && <div><h4>Due date:</h4><span>{day(due)}</span></div>}
          <div><h4>Status:</h4><span>{paid ? 'Paid' : 'Payment pending'}</span></div>
          <div className="inv-vert">
            {s.phone && <span>{s.phone}</span>}
            {s.email && <span>{s.email}</span>}
            <span>{site}</span>
          </div>
        </aside>

        <div className="inv-main">
          <table className="inv-table">
            <thead><tr><th>Item description</th><th className="r">Price (BDT)</th><th className="c">Qty</th><th className="r">Total (BDT)</th></tr></thead>
            <tbody>
              {items.map((i, k) => (
                <tr key={k}>
                  <td><b>{i.name}</b>{(i.option || i.brand || i.note) && <small>{[i.option, i.note].filter(Boolean).join(' · ') || i.brand}</small>}</td>
                  <td className="r">{amt(i.price)}</td>
                  <td className="c">{i.quantity}</td>
                  <td className="r">{amt(i.price * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="inv-lower">
            <div className="inv-pay">
              <h4>Payment method</h4>
              <span>{method}</span>
              {o.paymentRef && <span>Transaction ID: {o.paymentRef}</span>}
              {!paid && payLines.map((l) => <span key={l}>{l}</span>)}
              {(s.binNumber || s.tradeLicense) && (
                <div className="inv-tax">
                  {s.binNumber && <span>VAT reg. (BIN): {s.binNumber}</span>}
                  {s.tradeLicense && <span>Trade licence: {s.tradeLicense}</span>}
                </div>
              )}
            </div>
            <dl className="inv-sum">
              <div><dt>Sub total</dt><dd>{amt(subtotal)}</dd></div>
              {vat > 0 && <div><dt>VAT {o.vatRate ? `${o.vatRate}%` : ''}</dt><dd>{amt(vat)}</dd></div>}
              {o.shipping > 0 && <div><dt>{o.source === 'manual' ? 'Delivery / installation' : 'Delivery'}</dt><dd>{amt(o.shipping)}</dd></div>}
              {o.discount > 0 && <div><dt>Discount{o.coupon ? ` (${o.coupon})` : ''}</dt><dd>−{amt(o.discount)}</dd></div>}
              <div className="inv-total"><dt>Total</dt><dd>BDT {amt(o.total)}</dd></div>
            </dl>
          </div>

          {(s.invoiceTerms || s.invoiceNote) && (
            <div className="inv-terms">
              {s.invoiceTerms && <><h4>Terms &amp; conditions</h4><p>{s.invoiceTerms}</p></>}
              {s.invoiceNote && <p className="inv-thanks">{s.invoiceNote}</p>}
            </div>
          )}
          <div className="inv-sign"><span>Authorised signature</span></div>
        </div>
      </section>
    </article>
  );
}
