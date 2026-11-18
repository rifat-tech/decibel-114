// Draw a signature with a mouse, touchpad or finger. Saved as a transparent PNG (data URL).
import { useEffect, useRef, useState } from 'react';
import { LuEraser, LuCheck } from 'react-icons/lu';

export default function SignaturePad({ onSave }) {
  const ref = useRef();
  const drawing = useRef(false);
  const last = useRef(null);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const c = ref.current;
    const r = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * r; c.height = c.offsetHeight * r;
    const g = c.getContext('2d');
    g.scale(r, r); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#13213F';
  }, []);

  const pos = (e) => { const b = ref.current.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top, t: e.timeStamp }; };
  const down = (e) => { e.preventDefault(); ref.current.setPointerCapture(e.pointerId); drawing.current = true; last.current = pos(e); };
  const move = (e) => {
    if (!drawing.current) return;
    const p = pos(e), l = last.current, g = ref.current.getContext('2d');
    // Faster strokes draw thinner, like a pen.
    const speed = Math.hypot(p.x - l.x, p.y - l.y) / Math.max(1, p.t - l.t);
    g.lineWidth = Math.max(1.2, 3.2 - speed * 1.4);
    g.beginPath(); g.moveTo(l.x, l.y); g.lineTo(p.x, p.y); g.stroke();
    last.current = p; setEmpty(false);
  };
  const up = () => { drawing.current = false; };
  const clear = () => { const c = ref.current; c.getContext('2d').clearRect(0, 0, c.width, c.height); setEmpty(true); };

  // Trim the empty space around the strokes before saving.
  const save = () => {
    const c = ref.current, g = c.getContext('2d');
    const { data, width: w, height: h } = g.getImageData(0, 0, c.width, c.height);
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 <= x0) return;
    const pad = 8, out = document.createElement('canvas');
    out.width = x1 - x0 + pad * 2; out.height = y1 - y0 + pad * 2;
    out.getContext('2d').drawImage(c, x0 - pad, y0 - pad, out.width, out.height, 0, 0, out.width, out.height);
    onSave(out.toDataURL('image/png'));
    clear();
  };

  return (
    <div className="sigpad">
      <canvas ref={ref} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} aria-label="Draw your signature here" />
      {empty && <span className="sigpad-hint">Sign here with your mouse, touchpad or finger</span>}
      <div className="row-gap">
        <button type="button" className="btn btn-ghost btn-sm" onClick={clear} disabled={empty}><LuEraser /> Clear</button>
        <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={empty}><LuCheck /> Use this signature</button>
      </div>
    </div>
  );
}
