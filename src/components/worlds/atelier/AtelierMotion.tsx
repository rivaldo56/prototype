import { useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

/** Original monochrome character, drawn for this podcast adaptation. */
function PushCharacter() {
  return <svg viewBox="0 0 240 360" fill="none" aria-hidden="true" className="folio-pusher-art">
    <defs><pattern id="atelier-shirt-print" width="23" height="23" patternUnits="userSpaceOnUse"><rect width="23" height="23" fill="#777"/><path d="M11 5v12M5 11h12M7 7l8 8M7 15l8-8" stroke="#eee" strokeWidth="3"/></pattern></defs>
    <g stroke="#171717" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
      <g className="folio-leg-back"><path d="M112 235 80 283 35 313l-16-21 39-36 27-39" fill="#e8e8e8"/><path d="m36 295-17 13 14 22 24 14q12 9 18 2l-20-24-8-17" fill="white"/><path d="m23 318 28 26 22 5M36 311l14 4m-9-12 13 7"/></g>
      <g className="folio-leg-front"><path d="m123 228 25 45-18 53-24-3 7-48-23-35" fill="#e8e8e8"/><path d="m108 308-5 27 39 9 33 0q5-8-9-12l-35-15" fill="white"/><path d="m104 338 65 9M129 326l-9 8m17-6-7 9"/></g>
      <path d="m87 199-18 40q20 21 49 12l17-14 14-21" fill="#ddd"/><path d="m109 218 9 30"/>
      <g className="folio-pusher-body">
        <path d="m159 127 24 12 33-30 11 10-32 45q-7 8-17 1l-36-19" fill="#f5f5f5"/>
        <path d="m215 114 2-30q2-7 5-2l1 15 6-22q4-5 6 2l-3 31-6 13" fill="white"/>
        <path d="m118 106-27 20-24 77q24 20 69 20l25-78-11-25" fill="url(#atelier-shirt-print)"/>
        <path d="m150 150 27 24q8 5 16-3l35-38-9-14-34 28-19-15" fill="#f4f4f4"/>
        <path d="m218 126 8-20 0-22q4-7 6 0l2 19 3-17q4-3 4 3l-1 40-12 10" fill="white"/>
        <ellipse cx="219" cy="135" rx="10" ry="7" transform="rotate(-42 219 135)" fill="#555"/><ellipse cx="219" cy="134" rx="7" ry="5" transform="rotate(-42 219 134)" fill="white"/>
        <path d="m130 110 2-22 34-10 4 31-12 17-13-2" fill="white"/>
        <path d="M129 56q29-20 49 9l-2 22 6 11-9 2q-1 17-14 16l-23-17-11-22" fill="white"/>
        <path d="M127 58q-13 25 4 36l6-16 11-5 12-16" fill="#171717"/>
        <path d="M131 79q-12-6-10 6t15 7" fill="white"/><path d="m128 83 4 5m34-6 3 3m-12 16q6 8 13 3"/>
        <path d="M121 67q-7-34 20-39 30-4 36 28l-2 16q-25-13-54-5Z" fill="#aaa"/><path d="M151 31q14 11 13 31M123 62l51-4 24 12q6 7-6 8l-26-7" fill="#ccc"/>
        <path d="m147 150 9-27"/>
      </g>
    </g>
  </svg>;
}

export function OpeningHero({ onExplore }: { onExplore: () => void }) {
  const [replay, setReplay] = useState(0);
  return <section className="folio-opening" aria-label="Welcome to MangoMagic">
    <div className="folio-opening-logo"><h1>MANGO<br/>MAGIC</h1><p>Independent minds. Extraordinary conversations.</p></div>
    <div key={replay} className="folio-reveal" aria-hidden="true"><div className="folio-dark-curtain"/><div className="folio-pusher-track"><PushCharacter /></div></div>
    <div className="folio-opening-bottom"><button onClick={() => setReplay(value => value + 1)}>Replay opening ↻</button><button onClick={onExplore}>Scroll to listen <span>↓</span></button><span>A little curiosity goes a long way.</span></div>
  </section>;
}

export function ScrollIdentity({ onHome }: { onHome: () => void }) {
  const { scrollY } = useScroll();
  const reduced = useReducedMotion();
  const rotation = useTransform(scrollY, value => value * .2);
  return <button className="folio-scroll-identity" onClick={onHome} aria-label="MangoMagic home">
    <span className="folio-logo-perspective"><motion.span className="folio-logo-prism" style={{ rotateY: reduced ? 0 : rotation }}>
      <span className="folio-logo-face folio-logo-face-front"><b>MM</b><span className="folio-brand-initials">MM</span></span>
      <span className="folio-logo-face folio-logo-face-right">MANGO<br/>MAGIC</span><span className="folio-logo-face folio-logo-face-back">ON<br/>AIR<br/>↗</span><span className="folio-logo-face folio-logo-face-left">MM©</span>
    </motion.span></span><span className="folio-logo-caption">MangoMagic · Independent voices</span>
  </button>;
}
