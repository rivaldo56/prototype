import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Mail } from 'lucide-react';
import { Episode } from '../../../../types';

interface ShowViewProps {
  episodes: Episode[];
  onSelectEpisode: (ep: Episode) => void;
}

const capabilities = [
  'Conversational storytelling',
  'Acoustic ecology',
  'Executive futures',
  'Tactile interaction design',
  'Ambient computing',
  'Editorial art direction',
];

const process = [
  'Discovery — align on guest, thesis, and narrative arc.',
  'One episode first — record the spine conversation.',
  'Build the rest — edit chapters, pull quotes, and sonic identity.',
  'Mobile matters — refine transcript and playback for every screen.',
  'Final review — polish pacing, fact-check, and mix.',
  'Publish — release with artwork, liner notes, and platform links.',
];

const awards = [
  'Awwwards Site of the Day — MangoMagic Jukebox',
  'FWA of the Day — Executive Monolith',
  'CSSDA Website of the Day — Eco Editorial',
  'Behance UI Gallery — Atelier Portfolio',
  'Webby Honoree — Conversational Design',
];

const stats = [
  { value: '04', label: 'Episodes' },
  { value: '18', label: 'Months' },
  { value: '4.9', label: 'Rating' },
];

export const ShowView: React.FC<ShowViewProps> = ({ episodes, onSelectEpisode }) => {
  return (
    <article className="atelier-show">
      {/* Hero / bio */}
      <section className="px-6 md:px-12 pt-12 pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="md:col-span-7"
            >
              <p className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)] mb-4">
                About the show
              </p>
              <h1 className="font-editorial text-3xl md:text-5xl lg:text-6xl font-bold uppercase leading-[1] tracking-tight mb-8">
                Shaping conversations with clarity, intention, and character.
              </h1>
              <p className="text-base md:text-lg font-sans-clean leading-relaxed opacity-80 max-w-2xl">
                MangoMagic is an independent podcast expedition. Every episode is treated as its own
                world — its own typography, imagery, interaction, and sonic identity — while always
                keeping the human voice at the center.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="md:col-span-5"
            >
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center md:text-left">
                    <div className="font-display text-4xl md:text-5xl font-bold tracking-tighter">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)] mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Awards & capabilities */}
      <section className="px-6 md:px-12 py-16 md:py-24 border-t border-[var(--atelier-border)]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)] mb-6">
              Awards & Recognition
            </h2>
            <ul className="atelier-awards-list">
              {awards.map((award) => (
                <li key={award}>{award}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)] mb-6">
              Capabilities
            </h2>
            <div className="flex flex-wrap gap-2">
              {capabilities.map((cap) => (
                <span
                  key={cap}
                  className="px-3 py-1.5 rounded-full border border-[var(--atelier-border)] text-xs font-sans-clean"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="px-6 md:px-12 py-16 md:py-24 border-t border-[var(--atelier-border)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)] mb-8">
            Process
          </h2>
          <div className="atelier-process-list grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
            {process.map((step, i) => (
              <div key={i} className="atelier-process-item">
                <p className="text-base font-sans-clean leading-relaxed opacity-85">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selected episodes */}
      <section className="px-6 md:px-12 py-16 md:py-24 border-t border-[var(--atelier-border)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)] mb-8">
            Selected work
          </h2>
          <div className="space-y-0">
            {episodes.map((ep, index) => (
              <button
                key={ep.id}
                onClick={() => onSelectEpisode(ep)}
                className="group w-full flex items-center gap-4 md:gap-8 py-5 border-b border-[var(--atelier-border)] text-left hover:opacity-70 transition-opacity"
              >
                <span className="text-[10px] font-mono-tech text-[var(--atelier-muted)] w-8">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-editorial text-xl md:text-2xl font-bold uppercase tracking-tight truncate">
                    {ep.guestName}
                  </h3>
                  <p className="text-sm font-sans-clean text-[var(--atelier-muted)] truncate">
                    {ep.title}
                  </p>
                </div>
                <span className="hidden md:block text-[10px] font-mono-tech text-[var(--atelier-muted)]">
                  {ep.releaseDate}
                </span>
                <ArrowUpRight className="w-5 h-5 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-6 md:px-12 py-24 md:py-32 border-t border-[var(--atelier-border)]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-editorial text-3xl md:text-5xl font-bold uppercase tracking-tight mb-4">
            Come say hi
          </h2>
          <p className="text-sm font-sans-clean text-[var(--atelier-muted)] mb-6">
            Drop us a line for collaborations, guest suggestions, or just to say hello.
          </p>
          <a
            href="mailto:hello@mangomagic.fm"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--atelier-fg)] text-[var(--atelier-bg)] text-[11px] font-mono-tech uppercase tracking-widest hover:opacity-85 transition-opacity"
          >
            <Mail className="w-4 h-4" />
            <span>hello@mangomagic.fm</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </article>
  );
};
