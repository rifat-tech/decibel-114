import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuArrowRight, LuCheck, LuChevronDown, LuMessageCircle, LuPhone, LuServer, LuShoppingBag, LuSprout,
  LuBuilding2, LuBadgeCheck, LuWrench, LuHeadphones, LuDroplets, LuActivity, LuSun, LuUsers,
} from 'react-icons/lu';
import { useCatalog } from '../context/StoreContext';
import { AGRICULTURE, IT_SOLUTIONS, SEGMENTS, unsplash } from '../segments';
import { serviceLd, useSeo } from '../lib/seo';
import { telHref, waLink } from '../config';

const ICON = { products: LuShoppingBag, it: LuServer, agri: LuSprout };
const WHY_ICONS = { it: [LuUsers, LuBadgeCheck, LuWrench, LuHeadphones], agri: [LuDroplets, LuActivity, LuSun, LuHeadphones] };
const quoteFor = (what) => `/quote?items=${encodeURIComponent(`${what}: project enquiry`)}`;

function Img({ id, alt, w = 900, className = '', eager }) {
  return (
    <img className={className} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async"
      src={unsplash(id, w)} srcSet={`${unsplash(id, Math.round(w / 2))} ${Math.round(w / 2)}w, ${unsplash(id, w)} ${w}w, ${unsplash(id, w * 2)} ${w * 2}w`}
      sizes={w >= 1600 ? '(min-width: 960px) 100vw, 200vw' : '(min-width: 1100px) 400px, (min-width: 700px) 50vw, 100vw'} />
  );
}

function Faq({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="segp-faq">
      {items.map(([q, a], i) => (
        <div key={q} className={`segp-faq-item ${open === i ? 'open' : ''}`}>
          <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}><span>{q}</span><LuChevronDown /></button>
          {open === i && <p>{a}</p>}
        </div>
      ))}
    </div>
  );
}

function SegmentPage({ data, name }) {
  const { settings } = useCatalog();
  useSeo({ title: data.seoTitle, description: data.seoDescription, keywords: data.keywords, path: data.path, image: unsplash(data.hero, 1200), jsonLd: serviceLd(data) });
  const wa = waLink(settings?.whatsapp || settings?.phone, `Hello Decibel-114, I would like to discuss ${name}.`);
  const others = SEGMENTS.filter((s) => s.id !== data.id);
  const whyIcons = WHY_ICONS[data.id];

  return (
    <div className={`segpage segpage-${data.id}`}>
      <section className="segp-hero">
        <Img id={data.hero} alt="" w={1920} className="segp-hero-img" eager />
        <div className="segp-hero-shade" />
        <div className="container segp-hero-in">
          <span className="segp-eyebrow">{data.eyebrow}</span>
          <h1>{data.title}</h1>
          <p>{data.intro}</p>
          <div className="segp-cta">
            <Link to={quoteFor(name)} className="ap-btn">Request a consultation</Link>
            {wa && <a href={wa} target="_blank" rel="noreferrer" className="segp-ghost"><LuMessageCircle /> WhatsApp us</a>}
            {settings?.phone && <a href={telHref(settings.phone)} className="segp-ghost"><LuPhone /> {settings.phone}</a>}
          </div>
          <ul className="segp-trust">{data.trust.map((t) => <li key={t}><LuCheck /> {t}</li>)}</ul>
        </div>
      </section>

      <section className="container segp-sec">
        <div className="segp-head">
          <h2>{data.servicesTitle}</h2>
          <p>{data.servicesIntro}</p>
        </div>
        <div className="segp-grid">
          {data.services.map((s) => (
            <article key={s.t} className="segp-card">
              <div className="segp-card-media"><Img id={s.img} alt={s.t} /></div>
              <div className="segp-card-body">
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                <ul>{s.inc.map((x) => <li key={x}><LuCheck /> {x}</li>)}</ul>
                <div className="segp-card-foot">
                  <div className="segp-price"><small>Price</small><b>TBA</b></div>
                  <Link to={quoteFor(s.t)} className="segp-quote">Get a quote <LuArrowRight /></Link>
                </div>
                {s.cat && <Link to={`/shop?cat=${s.cat}`} className="segp-shop">Browse related products</Link>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="segp-band">
        <div className="container">
          <div className="segp-head"><h2>Why Decibel-114.</h2></div>
          <div className="segp-why">
            {data.why.map(([t, d], i) => { const I = whyIcons[i]; return (
              <div key={t}><span className="segp-why-ico"><I /></span><h3>{t}</h3><p>{d}</p></div>
            ); })}
          </div>
        </div>
      </section>

      <section className="container segp-sec">
        <div className="segp-head"><h2>How we work.</h2></div>
        <ol className="segp-steps">
          {data.steps.map(([t, d], i) => <li key={t}><span>{String(i + 1).padStart(2, '0')}</span><b>{t}</b><p>{d}</p></li>)}
        </ol>
      </section>

      <section className="container segp-sec">
        <div className="segp-head"><h2>{data.industriesTitle}</h2></div>
        <ul className="segp-chips">{data.industries.map((x) => <li key={x}><LuBuilding2 /> {x}</li>)}</ul>
        {data.brands.length > 0 && (
          <>
            <div className="segp-head segp-head-sub"><h2>{data.brandsTitle}</h2></div>
            <ul className="segp-brands notranslate" translate="no">{data.brands.map((b) => <li key={b}>{b}</li>)}</ul>
          </>
        )}
      </section>

      <section className="container segp-sec">
        <div className="segp-faq-wrap">
          <div className="segp-head"><h2>Questions, answered.</h2><p>Anything else? Our team is a message away.</p></div>
          <Faq items={data.faq} />
        </div>
      </section>

      <section className="container segp-sec">
        <div className="segp-final">
          <Img id={data.ctaImage} alt="" w={1600} className="segp-final-img" />
          <div className="segp-final-shade" />
          <div className="segp-final-in">
            <h2>Let’s plan your project.</h2>
            <p>Tell us what you need. We will visit, assess and send a clear proposal.</p>
            <div className="segp-cta">
              <Link to={quoteFor(name)} className="ap-btn">Request a consultation</Link>
              {wa && <a href={wa} target="_blank" rel="noreferrer" className="segp-ghost"><LuMessageCircle /> WhatsApp us</a>}
            </div>
          </div>
        </div>
      </section>

      <section className="container segp-sec segp-last">
        <div className="segp-head"><h2>Also at Decibel-114.</h2></div>
        <div className="segp-others">
          {others.map((s) => { const Icon = ICON[s.id]; return (
            <Link key={s.id} to={s.to} className={`segp-other seg-${s.id}`}>
              <span className="seg-ico"><Icon /></span>
              <span><b>{s.title}</b><small>{s.sub}</small></span>
              <LuArrowRight />
            </Link>
          ); })}
        </div>
      </section>
    </div>
  );
}

export const ITSolutions = () => <SegmentPage data={IT_SOLUTIONS} name="IT Solutions" />;
export const Agriculture = () => <SegmentPage data={AGRICULTURE} name="Agriculture" />;
