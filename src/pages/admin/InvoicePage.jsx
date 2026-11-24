// Admin → invoice: the invoice on its own A4 page, with Print, Download PDF, Edit and Duplicate.
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { LuArrowLeft, LuCopy, LuDownload, LuPencil, LuPrinter, LuTruck } from 'react-icons/lu';
import Invoice from '../../components/Invoice';
import { Spinner } from '../../components/ui';
import { adminGetOrder, getSettings } from '../../lib/db';
import { downloadPdf } from '../../lib/pdf';
import toast from 'react-hot-toast';

const fileName = (o) => `${o.invoiceNo || o.orderNumber}_${(o.customer?.company || o.customer?.name || 'Customer').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-')}`;

export default function InvoicePage() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const [o, setO] = useState(undefined);
  const [s, setS] = useState(null);
  useEffect(() => { adminGetOrder(id).then(setO).catch(() => setO(null)); getSettings().then(setS); }, [id]);
  // The browser names the PDF after the page title, so set it to "<invoice no>_<customer>".
  useEffect(() => { if (o) document.title = fileName(o); }, [o]);
  const print = () => { if (o) document.title = fileName(o); setTimeout(() => window.print(), 50); };
  const [busy, setBusy] = useState(false);
  const pdf = async () => {
    const el = document.querySelector('#print-area .ix');
    if (!el || busy) return;
    setBusy(true);
    try { await downloadPdf(el, fileName(o)); } catch (e) { toast.error('Could not make the PDF. Use Print → Save as PDF instead.'); } finally { setBusy(false); }
  };
  useEffect(() => { if (o && s && sp.get('pdf')) { const t = setTimeout(pdf, 1200); return () => clearTimeout(t); } return undefined; }, [o, s]); // eslint-disable-line react-hooks/exhaustive-deps

  if (o === undefined || !s) return <Spinner />;
  if (!o) return <div className="inv-page"><p>Invoice not found. <Link to="/admin/invoices">Back to invoices</Link></p></div>;
  const manual = o.source === 'manual';
  return (
    <div className="inv-page">
      <div className="inv-bar no-print">
        <Link to={manual ? '/admin/invoices' : `/admin/orders?open=${id}`} className="btn btn-ghost"><LuArrowLeft /> {manual ? 'All invoices' : 'Back to order'}</Link>
        <div className="row-gap">
          {manual && <Link className="btn btn-ghost" to={`/admin/invoices/${id}/edit`}><LuPencil /> Edit</Link>}
          <Link className="btn btn-ghost" to={`/admin/invoices/new?from=${id}`}><LuCopy /> Duplicate</Link>
          <Link className="btn btn-ghost" to={`/admin/challan/${id}`}><LuTruck /> Delivery challan</Link>
          <button className="btn btn-ghost" onClick={print}><LuPrinter /> Print</button>
          <button className="btn btn-primary" onClick={pdf} disabled={busy}><LuDownload /> {busy ? 'Making PDF…' : 'Download PDF'}</button>
        </div>
      </div>
      <p className="inv-hint no-print">“Download PDF” saves {fileName(o)}.pdf to your Downloads folder.</p>
      <div id="print-area"><Invoice order={o} settings={s} base={import.meta.env.BASE_URL.replace(/\/$/, '')} /></div>
    </div>
  );
}
