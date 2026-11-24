// Decibel-114 letterhead pad (A4). Header: logo, tagline and the corporate address block;
// a faint brand mark behind the page; footer band with what we do, website and phone.
// Anything placed inside it (a quotation, a letter) sits on the pad. All text comes from
// Admin → Store settings → Pad & quotation.
const lines = (t) => String(t || '').split('\n').map((x) => x.trim()).filter(Boolean);

export default function Pad({ settings: s, base = '', children, label = 'Letterhead pad' }) {
  const site = (s.website || 'decibel-114.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const phone = s.padPhone || s.phone;
  const email = s.padEmail;
  return (
    <article className="ix pd" aria-label={label}>
      <div className="ix-bar"><span /></div>
      <header className="pd-head">
        <div className="pd-brand">
          <img src={`${base}/brand/logo-dark.png`} alt={s.storeName || 'Decibel-114'} />
          {s.tagline && <p>{s.tagline}</p>}
        </div>
        <div className="pd-addr">
          <h4>{s.padLabel || 'Corporate Address'}</h4>
          {lines(s.padAddress).map((l, k) => <span key={k}>{l}</span>)}
          <span className="pd-contact">{[phone, email, site].filter(Boolean).join('  ·  ')}</span>
        </div>
      </header>
      <img className="pd-mark" src={`${base}/brand/mark.png`} alt="" aria-hidden="true" />
      <div className="pd-body">{children}</div>
      <footer className="pd-foot">
        <span>{s.padFooter || ''}</span>
        <b>{[site, phone].filter(Boolean).join('  ·  ')}</b>
      </footer>
    </article>
  );
}
