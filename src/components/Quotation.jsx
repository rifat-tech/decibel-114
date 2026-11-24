// A quotation (or a plain letter) printed on the Decibel-114 pad.
// Used on Admin → Quotations → view page and as the live preview while editing.
import Pad from './Pad';
import Seal from './Seal';
import { takaInWords } from '../lib/words';

const amt = (n) => (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const day = (t) => (t ? new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

const Num = ({ n }) => (
  <svg className="ix-num" viewBox="0 0 18 18" aria-hidden="true"><rect width="18" height="18" fill="#0A0A0A" /><text x="9" y="13" textAnchor="middle" fontSize="10.5" fontWeight="800" fontFamily="Inter, Arial, sans-serif" fill="#19B5F0">{n}</text></svg>
);

export default function Quotation({ q, settings: s, base = '' }) {
  const store = s.storeName || 'Decibel-114';
  const cu = q.customer || {};
  const items = (q.items || []).filter((i) => i.name);
  const table = q.priceTable !== false;
  const showUnit = items.some((i) => i.unit);
  const subtotal = q.subtotal ?? items.reduce((n, i) => n + i.price * i.quantity, 0);
  const sign = q.signatory || {};
  const terms = (q.terms || []).filter(Boolean);
  const paras = (t) => String(t || '').split(/\n\s*\n|\n/).map((x) => x.trim()).filter(Boolean);
  const kind = table ? 'QUOTATION' : (q.docTitle || '').toUpperCase();

  return (
    <Pad settings={s} base={base} label={`Quotation ${q.quoteNo || ''}`}>
      <div className="qt-top">
        {kind ? <h1>{kind}</h1> : <span />}
        <dl>
          <div><dt>Ref.</dt><dd>{q.quoteNo || '—'}</dd></div>
          <div><dt>Date</dt><dd>{day(q.quoteDate)}</dd></div>
          {q.poRef && <div><dt>Your ref.</dt><dd>{q.poRef}</dd></div>}
        </dl>
      </div>

      <div className="qt-to">
        <h4>To</h4>
        {cu.name && cu.company && <b>{cu.name}{cu.designation ? `, ${cu.designation}` : ''}</b>}
        {cu.company ? <b>{cu.company}</b> : <b>{cu.name || 'Customer name'}{cu.designation ? `, ${cu.designation}` : ''}</b>}
        {q.address?.line && <span>{q.address.line}</span>}
        {[q.address?.city, cu.phone, cu.email].filter(Boolean).length > 0 && <span>{[q.address?.city, cu.phone, cu.email].filter(Boolean).join('  ·  ')}</span>}
      </div>

      {q.subject && <p className="qt-subject"><b>Subject:</b> {q.subject}</p>}
      <p className="qt-p">{q.salutation || 'Dear Sir/Madam,'}</p>
      {paras(q.intro).map((t, k) => <p key={k} className="qt-p">{t}</p>)}

      {table && (
        <>
          <table className="ix-table qt-table">
            <thead><tr><th className="n">SL</th><th>Description</th>{showUnit && <th className="c">Unit</th>}<th className="c">Qty</th><th className="r">Unit price (BDT)</th><th className="r">Total (BDT)</th></tr></thead>
            <tbody>
              {items.map((i, k) => (
                <tr key={k}>
                  <td className="n">{String(k + 1).padStart(2, '0')}</td>
                  <td><b>{i.name}</b>{i.note && <small>{i.note}</small>}</td>
                  {showUnit && <td className="c">{i.unit || ''}</td>}
                  <td className="c"><b>{i.quantity}</b></td>
                  <td className="r">{amt(i.price)}</td>
                  <td className="r"><b>{amt(i.price * i.quantity)}</b></td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan={showUnit ? 6 : 5} className="ix-empty">Items you add appear here.</td></tr>}
            </tbody>
          </table>
          <section className="qt-sum">
            <div className="qt-words"><h4>In words</h4><p>{takaInWords(q.total || 0)}</p></div>
            <div className="ix-totals">
              <dl>
                <div><dt>Subtotal</dt><dd>{amt(subtotal)}</dd></div>
                {q.discount > 0 && <div><dt>Discount</dt><dd>– {amt(q.discount)}</dd></div>}
                {q.vat > 0 && <div><dt>VAT{q.vatRate ? ` (${q.vatRate}%)` : ''}</dt><dd>{amt(q.vat)}</dd></div>}
                {q.shipping > 0 && <div><dt>{q.shippingLabel || 'Delivery & installation'}</dt><dd>{amt(q.shipping)}</dd></div>}
              </dl>
              <div className="ix-due"><span>Total offer</span><strong>BDT {amt(q.total)}</strong></div>
            </div>
          </section>
        </>
      )}

      {terms.length > 0 && (
        <div className="ix-box qt-terms">
          <h4>Terms &amp; conditions</h4>
          <div className="ix-box-in"><ol>{terms.map((t, k) => <li key={k}><Num n={k + 1} /><span>{t}</span></li>)}</ol></div>
        </div>
      )}

      {paras(q.closing).map((t, k) => <p key={k} className="qt-p">{t}</p>)}

      <div className="qt-sign">
        <p className="qt-p">Thanking you,</p>
        <div className="qt-sign-art">
          {q.showSignature !== false && s.quoteSignature ? <img className="ix-signature" src={s.quoteSignature} alt="Signature" /> : <span className="qt-sign-space" />}
          {q.showSeal !== false && s.invoiceSeal !== false && (s.invoiceSealImage
            ? <img className="ix-seal" src={s.invoiceSealImage} alt="Company seal" />
            : <Seal name={store} place={s.sealPlace || 'Dhaka • Bangladesh'} base={base} />)}
        </div>
        <div className="qt-sign-name">
          <b>{sign.name || s.quoteSignName || 'Authorised signatory'}</b>
          {(sign.title || s.quoteSignTitle) && <span>{sign.title || s.quoteSignTitle}</span>}
          <span>{store}</span>
          {[sign.phone || s.quoteSignPhone, sign.email || s.quoteSignEmail].filter(Boolean).length > 0 && <span>{[sign.phone || s.quoteSignPhone, sign.email || s.quoteSignEmail].filter(Boolean).join('  ·  ')}</span>}
        </div>
      </div>
    </Pad>
  );
}
