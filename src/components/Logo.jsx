// Decibel-114: a level meter (three rising bars, the loudest lit) beside the wordmark.
export default function Logo({ light }) {
  return (
    <span className={`logo ${light ? 'light' : ''}`}>
      <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true" className="logo-mark">
        <rect width="64" height="64" rx="14" className="logo-tile" />
        <rect x="15" y="36" width="8" height="14" rx="2" className="logo-bar" />
        <rect x="28" y="26" width="8" height="24" rx="2" className="logo-bar" />
        <rect x="41" y="14" width="8" height="36" rx="2" className="logo-peak" />
      </svg>
      <span className="logo-word">Decibel<span className="logo-num">-114</span></span>
    </span>
  );
}
