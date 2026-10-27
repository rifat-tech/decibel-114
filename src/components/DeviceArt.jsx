import { useId } from 'react';
// Product illustrations shown until a real photo is uploaded. Drawn flat, on a white
// product-shot floor, one consistent light source (top-left) across every device.
const G = { body: '#2A2A2D', edge: '#161618', mid: '#46454A', light: '#DEDAD3', silver: '#C9C5BE', screenA: '#2B2C31', screenB: '#8C8576', accent: '#C9A86A', led: '#C9A86A' };

// Screen colours vary per product so a row of phones doesn't look like one image repeated.
const SCREENS = [['#141518', '#4A4740'], ['#121419', '#3B4556'], ['#17140F', '#6E5C40'], ['#101518', '#2F4C55'], ['#161314', '#4F3A40'], ['#121212', '#55524C'], ['#14161A', '#5A6070'], ['#18150F', '#7A6646']];
const BODIES = [['#B8B1A5', '#8B8478'], ['#3A3A3E', '#1C1C1F'], ['#E3E0DA', '#B7B3AC'], ['#2B2E34', '#15171A'], ['#C7B398', '#9A8468']];
const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

const Defs = ({ seed, uid }) => {
  const h = seed ? hash(seed) : 0;
  const [a, b] = SCREENS[h % SCREENS.length];
  const [d1, d2] = BODIES[(h >>> 3) % BODIES.length];
  return (
    <defs>
      <linearGradient id={`scr${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
      <linearGradient id={`alu${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E6E3DD" /><stop offset="1" stopColor="#B9B5AE" /></linearGradient>
      <linearGradient id={`dark${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={d1} /><stop offset="1" stopColor={d2} /></linearGradient>
    </defs>
  );
};

const A = {
  phone: ({ u }) => (<g>
    <rect x="62" y="12" width="76" height="140" rx="16" fill={u.dark} />
    <rect x="67" y="17" width="66" height="130" rx="12" fill={u.scr} />
    <rect x="88" y="22" width="24" height="7" rx="3.5" fill={G.edge} />
    <path d="M67 90 Q100 70 133 96 V135 Q133 147 121 147 H79 Q67 147 67 135Z" fill="#fff" opacity=".12" />
  </g>),
  laptop: ({ u }) => (<g>
    <rect x="38" y="22" width="124" height="86" rx="7" fill={u.alu} />
    <rect x="43" y="27" width="114" height="76" rx="3" fill={u.scr} />
    <path d="M18 110 H182 L174 122 Q172 126 166 126 H34 Q28 126 26 122Z" fill={u.alu} />
    <rect x="88" y="110" width="24" height="3" rx="1.5" fill="#9A958C" />
  </g>),
  tablet: ({ u }) => (<g>
    <rect x="44" y="14" width="112" height="138" rx="12" fill={u.alu} />
    <rect x="50" y="20" width="100" height="126" rx="7" fill={u.scr} />
    <rect x="162" y="50" width="4" height="70" rx="2" fill={G.silver} />
  </g>),
  pencil: ({ u }) => (<g transform="rotate(-35 100 80)">
    <rect x="30" y="72" width="130" height="14" rx="7" fill="#F6F4F0" stroke="#D8D3CA" />
    <path d="M160 72 L184 79 L160 86Z" fill="#E6E2DB" /><path d="M176 77 L184 79 L176 81Z" fill={G.body} />
  </g>),
  watch: ({ u }) => (<g>
    <rect x="76" y="6" width="48" height="40" rx="10" fill={G.mid} /><rect x="76" y="116" width="48" height="40" rx="10" fill={G.mid} />
    <rect x="62" y="36" width="76" height="88" rx="22" fill={u.dark} />
    <rect x="70" y="44" width="60" height="72" rx="15" fill="#05070B" />
    <circle cx="100" cy="80" r="20" fill="none" stroke={G.led} strokeWidth="5" strokeDasharray="90 40" />
    <circle cx="100" cy="80" r="12" fill="none" stroke={G.screenB} strokeWidth="4" strokeDasharray="50 30" />
    <rect x="138" y="62" width="6" height="16" rx="3" fill={G.silver} />
  </g>),
  earbuds: ({ u }) => (<g>
    <rect x="58" y="70" width="84" height="70" rx="26" fill="#F6F4F0" stroke="#D8D3CA" />
    <path d="M58 92 H142" stroke="#D8D3CA" /><circle cx="100" cy="112" r="3" fill={G.led} />
    <g fill="#FFFFFF" stroke="#D8D3CA"><path d="M72 24 q16 -4 18 14 v34 q0 6 -6 6 q-6 0 -6 -6 v-22 q-8 2 -10 -8 q-2 -14 4 -18z" /><path d="M128 24 q-16 -4 -18 14 v34 q0 6 6 6 q6 0 6 -6 v-22 q8 2 10 -8 q2 -14 -4 -18z" /></g>
  </g>),
  headphone: ({ u }) => (<g>
    <path d="M48 96 V78 Q48 22 100 22 Q152 22 152 78 V96" fill="none" stroke={G.body} strokeWidth="10" strokeLinecap="round" />
    <rect x="34" y="84" width="36" height="58" rx="16" fill={u.dark} /><rect x="130" y="84" width="36" height="58" rx="16" fill={u.dark} />
    <rect x="44" y="94" width="16" height="38" rx="8" fill={G.mid} /><rect x="140" y="94" width="16" height="38" rx="8" fill={G.mid} />
  </g>),
  speaker: ({ u }) => (<g>
    <rect x="36" y="44" width="128" height="86" rx="40" fill={u.dark} />
    <rect x="48" y="56" width="104" height="62" rx="31" fill={G.mid} />
    <circle cx="82" cy="87" r="18" fill={G.edge} /><circle cx="118" cy="87" r="18" fill={G.edge} />
    <rect x="86" y="128" width="28" height="6" rx="3" fill={G.accent} />
  </g>),
  monitor: ({ u }) => (<g>
    <rect x="22" y="16" width="156" height="98" rx="6" fill={G.edge} />
    <rect x="27" y="21" width="146" height="88" rx="3" fill={u.scr} />
    <path d="M88 114 h24 l6 26 h-36z" fill={G.mid} /><rect x="64" y="138" width="72" height="8" rx="4" fill={G.body} />
  </g>),
  imac: ({ u }) => (<g>
    <rect x="28" y="12" width="144" height="104" rx="8" fill="#A9A49B" />
    <rect x="34" y="18" width="132" height="80" rx="3" fill={u.scr} />
    <rect x="28" y="98" width="144" height="18" rx="0" fill="#8F8A80" />
    <path d="M86 116 h28 l8 30 h-44z" fill="#A9A49B" /><rect x="70" y="144" width="60" height="6" rx="3" fill="#8F8A80" />
  </g>),
  macmini: ({ u }) => (<g>
    <rect x="44" y="70" width="112" height="44" rx="12" fill={u.alu} />
    <rect x="44" y="104" width="112" height="10" rx="5" fill="#B3AEA5" />
    <circle cx="140" cy="92" r="3" fill={G.led} /><rect x="58" y="88" width="8" height="6" rx="2" fill="#9A958C" /><rect x="70" y="88" width="8" height="6" rx="2" fill="#9A958C" />
  </g>),
  console: ({ u }) => (<g>
    <rect x="24" y="52" width="152" height="70" rx="20" fill={u.dark} />
    <rect x="58" y="58" width="84" height="58" rx="5" fill={u.scr} />
    <rect x="24" y="52" width="30" height="70" rx="15" fill="#8E3A36" /><rect x="146" y="52" width="30" height="70" rx="15" fill="#3A5F6E" />
    <circle cx="39" cy="74" r="5" fill={G.edge} /><circle cx="161" cy="100" r="5" fill={G.edge} />
  </g>),
  gamepad: ({ u }) => (<g>
    <path d="M40 70 Q44 48 70 48 H130 Q156 48 160 70 L170 118 Q172 134 156 134 Q144 134 136 118 L130 108 H70 L64 118 Q56 134 44 134 Q28 134 30 118Z" fill="#F6F4F0" stroke="#D8D3CA" />
    <rect x="58" y="76" width="22" height="7" rx="2" fill={G.body} /><rect x="65" y="69" width="7" height="22" rx="2" fill={G.body} />
    <circle cx="132" cy="72" r="5" fill={G.body} /><circle cx="144" cy="84" r="5" fill={G.body} /><circle cx="120" cy="84" r="5" fill={G.body} /><circle cx="132" cy="96" r="5" fill={G.body} />
    <rect x="84" y="56" width="32" height="18" rx="4" fill={G.accent} opacity=".8" />
  </g>),
  router: ({ u }) => (<g>
    <rect x="62" y="16" width="7" height="58" rx="3.5" fill={G.body} transform="rotate(-10 65 74)" />
    <rect x="131" y="16" width="7" height="58" rx="3.5" fill={G.body} transform="rotate(10 135 74)" />
    <rect x="34" y="72" width="132" height="46" rx="10" fill={u.dark} />
    {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={56 + i * 13} cy={100} r="3" fill={G.led} />)}
    <rect x="128" y="94" width="24" height="12" rx="3" fill={G.accent} />
  </g>),
  mesh: ({ u }) => (<g>
    <rect x="70" y="30" width="60" height="110" rx="26" fill="#F6F4F0" stroke="#D8D3CA" />
    <circle cx="100" cy="122" r="4" fill={G.led} />
    {[0, 1, 2].map((i) => <path key={i} d={`M${82 - i * 10} ${24 - i * 8} q${18 + i * 10} ${-12 - i * 3} ${36 + i * 20} 0`} fill="none" stroke={G.screenA} strokeWidth="3" strokeLinecap="round" opacity={0.9 - i * 0.25} />)}
  </g>),
  ap: ({ u }) => (<g>
    <ellipse cx="100" cy="98" rx="72" ry="24" fill="#D8D3CA" /><ellipse cx="100" cy="92" rx="72" ry="24" fill="#F6F4F0" />
    <ellipse cx="100" cy="92" rx="18" ry="6" fill="none" stroke={G.screenA} strokeWidth="3" />
    {[0, 1, 2].map((i) => <path key={i} d={`M${82 - i * 14} ${58 - i * 9} q${18 + i * 14} ${-14 - i * 4} ${36 + i * 28} 0`} fill="none" stroke={G.screenA} strokeWidth="3" strokeLinecap="round" opacity={0.9 - i * 0.25} />)}
  </g>),
  switch: ({ u }) => (<g>
    <rect x="12" y="62" width="176" height="42" rx="5" fill={u.dark} />
    {Array.from({ length: 12 }).map((_, i) => (<g key={i}><rect x={26 + i * 11} y="72" width="8" height="8" rx="1" fill="#0B0D11" /><rect x={26 + i * 11} y="84" width="8" height="8" rx="1" fill="#0B0D11" /><circle cx={30 + i * 11} cy={98} r="1.8" fill={i % 3 ? G.led : G.accent} /></g>))}
    <rect x="164" y="72" width="16" height="20" rx="2" fill={G.accent} />
  </g>),
  dish: ({ u }) => (<g>
    <rect x="96" y="96" width="8" height="40" fill={G.mid} /><rect x="70" y="132" width="60" height="10" rx="5" fill={G.body} />
    <rect x="46" y="18" width="108" height="80" rx="10" fill="#F6F4F0" stroke="#D8D3CA" transform="skewX(-6) translate(8 0)" />
    <circle cx="104" cy="58" r="4" fill={G.screenA} />
  </g>),
  camera: ({ u }) => (<g>
    <rect x="54" y="30" width="92" height="14" rx="7" fill={G.mid} />
    <path d="M58 44 h84 v20 a42 42 0 0 1 -84 0z" fill="#F6F4F0" stroke="#D8D3CA" />
    <circle cx="100" cy="72" r="20" fill={G.body} /><circle cx="100" cy="72" r="9" fill={G.screenA} /><circle cx="96" cy="68" r="3" fill="#fff" opacity=".7" />
  </g>),
  dslr: ({ u }) => (<g>
    <path d="M30 54 h40 l10 -14 h40 l10 14 h40 q8 0 8 8 v66 q0 8 -8 8 h-140 q-8 0 -8 -8 v-66 q0 -8 8 -8z" fill={u.dark} />
    <circle cx="100" cy="94" r="34" fill={G.mid} /><circle cx="100" cy="94" r="24" fill={G.edge} /><circle cx="100" cy="94" r="12" fill={G.screenA} />
    <circle cx="150" cy="66" r="5" fill={G.accent} />
  </g>),
  gimbal: ({ u }) => (<g>
    <rect x="90" y="80" width="20" height="72" rx="10" fill={G.body} />
    <path d="M100 82 V54 H140 V40" fill="none" stroke={G.mid} strokeWidth="9" strokeLinecap="round" />
    <rect x="110" y="18" width="70" height="30" rx="6" fill={G.body} /><rect x="114" y="22" width="62" height="22" rx="3" fill={u.scr} />
    <circle cx="100" cy="108" r="6" fill={G.mid} />
  </g>),
  printer: ({ u }) => (<g>
    <rect x="58" y="24" width="84" height="36" rx="3" fill="#F8F6F2" stroke="#D8D3CA" />
    <rect x="28" y="54" width="144" height="64" rx="10" fill={u.alu} />
    <rect x="50" y="104" width="100" height="26" rx="3" fill="#FFFFFF" stroke="#D8D3CA" />
    <rect x="140" y="66" width="20" height="8" rx="2" fill={G.screenA} /><circle cx="44" cy="70" r="3" fill={G.led} />
  </g>),
  charger: ({ u }) => (<g>
    <rect x="64" y="34" width="72" height="80" rx="14" fill="#FFFFFF" stroke="#D8D3CA" />
    <rect x="94" y="94" width="12" height="5" rx="2" fill={G.mid} />
    <rect x="84" y="114" width="6" height="22" rx="2" fill={G.silver} /><rect x="110" y="114" width="6" height="22" rx="2" fill={G.silver} />
  </g>),
  cable: ({ u }) => (<g fill="none" strokeLinecap="round">
    <path d="M40 120 C40 40 160 40 160 90 C160 130 80 130 80 90 C80 60 130 60 130 90" stroke="#F6F4F0" strokeWidth="9" />
    <path d="M40 120 C40 40 160 40 160 90 C160 130 80 130 80 90 C80 60 130 60 130 90" stroke="#D8D3CA" strokeWidth="1" />
    <rect x="32" y="118" width="16" height="22" rx="3" fill="#ECE9E3" stroke="#CFC9BF" />
  </g>),
  powerbank: ({ u }) => (<g>
    <rect x="56" y="22" width="88" height="126" rx="16" fill={u.dark} />
    <rect x="92" y="40" width="16" height="5" rx="2" fill={G.mid} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={74 + i * 14} y="120" width="10" height="5" rx="2" fill={i < 3 ? G.led : G.mid} />)}
  </g>),
  storage: ({ u }) => (<g>
    <path d="M62 24 h60 l18 18 v100 q0 6 -6 6 h-72 q-6 0 -6 -6 v-112 q0 -6 6 -6z" fill={u.dark} />
    <rect x="70" y="40" width="54" height="44" rx="3" fill="#7A2230" /><rect x="70" y="92" width="54" height="10" rx="2" fill={G.accent} />
  </g>),
  tag: ({ u }) => (<g>
    <circle cx="100" cy="82" r="50" fill="#FFFFFF" stroke="#D8D3CA" strokeWidth="2" />
    <circle cx="100" cy="82" r="40" fill="#F6F4F0" /><circle cx="100" cy="82" r="10" fill={G.silver} />
  </g>),
  keyboard: ({ u }) => (<g>
    <rect x="18" y="58" width="164" height="60" rx="8" fill={u.alu} />
    {Array.from({ length: 4 }).map((_, r) => Array.from({ length: 12 }).map((__, c) => <rect key={`${r}-${c}`} x={26 + c * 12.6} y={64 + r * 12} width="10" height="9" rx="2" fill="#F8F6F2" />))}
  </g>),
  mouse: ({ u }) => (<g>
    <rect x="70" y="20" width="60" height="124" rx="30" fill="#F8F6F2" stroke="#D8D3CA" />
    <path d="M100 26 V62" stroke="#D8D3CA" />
  </g>),
  firewall: ({ u }) => (<g>
    <rect x="30" y="52" width="140" height="58" rx="8" fill={u.dark} />
    <rect x="30" y="52" width="140" height="10" rx="5" fill={G.accent} />
    <path d="M100 72 l14 5 v9 c0 8 -6 13 -14 16 c-8 -3 -14 -8 -14 -16 v-9z" fill={G.mid} stroke={G.accent} strokeWidth="2" />
  </g>),
};

export const ART_TYPES = Object.keys(A);

export default function DeviceArt({ type = 'phone', className = '', seed = '' }) {
  const C = A[type] || A.phone;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  // Each SVG gets its own gradient ids so colours never leak between drawings on one page.
  const u = { scr: `url(#scr${uid})`, alu: `url(#alu${uid})`, dark: `url(#dark${uid})` };
  return (
    <svg viewBox="0 0 200 160" className={`device-art ${className}`} role="img" aria-hidden="true">
      <Defs seed={seed} uid={uid} />
      <ellipse cx="100" cy="152" rx="70" ry="5" fill="#0B1220" opacity=".07" />
      <C u={u} />
    </svg>
  );
}

const CAT_ART = { laptop: 'laptop', phone: 'phone', tablet: 'tablet', desktop: 'imac', wearable: 'watch', sound: 'headphone', monitor: 'monitor', gaming: 'console', network: 'router', security: 'camera', camera: 'dslr', printer: 'printer', accessories: 'charger' };
export const artFor = (p, cat) => p?.art || CAT_ART[p?.categoryId] || cat?.icon || 'phone';

export function ProductVisual({ product, category, className = '' }) {
  const src = product?.images?.[0] || product?.image;
  if (src) return <img src={src} alt={product.name} className={`product-photo ${className}`} loading="lazy" decoding="async" />;
  return <DeviceArt type={artFor(product, category)} className={className} seed={product?.slug || product?.name || ''} />;
}
