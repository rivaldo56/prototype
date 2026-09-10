import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import './eco-rail.css';

export function EcoRail({ title, eyebrow, description, resetKey, children }: {
  title: string;
  eyebrow: string;
  description: string;
  resetKey: string;
  children: ReactNode;
}) {
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ start: true, end: false });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => setBounds({ start: element.scrollLeft <= 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
    element.scrollTo({ left: 0, behavior: 'instant' });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, [resetKey]);

  const move = (direction: number) => {
    const element = track.current;
    if (!element) return;
    const card = element.firstElementChild as HTMLElement | null;
    const distance = (card?.offsetWidth ?? element.clientWidth) + 24;
    element.scrollBy({ left: direction * distance, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  return <section className="eco-rail" aria-labelledby={`${id}-title`}>
    <div className="eco-rail-heading">
      <div><p className="eco-rail-eyebrow">{eyebrow}</p><h2 id={`${id}-title`}>{title}</h2><p className="eco-rail-description">{description}</p></div>
      <div className="eco-rail-controls">
        <button type="button" aria-label={`Previous ${title.toLowerCase()}`} aria-controls={id} disabled={bounds.start} onClick={() => move(-1)}><ArrowLeft size={20} /></button>
        <button type="button" aria-label={`Next ${title.toLowerCase()}`} aria-controls={id} disabled={bounds.end} onClick={() => move(1)}><ArrowRight size={20} /></button>
      </div>
    </div>
    <div id={id} ref={track} className="eco-rail-track" tabIndex={0} role="region" aria-label={`${title}; use left and right arrow keys to browse`} onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
    }}>{children}</div>
  </section>;
}
