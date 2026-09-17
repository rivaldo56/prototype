// Three exploratory podcast templates, shareable through ?variant=margin|shuffle|frequency.
import React, { useState } from 'react';
import { ArrowUpRight, ArrowRight, Play, Pause, Plus, Minus } from 'lucide-react';
import { Episode } from '../../types';
import { PODCAST_PLATFORMS } from '../../data/podcastConnections';
import { audioEngine } from '../../utils/audioEngine';
import { SqueezeCarousel, type SqueezeSlide } from '../ui/carousel-squeeze';
import { CoverflowCarousel } from '../ui/coverflow-carousel';
import './prototype-worlds.css';
import './shuffle-summer.css';
import './frequency-kinetic.css';

type Props = { episode: Episode; episodes: Episode[]; isPlaying: boolean; currentTime: number; onSeek: (time: number) => void; onSelectEpisode: (episode: Episode) => void };
const time = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
function Listen({ isPlaying, label = 'Listen now' }: { isPlaying: boolean; label?: string }) {
  return <button className="pw-listen" onClick={() => audioEngine.togglePlay()}>{isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}{isPlaying ? 'Pause listening' : label}</button>;
}
function Timeline({ episode, currentTime, onSeek }: Props) {
  return <div className="pw-timeline"><span>{time(currentTime)}</span><input aria-label="Episode position" type="range" min={0} max={episode.durationSeconds} value={currentTime} onChange={event => onSeek(Number(event.target.value))} /><span>{episode.duration}</span></div>;
}
function Notes({ episode, onSeek }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  return <div className="pw-notes">{episode.chapters.map(chapter => <div className="pw-note" key={chapter.id}><button aria-expanded={open === chapter.id} onClick={() => setOpen(open === chapter.id ? null : chapter.id)}><span>{time(chapter.time)}</span><strong>{chapter.title}</strong>{open === chapter.id ? <Minus size={18} /> : <Plus size={18} />}</button>{open === chapter.id && <div className="pw-note-body"><p>{chapter.summary}</p><button onClick={() => { onSeek(chapter.time); if (!audioEngine.getIsPlaying()) audioEngine.togglePlay(); }}>Listen from here <ArrowUpRight size={16} /></button></div>}</div>)}</div>;
}

type NewWorld = 'margin' | 'shuffle' | 'frequency';

function MoreSections({ episode, onSeek, world }: Pick<Props, 'episode' | 'onSeek'> & { world: NewWorld }) {
  const playFrom = (seconds: number): void => {
    onSeek(seconds);
    if (!audioEngine.getIsPlaying()) audioEngine.togglePlay();
  };

  return <div className={`pw-depth pw-depth--${world}`}>
    <section className="pw-takeaways">
      <div className="pw-depth-intro"><span className="pw-eyebrow">IDEAS TO TAKE WITH YOU / 01</span><h2>The signal,<br /><em>distilled.</em></h2><p>{episode.takeaways.length} ideas from this conversation, ready to revisit.</p></div>
      <div className="pw-takeaway-grid">{episode.takeaways.map((item, index) => <button key={item.id} onClick={() => playFrom(item.timestamp)}><span className="pw-eyebrow">0{index + 1} / {time(item.timestamp)}</span><strong>{item.label}</strong><p>{item.description}</p><span>Play this moment <ArrowUpRight size={15} /></span></button>)}</div>
    </section>
    <section className="pw-transcript">
      <div className="pw-section-heading"><div><span className="pw-eyebrow">FROM THE TRANSCRIPT / 02</span><h2>In their<br /><em>own words.</em></h2></div><button onClick={() => playFrom(episode.transcript[0]?.timestamp ?? 0)}>Start reading with audio <ArrowUpRight size={16} /></button></div>
      <div className="pw-transcript-lines">{episode.transcript.slice(0, 5).map(line => <button key={line.id} onClick={() => playFrom(line.timestamp)}><time>{time(line.timestamp)}</time><span>{line.speaker}</span><p>{line.text}</p></button>)}</div>
    </section>
    <section className="pw-profile">
      <div className="pw-profile-image"><img src={episode.portraitImage} alt={episode.guestName} loading="lazy" /><span className="pw-eyebrow">THE PERSON BEHIND THE PERSPECTIVE</span></div>
      <div><span className="pw-eyebrow">MEET THE GUEST / 03</span><h2>{episode.guestName}</h2><p className="pw-profile-role">{episode.guestRole}<br />{episode.guestCompany}</p><p>{episode.guestBio}</p><a href={episode.guestLinkedInUrl || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(episode.guestName)}`} target="_blank" rel="noreferrer">Find {episode.guestName.split(' ')[0]} on LinkedIn <ArrowUpRight size={16} /></a></div>
    </section>
    <section className="pw-connections">
      <div><span className="pw-eyebrow">KEEP THE CONVERSATION GOING / 04</span><h2>Listen wherever<br /><em>you already are.</em></h2><p>Follow 10X Future and take the next conversation with you.</p></div>
      <nav aria-label="Podcast platforms">{PODCAST_PLATFORMS.map(platform => <a key={platform.id} href={platform.href} target="_blank" rel="noreferrer"><span className="pw-eyebrow">{platform.action}</span><strong>{platform.name}</strong><ArrowUpRight /></a>)}</nav>
    </section>
  </div>;
}
function Footer({ name }: { name: string }) {
  return <footer className="pw-footer"><span>10X FUTURE<br /><small>A MangoMagic podcast.</small></span><a href="#top">Back to the top ↗</a><span>{name}<br /><small>Independent minds. Open conversations.</small></span></footer>;
}

function FrequencyVoices({ episode, episodes, onSelectEpisode }: Pick<Props, 'episode' | 'episodes' | 'onSelectEpisode'>) {
  const activeIndex = Math.max(0, episodes.findIndex(item => item.id === episode.id));
  const slides: SqueezeSlide[] = episodes.map(item => ({
    id: item.id,
    title: item.guestName,
    description: `${item.title}. ${item.guestRole} at ${item.guestCompany}.`,
    image: item.portraitImage,
    imageAlt: `Portrait of ${item.guestName}`,
    action: `Listen to episode ${item.episodeNumber}`,
    overlay: <span className="frequency-squeeze-label"><small>EP. {item.episodeNumber}</small><strong>{item.guestName}</strong></span>,
    onAction: () => {
      onSelectEpisode(item);
      if (!audioEngine.getIsPlaying()) audioEngine.togglePlay();
      document.querySelector('.frequency-story')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  }));

  return (
    <SqueezeCarousel
      slides={slides}
      defaultIndex={activeIndex}
      onIndexChange={index => onSelectEpisode(episodes[index])}
      label="10X Future guests"
      accent="#e8f08c"
      accentForeground="#1e201a"
      height="clamp(300px, 34vw, 440px)"
      gap={12}
      slatWidth={10}
      radius={0}
    />
  );
}
export function MarginWorld(props: Props) {
  const { episode, episodes, onSelectEpisode, isPlaying } = props;
  return <main id="top" className="pw margin-world"><nav className="pw-nav"><a href="#top" className="margin-logo">10x<span>future.</span></a><span className="pw-eyebrow">A little room for bigger ideas.</span><a href="#margin-archive">The conversations <ArrowUpRight size={16} /></a></nav>
    <section className="margin-hero"><div className="margin-issue pw-eyebrow"><span>THE CONVERSATION SERIES</span><span>VOL. 01 — NOW LISTENING</span></div><h1>Good questions.<br /><span>Long answers.</span></h1><div className="margin-feature"><div className="margin-feature-copy"><span className="pw-eyebrow">EPISODE {episode.episodeNumber} / {episode.duration}</span><h2>{episode.title}</h2><p>A conversation with <strong>{episode.guestName}</strong>.<br />{episode.subtitle}</p><Listen isPlaying={isPlaying} /><Timeline {...props} /></div><div className="margin-photo"><img src={episode.portraitImage} alt={episode.guestName} /><span className="margin-photo-label">A mind worth meeting. ↗</span><span className="margin-stamp" aria-hidden="true">KEEP<br />ASKING.</span></div></div></section>
    <section id="margin-archive" className="margin-archive"><div className="pw-section-heading"><h2>Stay curious.</h2><span className="pw-eyebrow">{episodes.length.toString().padStart(2, '0')} CONVERSATIONS & COUNTING</span></div>{episodes.map(ep => <button key={ep.id} className="margin-episode" aria-pressed={ep.id === episode.id} onClick={() => onSelectEpisode(ep)}><span className="pw-eyebrow">{ep.episodeNumber}</span><img src={ep.portraitImage} alt="" loading="lazy" /><span><strong>{ep.title}</strong><small>{ep.guestName}</small></span><span className="margin-duration">{ep.duration}</span><ArrowUpRight /></button>)}</section>
    <section className="margin-about"><div><span className="pw-eyebrow">BETWEEN THE LINES</span><h2>There's more<br />to the story.</h2><p>{episode.synopsis}</p></div><Notes {...props} /></section><MoreSections episode={episode} onSeek={props.onSeek} world="margin" /><Footer name="Make time to listen." /></main>;
}
export function ShuffleWorld(props: Props) {
  const { episode, episodes, onSelectEpisode, isPlaying } = props;
  const words = episode.title.split(' ');
  return <main id="top" className="pw shuffle-world"><nav className="pw-nav"><a href="#top" className="shuffle-logo">10X / FUTURE</a><span className="pw-eyebrow">THE LISTENING CLUB · {episodes.length} EPISODES</span><a href="#shuffle-shelf">Browse the shelf <ArrowUpRight size={16} /></a></nav>
    <section className="shuffle-room"><div className="shuffle-masthead"><div><span className="pw-eyebrow">NOW ON THE DESK — EPISODE {episode.episodeNumber}</span><h1>{words.slice(0, -1).join(' ')} <em>{words[words.length - 1]}</em></h1><p>{episode.synopsis}</p></div>
    <div className="shuffle-deskcard"><div className="shuffle-deskcard-row"><img src={episode.portraitImage} alt={episode.guestName} /><div><h2>{episode.guestName}</h2><span>{episode.guestRole} · {episode.duration}</span></div></div><Listen isPlaying={isPlaying} /><Timeline {...props} /></div></div>
    <div id="shuffle-shelf" className="shuffle-shelf"><div className="pw-section-heading"><h2>Browse the shelf.</h2><span className="pw-eyebrow">DRAG THE RACK OR USE THE ARROWS</span></div>
    <CoverflowCarousel className="shuffle-coverflow" cardClassName="shuffle-cover-card" label="Browse the shelf" showCaption showPagination showNavigation defaultIndex={episodes.findIndex(ep => ep.id === episode.id)} onSlideChange={index => onSelectEpisode(episodes[index])} slides={episodes.map(ep => ({ src: ep.portraitImage, alt: `Portrait of ${ep.guestName}`, title: ep.guestName, subtitle: `EP ${ep.episodeNumber} · ${ep.title}`, meta: [{ label: 'Length', value: ep.duration }, { label: 'Released', value: ep.releaseDate }] }))} /></div></section>
    <section className="shuffle-chapters"><span className="pw-eyebrow">THE GOOD PARTS</span><h2>Chapters, <em>at a glance.</em></h2><Notes {...props} /></section>
    <section className="shuffle-quote"><span className="shuffle-qmark" aria-hidden="true">“</span><blockquote>“{episode.heroQuote}”</blockquote><span>— {episode.guestName}</span></section><MoreSections episode={episode} onSeek={props.onSeek} world="shuffle" /><Footer name="Take an idea with you." /></main>;
}
export function FrequencyWorld(props: Props) {
  const { episode, episodes, onSelectEpisode, isPlaying } = props;
  const [motion, setMotion] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return <main id="top" className="pw frequency-world" data-motion={motion}><nav className="pw-nav"><a href="#top" className="frequency-logo">10X FUTURE<span>RADIO FOR THE RESTLESS.</span></a><a href="#frequency-lineup">The lineup <ArrowUpRight size={16} /></a><button className="frequency-motion" aria-pressed={motion} onClick={() => setMotion(!motion)}>{motion ? <Pause size={13} /> : <Play size={13} />}{motion ? 'Pause motion' : 'Resume motion'}</button></nav>
    <section className="frequency-hero"><div className="frequency-meta pw-eyebrow"><span>IDEAS TRAVEL.<br />TUNE IN.</span><span>THE HUMAN FREQUENCY<br />VOL. 01 / {episodes.length} VOICES</span></div><div className="frequency-poster"><h1><span>MAKE</span><span>SOME</span><span className="frequency-outline">SIGNAL.</span></h1><div className="frequency-orbit" aria-hidden="true">↓</div></div><a className="frequency-hero-next" href="#frequency-lineup"><span className="pw-eyebrow">CHOOSE A CONVERSATION</span><ArrowRight size={18} /></a></section>
    <div className="frequency-ticker" aria-hidden="true"><div>{Array.from({ length: 4 }, (_, i) => <span key={i}>MORE QUESTIONS <b>✳</b> BETTER CONVERSATIONS <b>✳</b> </span>)}</div></div>
    <section id="frequency-lineup" className="frequency-lineup"><div className="pw-section-heading"><h2>Different minds.<br /><em>Same wavelength.</em></h2><span className="pw-eyebrow">SELECT A VOICE ↙</span></div><FrequencyVoices episode={episode} episodes={episodes} onSelectEpisode={onSelectEpisode} /></section>
    <section className="frequency-story"><div><span className="pw-eyebrow">GO BELOW THE SURFACE</span><h2>Less scrolling.<br /><em>More listening.</em></h2><p>{episode.synopsis}</p></div><Notes {...props} /></section><MoreSections episode={episode} onSeek={props.onSeek} world="frequency" /><Footer name="Stay on this frequency." /></main>;
}
