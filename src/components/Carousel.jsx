import { useEffect, useRef, useState } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

/* Horizontal shelf: native scroll with snap (touch and trackpad just work), plus round
   arrow buttons on wider screens that page by one visible width. */
export default function Carousel({ children, className = '', label }) {
  const ref = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const update = () => {
    const el = ref.current; if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  useEffect(() => {
    update();
    const el = ref.current; if (!el) return undefined;
    const ro = new ResizeObserver(update); ro.observe(el);
    return () => ro.disconnect();
  }, [children]);
  const page = (d) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.9, behavior: 'smooth' });
  return (
    <div className={`shelf ${className}`}>
      <div ref={ref} className="shelf-track" onScroll={update} role="region" aria-label={label} tabIndex={0}>
        {children}
      </div>
      {!edge.start && <button type="button" className="shelf-btn prev" onClick={() => page(-1)} aria-label="Scroll left"><LuChevronLeft /></button>}
      {!edge.end && <button type="button" className="shelf-btn next" onClick={() => page(1)} aria-label="Scroll right"><LuChevronRight /></button>}
    </div>
  );
}
