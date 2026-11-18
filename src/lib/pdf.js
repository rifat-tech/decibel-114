// Turns an on-screen invoice into a real A4 PDF file and downloads it (no print dialog).
// Loaded on demand, so the PDF libraries only download when someone clicks "Download PDF".
export async function downloadPdf(el, name) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  if (document.fonts?.ready) await document.fonts.ready;
  // html2canvas measures each font's baseline with a tiny <img> in a probe <div> on <body> of the
  // live page. The site's global `img { display:block }` breaks that probe and every line of text
  // lands too low in the PDF. Restore inline images for the probe only, while we capture.
  const fix = document.createElement('style');
  fix.textContent = 'body > div:not(#root) > img { display: inline !important; }';
  document.head.appendChild(fix);
  let canvas;
  try {
    canvas = await html2canvas(el, { scale: 2.5, useCORS: true, backgroundColor: '#ffffff', logging: false, windowWidth: el.scrollWidth });
  } finally {
    fix.remove();
  }
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
