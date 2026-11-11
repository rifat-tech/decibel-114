// Admin → Website content: the entry popup, the IT Solutions and Agriculture pages,
// the language button and the page colour. Saved to Firestore (settings/site, settings/solutions-*).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuArrowDown, LuArrowUp, LuChevronDown, LuExternalLink, LuPlus, LuRotateCcw, LuTrash2 } from 'react-icons/lu';
import { Field, Spinner, useTitle } from '../../components/ui';
import { errText, getContent, resetContent, saveContent } from '../../lib/db';
import { sizeKB } from '../../lib/media';
import { useStore } from '../../context/StoreContext';
import { slugify } from '../../config';
import { ImageField, LinesField, PairsField, move } from './AdminFields';

const TABS = [['site', 'Popup, languages & colour'], ['it', 'IT Solutions page'], ['agri', 'Agriculture page']];
const LANGS = [['zh-CN', 'Chinese (中文)'], ['ru', 'Russian (Русский)']];
const LIMIT_KB = 900; // a Firestore document can hold 1 MB

export default function Content() {
  useTitle('Website content');
  const { reloadContent, categories } = useStore();
  const [c, setC] = useState(null);
  const [tab, setTab] = useState('site');
  const [busy, setBusy] = useState(false);
  useEffect(() => { getContent().then(setC); }, []);
  if (!c) return <Spinner />;

  const kb = sizeKB(c[tab]);
  const save = async () => {
    if (kb > LIMIT_KB) return toast.error(`This page is ${kb} KB, over the ${LIMIT_KB} KB limit. Use image links instead of uploads for a few photos.`);
    setBusy(true);
    try { await saveContent(tab, c[tab]); await reloadContent(); toast.success('Saved. The website shows it now.'); } catch (e) { toast.error(errText(e)); } finally { setBusy(false); }
  };
  const reset = async () => {
    if (!window.confirm('Go back to the original text and photos for this section? Your edits here will be lost.')) return;
    setBusy(true);
    try { await resetContent(tab); const fresh = await getContent(); setC(fresh); await reloadContent(); toast.success('Back to the original'); } catch (e) { toast.error(errText(e)); } finally { setBusy(false); }
  };
  const update = (key) => (patch) => setC((cur) => ({ ...cur, [key]: { ...cur[key], ...patch } }));
  const view = tab === 'it' ? '/it-solutions' : tab === 'agri' ? '/agriculture' : '/';

  return (
    <div className="admin-page">
      <div className="page-head">
        <div><h1>Website content</h1><p className="muted">Edit the entry popup, the solution pages, the language button and the page colour. Changes show on the website as soon as you save.</p></div>
        <div className="row-gap">
          <a className="btn btn-ghost" href={view} target="_blank" rel="noreferrer"><LuExternalLink /> View</a>
          <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
        </div>
      </div>
      <div className="seg scroll">{TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>

      {tab === 'site' && <SiteEditor v={c.site} set={update('site')} c={c} />}
      {(tab === 'it' || tab === 'agri') && <SegmentEditor v={c[tab]} set={update(tab)} categories={categories} />}

      <div className="content-foot">
        <span className={`muted small ${kb > LIMIT_KB ? 'error-text' : ''}`}>Size of this section: {kb} KB of {LIMIT_KB} KB</span>
        <button className="btn btn-ghost btn-sm" onClick={reset} disabled={busy}><LuRotateCcw /> Restore original</button>
      </div>
    </div>
  );
}

function SiteEditor({ v, set, c }) {
  const popup = v.popup, langs = v.languages, theme = v.theme;
  const setPopup = (patch) => set({ popup: { ...popup, ...patch } });
  const setOpt = (i, k, val) => setPopup({ options: popup.options.map((o, j) => (j === i ? { ...o, [k]: val } : o)) });
  const setLang = (patch) => set({ languages: { ...langs, ...patch } });
  return (
    <>
      <section className="panel narrow-panel">
        <h2>Entry popup</h2>
        <label className="check big"><input type="checkbox" checked={popup.enabled !== false} onChange={(e) => setPopup({ enabled: e.target.checked })} /> Show the popup when someone opens the website</label>
        <p className="muted small">It appears once per visit. Choosing Products keeps the visitor on the page they opened.</p>
        <div className="grid-2">
          <Field label="Heading"><input value={popup.title} onChange={(e) => setPopup({ title: e.target.value })} /></Field>
          <Field label="Line under the heading"><input value={popup.lead} onChange={(e) => setPopup({ lead: e.target.value })} /></Field>
        </div>
        {popup.options.map((o, i) => (
          <div key={o.id} className="grid-2 opt-row">
            <Field label={`Option ${i + 1} name`} hint={o.id === 'products' ? 'Opens the store' : o.id === 'it' ? 'Opens the IT Solutions page' : 'Opens the Agriculture page'}><input value={o.title} onChange={(e) => setOpt(i, 'title', e.target.value)} /></Field>
            <Field label="Description"><input value={o.sub} onChange={(e) => setOpt(i, 'sub', e.target.value)} /></Field>
          </div>
        ))}
        <p className="muted small">An option is hidden automatically when its page is switched off{c.it.enabled === false || c.agri.enabled === false ? ' (one page is off right now)' : ''}.</p>
      </section>

      <section className="panel narrow-panel">
        <h2>Language button</h2>
        <label className="check big"><input type="checkbox" checked={langs.enabled !== false} onChange={(e) => setLang({ enabled: e.target.checked })} /> Show the blinking language button in the header</label>
        <p className="muted small">English is always the default. The page is translated automatically by Google Translate.</p>
        {LANGS.map(([code, name]) => (
          <label key={code} className="check"><input type="checkbox" checked={(langs.list || []).includes(code)}
            onChange={(e) => setLang({ list: e.target.checked ? [...new Set([...(langs.list || []), code])] : (langs.list || []).filter((x) => x !== code) })} /> {name}</label>
        ))}
      </section>

      <section className="panel narrow-panel">
        <h2>Page colour</h2>
        <p className="muted small">The background behind the white cards. Keep it very light so text stays easy to read.</p>
        <div className="row-gap">
          <input type="color" value={theme.bg} onChange={(e) => set({ theme: { ...theme, bg: e.target.value } })} aria-label="Background colour" />
          <input value={theme.bg} onChange={(e) => set({ theme: { ...theme, bg: e.target.value } })} style={{ maxWidth: 120 }} />
          {[['#EEF4FA', 'Sky'], ['#F5F5F7', 'Grey'], ['#F2F7F2', 'Mint'], ['#FAF6EF', 'Cream'], ['#FFFFFF', 'White']].map(([hex, n]) => (
            <button key={hex} type="button" className="swatch" style={{ background: hex }} onClick={() => set({ theme: { ...theme, bg: hex } })} title={n} aria-label={n} />
          ))}
        </div>
      </section>
    </>
  );
}

function SegmentEditor({ v, set, categories }) {
  const [open, setOpen] = useState(-1);
  const services = v.services || [];
  const setSvc = (i, patch) => set({ services: services.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const addSvc = () => { set({ services: [...services, { t: '', slug: '', d: '', inc: [], img: '', price: 'TBA' }] }); setOpen(services.length); };
  return (
    <>
      <section className="panel narrow-panel">
        <label className="check big"><input type="checkbox" checked={v.enabled !== false} onChange={(e) => set({ enabled: e.target.checked })} /> Show this page on the website</label>
        <p className="muted small">When off, the page, its menu links and its popup option are hidden.</p>
      </section>

      <section className="panel narrow-panel">
        <h2>Top of the page</h2>
        <div className="grid-2">
          <Field label="Small label above the heading"><input value={v.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} /></Field>
          <Field label="Heading"><input value={v.title} onChange={(e) => set({ title: e.target.value })} /></Field>
        </div>
        <Field label="Introduction"><textarea rows={3} value={v.intro} onChange={(e) => set({ intro: e.target.value })} /></Field>
        <ImageField label="Large background photo" kind="hero" value={v.hero} onChange={(hero) => set({ hero })} hint="Wide photo, at least 1600 px across." />
        <LinesField label="Ticks under the buttons" value={v.trust} onChange={(trust) => set({ trust })} rows={4} />
      </section>

      <section className="panel">
        <div className="page-head small-head"><div><h2>Services</h2><p className="muted small">Each service is a card with a photo, a description, what is included and a price.</p></div></div>
        <div className="grid-2">
          <Field label="Section heading"><input value={v.servicesTitle} onChange={(e) => set({ servicesTitle: e.target.value })} /></Field>
          <Field label="Section introduction"><input value={v.servicesIntro} onChange={(e) => set({ servicesIntro: e.target.value })} /></Field>
        </div>
        <div className="svc-list">
          {services.map((s, i) => (
            <div key={i} className={`svc-item ${open === i ? 'open' : ''}`}>
              <div className="svc-head">
                <button type="button" className="svc-toggle" onClick={() => setOpen(open === i ? -1 : i)}>
                  {s.img ? <img src={imgSrcSafe(s.img)} alt="" /> : <span className="svc-noimg" />}
                  <span><b>{s.t || 'New service'}</b><small>Price: {s.price || 'TBA'}</small></span>
                  <LuChevronDown />
                </button>
                <div className="pair-tools">
                  <button type="button" className="icon-btn" onClick={() => set({ services: move(services, i, -1) })} aria-label="Move up" disabled={!i}><LuArrowUp /></button>
                  <button type="button" className="icon-btn" onClick={() => set({ services: move(services, i, 1) })} aria-label="Move down" disabled={i === services.length - 1}><LuArrowDown /></button>
                  <button type="button" className="icon-btn" onClick={() => window.confirm(`Remove “${s.t || 'this service'}”?`) && set({ services: services.filter((_, j) => j !== i) })} aria-label="Remove"><LuTrash2 /></button>
                </div>
              </div>
              {open === i && (
                <div className="svc-body">
                  <div className="grid-2">
                    <Field label="Service name"><input value={s.t} onChange={(e) => setSvc(i, { t: e.target.value, slug: !s.slug || s.slug === slugify(s.t) ? slugify(e.target.value) : s.slug })} /></Field>
                    <Field label="Price" hint="Write TBA, a figure like ৳25,000, or From ৳15,000."><input value={s.price ?? 'TBA'} onChange={(e) => setSvc(i, { price: e.target.value })} /></Field>
                  </div>
                  <Field label="Description"><textarea rows={3} value={s.d} onChange={(e) => setSvc(i, { d: e.target.value })} /></Field>
                  <LinesField label="What is included" value={s.inc} onChange={(inc) => setSvc(i, { inc })} rows={4} hint="One item per line." />
                  <ImageField label="Photo" value={s.img} onChange={(img) => setSvc(i, { img })} />
                  <div className="grid-2">
                    <Field label="Related product category" hint="Adds a “Browse related products” link."><select value={s.cat || ''} onChange={(e) => setSvc(i, { cat: e.target.value })}><option value="">None</option>{categories.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}</select></Field>
                    <Field label="Web address part" hint="Used in links like /it-solutions#this-part."><input value={s.slug || ''} onChange={(e) => setSvc(i, { slug: slugify(e.target.value) })} /></Field>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-ghost" onClick={addSvc}><LuPlus /> Add service</button>
      </section>

      <section className="panel narrow-panel">
        <PairsField label="Why Decibel-114 (up to 4 reads best)" value={v.why} onChange={(why) => set({ why })} titleLabel="Reason" textLabel="One sentence" addLabel="Add reason" />
      </section>
      <section className="panel narrow-panel">
        <PairsField label="How we work (steps)" value={v.steps} onChange={(steps) => set({ steps })} titleLabel="Step" textLabel="One sentence" addLabel="Add step" />
      </section>
      <section className="panel narrow-panel">
        <Field label="Industries heading"><input value={v.industriesTitle} onChange={(e) => set({ industriesTitle: e.target.value })} /></Field>
        <LinesField label="Industries" value={v.industries} onChange={(industries) => set({ industries })} rows={6} />
        <Field label="Brands heading"><input value={v.brandsTitle} onChange={(e) => set({ brandsTitle: e.target.value })} /></Field>
        <LinesField label="Brands" value={v.brands} onChange={(brands) => set({ brands })} rows={5} />
      </section>
      <section className="panel narrow-panel">
        <PairsField label="Questions and answers" value={v.faq} onChange={(faq) => set({ faq })} titleLabel="Question" textLabel="Answer" addLabel="Add question" long />
      </section>

      <section className="panel narrow-panel">
        <h2>Bottom banner</h2>
        <ImageField label="Photo behind “Let’s plan your project”" kind="hero" value={v.ctaImage} onChange={(ctaImage) => set({ ctaImage })} />
      </section>

      <section className="panel narrow-panel">
        <h2>Google search</h2>
        <p className="muted small">How this page appears in Google results. <Link to="/admin/settings">Store details</Link> are used for the rest of the site.</p>
        <Field label="Search title" hint={`${(v.seoTitle || '').length} characters. About 60 shows in full.`}><input value={v.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} /></Field>
        <Field label="Search description" hint={`${(v.seoDescription || '').length} characters. About 155 shows in full.`}><textarea rows={3} value={v.seoDescription} onChange={(e) => set({ seoDescription: e.target.value })} /></Field>
        <Field label="Keywords" hint="Comma-separated."><textarea rows={2} value={v.keywords} onChange={(e) => set({ keywords: e.target.value })} /></Field>
      </section>
    </>
  );
}

const imgSrcSafe = (v) => (/^photo-/.test(v) ? `https://images.unsplash.com/${v}?auto=format&fit=crop&w=120&q=60` : v);
