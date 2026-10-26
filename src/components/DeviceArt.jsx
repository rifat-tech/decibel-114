// Built-in product illustrations, used whenever a product has no photo yet.
// Each is a flat drawing of the real device class so the catalog stays coherent.
const BODY = '#13254F';
const EDGE = '#0A1A3F';
const FACE = '#1C3368';
const PORT = '#07112B';

const Led = ({ x, y, c = 'var(--led)', d = 0 }) => (
  <circle cx={x} cy={y} r="2.6" fill={c} className="led" style={{ animationDelay: `${d}s` }} />
);

function Router() {
  return (
    <g>
      <rect x="62" y="22" width="7" height="52" rx="3.5" fill={EDGE} transform="rotate(-10 65 74)" />
      <rect x="131" y="22" width="7" height="52" rx="3.5" fill={EDGE} transform="rotate(10 135 74)" />
      <rect x="38" y="70" width="124" height="44" rx="10" fill={BODY} />
      <rect x="38" y="70" width="124" height="10" rx="5" fill={FACE} />
      {[0, 1, 2, 3, 4].map((i) => <Led key={i} x={58 + i * 12} y={98} d={i * 0.15} />)}
      <rect x="128" y="92" width="22" height="12" rx="3" fill="var(--signal)" opacity=".9" />
    </g>
  );
}
function Switch() {
  return (
    <g>
      <rect x="14" y="54" width="172" height="44" rx="5" fill={BODY} />
      <rect x="14" y="54" width="172" height="6" rx="3" fill={FACE} />
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i}>
          <rect x={30 + i * 11} y="66" width="8" height="8" rx="1" fill={PORT} />
          <rect x={30 + i * 11} y="78" width="8" height="8" rx="1" fill={PORT} />
          <Led x={34 + i * 11} y={92} c={i % 3 === 0 ? 'var(--signal)' : 'var(--led)'} d={i * 0.08} />
        </g>
      ))}
      <rect x="166" y="66" width="12" height="20" rx="2" fill="var(--signal)" opacity=".85" />
    </g>
  );
}
function AccessPoint() {
  return (
    <g>
      <ellipse cx="100" cy="92" rx="70" ry="22" fill={EDGE} />
      <ellipse cx="100" cy="86" rx="70" ry="22" fill={BODY} />
      <ellipse cx="100" cy="84" rx="54" ry="15" fill={FACE} />
      <ellipse cx="100" cy="84" rx="16" ry="5" fill="none" stroke="var(--led)" strokeWidth="2.5" className="led" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${100 - 18 - i * 14} ${52 - i * 9} q${18 + i * 14} ${-14 - i * 4} ${36 + i * 28} 0`} fill="none" stroke="var(--signal)" strokeWidth="3" strokeLinecap="round" opacity={0.9 - i * 0.25} className="wave" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </g>
  );
}
function Firewall() {
  return (
    <g>
      <rect x="32" y="50" width="136" height="58" rx="8" fill={BODY} />
      <rect x="32" y="50" width="136" height="12" rx="6" fill="var(--signal)" />
      <path d="M100 70 l16 6 v10 c0 9 -7 15 -16 18 c-9 -3 -16 -9 -16 -18 v-10z" fill={FACE} stroke="var(--signal)" strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={46 + i * 9} y="84" width="6" height="8" rx="1" fill={PORT} />)}
      {[0, 1, 2].map((i) => <Led key={i} x={132 + i * 9} y={88} d={i * 0.2} />)}
    </g>
  );
}
function Dish() {
  return (
    <g>
      <rect x="96" y="92" width="8" height="34" fill={EDGE} />
      <rect x="72" y="122" width="56" height="8" rx="4" fill={EDGE} />
      <rect x="44" y="26" width="112" height="72" rx="10" fill={BODY} transform="skewX(-8) translate(12 0)" />
      <rect x="54" y="34" width="92" height="56" rx="6" fill={FACE} transform="skewX(-8) translate(12 0)" />
      <circle cx="104" cy="62" r="5" fill="var(--signal)" className="led" />
    </g>
  );
}
function Server() {
  return (
    <g>
      {[0, 1].map((r) => (
        <g key={r} transform={`translate(0 ${r * 34})`}>
          <rect x="16" y="40" width="168" height="30" rx="4" fill={r ? FACE : BODY} />
          {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={28 + i * 20} y="46" width="16" height="18" rx="2" fill={PORT} />)}
          <Led x={156} y={55} d={r * 0.4} />
          <Led x={168} y={55} c="var(--signal)" d={r * 0.4 + 0.2} />
        </g>
      ))}
    </g>
  );
}
function Cable() {
  return (
    <g fill="none" strokeLinecap="round">
      <ellipse cx="100" cy="80" rx="58" ry="40" stroke={BODY} strokeWidth="16" />
      <ellipse cx="100" cy="80" rx="40" ry="26" stroke={FACE} strokeWidth="12" />
      <path d="M150 96 q24 18 30 34" stroke="var(--signal)" strokeWidth="6" />
      <rect x="170" y="124" width="16" height="12" rx="2" fill="#cfd8e6" stroke="none" />
    </g>
  );
}
function Camera() {
  return (
    <g>
      <rect x="54" y="34" width="92" height="14" rx="7" fill={EDGE} />
      <path d="M58 48 h84 v18 a42 42 0 0 1 -84 0z" fill={BODY} />
      <circle cx="100" cy="72" r="20" fill={PORT} />
      <circle cx="100" cy="72" r="9" fill={FACE} stroke="var(--signal)" strokeWidth="2" />
      <Led x={124} y={60} c="var(--danger-led)" />
    </g>
  );
}
function Phone() {
  return (
    <g>
      <rect x="66" y="16" width="68" height="122" rx="12" fill={BODY} />
      <rect x="72" y="24" width="56" height="104" rx="7" fill={FACE} />
      <rect x="86" y="44" width="28" height="28" rx="6" fill="var(--signal)" opacity=".9" />
      <rect x="82" y="84" width="36" height="4" rx="2" fill="#5c76b3" />
      <rect x="88" y="94" width="24" height="4" rx="2" fill="#5c76b3" />
    </g>
  );
}
function Laptop() {
  return (
    <g>
      <rect x="44" y="28" width="112" height="74" rx="6" fill={BODY} />
      <rect x="52" y="35" width="96" height="60" rx="3" fill={FACE} />
      <path d="M28 104 h144 l-10 14 h-124z" fill={EDGE} />
      <rect x="64" y="50" width="40" height="5" rx="2.5" fill="var(--signal)" />
      <rect x="64" y="62" width="62" height="4" rx="2" fill="#5c76b3" />
      <rect x="64" y="72" width="50" height="4" rx="2" fill="#5c76b3" />
    </g>
  );
}
function Shield() {
  return (
    <g>
      <path d="M100 22 l50 18 v32 c0 28 -22 48 -50 58 c-28 -10 -50 -30 -50 -58 v-32z" fill={BODY} />
      <path d="M100 38 l34 12 v22 c0 19 -15 33 -34 40 c-19 -7 -34 -21 -34 -40 v-22z" fill={FACE} />
      <path d="M84 74 l12 12 l22 -24" fill="none" stroke="var(--signal)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

const MAP = { router: Router, switch: Switch, ap: AccessPoint, firewall: Firewall, dish: Dish, server: Server, cable: Cable, camera: Camera, phone: Phone, laptop: Laptop, shield: Shield };

export const ART_TYPES = Object.keys(MAP);

export default function DeviceArt({ type = 'router', className = '' }) {
  const C = MAP[type] || Router;
  return (
    <svg viewBox="0 0 200 150" className={`device-art ${className}`} role="img" aria-hidden="true">
      <ellipse cx="100" cy="138" rx="74" ry="6" fill="#0A1A3F" opacity=".08" />
      <C />
    </svg>
  );
}

const CAT_ART = { routers: 'router', switches: 'switch', wifi: 'ap', security: 'firewall', connectivity: 'dish', servers: 'server', cabling: 'cable', surveillance: 'camera', mobiles: 'phone', computers: 'laptop' };
export const artFor = (p, cat) => p?.art || CAT_ART[p?.categoryId] || (cat?.icon in MAP ? cat.icon : 'router');

export function ProductVisual({ product, category, className = '' }) {
  const src = product?.images?.[0] || product?.image;
  if (src) return <img src={src} alt={product.name} className={`product-photo ${className}`} loading="lazy" />;
  return <DeviceArt type={artFor(product, category)} className={className} />;
}
