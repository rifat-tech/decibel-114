import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { LuPhone, LuMessageCircle, LuUserPlus, LuShare2, LuGlobe, LuMail, LuCheck, LuDownload, LuScanLine } from 'react-icons/lu';
import { cardBySlug } from '../data/cards';
import { getCards } from '../lib/db';

export const SITE = 'https://decibel-114.com';
export const cardUrl = (slug) => `${SITE}/card/${slug}`;
const pretty = (p) => p.replace(/^\+880(\d{4})(\d{3})(\d{3})$/, '+880 $1-$2$3');

// The contact itself. Used for the QR (phone camera → "Add contact") and the Save contact button.
export function vcard(c, url) {
  const parts = String(c.name || '').trim().split(/\s+/);
  const last = parts.pop();
  return [
    'BEGIN:VCARD', 'VERSION:3.0',
    `N:${last};${parts.join(' ')};;;`, `FN:${c.name}`,
    `ORG:${c.company || 'Decibel-114'}`, c.title && `TITLE:${c.title}`,
    c.phone && `TEL;TYPE=CELL:${c.phone}`,
    c.email && `EMAIL:${c.email}`,
    `URL:${url}`,
    'END:VCARD',
  ].filter(Boolean).join('\r\n');
}

export const makeQr = (c, url) => QRCode.toDataURL(vcard(c, url), { margin: 0, width: 640, errorCorrectionLevel: 'L', color: { dark: '#0B2546', light: '#FFFFFF' } });

// The card itself (also used as the live preview in Admin → Digital cards).
export function CardFace({ c, qr, innerRef }) {
  const site = (c.website || SITE).replace(/^https?:\/\//, '').replace(/\/$/, '');
  return (
    <article className="ec-card" ref={innerRef}>
      <div className="ec-hero">
        <span className="ec-orb a" aria-hidden="true" />
        <span className="ec-orb b" aria-hidden="true" />
        <div className="ec-hero-top">
          <img src="/brand/logo-white.png" alt="Decibel-114" />
          <span>Digital card</span>
        </div>
        <div className="ec-hero-main">
          <i />
          <h1>{c.name || 'Full name'}</h1>
          <p className="ec-role">{c.title || 'Designation'}</p>
          {c.focus?.filter(Boolean).length > 0 && <p className="ec-focus">{c.focus.filter(Boolean).join('  ·  ')}</p>}
        </div>
      </div>
      <div className="ec-scan">
        <div className="ec-qrbox">
          {qr ? <img src={qr} alt="QR code with the contact details" /> : <div className="ec-qr-ph" />}
        </div>
        <p className="ec-scan-t"><LuScanLine /> Scan with your phone camera</p>
        <p className="ec-scan-s">to save this contact instantly</p>
      </div>
      <div className="ec-info">
        {c.phone && <span><LuPhone />{pretty(c.phone)}</span>}
        {c.email && <span><LuMail />{c.email}</span>}
        <span><LuGlobe />{site}</span>
      </div>
    </article>
  );
}

export default function Card() {
  const { slug } = useParams();
  const [c, setC] = useState(() => cardBySlug(slug) || null);
  const [loaded, setLoaded] = useState(false);
  const url = cardUrl(slug);
  useEffect(() => { getCards().then((l) => { setC(l.find((x) => x.slug === slug) || null); setLoaded(true); }); }, [slug]);
  const cardRef = useRef(null);
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!c) return;
    document.title = `${c.name} | ${c.company || 'Decibel-114'}`;
    makeQr(c, url).then(setQr);
  }, [c, url]);

  if (!c && !loaded) return <div className="ec-wrap" />;
  if (!c) return <div className="ec-wrap"><div className="ec-missing"><h1>Card not found</h1><Link to="/">Go to decibel-114.com</Link></div></div>;

  const fileBase = `${c.name.replace(/\s+/g, '-')}-${c.company || 'Decibel-114'}`;
  const save = () => {
    const blob = new Blob([vcard(c, url)], { type: 'text/vcard;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${c.name.replace(/\s+/g, '-')}.vcf`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const cardImage = async () => {
    const { snap } = await import('../lib/snap');
    const canvas = await snap(cardRef.current, 1080 / cardRef.current.offsetWidth);
    return new Promise((r) => canvas.toBlob(r, 'image/png'));
  };
  const download = async () => {
    setBusy(true);
    try {
      const blob = await cardImage();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = `${fileBase}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } finally { setBusy(false); }
  };
  // Share sends the card picture plus the link where the phone allows it, else just the link.
  const share = async () => {
    const text = [c.name, c.title, c.company || 'Decibel-114'].filter(Boolean).join(', ');
    try {
      if (navigator.share) {
        try {
          const blob = await cardImage();
          const file = new File([blob], `${fileBase}.png`, { type: 'image/png' });
          if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: c.name, text: `${text}\n${url}` }); return; }
        } catch (e) { if (e?.name === 'AbortError') return; }
        await navigator.share({ title: c.name, text, url });
      } else {
        await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800);
      }
    } catch { /* closed */ }
  };

  return (
    <div className="ec-wrap">
      <div className="ec-stage">
        <CardFace c={c} qr={qr} innerRef={cardRef} />

        <button className="ec-save" onClick={save}><LuUserPlus /> Save contact</button>
        <div className="ec-actions">
          <a className="ec-act call" href={`tel:${c.phone}`}><LuPhone /><span>Call</span></a>
          <a className="ec-act wa" href={`https://wa.me/${String(c.whatsapp || c.phone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><LuMessageCircle /><span>WhatsApp</span></a>
          <button className="ec-act sh" onClick={share}>{copied ? <LuCheck /> : <LuShare2 />}<span>{copied ? 'Copied' : 'Share'}</span></button>
          <button className="ec-act dl" onClick={download} disabled={busy}><LuDownload /><span>{busy ? 'Saving…' : 'Image'}</span></button>
        </div>
      </div>
    </div>
  );
}
