import React from 'react';
import { motion } from 'motion/react';
import { Play, Pause, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Episode } from '../../../../types';
import { audioEngine } from '../../../../utils/audioEngine';

interface EpisodeDetailViewProps {
  episode: Episode;
  isPlaying: boolean;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const EpisodeDetailView: React.FC<EpisodeDetailViewProps> = ({
  episode,
  isPlaying,
  onNext,
  onPrev,
}) => {
  const recognition = episode.takeaways.map((t) => t.label);

  return (
    <article className="atelier-detail">
      {/* Hero */}
      <section className="atelier-detail-hero relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={episode.coverImage}
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, var(--atelier-bg) 85%)`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full border border-[var(--atelier-fg)] text-[10px] font-mono-tech uppercase tracking-widest">
                EP {String(episode.episodeNumber).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)]">
                {episode.releaseDate}
              </span>
            </div>
            <h1 className="font-editorial text-4xl md:text-7xl lg:text-8xl font-bold uppercase leading-[0.95] tracking-tight max-w-4xl mb-4">
              {episode.title}
            </h1>
            <p className="text-lg md:text-2xl font-sans-clean text-[var(--atelier-muted)] max-w-2xl">
              with {episode.guestName}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Metadata + About */}
      <section className="px-6 md:px-12 pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            {/* Metadata sidebar */}
            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="md:col-span-4 space-y-8"
            >
              <MetaBlock label="Team / Role">
                <p className="text-sm font-sans-clean">Host / Elena Vance</p>
                <p className="text-sm font-sans-clean">Guest / {episode.guestName}</p>
                <p className="text-sm font-sans-clean">{episode.guestRole}</p>
              </MetaBlock>

              <MetaBlock label="Launch">
                <p className="text-sm font-sans-clean">{episode.releaseDate}</p>
                <p className="text-sm font-sans-clean">{episode.duration}</p>
              </MetaBlock>

              <MetaBlock label="Recognition">
                <ul className="atelier-awards-list">
                  {recognition.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </MetaBlock>

              <button
                onClick={() => audioEngine.togglePlay()}
                className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--atelier-fg)] text-[var(--atelier-bg)] text-[11px] font-mono-tech uppercase tracking-widest hover:opacity-85 transition-opacity"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pause episode' : 'Listen now'}</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </motion.aside>

            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="md:col-span-8"
            >
              <h2 className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)] mb-4">
                About
              </h2>
              <p className="font-editorial text-2xl md:text-3xl font-medium leading-snug mb-8">
                {episode.synopsis}
              </p>
              <div className="space-y-5">
                {episode.editorialBody.map((paragraph, i) => (
                  <p key={i} className="text-base md:text-lg font-sans-clean leading-relaxed text-[var(--atelier-fg)] opacity-85">
                    {paragraph}
                  </p>
                ))}
              </div>

              <blockquote className="mt-12 pl-6 border-l-2 border-[var(--atelier-fg)]">
                <p className="font-editorial text-xl md:text-2xl italic leading-snug">
                  “{episode.heroQuote}”
                </p>
                <p className="mt-3 text-sm font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)]">
                  — {episode.guestName}
                </p>
              </blockquote>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Next episode strip */}
      <section className="px-6 md:px-12 py-12 border-t border-[var(--atelier-border)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)] mb-2">
              Scroll / Next project
            </p>
            <button
              onClick={onNext}
              className="group text-left"
            >
              <h3 className="font-editorial text-2xl md:text-4xl font-bold uppercase tracking-tight group-hover:opacity-60 transition-opacity">
                Next episode →
              </h3>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onPrev}
              className="p-3 rounded-full border border-[var(--atelier-fg)] hover:bg-[var(--atelier-fg)] hover:text-[var(--atelier-bg)] transition-colors"
              aria-label="Previous episode"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNext}
              className="p-3 rounded-full border border-[var(--atelier-fg)] hover:bg-[var(--atelier-fg)] hover:text-[var(--atelier-bg)] transition-colors"
              aria-label="Next episode"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </article>
  );
};

interface MetaBlockProps {
  label: string;
  children: React.ReactNode;
}

const MetaBlock: React.FC<MetaBlockProps> = ({ label, children }) => (
  <div>
    <p className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)] mb-2">
      {label}
    </p>
    <div className="space-y-1">{children}</div>
  </div>
);
