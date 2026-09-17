import {
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { cn } from '../../lib/utils';

export type SqueezeSlide = {
  id?: string | number;
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  background?: string;
  overlay?: ReactNode;
  action?: string;
  href?: string;
  target?: string;
  onAction?: () => void;
};

type Size = number | string;

export type SqueezeCarouselProps = {
  slides: SqueezeSlide[];
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  height?: Size;
  slatWidth?: Size;
  slatGap?: Size;
  gap?: Size;
  radius?: Size;
  duration?: number;
  hoverGrow?: boolean;
  autoplay?: boolean;
  interval?: number;
  controls?: boolean;
  accent?: string;
  accentForeground?: string;
  label?: string;
  panelClassName?: string;
} & Omit<ComponentProps<'div'>, 'onSelect'>;

const size = (value: Size): string => typeof value === 'number' ? `${value}px` : value;
const wrap = (value: number, count: number): number => ((value % count) + count) % count;

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const read = (): void => setReduced(query.matches);
    read();
    query.addEventListener('change', read);
    return () => query.removeEventListener('change', read);
  }, []);
  return reduced;
}

export function SqueezeCarousel({
  slides,
  defaultIndex = 0,
  onIndexChange,
  height = 'clamp(260px, 34vw, 430px)',
  slatWidth = 12,
  slatGap = 8,
  gap = 14,
  radius = 0,
  duration = 850,
  hoverGrow = true,
  autoplay = false,
  interval = 6000,
  controls = true,
  accent = 'var(--sq-accent, currentColor)',
  accentForeground = '#1e201a',
  label = 'Featured conversations',
  panelClassName,
  className,
  style,
  ...props
}: SqueezeCarouselProps) {
  const count = slides.length;
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(() => count ? wrap(defaultIndex, count) : 0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const ids = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const focusSelected = useRef(false);

  const go = useCallback((next: number): void => {
    if (!count) return;
    setOpen(wrap(next, count));
  }, [count]);

  useEffect(() => {
    if (count) setOpen(wrap(defaultIndex, count));
  }, [count, defaultIndex]);

  useEffect(() => onIndexChange?.(open), [onIndexChange, open]);

  useEffect(() => {
    const strip = panelRef.current;
    if (!focusSelected.current || !strip) return;
    focusSelected.current = false;
    strip.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
  }, [open]);

  useEffect(() => {
    if (!autoplay || paused || reduced || count < 2) return;
    const timer = window.setTimeout(() => go(open + 1), interval);
    return () => window.clearTimeout(timer);
  }, [autoplay, paused, reduced, count, open, interval, go]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    focusSelected.current = true;
    go(open + (event.key === 'ArrowRight' ? 1 : -1));
  };

  if (!count) return null;

  const order = Array.from({ length: count }, (_, position) => wrap(open + position, count));
  const vars = {
    '--sq-height': size(height),
    '--sq-slat': size(slatWidth),
    '--sq-slat-gap': size(slatGap),
    '--sq-gap': size(gap),
    '--sq-radius': size(radius),
    '--sq-duration': `${reduced ? 0 : duration}ms`,
    '--sq-accent': accent,
    '--sq-on-accent': accentForeground,
  } as CSSProperties;

  return (
    <div
      className={cn('squeeze-carousel', className)}
      style={{ ...vars, ...style }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); setHovered(null); }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      {...props}
    >
      {controls && count > 1 && (
        <div className="squeeze-controls">
          <ArrowButton label="Previous conversation" back onClick={() => go(open - 1)} />
          <span>{String(open + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
          <ArrowButton label="Next conversation" onClick={() => go(open + 1)} />
        </div>
      )}

      <div
        ref={panelRef}
        className="squeeze-strip"
        role="tablist"
        aria-label={label}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
      >
        {order.map((slideIndex, position) => {
          const slide = slides[slideIndex];
          const front = position === 0;
          return (
            <button
              key={slide.id ?? slideIndex}
              type="button"
              role="tab"
              id={`${ids}-tab-${slideIndex}`}
              aria-selected={front}
              aria-controls={`${ids}-panel`}
              aria-label={slide.title}
              tabIndex={front ? 0 : -1}
              onMouseEnter={() => hoverGrow && setHovered(position)}
              onFocus={() => setHovered(position)}
              onClick={() => go(slideIndex)}
              className={cn('squeeze-card', panelClassName)}
              data-position={position}
              data-hovered={hovered === position}
            >
              <Picture slide={slide} />
              {slide.overlay && <span className="squeeze-overlay" aria-hidden="true">{slide.overlay}</span>}
            </button>
          );
        })}
      </div>

      <div id={`${ids}-panel`} role="tabpanel" aria-labelledby={`${ids}-tab-${open}`} aria-live="polite" className="squeeze-copy">
        <div>
          <strong>{slides[open].title}</strong>
          {slides[open].description && <p>{slides[open].description}</p>}
        </div>
        {slides[open].action && <Action slide={slides[open]} />}
      </div>
    </div>
  );
}

function Picture({ slide }: { slide: SqueezeSlide }) {
  if (slide.image) {
    return <img src={slide.image} alt={slide.imageAlt ?? ''} draggable={false} />;
  }
  return <span className="squeeze-background" aria-hidden="true" style={{ background: slide.background }} />;
}

function ArrowButton({ back = false, label, onClick }: { back?: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d={back ? 'M9.6 2.6 5.1 7.1h9.1v1.8H5.1l4.5 4.5-1.2 1.2-6-6L1.8 8l.6-.6 6-6 1.2 1.2Z' : 'M6.4 2.6l4.5 4.5H1.8v1.8h9.1l-4.5 4.5 1.2 1.2 6-6 .6-.6-.6-.6-6-6-1.2 1.2Z'} />
      </svg>
    </button>
  );
}

function Action({ slide }: { slide: SqueezeSlide }) {
  const content = <>{slide.action}<span aria-hidden="true">↗</span></>;
  const className = 'squeeze-action';
  if (slide.href) {
    return <a href={slide.href} target={slide.target} rel={slide.target === '_blank' ? 'noreferrer' : undefined} onClick={slide.onAction} className={className}>{content}</a>;
  }
  return <button type="button" onClick={slide.onAction} className={className}>{content}</button>;
}

export default SqueezeCarousel;
