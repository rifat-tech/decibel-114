// Small form pieces shared by the admin editors: photo picker, one-per-line lists and title/text pairs.
import { useEffect, useState } from 'react';

const lines = (t) => t.split('\n').map((x) => x.trim()).filter(Boolean);
import toast from 'react-hot-toast';
import { LuArrowDown, LuArrowUp, LuPlus, LuTrash2, LuUpload, LuX } from 'react-icons/lu';
import { imgSrc } from '../../segments';
import { uploadImage } from '../../lib/media';

/** One photo: upload from the computer, or paste a link (or an Unsplash photo id). */
export function ImageField({ label, value, onChange, kind = 'photo', hint }) {
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState('');
  const pick = async (file) => {
    if (!file) return;
    setBusy(true);
    try { onChange(await uploadImage(file, kind)); toast.success('Photo added'); } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  const addLink = () => {
    const v = link.trim();
    if (/^https?:\/\//.test(v) || /^photo-[\w-]+$/.test(v) || v.startsWith('/')) { onChange(v); setLink(''); } else toast.error('Paste a full image link starting with https://');
  };
  return (
    <div className="imgf">
      {label && <span className="field-label">{label}</span>}
      <div className="imgf-row">
        <div className={`imgf-thumb ${kind}`}>{value ? <img src={imgSrc(value, 400)} alt="" /> : <span>No photo</span>}</div>
        <div className="imgf-actions">
          <label className="btn btn-ghost btn-sm"><LuUpload /> {busy ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}<input type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} /></label>
          {value && <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}><LuX /> Remove</button>}
          <div className="row-gap"><input value={link} onChange={(e) => setLink(e.target.value)} placeholder="…or paste an image link" /><button type="button" className="btn btn-ghost btn-sm" onClick={addLink}>Use link</button></div>
          {hint && <small className="muted">{hint}</small>}
        </div>
      </div>
    </div>
  );
}

/** A list edited as one item per line. */
export function LinesField({ label, value = [], onChange, rows = 4, hint, placeholder }) {
  const joined = (value || []).join('\n');
  const [text, setText] = useState(joined);
  // Follow outside changes (restore original, switching tabs) without fighting the typing.
  useEffect(() => { if (lines(text).join('\n') !== joined) setText(joined); }, [joined]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <textarea rows={rows} value={text} placeholder={placeholder} onChange={(e) => { setText(e.target.value); onChange(lines(e.target.value)); }} />
      <small className="muted">{hint || 'One per line. Leave empty to hide this section.'}</small>
    </label>
  );
}

const move = (a, i, d) => { const b = [...a]; const j = i + d; if (j < 0 || j >= b.length) return b; [b[i], b[j]] = [b[j], b[i]]; return b; };

/** Rows of [title, text]: steps, reasons, questions and answers. */
export function PairsField({ label, value = [], onChange, titleLabel = 'Title', textLabel = 'Text', addLabel = 'Add row', long }) {
  const set = (i, k, v) => onChange(value.map((p, j) => (j === i ? (k === 0 ? [v, p[1]] : [p[0], v]) : p)));
  return (
    <div className="pairs">
      <span className="field-label">{label}</span>
      {value.map((p, i) => (
        <div key={i} className="pair-row">
          <input value={p[0]} onChange={(e) => set(i, 0, e.target.value)} placeholder={titleLabel} />
          {long ? <textarea rows={2} value={p[1]} onChange={(e) => set(i, 1, e.target.value)} placeholder={textLabel} />
            : <input value={p[1]} onChange={(e) => set(i, 1, e.target.value)} placeholder={textLabel} />}
          <div className="pair-tools">
            <button type="button" className="icon-btn" onClick={() => onChange(move(value, i, -1))} aria-label="Move up" disabled={!i}><LuArrowUp /></button>
            <button type="button" className="icon-btn" onClick={() => onChange(move(value, i, 1))} aria-label="Move down" disabled={i === value.length - 1}><LuArrowDown /></button>
            <button type="button" className="icon-btn" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove"><LuTrash2 /></button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange([...value, ['', '']])}><LuPlus /> {addLabel}</button>
    </div>
  );
}

export { move };
