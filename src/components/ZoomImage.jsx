import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LuX, LuZoomIn, LuZoomOut, LuChevronLeft, LuChevronRight } from 'react-icons/lu';

// Distributor photos come in fixed sizes; use the larger cut when it exists.
const large = (u) => String(u).replace(/-(?:200x200|400x400)\.(webp|jpe?g|png)$/i, '-600x600.$1');
function Big({ src, ...rest }) {
  const [u, setU] = useState(large(src));
  useEffect(() => setU(large(src)), [src]);
  return <img src={u} onError={() => u !== src && setU(src)} {...rest} />;
}

/* Product photo with hover magnifier (desktop) and a full-screen viewer (tap or click).
   In the viewer: click/tap toggles 2.5x, and the zoomed image pans by scrolling or dragging. */
export default function ZoomImage({ images, index = 0, alt, onIndex }) {
  const [origin, setOrigin] = useState('50% 50%');
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const fine = typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches;
  const src = images[index];
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <>
      <button
        type="button" className={`zoom ${hover && fine ? 'on' : ''}`} onClick={() => setOpen(true)}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onMouseMove={move}
        aria-label={`View larger image of ${alt}`}
      >
        <Big src={src} alt={alt} style={{ transformOrigin: origin }} draggable="false" />
        <span className="zoom-hint"><LuZoomIn /> {fine ? 'Hover to zoom, click for full screen' : 'Tap to zoom'}</span>
      </button>
      {open && <Viewer images={images} start={index} alt={alt} onClose={(i) => { setOpen(false); onIndex?.(i); }} />}
    </>
  );
}

function Viewer({ images, start, alt, onClose }) {
  const [i, setI] = useState(start);
  const [z, setZ] = useState(false);
  const box = useRef();
  const drag = useRef(null);
  const close = () => onClose(i);
  const go = (d) => { setZ(false); setI((x) => (x + d + images.length) % images.length); };
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    document.addEventListener('keydown', k); document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }); // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (e) => {
    if (drag.current?.moved) return;
    const el = box.current; const r = el.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width; const fy = (e.clientY - r.top) / r.height;
    setZ((v) => {
      if (!v) requestAnimationFrame(() => { el.scrollLeft = fx * el.scrollWidth - r.width / 2; el.scrollTop = fy * el.scrollHeight - r.height / 2; });
      return !v;
    });
  };
  const down = (e) => { if (!z || e.pointerType !== 'mouse') return; drag.current = { x: e.clientX, y: e.clientY, l: box.current.scrollLeft, t: box.current.scrollTop, moved: false }; };
  const mv = (e) => { const d = drag.current; if (!d) return; const dx = e.clientX - d.x; const dy = e.clientY - d.y; if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true; box.current.scrollLeft = d.l - dx; box.current.scrollTop = d.t - dy; };
  const up = () => { setTimeout(() => { drag.current = null; }, 0); };
  return createPortal(
    <div className="viewer" role="dialog" aria-modal="true" aria-label={`${alt} images`}>
      <div className="viewer-bar">
        <span>{i + 1} / {images.length}</span>
        <div className="row-gap">
          <button className="icon-btn" onClick={() => setZ((v) => !v)} aria-label={z ? 'Zoom out' : 'Zoom in'}>{z ? <LuZoomOut /> : <LuZoomIn />}</button>
          <button className="icon-btn" onClick={close} aria-label="Close"><LuX /></button>
        </div>
      </div>
      <div ref={box} className={`viewer-stage ${z ? 'z' : ''}`} onClick={toggle} onPointerDown={down} onPointerMove={mv} onPointerUp={up} onPointerLeave={up}>
        <Big src={images[i]} alt={alt} draggable="false" />
      </div>
      {images.length > 1 && <>
        <button className="viewer-nav prev" onClick={() => go(-1)} aria-label="Previous image"><LuChevronLeft /></button>
        <button className="viewer-nav next" onClick={() => go(1)} aria-label="Next image"><LuChevronRight /></button>
      </>}
    </div>,
    document.body,
  );
}
