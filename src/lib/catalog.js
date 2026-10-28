// Starter catalog for Decibel-114.
// Names, specs and prices were checked against Star Tech's public listings on 26 Oct 2026
// (Ryans uses the same market range). Descriptions are written fresh for this store.
// Update prices any time from Admin → Products or with a CSV import.
import { DESCRIPTIONS } from './descriptions.js';
import IMAGES from './curatedImages.json';

export const CATEGORIES = [
  { id: 'laptop', name: 'Laptop', short: 'Laptop', order: 1, subs: ['MacBook', 'Premium laptop', 'Business laptop', 'Gaming laptop', 'Everyday laptop', 'Ultrabook'] },
  { id: 'desktop', name: 'Desktop & Mac', short: 'Desktop', order: 2, subs: ['iMac', 'Mac mini', 'Mac Studio', 'Brand PC', 'All-in-one PC', 'Mini PC', 'Gaming PC', 'Budget PC'] },
  { id: 'monitor', name: 'Monitor & TV', short: 'Monitor', order: 3, subs: ['Gaming monitor', '4K monitor', 'Professional monitor', 'Curved monitor', 'Business monitor', 'Everyday monitor', 'Portable monitor', 'TV'] },
  { id: 'phone', name: 'Mobile phone', short: 'Phone', order: 4, subs: ['iPhone', 'Samsung', 'Xiaomi', 'Other phones'] },
  { id: 'tablet', name: 'Tablet', short: 'Tablet', order: 5, subs: ['iPad', 'Android tablet', 'Stylus'] },
  { id: 'component', name: 'PC components', short: 'Components', order: 6, subs: ['Processor', 'Motherboard', 'Graphics Card', 'RAM', 'SSD', 'HDD', 'Power Supply', 'Casing', 'CPU Cooler', 'Portable SSD', 'Portable HDD', 'UPS', 'UPS battery'] },
  { id: 'network', name: 'Networking', short: 'Networking', order: 7, subs: ['Starlink', 'Router', 'Access point', 'Access point & extender', 'Mesh Wi-Fi', 'Switch', 'Firewall', 'Gateway router', 'Ruijie Reyee', 'Huawei eKit', 'Grandstream', 'Network cable'] },
  { id: 'security', name: 'Security & CCTV', short: 'Security', order: 8, subs: ['CCTV camera', 'IP camera', 'Camera package', 'DVR, NVR & XVR', 'Access control'] },
  { id: 'office', name: 'Office equipment', short: 'Office', order: 9, subs: ['Interactive flat panel', 'Projectors', 'Conference system', 'Photocopier', 'Presenter', 'Software', 'Office supplies'] },
  { id: 'printer', name: 'Printer & scanner', short: 'Printer', order: 10, subs: ['Laser printer', 'Ink tank printer', 'Inkjet printer', 'Label printer', 'POS printer', 'ID card printer', 'Large format printer', 'Scanner', 'Toner & cartridge'] },
  { id: 'gaming', name: 'Gaming', short: 'Gaming', order: 11, subs: ['Console', 'Controller', 'Gamepad', 'Gaming Chair', 'Gaming Keyboard', 'Gaming Mouse'] },
  { id: 'sound', name: 'Audio', short: 'Audio', order: 12, subs: ['AirPods', 'Headphone', 'Earbuds', 'Earphone', 'Speaker', 'Bluetooth speaker', 'Speaker & home theatre', 'Microphone'] },
  { id: 'gadget', name: 'Smartwatch & gadgets', short: 'Gadgets', order: 13, subs: ['Apple Watch', 'Galaxy Watch', 'Smartwatch', 'Mirrorless', 'Gimbal', 'Action camera'] },
  { id: 'accessories', name: 'Accessories', short: 'Accessories', order: 14, subs: ['Apple accessories', 'Mobile accessories', 'Charger', 'Power bank', 'Converter & cable', 'Keyboard', 'Mouse', 'Keyboard & mouse combo', 'Laptop accessories', 'Pendrive', 'Memory card', 'Webcam'] },
  { id: 'server', name: 'Server & storage', short: 'Server', order: 15, subs: ['Server', 'Storage', 'Workstation'] },
];

const T = Date.parse('2026-10-26T10:00:00+06:00');
let n = 0;
const slug = (s) => s.toLowerCase().replace(/["”″]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const specs = (s) => s.split(';').map((x) => x.trim()).filter(Boolean).map((x) => {
  const i = x.indexOf(':');
  return i > 0 ? { key: x.slice(0, i).trim(), value: x.slice(i + 1).trim() } : { key: 'Feature', value: x };
});

/**
 * P(category, type, brand, name, price, regularPrice, art, specs, blurb, extra)
 * price 0 means "coming soon".
 */
function P(categoryId, subcategory, brand, name, price, originalPrice, art, specText, blurb, extra = {}) {
  n += 1;
  const s = specs(specText);
  return {
    id: 'p' + String(n).padStart(3, '0'),
    name, slug: slug(name), brand, categoryId, subcategory, art,
    price, originalPrice: originalPrice || 0,
    stock: price ? (extra.stock ?? 6) : 0,
    status: 'active',
    shortDescription: blurb,
    description: extra.desc || DESCRIPTIONS[slug(name)] || `${blurb} ${s.slice(0, 3).map((x) => `${x.key}: ${x.value}.`).join(' ')}`,
    specs: s,
    warranty: extra.warranty || (brand === 'Apple' ? '1 year Apple warranty' : '1 year'),
    featured: !!extra.featured, newArrival: !!extra.new, deal: !!extra.deal,
    tags: extra.tags || [],
    options: extra.options || [],
    images: (IMAGES[slug(name)] || []).map((u) => (import.meta.env?.BASE_URL || '/') + u.slice(1)),
    createdAt: T - n * 60000,
  };
}

const RAW = [
  /* ── iPhone ── */
  P('phone', 'iPhone', 'Apple', 'iPhone 18 Pro Max', 273000, 299999, 'phone',
    'Display: 6.9" LTPO Super Retina XDR OLED, 120Hz, Dolby Vision; Chip: A20 Pro (2nm), 6-core CPU, 7-core GPU; Camera: Triple 48MP rear, 18MP front; Features: Face ID, USB-C, IP68, MagSafe',
    'The largest iPhone with the new 2nm A20 Pro chip and three 48MP cameras.', { featured: true, new: true, tags: ['iphone 18', 'pro max', 'apple phone'] }),
  P('phone', 'iPhone', 'Apple', 'iPhone 18 Pro', 274999, 0, 'phone',
    'Display: 6.3" LTPO Super Retina XDR OLED, 120Hz, Dolby Vision; Chip: A20 Pro (2nm), 6-core CPU, 7-core GPU; Camera: Triple 48MP rear, 18MP front; Features: Face ID, USB-C, IP68, MagSafe',
    'Pro cameras and the A20 Pro chip in a one-hand 6.3-inch size.', { new: true, tags: ['iphone 18'] }),
  P('phone', 'iPhone', 'Apple', 'iPhone 17 Pro Max', 195000, 249999, 'phone',
    'Display: 6.9" LTPO Super Retina XDR OLED, 120Hz; Chip: A19 Pro (3nm), 6-core CPU, 6-core GPU; Camera: Triple 48MP rear, 18MP front; Features: Camera Control, Action button, Face ID, USB-C, IP68',
    'Last year’s flagship at a much lower price, with a full 48MP triple camera.', { featured: true, deal: true, tags: ['iphone 17'] }),
  P('phone', 'iPhone', 'Apple', 'iPhone 17 Pro', 182500, 229999, 'phone',
    'Display: 6.3" LTPO Super Retina XDR OLED, 120Hz; Chip: A19 Pro (3nm), 6-core CPU, 6-core GPU; Camera: Triple 48MP rear, 18MP front; Features: Camera Control, Action button, Face ID, USB-C, IP68',
    'Compact pro iPhone with telephoto, ProMotion and the A19 Pro chip.', { deal: true, tags: ['iphone 17'] }),
  P('phone', 'iPhone', 'Apple', 'iPhone Air', 166500, 209999, 'phone',
    'Display: 6.9" LTPO Super Retina XDR OLED, 120Hz; Chip: A19 Pro (3nm), 6-core CPU, 5-core GPU; Camera: 48MP Fusion rear, 18MP front; Features: Camera Control, Action button, Face ID, USB-C, IP68',
    'The thinnest iPhone yet, with a big 6.9-inch screen and pro-class chip.', { featured: true, tags: ['iphone air', 'slim'] }),
  P('phone', 'iPhone', 'Apple', 'iPhone 17', 140000, 179999, 'phone',
    'Display: 6.3" LTPO Super Retina XDR OLED, 120Hz; Chip: A19 (3nm), 6-core CPU, 5-core GPU; Camera: Dual 48MP rear, 18MP front; Features: Camera Control, Action button, Face ID, USB-C, IP68',
    'The everyday iPhone, now with a 120Hz display and two 48MP cameras.', { deal: true, tags: ['iphone 17'] }),
  P('phone', 'iPhone', 'Apple', 'iPhone 15 Plus', 126500, 179999, 'phone',
    'Display: 6.7" Super Retina XDR OLED; Chip: A16 Bionic; Storage: 256GB; Camera: 48MP + 12MP rear, 12MP front; Features: Dynamic Island, Face ID, USB-C',
    'Big-screen iPhone with 256GB storage at a lower price point.', { tags: ['iphone 15'] }),
  P('phone', 'iPhone', 'Apple', 'iPhone 17e', 0, 0, 'phone',
    'Display: 6.1" Super Retina XDR OLED; Chip: A19 (3nm), 6-core CPU, 4-core GPU; Camera: 48MP rear, 12MP front; Features: Action button, Face ID, USB-C, IP68',
    'The most affordable iPhone of the new generation. Coming soon.', { tags: ['iphone 17e'] }),
  P('phone', 'iPhone', 'Apple', 'iPhone Duo', 0, 0, 'phone',
    'Display: 7.6" foldable LTPO Super Retina XDR OLED, 120Hz; Chip: A20 Pro (2nm); Camera: Dual 48MP rear; Features: Face ID, USB-C, IP68, MagSafe',
    'Apple’s first foldable iPhone. Register interest and we will call you when stock lands.', { tags: ['fold', 'foldable'] }),

  /* ── MacBook ── */
  P('laptop', 'MacBook', 'Apple', 'MacBook Neo 13-inch 256GB', 97000, 99000, 'laptop',
    'Chip: A18 Pro, 6-core CPU, 5-core GPU; Memory: 8GB unified; Storage: 256GB SSD; Display: 13" Liquid Retina (2408 x 1506); Features: Magic Keyboard with Touch ID, Wi-Fi 6E, Bluetooth 6',
    'The most affordable MacBook, built for students and everyday work.', { featured: true, new: true, tags: ['macbook neo', 'student laptop'] }),
  P('laptop', 'MacBook', 'Apple', 'MacBook Neo 13-inch 512GB', 112000, 115000, 'laptop',
    'Chip: A18 Pro, 6-core CPU, 5-core GPU; Memory: 8GB unified; Storage: 512GB SSD; Display: 13" Liquid Retina (2408 x 1506); Features: Magic Keyboard with Touch ID, Wi-Fi 6E, Bluetooth 6',
    'MacBook Neo with double the storage for photos and projects.', { new: true }),
  P('laptop', 'MacBook', 'Apple', 'MacBook Air M5 13-inch 16GB/512GB', 161500, 175000, 'laptop',
    'Chip: Apple M5, 10-core CPU, 8-core GPU; Memory: 16GB unified; Storage: 512GB SSD; Display: 13.6" Liquid Retina (2560 x 1664), True Tone; Features: Backlit Magic Keyboard, Touch ID',
    'Fanless, silent and light. The MacBook most people should buy.', { featured: true, deal: true, tags: ['macbook air', 'm5'] }),
  P('laptop', 'MacBook', 'Apple', 'MacBook Air M5 13-inch 10-core GPU 1TB', 215000, 225000, 'laptop',
    'Chip: Apple M5, 10-core CPU, 10-core GPU; Memory: 16GB or 24GB unified; Storage: 1TB SSD; Display: 13.6" Liquid Retina (2560 x 1664); Features: Backlit Magic Keyboard, Touch ID',
    'The 13-inch Air with the faster GPU and a full terabyte of storage.', { tags: ['macbook air', 'm5'] }),
  P('laptop', 'MacBook', 'Apple', 'MacBook Air M5 15-inch', 207000, 0, 'laptop',
    'Chip: Apple M5, 10-core CPU, 10-core GPU; Memory: 16GB unified; Storage: 512GB or 1TB SSD; Display: 15.3" Liquid Retina (2880 x 1864); Features: Backlit Magic Keyboard, Touch ID',
    'A bigger screen and six-speaker sound in a still-thin Air.', { tags: ['macbook air', '15 inch'] }),
  P('laptop', 'MacBook', 'Apple', 'MacBook Pro 14-inch M5', 267000, 0, 'laptop',
    'Chip: Apple M5, 10-core CPU, 10-core GPU; Memory: 16GB or 24GB; Storage: 512GB or 1TB SSD; Display: 14.2" Liquid Retina XDR (3024 x 1964); Features: Touch ID, Wi-Fi 6E, Bluetooth 5.3',
    'Pro display, more ports and sustained performance for creative work.', { featured: true, tags: ['macbook pro'] }),
  P('laptop', 'MacBook', 'Apple', 'MacBook Pro 14-inch M5 Pro', 340000, 355000, 'laptop',
    'Chip: Apple M5 Pro, 15-core CPU, 16-core GPU; Memory: 24GB; Storage: 1TB SSD; Display: 14.2" Liquid Retina XDR; Features: Touch ID, Wi-Fi 7, Bluetooth 6',
    'M5 Pro power for video editing, code and 3D in a 14-inch body.', { tags: ['macbook pro', 'm5 pro'] }),
  P('laptop', 'MacBook', 'Apple', 'MacBook Pro 16-inch M5 Pro', 425000, 0, 'laptop',
    'Chip: Apple M5 Pro, 18-core CPU, 20-core GPU; Memory: 24GB or 64GB; Storage: 1TB SSD; Display: 16.2" Liquid Retina XDR; Features: Touch ID, Wi-Fi 7, Bluetooth 6',
    'The big-screen MacBook Pro with all-day battery.', { tags: ['macbook pro 16'] }),
  P('laptop', 'MacBook', 'Apple', 'MacBook Pro 16-inch M5 Max', 550000, 565000, 'laptop',
    'Chip: Apple M5 Max, 18-core CPU, 32-core GPU; Memory: 36GB; Storage: 2TB SSD; Display: 16.2" Liquid Retina XDR; Features: Touch ID, Wi-Fi 7, Bluetooth 6',
    'Studio-grade performance for 8K video, large models and heavy renders.', { tags: ['macbook pro', 'm5 max'] }),

  /* ── iPad ── */
  P('tablet', 'iPad', 'Apple', 'iPad 11th Gen (2025)', 54500, 56500, 'tablet',
    'Display: 11" Liquid Retina; Chip: A16 Bionic; Storage: 128GB or 256GB; Camera: 12MP rear, 12MP Center Stage front; Features: Touch ID, USB-C',
    'The best-value iPad for study, streaming and notes.', { deal: true, tags: ['ipad'] }),
  P('tablet', 'iPad', 'Apple', 'iPad mini 7 (Wi-Fi)', 73500, 77500, 'tablet',
    'Chip: A17 Pro, 6-core CPU, 5-core GPU; Display: 8.3" Liquid Retina (2266 x 1488); Storage: 128GB; Camera: 12MP rear and front; Features: Apple Pencil Pro support',
    'A full iPad that fits in one hand and a jacket pocket.', { tags: ['ipad mini'] }),
  P('tablet', 'iPad', 'Apple', 'iPad Air M4 11-inch (Wi-Fi)', 90000, 93500, 'tablet',
    'Display: 11" Liquid Retina (2360 x 1640); Chip: Apple M4, 8-core CPU, 9-core GPU; Storage: 128GB; Features: Touch ID, USB-C, Apple Pencil Pro support',
    'Laptop-class M4 chip in a light 11-inch iPad.', { featured: true, new: true, tags: ['ipad air'] }),
  P('tablet', 'iPad', 'Apple', 'iPad Air M4 13-inch (Wi-Fi)', 115490, 119500, 'tablet',
    'Display: 13" Liquid Retina (2732 x 2048); Chip: Apple M4, 8-core CPU, 9-core GPU; Storage: 128GB; Features: Touch ID, USB-C',
    'A 13-inch canvas for drawing, design and split-screen work.', { tags: ['ipad air 13'] }),
  P('tablet', 'iPad', 'Apple', 'iPad Pro M5 11-inch (Wi-Fi)', 144000, 155000, 'tablet',
    'Chip: Apple M5, 9-core CPU, 10-core GPU; Display: 11" Tandem OLED Ultra Retina XDR; Storage: 256GB or 512GB; Memory: 12GB; Camera: 12MP rear, 12MP landscape front',
    'Tandem OLED and the M5 chip in Apple’s thinnest pro tablet.', { featured: true, tags: ['ipad pro'] }),
  P('tablet', 'iPad', 'Apple', 'iPad Pro M5 11-inch (Wi-Fi + Cellular)', 168500, 175000, 'tablet',
    'Chip: Apple M5, 9-core CPU, 10-core GPU; Display: 11" Tandem OLED Ultra Retina XDR; Storage: 256GB; Memory: 12GB; Connectivity: 5G cellular',
    'iPad Pro with built-in 5G for work away from Wi-Fi.', { tags: ['ipad pro', 'cellular'] }),
  P('tablet', 'iPad', 'Apple', 'iPad Pro M5 13-inch (Wi-Fi)', 172000, 178500, 'tablet',
    'Chip: Apple M5, 9-core CPU, 10-core GPU; Display: 13" Tandem OLED Ultra Retina XDR; Storage: 256GB or 512GB; Memory: 12GB',
    'The largest, brightest iPad display for pro creators.', { tags: ['ipad pro 13'] }),
  P('tablet', 'Stylus', 'Apple', 'Apple Pencil Pro', 13000, 15500, 'pencil',
    'Compatibility: iPad Pro, iPad Air (M2 and later), iPad mini 7; Sensors: Barrel roll gyroscope, squeeze; Features: Double-tap, haptic feedback, Find My',
    'Squeeze, barrel-roll and haptics for precise drawing and notes.', { tags: ['pencil', 'stylus'] }),
  P('tablet', 'Stylus', 'Apple', 'Apple Pencil (USB-C)', 9100, 12500, 'pencil',
    'Connectivity: Bluetooth; Charging: USB-C; Battery: Up to 12 hours; Compatibility: All USB-C iPads',
    'An affordable Apple Pencil for any USB-C iPad.', { deal: true, tags: ['pencil'] }),

  /* ── Mac desktops ── */
  P('desktop', 'iMac', 'Apple', 'iMac 24-inch M4 (8-core GPU, 256GB)', 265000, 0, 'imac',
    'Chip: Apple M4, 8-core CPU, 8-core GPU; Memory: 16GB; Storage: 256GB SSD; Display: 24" 4.5K Retina (4480 x 2520); Ports: 2x Thunderbolt 4',
    'An all-in-one Mac with a 4.5K display, ready in minutes.', { tags: ['imac'] }),
  P('desktop', 'iMac', 'Apple', 'iMac 24-inch M4 (10-core GPU, 512GB)', 350000, 0, 'imac',
    'Chip: Apple M4, 10-core CPU, 10-core GPU; Memory: 16GB; Storage: 512GB SSD; Display: 24" 4.5K Retina; Ports: 4x Thunderbolt 4',
    'More GPU, more storage and four Thunderbolt ports.', { tags: ['imac'] }),
  P('desktop', 'Mac mini', 'Apple', 'Mac mini M6', 132000, 0, 'macmini',
    'Chip: 12-core CPU, 12-core GPU, 16-core Neural Engine; Memory: 16GB unified; Storage: 256GB or 512GB; Ports: 3x Thunderbolt 4, 2x USB-C, HDMI; Network: Wi-Fi 7, 2.5G Ethernet',
    'A tiny, quiet desktop Mac. Add any monitor and keyboard.', { featured: true, new: true, tags: ['mac mini'] }),
  P('desktop', 'Mac Studio', 'Apple', 'Mac Studio M5 Max', 435000, 0, 'macmini',
    'Chip: Apple M5 Max, 18-core CPU, 32-core GPU; Memory: 36GB; Storage: 512GB SSD; Ports: 4x Thunderbolt 5, HDMI, SD card; Network: 10Gb Ethernet, Wi-Fi 7',
    'Workstation power in a compact desktop for studios and editors.', { tags: ['mac studio'] }),

  /* ── Apple Watch ── */
  P('wearable', 'Apple Watch', 'Apple', 'Apple Watch Series 12', 62300, 67999, 'watch',
    'Display: Always-On Retina, LTPO3; Chip: S11; Sensors: ECG, blood oxygen, temperature; Water: 50m, IP6X',
    'The newest Apple Watch for health, fitness and safety features.', { featured: true, new: true, tags: ['apple watch'] }),
  P('wearable', 'Apple Watch', 'Apple', 'Apple Watch Series 11', 45300, 48999, 'watch',
    'Display: Always-On Retina, LTPO3; Chip: S10; Sensors: ECG, blood oxygen, temperature; Water: 50m, IP6X',
    'Full health tracking for less than the newest model.', { deal: true, tags: ['apple watch'] }),
  P('wearable', 'Apple Watch', 'Apple', 'Apple Watch Ultra 3', 97400, 104999, 'watch',
    'Display: Always-On Retina, LTPO3; Chip: S10; Connectivity: 5G and LTE; Build: Titanium, 100m water resistance, military-grade testing',
    'Titanium sport watch with satellite-ready cellular and multi-day battery.', { tags: ['apple watch ultra'] }),

  /* ── AirPods / sound ── */
  P('sound', 'AirPods', 'Apple', 'AirPods Pro 3', 26400, 28999, 'earbuds',
    'Chip: Apple H2; Audio: Active Noise Cancellation, Spatial Audio; Sensors: Heart rate, skin detect; Features: Live Translation, hearing aid; Water: IP57',
    'Apple’s best noise cancelling earbuds, now with heart-rate sensing.', { featured: true, deal: true, tags: ['airpods pro'] }),
  P('sound', 'AirPods', 'Apple', 'AirPods 5', 19400, 20999, 'earbuds',
    'Chip: Apple H2; Features: Live Translation, Siri; Water: IP57; Battery: Up to 5 hours listening',
    'Open-fit AirPods with live translation and better water resistance.', { new: true, tags: ['airpods'] }),
  P('sound', 'AirPods', 'Apple', 'AirPods 4', 13167, 15490, 'earbuds',
    'Chip: Apple H2; Audio: Personalized Spatial Audio; Water: IP54; Battery: Up to 5 hours listening',
    'Comfortable everyday AirPods at the lowest price.', { tags: ['airpods'] }),
  P('sound', 'AirPods', 'Apple', 'AirPods Max', 69000, 0, 'headphone',
    'Driver: Apple-designed dynamic; Audio: Active Noise Cancellation, Transparency, Spatial Audio; Build: Aluminium cups, knit mesh canopy',
    'Over-ear AirPods with high-fidelity sound and strong noise cancelling.', { tags: ['airpods max', 'headphone'] }),
  P('sound', 'Headphone', 'Sony', 'Sony WH-1000XM6 Wireless Headphone', 42499, 43000, 'headphone',
    'Noise cancelling: 12 microphones; Audio: 360 Spatial Sound, Hi-Res; Design: Foldable; Battery: Up to 30 hours',
    'Industry-leading noise cancelling for flights and open offices.', { featured: true, tags: ['sony', 'anc'] }),
  P('sound', 'Speaker', 'JBL', 'JBL Flip 7 Bluetooth Speaker', 11499, 12499, 'speaker',
    'Output: 30W two-way (25W woofer + 10W tweeter); Frequency: 65Hz to 20kHz; Build: Rugged, waterproof',
    'Loud, rugged and waterproof. Goes anywhere.', { deal: true, tags: ['jbl', 'speaker'] }),
  P('sound', 'Speaker', 'Marshall', 'Marshall Emberton III', 21400, 22999, 'speaker',
    'Connection: Bluetooth; Battery: 32+ hours; Build: Compact, rugged',
    'Classic Marshall look with 32 hours of battery.', { tags: ['marshall'] }),
  P('sound', 'Speaker', 'Marshall', 'Marshall Stanmore III', 42500, 45999, 'speaker',
    'Drivers: 2x 0.75" tweeters, 5.25" woofer; Power: 80W total; Inputs: RCA, 3.5mm, Bluetooth',
    'A home speaker with room-filling sound and vintage style.', { tags: ['marshall'] }),

  /* ── Apple accessories ── */
  P('accessories', 'Apple accessories', 'Apple', 'Apple AirTag (2nd Gen)', 4200, 4599, 'tag',
    'Chip: 2nd Gen Ultra Wideband; Water and dust: IP67; Connectivity: Bluetooth, NFC; Battery: Replaceable CR2032',
    'Find keys, bags and luggage with the Find My network.', { new: true, tags: ['airtag', 'tracker'] }),
  P('accessories', 'Apple accessories', 'Apple', 'Apple 20W USB-C Power Adapter', 2295, 2550, 'charger',
    'Output: 20W; Connector: USB-C; Compatibility: iPhone, iPad, AirPods',
    'Fast-charge an iPhone to about 50% in roughly 30 minutes.', { tags: ['charger', 'adapter'] }),
  P('accessories', 'Apple accessories', 'Apple', 'Apple 40W Dynamic Power Adapter (60W Max)', 5228, 6299, 'charger',
    'Output: 40W, up to 60W dynamic; Connector: USB-C; Compatibility: iPhone, iPad, MacBook Air',
    'One compact charger that can also top up a MacBook Air.', { tags: ['charger'] }),
  P('accessories', 'Apple accessories', 'Apple', 'Apple 35W Dual USB-C Power Adapter', 6490, 6999, 'charger',
    'Output: 35W shared; Ports: 2x USB-C; Plug: UK 3-pin',
    'Charge an iPhone and a Watch or iPad from one plug.', { tags: ['charger'] }),
  P('accessories', 'Apple accessories', 'Apple', 'Apple USB-C 60W Cable (1 m)', 2490, 0, 'cable',
    'Connectors: USB-C to USB-C; Power: 60W; Length: 1 m',
    'Original woven USB-C cable for iPhone, iPad and Mac.', { tags: ['cable'] }),
  P('accessories', 'Apple accessories', 'Apple', 'Apple USB-C to Lightning Cable (1 m)', 1990, 0, 'cable',
    'Connectors: USB-C to Lightning; Length: 1 m; Compatibility: iPhone 14 and earlier, AirPods with Lightning',
    'Fast-charge older iPhones from a USB-C charger.', { tags: ['cable', 'lightning'] }),
  P('accessories', 'Apple accessories', 'Apple', 'Apple Magic Keyboard with Touch ID', 20900, 0, 'keyboard',
    'Connectivity: Bluetooth, USB-C charging; Security: Touch ID; Battery: Rechargeable',
    'Wireless Mac keyboard with Touch ID for quick, secure sign-in.', { tags: ['magic keyboard'] }),
  P('accessories', 'Apple accessories', 'Apple', 'Apple Magic Mouse (USB-C)', 12000, 14000, 'mouse',
    'Connectivity: Bluetooth; Charging: USB-C; Surface: Multi-Touch',
    'The Multi-Touch mouse made for macOS gestures.', { deal: true, tags: ['magic mouse'] }),

  /* ── Other phones ── */
  P('phone', 'Samsung', 'Samsung', 'Samsung Galaxy S26 Ultra', 199999, 0, 'phone',
    'Display: 6.9" Dynamic LTPO AMOLED 2X, 120Hz; Chip: Snapdragon 8 Elite Gen 5 (3nm); Camera: 200 + 50 + 50 + 10MP rear, 12MP front; Features: S Pen',
    'Samsung’s top phone with a 200MP camera and built-in S Pen.', { featured: true, new: true, tags: ['galaxy s26', 'android'] }),
  P('phone', 'Samsung', 'Samsung', 'Samsung Galaxy S26', 130299, 0, 'phone',
    'Display: 6.3" Dynamic LTPO AMOLED 2X, 120Hz; Chip: Snapdragon 8 Elite Gen 5 (3nm); Camera: 50 + 12 + 10MP rear, 12MP front',
    'Compact flagship Android with the latest Snapdragon chip.', { tags: ['galaxy s26'] }),
  P('phone', 'Samsung', 'Samsung', 'Samsung Galaxy A57 5G', 76000, 79400, 'phone',
    'Display: 6.7" FHD+ Super AMOLED, 120Hz; Chip: Exynos 1680 (4nm); Camera: 50 + 12 + 5MP rear, 12MP front',
    'Mid-range Galaxy with a bright AMOLED screen and long software support.', { tags: ['galaxy a57'] }),
  P('phone', 'Xiaomi', 'Xiaomi', 'Redmi Note 17 Pro Max 5G', 64999, 0, 'phone',
    'Display: 6.83" 1.5K AMOLED, 120Hz; Chip: Snapdragon 6 Gen 5 (4nm); Camera: 50 + 8MP rear, 32MP front',
    'Big 1.5K screen and fast charging for a mid-range price.', { new: true, tags: ['redmi', 'xiaomi'] }),
  P('phone', 'Xiaomi', 'Xiaomi', 'Redmi Note 17 Pro 5G', 54999, 0, 'phone',
    'Display: 6.83" 1.5K AMOLED, 120Hz; Chip: Snapdragon 6s Gen 4 (4nm); Camera: 50 + 8MP rear, 16MP front',
    'A capable 5G phone with a sharp AMOLED display.', { tags: ['redmi'] }),

  /* ── Laptops (other brands) ── */
  P('laptop', 'Ultrabook', 'ASUS', 'ASUS Zenbook 14 OLED UX3405CA Core Ultra 5 225H', 176000, 0, 'laptop',
    'Processor: Intel Core Ultra 5 225H, up to 4.9GHz; Memory: 16GB LPDDR5X; Storage: 512GB PCIe 4.0 SSD; Display: 14" WUXGA OLED',
    'A light OLED ultrabook for work and travel.', { tags: ['zenbook', 'oled'] }),
  P('laptop', 'Ultrabook', 'ASUS', 'ASUS Zenbook A14 Snapdragon X Elite', 182000, 0, 'laptop',
    'Processor: Snapdragon X Elite X1E-78-100; Memory: 16GB LPDDR5X; Storage: 1TB SSD; Display: 14" WUXGA OLED; Features: Copilot+ PC',
    'All-day battery Copilot+ PC that weighs under a kilogram.', { new: true, tags: ['zenbook', 'copilot'] }),
  P('laptop', 'Business laptop', 'Lenovo', 'Lenovo ThinkPad E14 Gen 7 Core Ultra 5 225H', 139500, 143000, 'laptop',
    'Processor: Intel Core Ultra 5 225H, up to 4.9GHz; Memory: 16GB DDR5; Storage: 512GB NVMe SSD; Display: 14" WUXGA IPS anti-glare',
    'Durable ThinkPad keyboard and security features for office fleets.', { tags: ['thinkpad', 'business'] }),
  P('laptop', 'Business laptop', 'Lenovo', 'Lenovo ThinkPad L14 Gen 6 Core Ultra 5 225U', 135500, 0, 'laptop',
    'Processor: Intel Core Ultra 5 225U; Memory: 16GB DDR5; Storage: 512GB NVMe SSD (Opal); Display: 14" WUXGA IPS 400 nits',
    'Serviceable business laptop with a bright anti-glare screen.', { tags: ['thinkpad'] }),
  P('laptop', 'Gaming laptop', 'ASUS', 'ASUS ROG Strix G16 Ryzen 9 8940HX RTX 5050', 250000, 0, 'laptop',
    'Processor: AMD Ryzen 9 8940HX, up to 5.3GHz; Graphics: NVIDIA GeForce RTX 5050 8GB GDDR7; Memory: 16GB DDR5; Storage: 512GB SSD; Display: 16" 2.5K',
    'High-refresh 2.5K gaming with a Ryzen 9 and RTX 50-series GPU.', { featured: true, tags: ['rog', 'gaming'] }),

  /* ── Wearables (other) ── */
  P('wearable', 'Galaxy Watch', 'Samsung', 'Samsung Galaxy Watch 9', 34900, 37999, 'watch',
    'Display: 1.47" Super AMOLED, 3000 nits; Chip: Snapdragon W6100 Wear Elite (3nm); Memory: 2GB RAM, 32GB',
    'The newest Galaxy Watch for Android phones.', { new: true, tags: ['galaxy watch'] }),
  P('wearable', 'Galaxy Watch', 'Samsung', 'Samsung Galaxy Watch Ultra 2025', 40300, 43999, 'watch',
    'Display: 1.5" Super AMOLED; Chip: Exynos W1000 (3nm); Memory: 2GB RAM, 64GB',
    'Rugged titanium Galaxy Watch for outdoor sports.', { tags: ['galaxy watch ultra'] }),

  /* ── Monitors ── */
  P('monitor', 'Gaming monitor', 'Samsung', 'Samsung Odyssey OLED G6 27" QHD 500Hz', 149500, 152000, 'monitor',
    'Resolution: 2560 x 1440 QHD; Panel: OLED, 500Hz, 0.03ms GTG; Ports: 2x HDMI, DisplayPort, USB hub',
    'Esports-speed OLED with perfect blacks.', { featured: true, tags: ['odyssey', 'oled'] }),
  P('monitor', 'Gaming monitor', 'Samsung', 'Samsung Odyssey G5 32" QHD 180Hz', 47500, 52500, 'monitor',
    'Resolution: 2560 x 1440 QHD; Panel: IPS, 180Hz, 1ms GTG; Ports: HDMI, DisplayPort',
    'A big, fast QHD screen for gaming and productivity.', { deal: true, tags: ['odyssey'] }),
  P('monitor', 'Gaming monitor', 'LG', 'LG UltraGear 27GS65F 27" FHD 180Hz', 34000, 35000, 'monitor',
    'Resolution: 1920 x 1080; Panel: IPS, 180Hz, 1ms GTG; Ports: DisplayPort, HDMI',
    'Smooth 180Hz IPS gaming on a 27-inch panel.', { tags: ['ultragear'] }),
  P('monitor', 'Gaming monitor', 'Lenovo', 'Lenovo Legion 25-10 24.5" 320Hz', 23500, 24500, 'monitor',
    'Resolution: 1920 x 1080; Panel: IPS, 320Hz; Ports: 2x HDMI 2.1, DisplayPort 1.4',
    '320Hz for competitive shooters at a fair price.', { tags: ['legion'] }),

  /* ── Gaming ── */
  P('gaming', 'Console', 'Nintendo', 'Nintendo Switch 2', 66790, 82000, 'console',
    'Display: 7.9" LCD touch; Storage: 256GB; Output: Up to 4K HDR docked, 120fps; Modes: TV, tabletop, handheld',
    'Nintendo’s new hybrid console for TV and on-the-go play.', { featured: true, deal: true, tags: ['switch 2', 'nintendo'] }),
  P('gaming', 'Controller', 'Sony', 'PlayStation 5 DualSense Ghost of Yōtei Gold Edition', 15900, 18000, 'gamepad',
    'Features: Adaptive triggers, haptic feedback; Audio: Built-in mic and speaker, 3.5mm jack; Connectivity: Bluetooth, USB',
    'Limited-edition DualSense with full haptics.', { tags: ['ps5', 'controller'] }),

  /* ── Network ── */
  P('network', 'Starlink', 'Starlink', 'Starlink Standard Kit', 46900, 49500, 'dish',
    'Antenna: Electronic phased array; Wi-Fi: Tri-band 4x4 MU-MIMO, Wi-Fi 6; Coverage: Up to 297 m², 235 devices',
    'High-speed satellite internet anywhere in Bangladesh. Subscription billed by Starlink.', { featured: true, tags: ['starlink', 'satellite'] }),
  P('network', 'Starlink', 'Starlink', 'Starlink Mini Kit', 24900, 26500, 'dish',
    'Antenna: Electronic phased array; Wi-Fi: Dual-band 3x3 MU-MIMO, Wi-Fi 5; Coverage: Up to 112 m², 128 devices; Power: 12-48V DC',
    'Backpack-size Starlink with built-in Wi-Fi for travel and backup.', { new: true, tags: ['starlink mini'] }),
  P('network', 'Access point', 'Ubiquiti', 'UniFi U7 Lite Wi-Fi 7 Access Point (with adapter)', 26500, 0, 'ap',
    'Standard: Wi-Fi 7, dual-band; Speed: 4.3 Gbps (5GHz), 688 Mbps (2.4GHz); MIMO: 2x2 MU-MIMO',
    'Affordable Wi-Fi 7 for homes and small offices, managed from the UniFi app.', { featured: true, tags: ['unifi', 'wifi 7'] }),
  P('network', 'Access point', 'Ubiquiti', 'UniFi 6 Pro Wi-Fi 6 Access Point (with PoE adapter)', 32800, 0, 'ap',
    'Standard: Wi-Fi 6; Throughput: Up to 4.8 Gbps; Power: 13W PoE',
    'High-capacity Wi-Fi 6 for busy offices and shops.', { tags: ['unifi'] }),
  P('network', 'Mesh Wi-Fi', 'TP-Link', 'TP-Link Deco X10 AX1500 Mesh (1-pack)', 6050, 6090, 'mesh',
    'Coverage: Up to 2,100 ft²; Devices: Up to 120; Bands: 2.4GHz and 5GHz Wi-Fi 6',
    'Whole-home Wi-Fi 6 mesh that is easy to expand.', { deal: true, tags: ['deco', 'mesh'] }),
  P('network', 'Router', 'MikroTik', 'MikroTik hEX lite RB750R2', 5500, 5600, 'router',
    'CPU: 850MHz; RAM: 64MB; Ports: 5x Ethernet; OS: RouterOS',
    'Reliable RouterOS router for ISPs and small offices.', { tags: ['mikrotik'] }),
  P('network', 'Router', 'Ruijie', 'Ruijie RG-EW1300G Dual-Band Gigabit Router', 3358, 3650, 'router',
    'Standard: Wi-Fi 5 (802.11ac); Speed: 400 Mbps (2.4GHz) + 867 Mbps (5GHz); Antennas: 5 external',
    'Gigabit dual-band router that suits most fibre connections.', { tags: ['ruijie'] }),
  P('network', 'Switch', 'Cisco', 'Cisco CBS350-24T-4G 24-Port Managed Switch', 35000, 35500, 'switch',
    'Ports: 24x Gigabit + 4 combo; Switching capacity: 56 Gbps; Management: Web, CLI, VLAN',
    'Managed Layer 2+ switching for growing business networks.', { tags: ['cisco', 'switch'] }),
  P('network', 'Switch', 'TP-Link', 'TP-Link LS1210P 8-Port PoE+ Switch', 3890, 0, 'switch',
    'Ports: 8x 10/100 PoE+, 2x Gigabit uplink; Range: Up to 250 m extend mode',
    'Power IP cameras and access points from one desktop switch.', { tags: ['poe'] }),

  /* ── Security ── */
  P('security', 'Camera package', 'Hikvision', 'Hikvision 4 Camera IP CCTV Package', 21990, 28000, 'camera',
    'Cameras: 4x Hikvision DS-2CD1T23G0-I 2MP; Recorder: 4-channel NVR; Storage: 500GB HDD',
    'A ready CCTV kit for a home or shop, with remote viewing on your phone.', { featured: true, deal: true, tags: ['cctv', 'hikvision'] }),
  P('security', 'IP camera', 'Hikvision', 'Hikvision DS-2CD1T23G0-I 2MP Bullet IP Camera', 3465, 0, 'camera',
    'Sensor: 1/2.8" CMOS; Resolution: 2MP 1080p @30fps; Lens: 4mm F2.0; IR: Up to 50 m',
    'Outdoor 1080p camera with 50 m night vision.', { tags: ['ip camera'] }),

  /* ── Camera ── */
  P('camera', 'Mirrorless', 'Sony', 'Sony ZV-E10 II with 16-50mm Lens', 109375, 125000, 'dslr',
    'Sensor: 26MP APS-C Exmor R; Video: 4K 60p, 1080p 120p; Screen: 3" vari-angle touchscreen, vertical video support',
    'A creator camera for YouTube, reels and product shots.', { featured: true, tags: ['vlog', 'sony'] }),
  P('camera', 'Mirrorless', 'Canon', 'Canon EOS R50 with 18-45mm Lens', 74520, 90000, 'dslr',
    'Sensor: 24.2MP APS-C CMOS; Processor: DIGIC X; Video: 4K 30p; Autofocus: Dual Pixel CMOS AF II',
    'Light, simple mirrorless camera to step up from a phone.', { deal: true, tags: ['canon'] }),
  P('camera', 'Gimbal', 'DJI', 'DJI Osmo Mobile 8', 13499, 14999, 'gimbal',
    'Battery: 3350mAh; Connectivity: Bluetooth 5.3; Features: Built-in tripod, magnetic phone clamp, subject tracking',
    'Smooth phone video with automatic tracking.', { tags: ['dji', 'gimbal'] }),

  /* ── Printers ── */
  P('printer', 'Laser printer', 'HP', 'HP LaserJet Pro 4003dw', 41000, 42000, 'printer',
    'Function: Print; Speed: Up to 40 ppm (A4); Duty cycle: Up to 80,000 pages/month; Connectivity: Wi-Fi, LAN, USB',
    'Fast duplex office laser printer with Wi-Fi.', { tags: ['hp', 'laser'] }),
  P('printer', 'Ink tank printer', 'Epson', 'Epson EcoTank L3250 Wi-Fi All-in-One', 22000, 22500, 'printer',
    'Functions: Print, scan, copy; Connectivity: Wi-Fi; Printing: Borderless up to 4R',
    'Low-cost-per-page colour printing for home and small office.', { tags: ['epson', 'ink tank'] }),

  /* ── Accessories ── */
  P('accessories', 'Power bank', 'Anker', 'Anker Zolo 10000mAh 30W Power Bank (built-in USB-C)', 3500, 3799, 'powerbank',
    'Capacity: 10000mAh; Output: 30W fast charging; Interface: Built-in USB-C cable',
    'Pocket power bank that fast-charges an iPhone or Android.', { tags: ['anker', 'power bank'] }),
  P('accessories', 'Charger', 'Baseus', 'Baseus GaN5 Pro 65W Slim Charger', 4100, 4399, 'charger',
    'Output: 65W; Ports: 1x USB-C, 1x USB-A; Design: Ultra-slim, foldable',
    'One slim charger for a laptop and a phone.', { tags: ['gan', 'charger'] }),
  P('accessories', 'Memory card', 'SanDisk', 'SanDisk Extreme PRO 128GB SDXC 200MB/s', 5200, 0, 'storage',
    'Capacity: 128GB; Class: UHS-I, V30, U3; Read: Up to 200MB/s',
    'Fast SD card for 4K video and burst photos.', { tags: ['sandisk', 'sd card'] }),
];

export const BRANDS_FEATURED = ['Apple', 'Samsung', 'Sony', 'ASUS', 'Lenovo', 'Xiaomi', 'Ubiquiti', 'Starlink', 'Hikvision', 'JBL', 'Marshall', 'Nintendo'];

// Curated items sit in the same taxonomy as the price list.
const MOVE = { wearable: 'gadget', camera: 'gadget' };
const PRICE_FIX = { 'Starlink Standard Kit': [49500, 0], 'Starlink Mini Kit': [26500, 0] };
export const PRODUCTS = RAW.map((p) => {
  const fix = PRICE_FIX[p.name];
  return { ...p, categoryId: MOVE[p.categoryId] || p.categoryId, ...(fix ? { price: fix[0], originalPrice: fix[1] } : {}) };
});
