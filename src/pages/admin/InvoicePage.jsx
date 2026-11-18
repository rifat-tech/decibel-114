// Admin → invoice: the invoice on its own A4 page, with Print, Download PDF, Edit and Duplicate.
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { LuArrowLeft, LuCopy, LuDownload, LuPencil, LuPrinter } from 'react-icons/lu';
import Invoice from '../../components/Invoice';
import { Spinner } from '../../components/ui';
import { adminGetOrder, getSettings } from '../../lib/db';

const fileName = (o) => `${o.invoiceNo || o.orderNumber}_${(o.customer?.company || o.customer?.name || 'Customer').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-')}`;

export default function InvoicePage() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const [o, setO] = useState(undefined);
  const [s, setS] = useState(null);
  useEffect(() => { adminGetOrder(id).then(setO).catch(() => setO(null)); getSettings().then(setS); }, [id]);
  // The browser names the PDF after the page title, so set it to "<invoice no>_<customer>".
  useEffect(() => { if (o) document.title = fileName(o); }, [o]);
  const pdf = () => { if (o) document.title = fileName(o); setTimeout(() => window.print(), 50); };
  useEffect(() => { if (o && s && sp.get('pdf')) { const t = setTimeout(pdf, 900); return () => clearTimeout(t); } return undefined; }, [o, s]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <button className="btn btn-ghost" onClick={pdf}><LuPrinter /> Print</button>
          <button className="btn btn-primary" onClick={pdf}><LuDownload /> Download PDF</button>
        </div>
      </div>
      <p className="inv-hint no-print">For a PDF, choose “Save as PDF” as the printer. The file is named {fileName(o)}.pdf.</p>
      <div id="print-area"><Invoice order={o} settings={s} base={import.meta.env.BASE_URL.replace(/\/$/, '')} /></div>
    </div>
  );
}
