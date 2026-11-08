import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';

// One luxury easing curve used everywhere
export const EASE = [0.22, 1, 0.36, 1];

const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

/* ---------- Scroll reveal ---------- */
export function Reveal({ children, delay = 0, y = 40, className, style, as = 'div' }) {
  const M = motion[as];
  return (
    <M
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const staggerChild = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export function Stagger({ children, className, style }) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, style }) {
  return (
    <motion.div className={className} style={style} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

/* ---------- 3D tilt card ---------- */
export function TiltCard({ children, className, style, max = 10, onClick }) {
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), spring);
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), spring);
  const glareX = useTransform(mx, (v) => `${v * 100}%`);
  const glareY = useTransform(my, (v) => `${v * 100}%`);

  const onMove = (e) => {
    if (isTouch()) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { mx.set(0.5); my.set(0.5); };

  return (
    <motion.div
      ref={ref}
      className={`tilt-card ${className || ''}`}
      style={{ ...style, rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      whileHover={{ y: -8, transition: { duration: 0.5, ease: EASE } }}
    >
      {children}
      <motion.span
        className="tilt-glare"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,236,180,0.35), transparent 55%)`
          ),
        }}
      />
    </motion.div>
  );
}

/* ---------- Magnetic button with ripple ---------- */
export function Magnetic({ children, className, strength = 0.35, as = 'button', ...rest }) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 220, damping: 15 });
  const y = useSpring(0, { stiffness: 220, damping: 15 });
  const [ripples, setRipples] = useState([]);
  const M = motion[as];

  const onMove = (e) => {
    if (isTouch()) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  const onEnter = (e) => {
    const r = ref.current.getBoundingClientRect();
    const id = Date.now();
    setRipples((p) => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((p) => p.filter((q) => q.id !== id)), 800);
  };

  return (
    <M
      ref={ref}
      className={`magnetic ${className || ''}`}
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={onEnter}
      whileTap={{ scale: 0.96 }}
      {...rest}
    >
      <span className="magnetic-label">{children}</span>
      {ripples.map((r) => (
        <span key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
      ))}
    </M>
  );
}

/* ---------- Curved 3D coverflow (drag / swipe) ---------- */
export function Coverflow({ items, renderItem, cardWidth = 260, gap = 0.62 }) {
  const progress = useMotionValue(0); // fractional index
  const [active, setActive] = useState(0);
  const startRef = useRef(0);

  const goTo = (i) => {
    const clamped = Math.max(0, Math.min(items.length - 1, i));
    setActive(clamped);
    animate(progress, clamped, { duration: 0.9, ease: EASE });
  };

  return (
    <div className="coverflow">
      <motion.div
        className="coverflow-stage"
        onPanStart={() => { startRef.current = progress.get(); }}
        onPan={(_, info) => {
          const next = startRef.current - info.offset.x / (cardWidth * 0.8);
          progress.set(Math.max(-0.4, Math.min(items.length - 0.6, next)));
        }}
        onPanEnd={(_, info) => {
          const projected = progress.get() - info.velocity.x / (cardWidth * 4);
          goTo(Math.round(projected));
        }}
        style={{ touchAction: 'pan-y' }}
      >
        {items.map((item, i) => (
          <CoverflowCard
            key={item.id}
            index={i}
            progress={progress}
            width={cardWidth}
            gap={gap}
            onClick={() => goTo(i)}
          >
            {renderItem(item, i === active)}
          </CoverflowCard>
        ))}
      </motion.div>
      <div className="coverflow-dots">
        {items.map((it, i) => (
          <button
            key={it.id}
            className={`cf-dot ${i === active ? 'active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function CoverflowCard({ index, progress, width, gap, children, onClick }) {
  const d = useTransform(progress, (p) => index - p);
  const x = useTransform(d, (v) => v * width * gap);
  const rotateY = useTransform(d, (v) => Math.max(-55, Math.min(55, -v * 38)));
  const z = useTransform(d, (v) => -Math.abs(v) * 160);
  const scale = useTransform(d, (v) => 1 - Math.min(Math.abs(v), 3) * 0.06);
  const opacity = useTransform(d, (v) => 1 - Math.min(Math.abs(v), 4) * 0.18);
  const zIndex = useTransform(d, (v) => 100 - Math.round(Math.abs(v) * 10));

  return (
    <motion.div
      className="coverflow-card"
      style={{ width, x, rotateY, z, scale, opacity, zIndex, marginLeft: -width / 2 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
