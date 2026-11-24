// Delivery challan on the Decibel-114 pad: what was delivered, without prices, with
// "Delivered by" and "Received by" signature blocks. Built from any invoice or quotation.
import Pad from './Pad';
import Seal from './Seal';

const day = (t) => (t ? new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
// D114-INV-2026-0002 → D114-DC-2026-0002
export const challanNo = (o) => {
  const n = o.invoiceNo || o.quoteNo || o.orderNumber || '';
  return /-(INV|QT)-/.test(n) ? n.replace(/-(INV|QT)-/, '-DC-') : `D114-DC-${n}`;
};

export default function Challan({ order: o, settings: s, base = '', challan = {} }) {
  const store = s.storeName || 'Decibel-114';
  const cu = o.customer || {};
  const ship = o.shipTo || {};
  const to = {
    company: ship.company || cu.company || '',
    name: ship.name || cu.name || '',
    designation: ship.designation ?? cu.designation ?? '',
    phone: ship.phone || cu.phone || '',
    line: ship.line || o.address?.line || '',
    city: ship.city || o.address?.city || '',
  };
  const items = (o.items || []).filter((i) => i.name);
  const showUnit = items.some((i) => i.unit);
  const qty = items.reduce((n, i) => n + (Number(i.quantity) || 0), 0);
  const ref = o.invoiceNo ? ['Invoice no.', o.invoiceNo] : o.quoteNo ? ['Quotation ref.', o.quoteNo] : ['Order no.', o.orderNumber];
  const signName = challan.deliveredBy || s.quoteSignName || s.signatoryName || '';
  const signTitle = challan.deliveredBy ? (challan.deliveredByTitle || '') : (s.quoteSignTitle || s.signatoryTitle || '');

  return (
    <Pad settings={s} base={base} label={`Delivery challan ${challan.no || challanNo(o)}`}>
      <div className="qt-top">
        <h1>DELIVERY CHALLAN</h1>
        <dl>
          <div><dt>Challan no.</dt><dd>{challan.no || challanNo(o)}</dd></div>
          <div><dt>Date</dt><dd>{day(challan.date || Date.now())}</dd></div>
          {ref[1] && <div><dt>{ref[0]}</dt><dd>{ref[1]}</dd></div>}
          {o.poRef && <div><dt>PO / ref.</dt><dd>{o.poRef}</dd></div>}
        </dl>
      </div>

      <div className="dcn-parties">
        <div className="qt-to">
          <h4>Deliver to</h4>
          <b>{to.company || to.name}</b>
          {to.company && to.name && <span>Attn: {[to.name, to.designation].filter(Boolean).join(', ')}</span>}
          {to.line && <span>{to.line}</span>}
          {[to.city, to.phone].filter(Boolean).length > 0 && <span>{[to.city, to.phone].filter(Boolean).join('  ·  ')}</span>}
        </div>
        <div className="qt-to dcn-from">
          <h4>Delivered from</h4>
          <b>{store}</b>
          {String(s.padAddress || '').split('\n').filter(Boolean).map((l, k) => <span key={k}>{l}</span>)}
          {(s.padPhone || s.phone) && <span>{s.padPhone || s.phone}</span>}
        </div>
      </div>

      {challan.note && <p className="qt-subject"><b>Note:</b> {challan.note}</p>}

      <table className="ix-table qt-table dcn-table">
        <thead><tr><th className="n">SL</th><th>Description of goods</th>{showUnit && <th className="c">Unit</th>}<th className="c">Qty</th><th className="dcn-rm">Remarks</th></tr></thead>
        <tbody>
          {items.map((i, k) => (
            <tr key={k}>
              <td className="n">{String(k + 1).padStart(2, '0')}</td>
              <td><b>{i.name}</b>{i.note && <small>{i.note}</small>}</td>
              {showUnit && <td className="c">{i.unit || ''}</td>}
              <td className="c"><b>{i.quantity}</b></td>
              <td className="dcn-rm">{(challan.remarks || {})[k] || ''}</td>
            </tr>
          ))}
        </tbody>
        <tfoot><tr><td /><td><b>Total</b> · {items.length} item{items.length === 1 ? '' : 's'}</td>{showUnit && <td />}<td className="c"><b>{qty}</b></td><td /></tr></tfoot>
      </table>

      <p className="dcn-ack">Received the above goods in good condition and in full quantity.</p>

      <div className="dcn-signs">
        <div className="dcn-sign">
          <h4>Delivered by</h4>
          <div className="dcn-art">
            {s.quoteSignature && !challan.deliveredBy ? <img className="ix-signature" src={s.quoteSignature} alt="Signature" /> : <span className="qt-sign-space" />}
            {s.invoiceSeal !== false && (s.invoiceSealImage ? <img className="ix-seal" src={s.invoiceSealImage} alt="Company seal" /> : <Seal name={store} place={s.sealPlace || 'Dhaka • Bangladesh'} base={base} />)}
          </div>
          <div className="dcn-line">
            <b>{signName || 'Name'}</b>
            {signTitle && <span>{signTitle}</span>}
            <span>{store}</span>
          </div>
        </div>
        <div className="dcn-sign">
          <h4>Received by</h4>
          <div className="dcn-art dcn-blank"><span>Company seal</span></div>
          <div className="dcn-fill">
            <span>Name</span><i />
            <span>Designation</span><i />
            <span>Signature &amp; date</span><i />
          </div>
        </div>
      </div>
    </Pad>
  );
}
