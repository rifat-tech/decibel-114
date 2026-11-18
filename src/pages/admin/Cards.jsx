// Admin → Digital cards: make and edit the team's digital visiting cards.
// Each card is a page at decibel-114.com/card/<link name> with a QR that holds the contact.
// Saved to Firestore settings/cards (public read, admin write).
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { LuCopy, LuExternalLink, LuPencil, LuPlus, LuTrash2, LuContact } from 'react-icons/lu';
import { Field, Spinner, useTitle } from '../../components/ui';
import { errText, getCards, saveCards } from '../../lib/db';
import { slugify } from '../../config';
import { CardFace, cardUrl, makeQr } from '../Card';

const BLANK = { slug: '', name: '', title: '', focus: [], phone: '', whatsapp: '', email: '', company: 'Decibel-114', website: 'https://decibel-114.com' };
// "01944…" or "8801944…" → "+8801944…"
const bdPhone = (p) => {
  const d = String(p || '').replace(/[^\d+]/g, '');
  if (!d) return '';
  if (d.startsWith('+')) return d;
  if (d.startsWith('880')) return '+' + d;
  if (d.startsWith('0')) return '+88' + d;
  return d;
};
const nameSlug = (n) => slugify(String(n || '').replace(/^md\.?\s+/i, ''));

export default function Cards() {
  useTitle('Digital cards');
  const [list, setList] = useState(null);
  const [edit, setEdit] = useState(null); // { i: index or -1 for new, v: card }
  const [busy, setBusy] = useState(false);
  const [qr, setQr] = useState('');

  useEffect(() => { getCards().then((l) => { setList(l); if (l[0]) setEdit({ i: 0, v: { ...BLANK, ...l[0] } }); }); }, []);
  const v = edit?.v;
  const slug = v ? (v.slug || nameSlug(v.name)) : '';
  useEffect(() => {
    if (!v) return;
    const t = setTimeout(() => makeQr({ ...v, phone: bdPhone(v.phone) }, cardUrl(slug || 'new')).then(setQr), 250);
    return () => clearTimeout(t);
  }, [v, slug]);
  const focusText = useMemo(() => (v?.focus || []).join(', '), [v]);

  if (!list) return <Spinner />;

  const set = (patch) => setEdit((e) => ({ ...e, v: { ...e.v, ...patch } }));
  const copy = async (s) => { try { await navigator.clipboard.writeText(cardUrl(s)); toast.success('Link copied'); } catch { toast.error('Could not copy'); } };

  const persist = async (next, msg) => {
    setBusy(true);
    try { await saveCards(next); setList(next); toast.success(msg); return true; }
    catch (e) { toast.error(errText(e)); return false; }
    finally { setBusy(false); }
  };

  const save = async () => {
    if (!v.name.trim()) return toast.error('Write the name');
    if (!v.phone.trim()) return toast.error('Write the phone number');
    const s = slugify(slug);
    if (!s) return toast.error('Write a link name');
    if (list.some((c, j) => c.slug === s && j !== edit.i)) return toast.error(`Another card already uses /card/${s}`);
    const card = {
      ...v, slug: s, name: v.name.trim(), title: v.title.trim(),
      phone: bdPhone(v.phone), whatsapp: (bdPhone(v.whatsapp) || bdPhone(v.phone)).replace(/\D/g, ''),
      email: v.email.trim(), focus: (v.focus || []).map((x) => x.trim()).filter(Boolean),
    };
    const next = edit.i === -1 ? [...list, card] : list.map((c, j) => (j === edit.i ? card : c));
    if (await persist(next, 'Saved. The card link works now.')) setEdit({ i: edit.i === -1 ? next.length - 1 : edit.i, v: card });
  };
  const remove = async (j) => {
    if (!window.confirm(`Delete the card for ${list[j].name}? Its link will stop working.`)) return;
    const next = list.filter((_, k) => k !== j);
    if (await persist(next, 'Card deleted')) setEdit(next[0] ? { i: 0, v: { ...BLANK, ...next[0] } } : null);
  };

  return (
    <div className="admin-page">
      <div className="page-head">
        <div><h1>Digital cards</h1><p className="muted">Digital visiting cards for the team. Send the link or the card image; anyone who scans the QR saves the contact on their phone.</p></div>
        <div className="row-gap">
          <button className="btn btn-primary" onClick={() => setEdit({ i: -1, v: { ...BLANK } })}><LuPlus /> New card</button>
        </div>
      </div>

      <div className="dc-layout">
        <section className="panel dc-list">
          <h2>Cards ({list.length})</h2>
          {list.length === 0 && <p className="muted">No cards yet. Click <b>New card</b>.</p>}
          {list.map((c, j) => (
            <div key={c.slug} className={`dc-item${edit?.i === j ? ' on' : ''}`}>
              <button className="dc-pick" onClick={() => setEdit({ i: j, v: { ...BLANK, ...c } })}>
                <LuContact />
                <span><b>{c.name}</b><small>{c.title}</small><small className="dc-link">/card/{c.slug}</small></span>
              </button>
              <div className="dc-acts">
                <a className="icon-btn" href={`/card/${c.slug}`} target="_blank" rel="noreferrer" title="Open card" aria-label={`Open ${c.name}'s card`}><LuExternalLink /></a>
                <button className="icon-btn" onClick={() => copy(c.slug)} title="Copy link" aria-label={`Copy link to ${c.name}'s card`}><LuCopy /></button>
                <button className="icon-btn" onClick={() => setEdit({ i: j, v: { ...BLANK, ...c } })} title="Edit" aria-label={`Edit ${c.name}'s card`}><LuPencil /></button>
                <button className="icon-btn danger" onClick={() => remove(j)} disabled={busy} title="Delete" aria-label={`Delete ${c.name}'s card`}><LuTrash2 /></button>
              </div>
            </div>
          ))}
        </section>

        {v && (
          <section className="panel dc-edit">
            <h2>{edit.i === -1 ? 'New card' : `Edit: ${list[edit.i]?.name || ''}`}</h2>
            <div className="dc-grid">
              <div className="dc-form">
                <Field label="Full name"><input value={v.name} onChange={(e) => set({ name: e.target.value })} placeholder="MD Ismail Hossain" /></Field>
                <Field label="Designation"><input value={v.title} onChange={(e) => set({ title: e.target.value })} placeholder="Head of Infrastructure & Security" /></Field>
                <Field label="What they handle" hint="Short words, separated by commas. Shown under the designation."><input value={focusText} onChange={(e) => set({ focus: e.target.value.split(',').map((x) => x.trimStart()) })} placeholder="Network infrastructure, Cabling, CCTV & security" /></Field>
                <Field label="Mobile number"><input value={v.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="01944422257" inputMode="tel" /></Field>
                <Field label="WhatsApp number" hint="Leave empty if it is the same as the mobile number."><input value={v.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} inputMode="tel" /></Field>
                <Field label="Email (optional)"><input value={v.email} onChange={(e) => set({ email: e.target.value })} type="email" /></Field>
                <Field label="Link name" hint={`The card opens at ${cardUrl(slug || 'name')}`}><input value={v.slug} onChange={(e) => set({ slug: e.target.value })} placeholder={nameSlug(v.name) || 'ismail-hossain'} /></Field>
                <div className="row-gap">
                  <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save card'}</button>
                  {edit.i !== -1 && <a className="btn btn-ghost" href={`/card/${list[edit.i]?.slug}`} target="_blank" rel="noreferrer"><LuExternalLink /> Open card</a>}
                </div>
              </div>
              <div className="dc-preview">
                <p className="muted small">Preview</p>
                <div className="ec-stage"><CardFace c={{ ...v, phone: bdPhone(v.phone) }} qr={qr} /></div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
