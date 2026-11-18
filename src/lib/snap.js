// Renders a DOM element to a canvas with html2canvas (loaded on demand).
// The site's global `img { display:block }` breaks html2canvas's font-baseline probe (a <div> it adds to
// <body>) and draws every line of text too low, so inline images are restored for that probe while capturing.
export async function snap(el, scale = 2.5, backgroundColor = null) {
  const { default: html2canvas } = await import('html2canvas');
  if (document.fonts?.ready) await document.fonts.ready;
  const fix = document.createElement('style');
  fix.textContent = 'body > div:not(#root) > img { display: inline !important; }';
  document.head.appendChild(fix);
  try {
    return await html2canvas(el, { scale, useCORS: true, backgroundColor, logging: false });
  } finally {
    fix.remove();
  }
}
