// Turns an on-screen invoice into a real A4 PDF file and downloads it (no print dialog).
// Loaded on demand, so the PDF libraries only download when someone clicks "Download PDF".
export async function downloadPdf(el, name) {
  const [{ snap }, { jsPDF }] = await Promise.all([import('./snap'), import('jspdf')]);
  const canvas = await snap(el, 2.5, '#ffffff');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  const pageW = 210, pageH = 297;
  let imgH = (canvas.height * pageW) / canvas.width;
  // A page that is only a hair over A4 (rounding) is fitted to one page instead of spilling a blank sheet.
  if (imgH > pageH && imgH < pageH * 1.04) imgH = pageH;
  const img = canvas.toDataURL('image/jpeg', 0.95);
  // One page in most cases; longer invoices continue on the next pages.
  let y = 0;
  while (y < imgH - 0.5) {
    if (y > 0) pdf.addPage();
    pdf.addImage(img, 'JPEG', 0, -y, pageW, imgH, undefined, 'FAST');
    y += pageH;
  }
  pdf.save(`${name}.pdf`);
}
