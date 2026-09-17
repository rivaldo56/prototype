import { useRef, useState } from 'react';
import type { CSSProperties, FC } from 'react';
import { useInView } from 'motion/react';
import { ArrowUpRight, Pause, Play, Podcast, Youtube } from 'lucide-react';
import type { WorldType } from '../../types';
import { PODCAST_PLATFORMS, SPONSOR_PREVIEWS } from '../../data/podcastConnections';
import './podcast-connections.css';

interface WorldSectionProps {
  world: Extract<WorldType, 'eco' | 'executive' | 'jukebox' | 'atelier'>;
}

const COPY = {
  eco: { eyebrow: 'A shared ecosystem', title: 'Good company. Common ground.', description: 'A space for the people and brands helping thoughtful conversations grow.' },
  executive: { eyebrow: 'The partner network', title: 'Aligned in ambition.', description: 'Independent perspectives. Shared standards. A considered space for our partners.' },
  jukebox: { eyebrow: 'The supporting acts', title: 'Better in good company.', description: 'Room on the record for the brands that keep independent voices spinning.' },
  atelier: { eyebrow: 'The studio patrons', title: 'Craft in good company.', description: 'Partners who believe podcasts can be as considered as any portfolio piece.' },
};

export const SponsorsSection: FC<WorldSectionProps> = ({ world }) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.15 });
  const [paused, setPaused] = useState(false);
  const copy = COPY[world];

  return (
    <section
      ref={ref}
      className={`podcast-connections connections--${world} sponsor-section`}
      aria-labelledby={`sponsors-${world}`}
      data-moving={inView && !paused}
    >
      <div className="connections-inner">
        <div className="sponsor-intro">
          <div>
            <p className="connections-eyebrow">Sponsors / {copy.eyebrow}</p>
            <h2 id={`sponsors-${world}`}>{copy.title}</h2>
            <p className="connections-description">{copy.description}</p>
          </div>
          <button className="sponsor-motion-toggle" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? 'Resume sponsor motion' : 'Pause sponsor motion'}>
            {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
            <span>{paused ? 'Resume motion' : 'Pause motion'}</span>
          </button>
        </div>

        <div className="sponsor-stage">
          <svg className="sponsor-connections" viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true">
            <path className="sponsor-connection-base" d={world === 'eco' ? 'M 0 130 C 160 30 220 200 340 110 S 560 20 660 110 S 850 200 1000 80' : 'M 0 110 H 1000'} />
            <path className="sponsor-connection-tracer" d={world === 'eco' ? 'M 0 130 C 160 30 220 200 340 110 S 560 20 660 110 S 850 200 1000 80' : 'M 0 110 H 1000'} pathLength="100" />
          </svg>
          <ul className="sponsor-list">
            {SPONSOR_PREVIEWS[world].map((sponsor, index) => (
              <li className="sponsor-item" key={sponsor.name} style={{ '--sponsor-index': index } as CSSProperties}>
                <div className="sponsor-art" aria-hidden="true">
                  <span className="sponsor-orbit sponsor-orbit-one" />
                  <span className="sponsor-orbit sponsor-orbit-two" />
                  <span className="sponsor-orbit sponsor-orbit-three" />
                  <span className="sponsor-center" />
                </div>
                <div className="sponsor-wordmark">{sponsor.name}</div>
                <span className="sponsor-discipline">{sponsor.discipline}</span>
                <span className="sponsor-catalog">0{index + 1} / {world === 'jukebox' ? 'SIDE B' : world === 'atelier' ? 'PATRON' : 'PARTNER'}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="sponsor-preview-note">Sponsor preview · Sample identities</p>
      </div>
    </section>
  );
};

export const PodcastPlatformLinks: FC<WorldSectionProps> = ({ world }) => (
  <footer id={`platforms-${world}`} className={`podcast-connections connections--${world} platform-section`} aria-labelledby={`platforms-${world}`}>
    <div className="connections-inner">
      <div className="platform-heading">
        <p className="connections-eyebrow">Listen / Watch / Discover</p>
        <h2 id={`platforms-${world}`}>
          {world === 'eco'
            ? 'Find your next conversation.'
            : world === 'executive'
            ? 'A different perspective. On your terms.'
            : world === 'atelier'
            ? 'Selected conversations. Every platform.'
            : 'Same curiosity. Different frequencies.'}
        </h2>
        <p className="connections-description">Explore podcast platforms.</p>
      </div>
      <nav className="platform-links" aria-label="Podcast platforms">
        {PODCAST_PLATFORMS.map((platform) => (
          <a key={platform.id} href={platform.href} target="_blank" rel="noopener noreferrer" className="platform-link" aria-label={`${platform.name} homepage (opens in a new tab)`}>
            <span className={`platform-icon platform-icon--${platform.id}`} aria-hidden="true">
              {platform.id === 'spotify' ? (
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="currentColor" /><g stroke="var(--platform-icon-ink)" strokeWidth="1.6" strokeLinecap="round"><path d="M6 9c4-1.5 8-1.2 12 .8" /><path d="M7 12.3c3.4-1.1 6.7-.8 9.7.7" /><path d="M8 15.5c2.6-.7 5-.5 7.4.6" /></g></svg>
              ) : platform.id === 'apple' ? <Podcast size={26} /> : <Youtube size={28} />}
            </span>
            <span className="platform-label"><span className="platform-action">{platform.action}</span><span className="platform-name">{platform.name}</span></span>
            <ArrowUpRight className="platform-arrow" size={20} aria-hidden="true" />
          </a>
        ))}
      </nav>
      <div className="connections-signoff"><span>MangoMagic</span><span>Conversations worth staying for.</span></div>
    </div>
  </footer>
);
