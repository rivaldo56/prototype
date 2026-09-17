import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import type { Episode, WorldType } from '../../../types';
import { audioEngine } from '../../../utils/audioEngine';
import './replica.css';
import { OpeningHero, ScrollIdentity } from './AtelierMotion';
import './continuous.css';

type View = 'episodes' | 'episode' | 'show' | 'playground';
interface Props { episode: Episode; episodes: Episode[]; isPlaying: boolean; currentTime: number; onSeek: (time: number) => void; onSelectEpisode?: (episode: Episode) => void; onSelectWorld?: (world: WorldType) => void }
const readView = (): View => { const v = new URLSearchParams(location.search).get('atelierView'); return v === 'episode' || v === 'show' || v === 'playground' ? v : 'episodes'; };
const clock = (value: number): string => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
const platforms = [['Spotify', 'https://open.spotify.com/'], ['Apple Podcasts', 'https://podcasts.apple.com/'], ['YouTube', 'https://www.youtube.com/']];

export function AtelierReplicaWorld({ episode, episodes, isPlaying, currentTime, onSeek, onSelectEpisode }: Props) {
  const [view, setView] = useState<View>(readView);
  const [heroVisible, setHeroVisible] = useState(true);
  const [overlay, setOverlay] = useState<'menu' | 'contact' | 'credits' | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const navigate = (next: View, selected?: Episode) => {
    if (selected) onSelectEpisode?.(selected);
    setOverlay(null); setView(next);
    const url = new URL(location.href); url.searchParams.set('atelierView', next);
    if (selected) url.searchParams.set('atelierEpisode', selected.slug);
    history.pushState({}, '', url);
    requestAnimationFrame(() => document.getElementById(`atelier-${next}`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }));
  };
  useEffect(() => {
    const restore = () => { const next = readView(); setView(next); const slug = new URLSearchParams(location.search).get('atelierEpisode'); const selected = episodes.find(item => item.slug === slug); if (selected) onSelectEpisode?.(selected); if (new URLSearchParams(location.search).has('atelierView')) requestAnimationFrame(() => document.getElementById(`atelier-${next}`)?.scrollIntoView({ behavior: 'instant' })); };
    restore(); window.addEventListener('popstate', restore); return () => window.removeEventListener('popstate', restore);
  }, [episodes]);
  useEffect(() => {
    const hero = root.current?.querySelector('.folio-opening');
    let heroObserver: IntersectionObserver;
    const observeHero = () => {
      heroObserver?.disconnect();
      const inset = (document.querySelector('header')?.getBoundingClientRect().height ?? 76) + 8;
      heroObserver = new IntersectionObserver(entries => setHeroVisible(entries[0].isIntersecting), { rootMargin: `-${inset}px 0px -40% 0px` });
      if (hero) heroObserver.observe(hero);
    };
    observeHero(); window.addEventListener('resize', observeHero);
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setView(entry.target.id.replace('atelier-', '') as View);
    }, { rootMargin: '-25% 0px -60% 0px' });
    root.current?.querySelectorAll('[data-atelier-section]').forEach(section => observer.observe(section));
    return () => { observer.disconnect(); heroObserver.disconnect(); window.removeEventListener('resize', observeHero); };
  }, []);
  useLayoutEffect(() => {
    const header = document.querySelector('header'); if (!header) return;
    const measure = () => root.current?.style.setProperty('--folio-header', `${header.getBoundingClientRect().height}px`);
    measure(); const observer = new ResizeObserver(measure); observer.observe(header); return () => observer.disconnect();
  }, []);
  const openEpisode = (item: Episode) => navigate('episode', item);
  return <div className="huy-template folio-continuous" ref={root}>
    <header className="folio-header" style={{ visibility: heroVisible ? 'hidden' : 'visible' }}>
      <ScrollIdentity onHome={() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })} />
      <div className="folio-navigation"><button className="folio-menu-trigger" onClick={() => setOverlay('menu')}>Menu</button><nav aria-label="Atelier pages">{([['episodes', 'Episodes'], ['playground', 'Moments'], ['show', 'About']] as const).map(([key, label]) => <button key={key} aria-current={view === key || (key === 'show' && view === 'episode') ? 'page' : undefined} onClick={() => navigate(key)}>{label}</button>)}<button onClick={() => setOverlay('contact')}>Contact</button></nav></div>
      <button className="folio-audio" onClick={() => audioEngine.togglePlay()}>Audio <span>{isPlaying ? 'On' : 'Off'} —</span></button>
      <div className="folio-location">Independent voices<br /><span>Listening everywhere</span></div>
      <button className="folio-inquiry" onClick={() => setOverlay('contact')}><span>For inquiries</span> Get in touch ↗</button>
    </header>
    <main>
      <OpeningHero onExplore={() => navigate('episodes')} />
      <section id="atelier-episodes" data-atelier-section><Collection episodes={episodes} onOpen={openEpisode} /></section>
      <section id="atelier-playground" data-atelier-section><MomentsPage episodes={episodes} onOpen={openEpisode} /></section>
      <section id="atelier-show" data-atelier-section>
        <section id="atelier-episode" aria-label="About this conversation"><EpisodePage episode={episode} isPlaying={isPlaying} currentTime={currentTime} onSeek={onSeek} onNext={() => openEpisode(episodes[(episodes.findIndex(item => item.id === episode.id) + 1) % episodes.length])} /></section>
      </section>
    </main>
    <footer className="folio-footer"><button onClick={() => setOverlay('contact')}>Come say hi ↗</button><span>MangoMagic / Independent conversations</span><button onClick={() => setOverlay('credits')}>Credits</button></footer>
    {overlay && <Overlay title={overlay === 'menu' ? 'Explore' : overlay === 'contact' ? 'Come say hi' : 'Credits'} onClose={() => setOverlay(null)}>
      {overlay === 'menu' ? <nav className="folio-overlay-nav">{([['episodes', 'Episodes'], ['playground', 'Moments'], ['show', 'About the show']] as const).map(([key, label]) => <button key={key} onClick={() => navigate(key)}>{label} ↗</button>)}<button onClick={() => setOverlay('contact')}>Contact ↗</button></nav> : overlay === 'contact' ? <div className="folio-contact-grid"><div><span>Drop us a line</span><a href="mailto:hello@mangomagic.fm">hello@mangomagic.fm ↗</a></div><div><span>Keep listening</span>{platforms.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer">{label} ↗</a>)}</div><p>Good conversations start with a little curiosity.<br />Have a story worth sharing?</p></div> : <div className="folio-contact-grid"><div><span>Design reference</span><a href="https://huyml.co/" target="_blank" rel="noreferrer">Huy Phan ↗</a></div><div><span>Podcast adaptation</span><p>MangoMagic Atelier</p><span>Typography</span><p>Fraunces / Arial</p></div><p>Interactive podcast prototype. Audio and platform destinations are demonstrations.</p></div>}
    </Overlay>}
  </div>;
}

function Overlay({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const previous = document.activeElement as HTMLElement | null; dialog.current?.showModal(); const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = overflow; previous?.focus(); }; }, []);
  return <dialog ref={dialog} className="folio-dialog" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}><div><button className="folio-close" autoFocus onClick={onClose}>Close ×</button><h2>{title}</h2>{children}</div></dialog>;
}

function Collection({ episodes, onOpen }: { episodes: Episode[]; onOpen: (episode: Episode) => void }) {
  const runway = useRef<HTMLDivElement>(null); const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: runway, offset: ['start start', 'end end'] });
  const spring = useSpring(scrollYProgress, { stiffness: 90, damping: 28 });
  const active = useTransform(reduced ? scrollYProgress : spring, [0, 1], [0, Math.max(0, episodes.length - 1)]);
  const [index, setIndex] = useState(0);
  useMotionValueEvent(active, 'change', value => setIndex(Math.max(0, Math.min(episodes.length - 1, Math.round(value)))));
  const listY = useTransform(active, value => -value * 164);
  const episode = episodes[index];
  const goTo = (next: number) => { const el = runway.current; if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.offsetHeight - innerHeight) * next / Math.max(1, episodes.length - 1), behavior: reduced ? 'instant' : 'smooth' }); };
  return <div ref={runway} className="folio-runway" style={{ height: `${Math.max(2, episodes.length) * 110}svh` }}><section className="folio-viewport" aria-label="Episode collection">
    {episode && <div className="folio-meta" aria-live="polite"><dl><dt>Guest</dt><dd>{episode.guestName}</dd><dt>Role</dt><dd>{episode.guestRole}</dd></dl><dl><dt>Released</dt><dd>{episode.releaseDate}</dd><dt>On this record</dt><dd>{episode.takeaways.slice(0, 3).map(item => <span key={item.id}>{item.label}</span>)}</dd></dl></div>}
    <div className="folio-stage" aria-hidden="true">{episodes.map((item, i) => <div key={item.id}><Plate episode={item} index={i} active={active} /></div>)}</div>
    {episode && <button className="folio-open" aria-label={`Open episode with ${episode.guestName}`} onClick={() => onOpen(episode)}><span>Listen to episode ↗</span></button>}
    <div className="folio-index-window"><motion.div className="folio-index" style={{ y: listY }}>{episodes.map((item, i) => <button key={item.id} className="folio-index-item" data-active={index === i} aria-current={index === i ? 'true' : undefined} onClick={() => goTo(i)}><span>{item.guestCompany}</span><h2>{item.guestName}</h2><i>—</i><p>{item.title}</p></button>)}</motion.div></div>
    {episode && <div className="folio-swatches" aria-hidden="true"><i style={{ background: episode.themeColor.accent }} /><i style={{ background: episode.themeColor.vinylLabel }} /><i /></div>}
    <div className="folio-counter"><span>Selected episodes</span><strong>{String(index + 1).padStart(2, '0')}</strong><span>/{String(episodes.length).padStart(2, '0')}</span></div>
    <div className="folio-bottom"><span>Scroll to explore</span><div><button disabled={index === 0} aria-label="Previous collection episode" onClick={() => goTo(index - 1)}>↑</button><button disabled={index === episodes.length - 1} aria-label="Next collection episode" onClick={() => goTo(index + 1)}>↓</button></div><button onClick={() => episode && onOpen(episode)}>Open conversation ↗</button></div>
  </section></div>;
}

function Plate({ episode, index, active }: { episode: Episode; index: number; active: MotionValue<number> }) {
  const reduced = useReducedMotion(); const offset = useTransform(active, value => index - value);
  const x = useTransform(offset, value => `${-value * 13}vw`); const y = useTransform(offset, value => `${value * 59}svh`);
  const rotateZ = useTransform(offset, [-2, 0, 2], [15, 1, 15]); const rotateY = useTransform(offset, [-2, 0, 2], [-28, 0, 28]);
  const scale = useTransform(offset, [-2, 0, 2], [.72, 1, .72]); const opacity = useTransform(offset, [-2, -1.5, 0, 1.5, 2], [0, 1, 1, 1, 0]);
  return <motion.div className="folio-plate" style={{ x: reduced ? 0 : x, y, rotateZ: reduced ? 0 : rotateZ, rotateY: reduced ? 0 : rotateY, scale, opacity }}><img src={episode.coverImage} alt="" draggable={false} /><span>{episode.guestName}<small>EP {episode.episodeNumber} / {episode.duration}</small></span></motion.div>;
}

function EpisodePage({ episode, isPlaying, currentTime, onSeek, onNext }: { episode: Episode; isPlaying: boolean; currentTime: number; onSeek: (time: number) => void; onNext: () => void }) {
  return <article className="folio-detail">
    <aside className="folio-detail-meta"><dl><dt>About</dt><dd>{episode.synopsis}</dd><dt>Guest</dt><dd>{episode.guestName}<br />{episode.guestRole}</dd><dt>Released</dt><dd>{episode.releaseDate}</dd><dt>Length</dt><dd>{episode.duration}</dd></dl><button className="folio-underlined" onClick={() => audioEngine.togglePlay()}>{isPlaying ? 'Pause' : 'Play episode'} →</button><label className="folio-seek">{clock(currentTime)} / {clock(episode.durationSeconds)}<input type="range" aria-label="Episode playback position" min={0} max={episode.durationSeconds} value={Math.min(currentTime, episode.durationSeconds)} onChange={event => onSeek(Number(event.target.value))} /></label></aside>
    <div className="folio-gallery">
      <section className="folio-gallery-cover"><img src={episode.coverImage} alt={episode.guestName} /><p>{episode.title}</p></section>
      <img className="folio-guest-photo" src={episode.portraitImage} alt={`Portrait of ${episode.guestName}`} />
      <p className="folio-bio">{episode.guestBio}</p>
      <button className="folio-next" onClick={onNext}><span>Next conversation</span>Keep listening ↗</button>
    </div>
    <h1 className="folio-detail-title">{episode.guestName}</h1>
  </article>;
}

function MomentsPage({ episodes, onOpen }: { episodes: Episode[]; onOpen: (episode: Episode) => void }) {
  const [filter, setFilter] = useState('all');
  const moments = episodes.flatMap(item => item.takeaways.map(takeaway => ({ episode: item, takeaway })));
  return <article className="folio-moments"><div className="folio-moments-intro"><h1>Side notes<br /><em>& moments.</em></h1><p>Ideas worth keeping. A collection of small discoveries from the conversations.</p><nav aria-label="Filter moments">{['all', 'strategy', 'infrastructure', 'philosophy', 'insight'].map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</nav></div><div className="folio-moment-grid">{moments.filter(item => filter === 'all' || item.takeaway.category === filter).map(({ episode: item, takeaway }, i) => <button key={`${item.id}-${takeaway.id}`} className="folio-moment" onClick={() => onOpen(item)} style={{ '--moment-color': item.themeColor.accent } as CSSProperties}>{i % 3 === 0 ? <img src={item.portraitImage} alt="" /> : null}<span>{takeaway.category} / {clock(takeaway.timestamp)}</span><h2>{takeaway.label}</h2><p>{takeaway.description}</p><small>{item.guestName} ↗</small></button>)}</div></article>;
}
