// Admin → delivery challan for an invoice, quotation or order: a few challan details on top
// (number, date, who delivered, remarks), the challan on the pad below, then Print or Download PDF.
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuArrowLeft, LuDownload, LuPrinter, LuSave } from 'react-icons/lu';
import Challan, { challanNo } from '../../components/Challan';
import { Field, Spinner } from '../../components/ui';
import { adminGetOrder, errText, getSettings, updateOrder } from '../../lib/db';
import { downloadPdf } from '../../lib/pdf';
import { useAuth } from '../../context/AuthContext';

const toDateInput = (t) => new Date(t - new Date(t).getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const fromDateInput = (v) => { const [y, m, d] = String(v).split('-').map(Number); return y ? new Date(y, m - 1, d, 12).getTime() : Date.now(); };
const fileName = (o, c) => `${c.no || challanNo(o)}_${(o.shipTo?.company || o.customer?.company || o.customer?.name || 'Customer').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-')}`;

export default function ChallanPage() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const { user } = useAuth();
  const [o, setO] = useState(undefined);
  const [s, setS] = useState(null);
  const [c, setC] = useState(null);
  const [busy, setBusy] = useState('');
  useEffect(() => {
    getSettings().then(setS);
    adminGetOrder(id).then((x) => {
      setO(x || null);
      if (x) setC({ no: x.challan?.no || challanNo(x), date: x.challan?.date || Date.now(), deliveredBy: x.challan?.deliveredBy || '', deliveredByTitle: x.challan?.deliveredByTitle || '', note: x.challan?.note || '', remarks: x.challan?.remarks || {} });
    }).catch(() => setO(null));
  }, [id]);
  useEffect(() => { if (o && c) document.title = fileName(o, c); }, [o, c]);

  const pdf = async () => {
    const el = document.querySelector('#print-area .ix');
    if (!el || busy) return;
    setBusy('pdf');
    try { await downloadPdf(el, fileName(o, c)); } catch { toast.error('Could not make the PDF. Use Print → Save as PDF instead.'); } finally { setBusy(''); }
  };
  useEffect(() => { if (o && s && c && sp.get('pdf')) { const t = setTimeout(pdf, 1200); return () => clearTimeout(t); } return undefined; }, [o, s]); // eslint-disable-line react-hooks/exhaustive-deps

  if (o === undefined || !s || (o && !c)) return <Spinner />;
  if (!o) return <div className="inv-page"><p>Not found. <Link to="/admin/invoices">Back to invoices</Link></p></div>;

  const back = o.source === 'quotation' ? [`/admin/quotation/${o.id}`, 'Back to quotation'] : o.source === 'manual' ? [`/admin/invoice/${o.id}`, 'Back to invoice'] : ['/admin/orders', 'Back to orders'];
  const set = (k) => (e) => setC((x) => ({ ...x, [k]: e.target.value }));
  const save = async () => {
    setBusy('save');
    try {
      const challan = { ...c, no: c.no.trim(), deliveredBy: c.deliveredBy.trim(), deliveredByTitle: c.deliveredByTitle.trim(), note: c.note.trim() };
      await updateOrder(o, { challan }, user?.profile?.name || user?.email || 'staff');
      setO({ ...o, challan }); toast.success('Challan details saved');
    } catch (e) { toast.error(errText(e)); } finally { setBusy(''); }
  };
  const items = (o.items || []).filter((i) => i.name);

  return (
    <div className="inv-page">
      <div className="inv-bar no-print">
        <Link to={back[0]} className="btn btn-ghost"><LuArrowLeft /> {back[1]}</Link>
        <div className="row-gap">
          <button className="btn btn-ghost" onClick={save} disabled={!!busy}><LuSave /> {busy === 'save' ? 'Saving…' : 'Save details'}</button>
          <button className="btn btn-ghost" onClick={() => setTimeout(() => window.print(), 50)}><LuPrinter /> Print</button>
          <button className="btn btn-primary" onClick={pdf} disabled={!!busy}><LuDownload /> {busy === 'pdf' ? 'Making PDF…' : 'Download PDF'}</button>
        </div>
      </div>

      <section className="panel dcn-panel no-print">
        <h2>Challan details</h2>
        <div className="ni-3">
          <Field label="Challan no."><input value={c.no} onChange={set('no')} /></Field>
          <Field label="Delivery date"><input type="date" value={toDateInput(c.date)} onChange={(e) => setC((x) => ({ ...x, date: fromDateInput(e.target.value) }))} /></Field>
          <Field label="Delivered by" hint={`Empty = ${s.quoteSignName || 'the pad signatory'}`}><input value={c.deliveredBy} onChange={set('deliveredBy')} /></Field>
        </div>
        {c.deliveredBy && <Field label="Their designation"><input value={c.deliveredByTitle} onChange={set('deliveredByTitle')} /></Field>}
        <Field label="Note on the challan (optional)" hint="e.g. Delivered to the 7th floor IT room; installation done."><input value={c.note} onChange={set('note')} /></Field>
        <details>
          <summary>Remarks per item (optional)</summary>
          {items.map((i, k) => (
            <Field key={k} label={`${k + 1}. ${i.name}`}><input value={c.remarks[k] || ''} placeholder="e.g. Serial no., installed, OK" onChange={(e) => setC((x) => ({ ...x, remarks: { ...x.remarks, [k]: e.target.value } }))} /></Field>
          ))}
        </details>
      </section>

      <p className="inv-hint no-print">“Download PDF” saves {fileName(o, c)}.pdf to your Downloads folder.</p>
      <div id="print-area"><Challan order={o} settings={s} challan={c} base={import.meta.env.BASE_URL.replace(/\/$/, '')} /></div>
    </div>
  );
}
