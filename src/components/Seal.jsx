// Round company seal for invoices, drawn as SVG so it prints sharp at any size.
// Text runs around the ring; the centre carries the mark and "AUTHORISED".
import { useEffect, useId, useState } from 'react';

// The mark is embedded as data so it also draws when the invoice is turned into a PDF
// (an SVG drawn as a picture cannot load outside files).
const cache = {};
function useDataUrl(url) {
  const [v, setV] = useState(cache[url] || '');
  useEffect(() => {
    if (cache[url]) { setV(cache[url]); return; }
    fetch(url).then((r) => r.blob()).then((b) => new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); }))
      .then((d) => { cache[url] = d; setV(d); }).catch(() => {});
  }, [url]);
  return v;
}

export default function Seal({ name = 'DECIBEL-114', place = 'DHAKA • BANGLADESH', base = '' }) {
  const id = useId().replace(/:/g, '');
  const ring = `${name.toUpperCase()}  •  ${place.toUpperCase()}  •  `;
  const mark = useDataUrl(`${base}/brand/mark-seal.png`);
  return (
    <svg className="iv-seal" viewBox="0 0 200 200" role="img" aria-label={`${name} seal`}>
      <defs>
        <path id={`${id}-c`} d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
      </defs>
      <g fill="none" stroke="currentColor">
        <circle cx="100" cy="100" r="95" strokeWidth="3.5" />
        <circle cx="100" cy="100" r="88" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="58" strokeWidth="1.6" />
      </g>
      <text fill="currentColor" fontSize="15.5" fontWeight="700" letterSpacing="2.4" fontFamily="Inter, Arial, sans-serif">
        <textPath href={`#${id}-c`} startOffset="0" textLength="458" lengthAdjust="spacing">{ring}</textPath>
      </text>
      {/* The logo mark, pre-coloured in seal ink so it also draws in the PDF export */}
      {mark && <image href={mark} x="76" y="56" width="48" height="48" />}
      <text x="100" y="124" textAnchor="middle" fill="currentColor" fontSize="12.5" fontWeight="800" letterSpacing="1.6" fontFamily="Inter, Arial, sans-serif">AUTHORISED</text>
      <text x="100" y="139" textAnchor="middle" fill="currentColor" fontSize="8.5" fontWeight="600" letterSpacing="1" fontFamily="Inter, Arial, sans-serif">SIGNATORY</text>
    </svg>
  );
}
