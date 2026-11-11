// SEO build: run after `vite build`. Writes a static HTML file for every main page and every
// product (title, description, canonical, Open Graph, JSON-LD and readable fallback content),
// plus sitemap.xml and robots.txt. Pages then return HTTP 200 with real content for crawlers;
// the React app takes over as soon as it loads.
// Usage: node scripts/seo-build.mjs <outDir>
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';

const out = path.resolve(process.argv[2] || 'dist');
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { PRODUCTS, CATEGORIES } = await vite.ssrLoadModule('/src/lib/catalog.js');
const { IT_SOLUTIONS, AGRICULTURE, unsplash } = await vite.ssrLoadModule('/src/segments.js');
const { SITE_URL, SITE_NAME, DEFAULT_DESC, DEFAULT_IMAGE, canonical, productLd, serviceLd, abs } = await vite.ssrLoadModule('/src/lib/seo.js');
await vite.close();

const IMG_CDN = 'https://e4b4vq9ke3.tenbytecdn.com/image/cache/catalog/';
const list = JSON.parse(fs.readFileSync('public/catalog.json', 'utf8')).products
  .map((p) => ({ ...p, images: (p.images || []).map((u) => (u.startsWith('~') ? IMG_CDN + u.slice(1) : u)) }));
const bySlug = new Map();
for (const p of [...list, ...PRODUCTS]) if (p.slug && p.status !== 'hidden') bySlug.set(p.slug, p); // curated wins
const products = [...bySlug.values()];
const catName = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name]));

const template = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const money = (n) => '৳' + Math.round(Number(n || 0)).toLocaleString('en-IN');
const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s\S*$/, '') + '…' : s; };

function page({ urlPath, title, description, image, keywords, ld, body, type = 'website' }) {
  const full = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Apple, gadgets and network gear in Bangladesh`;
  const url = canonical(urlPath);
  const head = [
    `<title>${esc(full)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    keywords ? `<meta name="keywords" content="${esc(keywords)}" />` : '',
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${esc(full)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${esc(image || DEFAULT_IMAGE)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(full)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(image || DEFAULT_IMAGE)}" />`,
    ...(ld ? [ld].flat().map((x, i) => `<script type="application/ld+json"${i === 0 ? ' id="page-ld"' : ''}>${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`) : []),
  ].filter(Boolean).join('\n    ');
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/\s*<meta name="description"[^>]*>/, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"><div class="seo-fallback">${body}</div></div>`);
  const file = urlPath === '/' ? path.join(out, 'index.html') : path.join(out, urlPath.replace(/^\//, ''), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  return url;
}

const nav = `<nav><a href="/">Home</a> · <a href="/shop">All products</a> · <a href="/it-solutions">IT Solutions</a> · <a href="/agriculture">Agriculture</a> · <a href="/deals">Deals</a> · <a href="/quote">Corporate quote</a></nav>`;
const catLinks = `<ul>${CATEGORIES.map((c) => `<li><a href="/shop?cat=${c.id}">${esc(c.name)}</a></li>`).join('')}</ul>`;
const urls = []; // [url, priority, changefreq]

// Home
const org = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': SITE_URL + '/#org', name: SITE_NAME, url: SITE_URL + '/', logo: SITE_URL + '/brand/logo-full.png',
      description: DEFAULT_DESC, areaServed: 'Bangladesh', address: { '@type': 'PostalAddress', addressLocality: 'Dhaka', addressCountry: 'BD' } },
    { '@type': 'WebSite', '@id': SITE_URL + '/#site', name: SITE_NAME, url: SITE_URL + '/', publisher: { '@id': SITE_URL + '/#org' },
      potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: SITE_URL + '/shop?q={search_term_string}' }, 'query-input': 'required name=search_term_string' } },
    { '@type': 'OnlineStore', name: SITE_NAME, url: SITE_URL + '/', parentOrganization: { '@id': SITE_URL + '/#org' }, currenciesAccepted: 'BDT', areaServed: 'Bangladesh' },
  ],
};
urls.push([page({ urlPath: '/', title: '', description: DEFAULT_DESC, ld: org,
  keywords: 'Decibel-114, tech shop Bangladesh, Apple Bangladesh, iPhone price in Bangladesh, laptop price in Bangladesh, networking products Bangladesh, Starlink Bangladesh, UniFi Bangladesh, IT solutions Dhaka, smart agriculture Bangladesh',
  body: `<h1>Decibel-114: Apple, laptops, phones, networking and IT solutions in Bangladesh</h1><p>${esc(DEFAULT_DESC)}</p>${nav}<h2>Shop by category</h2>${catLinks}` }), '1.0', 'daily']);

// Segment pages
for (const seg of [IT_SOLUTIONS, AGRICULTURE]) {
  const body = `<h1>${esc(seg.title)}</h1><p>${esc(seg.intro)}</p>${nav}<h2>${esc(seg.servicesTitle)}</h2>` +
    seg.services.map((s) => `<section><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p><ul>${s.inc.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><p>Price: TBA</p></section>`).join('') +
    `<h2>${esc(seg.industriesTitle)}</h2><ul>${seg.industries.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` +
    `<h2>Questions, answered</h2>${seg.faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}`;
  urls.push([page({ urlPath: seg.path, title: seg.seoTitle, description: seg.seoDescription, keywords: seg.keywords, image: unsplash(seg.hero, 1200), ld: serviceLd(seg), body }), '0.9', 'weekly']);
}

// Other store pages
const simple = [
  ['/shop', 'All products', 'Shop laptops, phones, Apple, monitors, networking, CCTV, printers, gaming and accessories in Bangladesh. Genuine products, official warranty and delivery across Bangladesh.', '0.9', 'daily'],
  ['/deals', 'Top deals', 'Current offers and discounted prices on laptops, phones, networking and electronics at Decibel-114 Bangladesh.', '0.8', 'daily'],
  ['/brand/apple', 'Apple store', 'iPhone, MacBook, iPad, Apple Watch, AirPods and accessories with official warranty in Bangladesh. Latest Apple prices at Decibel-114.', '0.9', 'daily'],
  ['/quote', 'Request a business quote', 'Corporate and bulk quotations for offices, ISPs, hotels, schools and projects in Bangladesh. Volume pricing, corporate invoice and installation.', '0.7', 'monthly'],
  ['/track', 'Track order', 'Track your Decibel-114 order.', '0.3', 'yearly'],
  ['/page/delivery', 'Delivery', 'Delivery charges and times inside and outside Dhaka for Decibel-114 orders.', '0.3', 'yearly'],
  ['/page/warranty', 'Warranty', 'How official brand warranty works for products bought from Decibel-114.', '0.3', 'yearly'],
  ['/page/returns', 'Returns and refunds', 'Return and refund policy for Decibel-114 orders.', '0.3', 'yearly'],
  ['/page/privacy', 'Privacy', 'How Decibel-114 handles your personal information.', '0.2', 'yearly'],
  ['/page/terms', 'Terms', 'Terms of sale at Decibel-114.', '0.2', 'yearly'],
];
for (const [p, t, d, pr, cf] of simple) {
  const extra = p === '/shop' ? `<h2>Categories</h2>${catLinks}` : '';
  urls.push([page({ urlPath: p, title: t, description: d, body: `<h1>${esc(t)}</h1><p>${esc(d)}</p>${nav}${extra}` }), pr, cf]);
}
for (const c of CATEGORIES) urls.push([`${SITE_URL}/shop?cat=${c.id}`, '0.8', 'daily']);

// Products
let n = 0;
for (const p of products) {
  const cat = catName[p.categoryId] || '';
  const specs = (p.specs || []).filter((x) => x.value).slice(0, 12);
  const desc = clip(`Buy ${p.name} in Bangladesh from Decibel-114. ${p.price ? `Price ${money(p.price)}. ` : ''}${p.shortDescription || specs.slice(0, 3).map((x) => x.value).join(', ')}. Official warranty, delivery across Bangladesh.`, 300);
  const title = clip(`${p.name}${p.price ? ' Price in Bangladesh' : ''}`, 110);
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
    ...(cat ? [{ '@type': 'ListItem', position: 2, name: cat, item: `${SITE_URL}/shop?cat=${p.categoryId}` }] : []),
    { '@type': 'ListItem', position: cat ? 3 : 2, name: p.name, item: canonical(`/product/${p.slug}`) }] };
  const body = `<nav><a href="/">Home</a>${cat ? ` › <a href="/shop?cat=${p.categoryId}">${esc(cat)}</a>` : ''}</nav>` +
    `<h1>${esc(p.name)}</h1>${p.images?.[0] ? `<img src="${esc(abs(p.images[0]))}" alt="${esc(p.name)}" width="400" height="400" />` : ''}` +
    `<p>${p.price ? `Price: ${money(p.price)}` : 'Price on request'}${p.brand ? ` · Brand: ${esc(p.brand)}` : ''}</p>` +
    (p.description ? `<p>${esc(clip(p.description, 1200))}</p>` : '') +
    (specs.length ? `<h2>Specifications</h2><ul>${specs.map((x) => `<li>${x.key ? `<b>${esc(x.key)}:</b> ` : ''}${esc(x.value)}</li>`).join('')}</ul>` : '');
  urls.push([page({ urlPath: `/product/${p.slug}`, title, description: desc, image: abs(p.images?.[0]), ld: [productLd(p), crumbs], body, type: 'product' }), p.price ? '0.7' : '0.5', 'weekly']);
  n++;
}

// sitemap + robots
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, pr, cf]) =>
  `  <url><loc>${esc(u)}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /cart\nDisallow: /checkout\nDisallow: /account\nDisallow: /login\nDisallow: /register\nDisallow: /saved\nDisallow: /compare\nDisallow: /order/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
// 404 fallback keeps the SPA working for any other URL, but tells crawlers not to index it.
fs.writeFileSync(path.join(out, '404.html'), template.replace('<head>', '<head>\n    <meta name="robots" content="noindex" />'));
console.log(`SEO: ${urls.length} URLs in sitemap, ${n} product pages`);
