import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { LuPhone, LuMessageCircle, LuUserPlus, LuShare2, LuGlobe, LuMail, LuCheck } from 'react-icons/lu';
import { cardBySlug } from '../data/cards';

const SITE = 'https://decibel-114.com';
const pretty = (p) => p.replace(/^\+880(\d{4})(\d{3})(\d{3})$/, '+880 $1-$2$3');
const initials = (n) => n.replace(/^MD\.?\s+/i, '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

function vcard(c, url) {
  const parts = c.name.split(/\s+/);
  const last = parts.pop();
  return [
    'BEGIN:VCARD', 'VERSION:3.0',
    `N:${last};${parts.join(' ')};;;`, `FN:${c.name}`,
    `ORG:${c.company}`, `TITLE:${c.title}`,
    `TEL;TYPE=CELL,VOICE:${c.phone}`,
    c.email && `EMAIL;TYPE=WORK:${c.email}`,
    `URL:${c.website}`, `URL;TYPE=card:${url}`,
    'END:VCARD',
  ].filter(Boolean).join('\r\n');
}

export default function Card() {
  const { slug } = useParams();
  const c = cardBySlug(slug);
  const url = `${SITE}/card/${slug}`;
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState(false);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (!c) return;
    document.title = `${c.name} | ${c.company}`;
    QRCode.toDataURL(url, { margin: 1, width: 360, errorCorrectionLevel: 'M', color: { dark: '#0A0A0A', light: '#FFFFFF' } }).then(setQr);
  }, [c, url]);

  if (!c) return <div className="ec-wrap"><div className="ec-card ec-missing"><h1>Card not found</h1><Link to="/">Go to decibel-114.com</Link></div></div>;

  const save = () => {
    const blob = new Blob([vcard(c, url)], { type: 'text/vcard;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${c.name.replace(/\s+/g, '-')}.vcf`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: c.name, text: `${c.name}, ${c.title} at ${c.company}`, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    } catch { /* closed */ }
  };

  return (
    <div className="ec-wrap">
      <div className="ec-stage">
        <button type="button" className={`ec-bc${flip ? ' flip' : ''}`} onClick={() => setFlip((f) => !f)} aria-label={flip ? 'Show front of card' : 'Show back of card'}>
          <div className="ec-face ec-front">
            <div className="ec-f-top">
              <img src="/brand/logo-dark.png" alt="Decibel-114" />
              <span>Network<br />Infrastructure</span>
            </div>
            <div className="ec-f-main">
              <i />
              <h1>{c.name}</h1>
              <p>{c.title}</p>
            </div>
            <b className="ec-bar" />
          </div>
          <div className="ec-face ec-back">
            <b className="ec-bar top" />
            <div className="ec-b-left">
              <img src="/brand/logo-dark.png" alt="" />
              <ul>
                <li><LuPhone />{pretty(c.phone)}</li>
                <li><LuMessageCircle />WhatsApp: same number</li>
                {c.email && <li><LuMail />{c.email}</li>}
                <li><LuGlobe />{c.website.replace(/^https?:\/\//, '')}</li>
              </ul>
              <span>Networking · IT solutions · Gadgets</span>
            </div>
            <div className="ec-b-qr">
              {qr && <img src={qr} alt={`QR code for ${url}`} />}
              <span>Scan to save<br />my contact</span>
            </div>
          </div>
        </button>
        <p className="ec-hint">Tap the card to flip</p>

        <div className="ec-actions">
          <a className="ec-act" href={`tel:${c.phone}`}><LuPhone /><span>Call</span></a>
          <a className="ec-act" href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer"><LuMessageCircle /><span>WhatsApp</span></a>
          <button className="ec-act" onClick={share}>{copied ? <LuCheck /> : <LuShare2 />}<span>{copied ? 'Copied' : 'Share'}</span></button>
        </div>
        <button className="ec-save" onClick={save}><LuUserPlus /> Save contact</button>
      </div>
    </div>
  );
}
