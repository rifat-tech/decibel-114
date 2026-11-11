import { Link } from 'react-router-dom';
import { LuArrowRight, LuMessageCircle, LuPhone, LuServer, LuShoppingBag, LuSprout } from 'react-icons/lu';
import DeviceArt from '../components/DeviceArt';
import { useTitle } from '../components/ui';
import { useCatalog } from '../context/StoreContext';
import { AGRICULTURE, IT_SOLUTIONS, SEGMENTS } from '../segments';
import { money, telHref, waLink } from '../config';

const ICON = { products: LuShoppingBag, it: LuServer, agri: LuSprout };

function SegmentPage({ data, title }) {
  useTitle(title);
  const { products, settings } = useCatalog();
  const from = (cat) => { const ps = products.filter((p) => p.categoryId === cat && p.price > 0); return ps.length ? Math.min(...ps.map((p) => p.price)) : 0; };
  const quote = `/quote?items=${encodeURIComponent(`${title} enquiry`)}`;
  const wa = waLink(settings?.whatsapp || settings?.phone, `Hello Decibel-114, I am interested in ${title}.`);
  const others = SEGMENTS.filter((s) => s.id !== data.id);

  return (
    <div className={`segpage segpage-${data.id}`}>
      <section className="segp-hero">
        <div className="container">
          <span className="segp-eyebrow">{data.eyebrow}</span>
          <h1>{data.title}</h1>
          <p>{data.intro}</p>
          <div className="segp-cta">
            <Link to={quote} className="ap-btn">Talk to our team</Link>
            {settings?.phone && <a href={telHref(settings.phone)} className="segp-link"><LuPhone /> {settings.phone}</a>}
            {wa && <a href={wa} target="_blank" rel="noreferrer" className="segp-link"><LuMessageCircle /> WhatsApp</a>}
          </div>
        </div>
      </section>

      <section className="container segp-body">
        {data.services.length > 0 ? (
          <>
            <h2 className="segp-h2">What we do.</h2>
            <div className="segp-grid">
              {data.services.map((s) => (
                <article key={s.t} className="segp-card">
                  {s.art && <DeviceArt type={s.art} />}
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                  {s.cat && <Link to={`/shop?cat=${s.cat}`} className="link-strong">{from(s.cat) ? `Products from ${money(from(s.cat))}` : 'See products'}</Link>}
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="segp-soon">
            <span className="segp-soon-ico"><LuSprout /></span>
            <div><h2>Services coming soon.</h2><p>We are preparing the full list of what we offer here. Send us your requirement and our team will get back to you.</p></div>
            <Link to={quote} className="ap-btn">Send a requirement</Link>
          </div>
        )}

        {data.steps.length > 0 && (
          <>
            <h2 className="segp-h2">How it works.</h2>
            <ol className="segp-steps">
              {data.steps.map(([t, d], i) => <li key={t}><span>{String(i + 1).padStart(2, '0')}</span><b>{t}</b><p>{d}</p></li>)}
            </ol>
          </>
        )}

        <h2 className="segp-h2">Also at Decibel-114.</h2>
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

export const ITSolutions = () => <SegmentPage data={IT_SOLUTIONS} title="IT Solutions" />;
export const Agriculture = () => <SegmentPage data={AGRICULTURE} title="Agriculture" />;
