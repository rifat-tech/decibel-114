// Round company seal for invoices, drawn as SVG so it prints sharp at any size.
// Text runs around the ring; the centre carries the mark and "AUTHORISED".
import { useId } from 'react';

export default function Seal({ name = 'DECIBEL-114', place = 'DHAKA • BANGLADESH', base = '' }) {
  const id = useId().replace(/:/g, '');
  const ring = `${name.toUpperCase()}  •  ${place.toUpperCase()}  •  `;
  return (
    <svg className="iv-seal" viewBox="0 0 200 200" role="img" aria-label={`${name} seal`}>
      <defs>
        <path id={`${id}-c`} d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        <mask id={`${id}-m`} style={{ maskType: 'alpha' }}><image href={`${base}/brand/mark.png`} x="76" y="56" width="48" height="48" /></mask>
      </defs>
      <g fill="none" stroke="currentColor">
        <circle cx="100" cy="100" r="95" strokeWidth="3.5" />
        <circle cx="100" cy="100" r="88" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="58" strokeWidth="1.6" />
      </g>
      <text fill="currentColor" fontSize="15.5" fontWeight="700" letterSpacing="2.4" fontFamily="Inter, Arial, sans-serif">
        <textPath href={`#${id}-c`} startOffset="0" textLength="458" lengthAdjust="spacing">{ring}</textPath>
      </text>
      {/* The logo mark in the seal's ink colour */}
      <rect x="76" y="56" width="48" height="48" fill="currentColor" mask={`url(#${id}-m)`} />
      <text x="100" y="124" textAnchor="middle" fill="currentColor" fontSize="12.5" fontWeight="800" letterSpacing="1.6" fontFamily="Inter, Arial, sans-serif">AUTHORISED</text>
      <text x="100" y="139" textAnchor="middle" fill="currentColor" fontSize="8.5" fontWeight="600" letterSpacing="1" fontFamily="Inter, Arial, sans-serif">SIGNATORY</text>
    </svg>
  );
}
