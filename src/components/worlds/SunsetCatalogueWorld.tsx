import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Play, Pause, Plus, Minus } from 'lucide-react';
import type { Episode } from '../../types';
import { PODCAST_PLATFORMS } from '../../data/podcastConnections';
import { audioEngine } from '../../utils/audioEngine';
import { CoverflowCarousel } from '../ui/coverflow-carousel';
import { formatRecordTime } from './jukebox/SleeveJourneyParts';
import './sunset-catalogue.css';

type Props = {
  episode: Episode;
  episodes: Episode[];
  isPlaying: boolean;
  currentTime: number;
  onSeek: (time: number) => void;
  onSelectEpisode: (episode: Episode) => void;
};

const time = (seconds: number) => formatRecordTime(seconds);

function Listen({ isPlaying, label = 'Listen now' }: { isPlaying: boolean; label?: string }) {
  return (
    <button
      className="sc-listen"
      onClick={() => audioEngine.togglePlay()}
      aria-label={isPlaying ? 'Pause listening' : label}
    >
      {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
      {isPlaying ? 'Pause listening' : label}
    </button>
  );
}

function Timeline({ episode, currentTime, onSeek }: Props) {
  return (
    <div className="sc-timeline">
      <span>{time(currentTime)}</span>
      <input
        aria-label="Episode position"
        type="range"
        min={0}
        max={episode.durationSeconds}
        value={currentTime}
        onChange={(event) => onSeek(Number(event.target.value))}
      />
      <span>{episode.duration}</span>
    </div>
  );
}

function Notes({ episode, onSeek }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="sc-notes">
      {episode.chapters.map((chapter) => (
        <div className="sc-note" key={chapter.id}>
          <button
            aria-expanded={open === chapter.id}
            onClick={() => setOpen(open === chapter.id ? null : chapter.id)}
          >
            <span>{time(chapter.time)}</span>
            <strong>{chapter.title}</strong>
            {open === chapter.id ? <Minus size={18} /> : <Plus size={18} />}
          </button>
          {open === chapter.id && (
            <div className="sc-note-body">
              <p>{chapter.summary}</p>
              <button
                onClick={() => {
                  onSeek(chapter.time);
                  if (!audioEngine.getIsPlaying()) audioEngine.togglePlay();
                }}
              >
                Listen from here <ArrowUpRight size={16} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MoreSections({ episode, onSeek }: Pick<Props, 'episode' | 'onSeek'>) {
  const playFrom = (seconds: number): void => {
    onSeek(seconds);
    if (!audioEngine.getIsPlaying()) audioEngine.togglePlay();
  };

  return (
    <div className="sc-depth">
      <section className="sc-takeaways">
        <div className="sc-depth-intro">
          <span className="sc-eyebrow">IDEAS TO TAKE WITH YOU / 01</span>
          <h2>The signal,<br /><em>distilled.</em></h2>
          <p>{episode.takeaways.length} ideas from this conversation, ready to revisit.</p>
        </div>
        <div className="sc-takeaway-grid">
          {episode.takeaways.map((item, index) => (
            <button key={item.id} onClick={() => playFrom(item.timestamp)}>
              <span className="sc-eyebrow">0{index + 1} / {time(item.timestamp)}</span>
              <strong>{item.label}</strong>
              <p>{item.description}</p>
              <span>Play this moment <ArrowUpRight size={15} /></span>
            </button>
          ))}
        </div>
      </section>
      <section className="sc-transcript">
        <div className="sc-section-heading">
          <div>
            <span className="sc-eyebrow">FROM THE TRANSCRIPT / 02</span>
            <h2>In their<br /><em>own words.</em></h2>
          </div>
          <button onClick={() => playFrom(episode.transcript[0]?.timestamp ?? 0)}>
            Start reading with audio <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="sc-transcript-lines">
          {episode.transcript.slice(0, 5).map((line) => (
            <button key={line.id} onClick={() => playFrom(line.timestamp)}>
              <time>{time(line.timestamp)}</time>
              <span>{line.speaker}</span>
              <p>{line.text}</p>
            </button>
          ))}
        </div>
      </section>
      <section className="sc-profile">
        <div className="sc-profile-image">
          <img src={episode.portraitImage} alt={episode.guestName} loading="lazy" />
          <span className="sc-eyebrow">THE PERSON BEHIND THE PERSPECTIVE</span>
        </div>
        <div>
          <span className="sc-eyebrow">MEET THE GUEST / 03</span>
          <h2>{episode.guestName}</h2>
          <p className="sc-profile-role">
            {episode.guestRole}<br />{episode.guestCompany}
          </p>
          <p>{episode.guestBio}</p>
          <a
            href={episode.guestLinkedInUrl || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(episode.guestName)}`}
            target="_blank"
            rel="noreferrer"
          >
            Find {episode.guestName.split(' ')[0]} on LinkedIn <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
      <section className="sc-connections">
        <div>
          <span className="sc-eyebrow">KEEP THE CONVERSATION GOING / 04</span>
          <h2>Listen wherever<br /><em>you already are.</em></h2>
          <p>Follow 10X Future and take the next conversation with you.</p>
        </div>
        <nav aria-label="Podcast platforms">
          {PODCAST_PLATFORMS.map((platform) => (
            <a key={platform.id} href={platform.href} target="_blank" rel="noreferrer">
              <span className="sc-eyebrow">{platform.action}</span>
              <strong>{platform.name}</strong>
              <ArrowUpRight />
            </a>
          ))}
        </nav>
      </section>
    </div>
  );
}

function Footer({ name }: { name: string }) {
  return (
    <footer className="sc-footer">
      <span>10X FUTURE<br /><small>A MangoMagic podcast.</small></span>
      <a href="#top">Back to the top ↗</a>
      <span>{name}<br /><small>Independent minds. Open conversations.</small></span>
    </footer>
  );
}

export function SunsetCatalogueWorld(props: Props) {
  const { episode, episodes, onSelectEpisode, isPlaying } = props;
  const activeIndex = Math.max(0, episodes.findIndex((item) => item.id === episode.id));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const slides = episodes.map((ep) => ({
    src: ep.portraitImage,
    alt: `Portrait of ${ep.guestName}`,
    title: ep.guestName,
    subtitle: `EP ${ep.episodeNumber} · ${ep.title}`,
    meta: [
      { label: 'Length', value: ep.duration },
      { label: 'Released', value: ep.releaseDate },
    ],
  }));

  return (
    <main id="top" className="sc sunset-world" data-reduced={prefersReducedMotion}>
      <nav className="sc-nav">
        <a href="#top" className="sc-logo">
          MANGO<span>MAGIC</span>
        </a>
        <span className="sc-eyebrow">SUNSET CATALOGUE · {episodes.length} RECORDS</span>
        <a href="#sc-archive">Browse the collection <ArrowUpRight size={16} /></a>
      </nav>

      <section className="sc-hero">
        <div className="sc-hero-copy">
          <span className="sc-eyebrow">THE EPISODE COLLECTION</span>
          <h1>Go on.<br /><em>Dig a little.</em></h1>
          <p>Every sleeve has a story. Find your next one.</p>
        </div>

        <CoverflowCarousel
          className="sc-coverflow"
          cardClassName="sc-cover-card"
          label="Episode catalogue"
          showCaption
          showPagination
          showNavigation
          defaultIndex={activeIndex}
          onSlideChange={(index) => onSelectEpisode(episodes[index])}
          reducedMotion={prefersReducedMotion}
          cardWidth="clamp(180px, min(25vw, 40svh), 340px)"
          renderSlide={(_, index) => (
            <div className="sc-sleeve">
              <img className="sc-sleeve-photo" src={slides[index].src} alt="" draggable={false} referrerPolicy="no-referrer" />
              <div className="sc-sleeve-ink" />
              <div className="sc-sleeve-masthead">
                <span>MANGO<br />MAGIC</span>
                <span>VOL.<br />{slides[index].meta[0].value}</span>
              </div>
              <div className="sc-sleeve-title">{slides[index].title}<span>{slides[index].subtitle}</span></div>
              <div className="sc-sleeve-bottom">
                <span>A conversation worth keeping.</span>
                <span>33⅓ / STEREO</span>
              </div>
              <span className="sc-sleeve-spine" />
            </div>
          )}
          slides={slides}
        />

        <div className="sc-selection" aria-live="polite">
          <span className="sc-eyebrow">SELECTED / EP {episode.episodeNumber}</span>
          <h3>{episode.guestName}</h3>
          <p>{episode.title}</p>
          <div className="sc-selection-controls">
            <Listen isPlaying={isPlaying} label="Play the record" />
            <Timeline {...props} />
          </div>
        </div>
      </section>

      <section id="sc-archive" className="sc-archive" aria-labelledby="sc-archive-heading">
        <div className="sc-section-heading">
          <h2 id="sc-archive-heading">Stay curious.</h2>
          <span className="sc-eyebrow">{episodes.length.toString().padStart(2, '0')} RECORDS & COUNTING</span>
        </div>
        <div className="sc-archive-grid" role="list">
          {episodes.map((ep) => (
            <button
              key={ep.id}
              className="sc-archive-card"
              role="listitem"
              aria-pressed={ep.id === episode.id}
              onClick={() => onSelectEpisode(ep)}
            >
              <span className="sc-eyebrow">{ep.episodeNumber}</span>
              <img src={ep.portraitImage} alt="" loading="lazy" />
              <span>
                <strong>{ep.title}</strong>
                <small>{ep.guestName}</small>
              </span>
              <span className="sc-duration">{ep.duration}</span>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      </section>

      <section className="sc-about">
        <div>
          <span className="sc-eyebrow">BETWEEN THE LINES</span>
          <h2>There's more<br />to the story.</h2>
          <p>{episode.synopsis}</p>
        </div>
        <Notes {...props} />
      </section>

      <MoreSections episode={episode} onSeek={props.onSeek} />
      <Footer name="Made for listening. Kept for later." />
    </main>
  );
}