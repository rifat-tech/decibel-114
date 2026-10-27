import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { LuPlus, LuTrash2, LuArrowUp } from 'react-icons/lu';
import DeviceArt, { ART_TYPES } from '../../components/DeviceArt';
import { Field, Spinner, useTitle } from '../../components/ui';
import { errText, getSettings, rid, saveSettings } from '../../lib/db';
import { useStore } from '../../context/StoreContext';

const TABS = [['store', 'Store details'], ['delivery', 'Delivery & payment'], ['banners', 'Home banners'], ['ai', 'AI assistant']];

export default function Settings() {
  useTitle('Store settings');
  const { reloadSettings } = useStore();
  const [s, setS] = useState(null);
  const [tab, setTab] = useState('store');
  const [busy, setBusy] = useState(false);
  useEffect(() => { getSettings().then(setS); }, []);
  if (!s) return <Spinner />;
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });
  const setNum = (k) => (e) => setS({ ...s, [k]: Number(e.target.value.replace(/\D/g, '')) || 0 });
  const setAi = (k) => (e) => setS({ ...s, ai: { ...s.ai, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value } });
  const setBanner = (i, k, v) => setS({ ...s, banners: s.banners.map((b, j) => (j === i ? { ...b, [k]: v } : b)) });
  const save = async () => {
    setBusy(true);
    try { await saveSettings(s); await reloadSettings(); toast.success('Settings saved'); } catch (e) { toast.error(errText(e)); } finally { setBusy(false); }
  };

  return (
    <div className="admin-page">
      <div className="page-head"><div><h1>Store settings</h1><p className="muted">Changes show on the website as soon as you save.</p></div><button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></div>
      <div className="seg scroll">{TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>

      {tab === 'store' && (
        <section className="panel narrow-panel">
          <div className="grid-2">
            <Field label="Store name"><input value={s.storeName} onChange={set('storeName')} /></Field>
            <Field label="Tagline"><input value={s.tagline} onChange={set('tagline')} /></Field>
            <Field label="Phone"><input value={s.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" /></Field>
            <Field label="WhatsApp number" hint="Leave empty to use the phone number."><input value={s.whatsapp} onChange={set('whatsapp')} /></Field>
            <Field label="Email"><input type="email" value={s.email} onChange={set('email')} /></Field>
            <Field label="Opening hours"><input value={s.hours} onChange={set('hours')} /></Field>
          </div>
          <Field label="Shop address"><textarea rows={2} value={s.address} onChange={set('address')} /></Field>
        </section>
      )}

      {tab === 'delivery' && (
        <section className="panel narrow-panel">
          <div className="grid-2">
            <Field label="Delivery inside Dhaka (৳)"><input inputMode="numeric" value={s.shippingInsideDhaka} onChange={setNum('shippingInsideDhaka')} /></Field>
            <Field label="Delivery outside Dhaka (৳)"><input inputMode="numeric" value={s.shippingOutsideDhaka} onChange={setNum('shippingOutsideDhaka')} /></Field>
            <Field label="Free delivery from (৳)" hint="0 turns free delivery off."><input inputMode="numeric" value={s.freeShippingOver} onChange={setNum('freeShippingOver')} /></Field>
            <Field label="Return window (days)"><input inputMode="numeric" value={s.returnDays} onChange={setNum('returnDays')} /></Field>
          </div>
          <h2>Payment methods</h2>
          <p className="muted small">Cash on delivery is always on. Fill a method to offer it at checkout. Use “|” for a new line.</p>
          <Field label="bKash"><input value={s.bkash} onChange={set('bkash')} placeholder="01XXXXXXXXX (Merchant)|Use your order number as reference" /></Field>
          <Field label="Nagad"><input value={s.nagad} onChange={set('nagad')} /></Field>
          <Field label="Bank transfer"><input value={s.bank} onChange={set('bank')} placeholder="Bank: …|A/C name: …|A/C no: …|Branch: …" /></Field>
        </section>
      )}

      {tab === 'banners' && (
        <section className="panel">
          <p className="muted">The large rotating banners at the top of the home page.</p>
          {s.banners.map((b, i) => (
            <div key={b.id} className="banner-edit">
              <div className={`banner-preview tone-${b.tone}`}>{b.image ? <img src={b.image} alt="" /> : <DeviceArt type={b.art} />}</div>
              <div className="banner-fields">
                <div className="grid-2">
                  <Field label="Headline"><input value={b.title} onChange={(e) => setBanner(i, 'title', e.target.value)} /></Field>
                  <Field label="Button text"><input value={b.cta} onChange={(e) => setBanner(i, 'cta', e.target.value)} /></Field>
                </div>
                <Field label="Sentence"><input value={b.text} onChange={(e) => setBanner(i, 'text', e.target.value)} /></Field>
                <div className="grid-2">
                  <Field label="Link"><input value={b.link} onChange={(e) => setBanner(i, 'link', e.target.value)} placeholder="/shop?cat=phone" /></Field>
                  <Field label="Colour"><select value={b.tone} onChange={(e) => setBanner(i, 'tone', e.target.value)}><option value="blue">Blue</option><option value="ink">Dark</option><option value="yellow">Yellow</option><option value="light">Light</option></select></Field>
                  <Field label="Picture"><select value={b.art} onChange={(e) => setBanner(i, 'art', e.target.value)}>{ART_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
                  <Field label="Or image link"><input value={b.image || ''} onChange={(e) => setBanner(i, 'image', e.target.value)} placeholder="https://…" /></Field>
                </div>
                <div className="row-gap">
                  {i > 0 && <button className="btn btn-ghost btn-sm" onClick={() => { const a = [...s.banners]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; setS({ ...s, banners: a }); }}><LuArrowUp /> Move up</button>}
                  <button className="btn btn-ghost btn-sm" onClick={() => setS({ ...s, banners: s.banners.filter((_, j) => j !== i) })}><LuTrash2 /> Remove</button>
                </div>
              </div>
            </div>
          ))}
          <button className="btn btn-ghost" onClick={() => setS({ ...s, banners: [...s.banners, { id: rid(6), title: 'New banner', text: '', cta: 'Shop now', link: '/shop', tone: 'blue', art: 'phone' }] })}><LuPlus /> Add banner</button>
        </section>
      )}

      {tab === 'ai' && (
        <section className="panel narrow-panel">
          <label className="check big"><input type="checkbox" checked={!!s.ai.enabled} onChange={setAi('enabled')} /> Let the assistant answer chats first</label>
          <p className="muted small">When off, every chat goes straight to your team in the Inbox. The assistant uses Google Gemini through Firebase AI Logic and only sees the products related to each question.</p>
          <div className="grid-2">
            <Field label="Assistant name"><input value={s.ai.name} onChange={setAi('name')} /></Field>
            <Field label="Model" hint="Change only if Google retires this model."><input value={s.ai.model} onChange={setAi('model')} /></Field>
          </div>
          <Field label="Instructions" hint="Tone, language, what to promote, what never to promise."><textarea rows={6} value={s.ai.instructions} onChange={setAi('instructions')} /></Field>
        </section>
      )}
    </div>
  );
}
