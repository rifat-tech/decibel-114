// Admin → order → Invoice: the invoice on its own A4 page, ready to print or save as PDF.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LuArrowLeft, LuPrinter } from 'react-icons/lu';
import Invoice from '../../components/Invoice';
import { Spinner, useTitle } from '../../components/ui';
import { adminGetOrder, getSettings } from '../../lib/db';

export default function InvoicePage() {
  const { id } = useParams();
  const [o, setO] = useState(undefined);
  const [s, setS] = useState(null);
  useTitle(o ? `Invoice ${o.orderNumber}` : 'Invoice');
  useEffect(() => { adminGetOrder(id).then(setO).catch(() => setO(null)); getSettings().then(setS); }, [id]);
  if (o === undefined || !s) return <Spinner />;
  if (!o) return <div className="inv-page"><p>Order not found. <Link to="/admin/orders">Back to orders</Link></p></div>;
  return (
    <div className="inv-page">
      <div className="inv-bar no-print">
        <Link to={`/admin/orders?open=${id}`} className="btn btn-ghost"><LuArrowLeft /> Back to order</Link>
        <span className="muted small">Choose “Save as PDF” in the print window to get a PDF.</span>
        <button className="btn btn-primary" onClick={() => window.print()}><LuPrinter /> Print or save PDF</button>
      </div>
      <div id="print-area"><Invoice order={o} settings={s} base={import.meta.env.BASE_URL.replace(/\/$/, '')} /></div>
    </div>
  );
}
