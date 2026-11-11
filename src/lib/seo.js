// Per-page search and social tags. The SEO build step (scripts/seo-build.mjs) writes the same
// tags into static HTML for every main page, so crawlers see them before any script runs.
import { useEffect } from 'react';

export const SITE_URL = 'https://decibel-114.com';
export const SITE_NAME = 'Decibel-114';
export const DEFAULT_DESC = 'Decibel-114: Apple, laptops, phones, networking, security and IT solutions in Bangladesh. Genuine products with official warranty, delivery across Bangladesh, and enterprise IT and smart agriculture solutions.';
export const DEFAULT_IMAGE = SITE_URL + '/brand/logo-navy.png';
/** Canonical URL: GitHub Pages serves every page as a folder, so inner pages end with a slash. */
export const canonical = (path = '/') => SITE_URL + (path === '/' ? '/' : path.replace(/\/?$/, '/'));

function meta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
function link(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
  el.setAttribute('href', href);
}

/** Sets title, description, canonical, Open Graph/Twitter tags and optional JSON-LD for the page. */
export function useSeo({ title, description, path, image, keywords, jsonLd } = {}) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : '';
  useEffect(() => {
    const full = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Apple, gadgets and network gear in Bangladesh`;
    const desc = description || DEFAULT_DESC;
    const url = canonical(path || location.pathname);
    document.title = full;
    meta('name', 'description', desc);
    if (keywords) meta('name', 'keywords', keywords);
    link('canonical', url);
    meta('property', 'og:title', full);
    meta('property', 'og:description', desc);
    meta('property', 'og:url', url);
    meta('property', 'og:image', image || DEFAULT_IMAGE);
    meta('name', 'twitter:title', full);
    meta('name', 'twitter:description', desc);
    meta('name', 'twitter:image', image || DEFAULT_IMAGE);
    let s = document.getElementById('page-ld');
    if (ld) {
      if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'page-ld'; document.head.appendChild(s); }
      s.textContent = ld;
    } else if (s) s.remove();
  }, [title, description, path, image, keywords, ld]);
}

export const abs = (u) => (!u ? undefined : u.startsWith('http') ? u : SITE_URL + (u.startsWith('/') ? u : '/' + u));

/** schema.org Product, shared by the live page and the static SEO build. */
export function productLd(p) {
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.id,
    image: (p.images || []).slice(0, 3).map(abs).filter(Boolean),
    description: String(p.description || p.shortDescription || p.name).slice(0, 500),
    brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
    url: canonical(`/product/${p.slug}`),
  };
  if (p.price > 0) {
    ld.offers = { '@type': 'Offer', priceCurrency: 'BDT', price: p.price, url: ld.url, itemCondition: 'https://schema.org/NewCondition',
      availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/BackOrder', seller: { '@type': 'Organization', name: SITE_NAME } };
  }
  return ld;
}

export function serviceLd(seg) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Service', name: seg.eyebrow, serviceType: seg.services.map((s) => s.t), description: seg.seoDescription,
        provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL }, areaServed: { '@type': 'Country', name: 'Bangladesh' }, url: canonical(seg.path),
        hasOfferCatalog: { '@type': 'OfferCatalog', name: seg.servicesTitle, itemListElement: seg.services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.t, description: s.d } })) } },
      { '@type': 'FAQPage', mainEntity: seg.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' }, { '@type': 'ListItem', position: 2, name: seg.eyebrow.replace('Decibel-114 ', ''), item: canonical(seg.path) }] },
    ],
  };
}
