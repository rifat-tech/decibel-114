import { Fragment, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

// One small motion vocabulary for the storefront. Every piece renders plain markup when the
// visitor prefers reduced motion, so nothing depends on animation to be readable or usable.

const EASE = [0.16, 1, 0.3, 1];
const FROM = {
  up: { opacity: 0, y: 28 },
  left: { opacity: 0, x: -36 },
  right: { opacity: 0, x: 36 },
  fade: { opacity: 0 },
};
const TO = { up: { opacity: 1, y: 0 }, left: { opacity: 1, x: 0 }, right: { opacity: 1, x: 0 }, fade: { opacity: 1 } };

/** Reveals its content once, when it scrolls into view. */
export function Reveal({ as = 'div', from = 'up', delay = 0, duration = 0.7, amount = 0.25, className, children, ...rest }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;
  if (reduce) { const Plain = as; return <Plain className={className} {...rest}>{children}</Plain>; }
  return (
    <Tag className={className} initial={FROM[from]} whileInView={TO[from]} viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: EASE }} {...rest}>
      {children}
    </Tag>
  );
}

/** A row or grid whose children arrive one after another. Offsets vary a little per item
    so the row settles like objects placed on a shelf rather than marching in lockstep. */
export function Stagger({ className, children, step = 0.06 }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial="hide" whileInView="show" viewport={{ once: true, amount: 0.15 }}
      variants={{ show: { transition: { staggerChildren: step } } }}>
      {children}
    </motion.div>
  );
}
export function StaggerItem({ children, i = 0, className }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  const y = [26, 34, 22, 30][i % 4];
  return (
    <motion.div className={className} variants={{ hide: { opacity: 0, y }, show: { opacity: 1, y: 0, transition: { duration: 0.55 + (i % 3) * 0.08, ease: EASE } } }}>
      {children}
    </motion.div>
  );
}

/** Heading that writes itself in word by word. Used sparingly: hero titles only. */
export function SplitWords({ text, as = 'h1', className, delay = 0.05 }) {
  const reduce = useReducedMotion();
  const Tag = as;
  if (reduce) return <Tag className={className}>{text}</Tag>;
  const words = String(text).split(' ');
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, k) => (
        <Fragment key={k}>
          <span className="sw" aria-hidden="true">
            <motion.span className="sw-in" initial={{ y: '105%' }} animate={{ y: '0%' }} transition={{ duration: 0.65, delay: delay + k * 0.07, ease: EASE }}>{w}</motion.span>
          </span>
          {k < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Moves its content against the scroll for a little depth. */
export function Parallax({ children, className, distance = 40 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  if (reduce) return <div ref={ref} className={className}>{children}</div>;
  return <motion.div ref={ref} className={className} style={{ y }}>{children}</motion.div>;
}
