// Admin → quotation on its own A4 pad page, with Edit, Duplicate, Print and Download PDF.
// /admin/quotation/blank shows the empty pad, to print and write on by hand.
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuArrowLeft, LuCopy, LuDownload, LuPencil, LuPrinter, LuTruck } from 'react-icons/lu';
import Quotation from '../../components/Quotation';
import Pad from '../../components/Pad';
import { Spinner } from '../../components/ui';
import { adminGetOrder, getSettings } from '../../lib/db';
import { downloadPdf } from '../../lib/pdf';

const fileName = (q) => (q ? `${q.quoteNo}_${(q.customer?.company || q.customer?.name || 'Customer').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-')}` : 'Decibel-114_Pad');

export default function QuotationPage() {
  const { id } = useParams();
  const blank = id === 'blank';
  const [sp] = useSearchParams();
  const [q, setQ] = useState(blank ? null : undefined);
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { getSettings().then(setS); if (!blank) adminGetOrder(id).then((o) => setQ(o?.source === 'quotation' ? o : null)).catch(() => setQ(null)); }, [id, blank]);
  useEffect(() => { if (q || blank) document.title = fileName(q); }, [q, blank]);

  const print = () => { document.title = fileName(q); setTimeout(() => window.print(), 50); };
  const pdf = async () => {
    const el = document.querySelector('#print-area .ix');
    if (!el || busy) return;
    setBusy(true);
    try { await downloadPdf(el, fileName(q)); } catch { toast.error('Could not make the PDF. Use Print → Save as PDF instead.'); } finally { setBusy(false); }
  };
  useEffect(() => { if ((q || blank) && s && sp.get('pdf')) { const t = setTimeout(pdf, 1200); return () => clearTimeout(t); } return undefined; }, [q, s]); // eslint-disable-line react-hooks/exhaustive-deps

  if (q === undefined || !s) return <Spinner />;
  if (!q && !blank) return <div className="inv-page"><p>Quotation not found. <Link to="/admin/quotations">Back to quotations</Link></p></div>;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return (
    <div className="inv-page">
      <div className="inv-bar no-print">
        <Link to="/admin/quotations" className="btn btn-ghost"><LuArrowLeft /> All quotations</Link>
        <div className="row-gap">
          {!blank && <Link className="btn btn-ghost" to={`/admin/quotations/${id}/edit`}><LuPencil /> Edit</Link>}
          {!blank && <Link className="btn btn-ghost" to={`/admin/quotations/new?from=${id}`}><LuCopy /> Duplicate</Link>}
          {!blank && q.priceTable !== false && <Link className="btn btn-ghost" to={`/admin/challan/${id}`}><LuTruck /> Delivery challan</Link>}
          <button className="btn btn-ghost" onClick={print}><LuPrinter /> Print</button>
          <button className="btn btn-primary" onClick={pdf} disabled={busy}><LuDownload /> {busy ? 'Making PDF…' : 'Download PDF'}</button>
        </div>
      </div>
      <p className="inv-hint no-print">“Download PDF” saves {fileName(q)}.pdf to your Downloads folder.</p>
      <div id="print-area">{blank ? <Pad settings={s} base={base} /> : <Quotation q={q} settings={s} base={base} />}</div>
    </div>
  );
}
