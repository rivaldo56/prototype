import React, { useState } from 'react';
import { motion, MotionValue, useMotionValueEvent, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Episode } from '../../../../types';

interface EpisodeInfoCardProps {
  episodes: Episode[];
  progress: MotionValue<number>;
  activeIndex: MotionValue<number>;
  onSelectEpisode: (ep: Episode) => void;
}

export const EpisodeInfoCard: React.FC<EpisodeInfoCardProps> = ({
  episodes,
  progress,
  activeIndex,
  onSelectEpisode,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useMotionValueEvent(activeIndex, 'change', (latest: number) => {
    setCurrentIndex(Math.min(episodes.length - 1, Math.max(0, Math.round(latest))));
  });

  // Fade card slightly during fast transitions.
  const transitionProgress = useTransform(progress, (value: number) => {
    const segment = value * (episodes.length - 1);
    const distanceFromCenter = Math.abs(segment - Math.round(segment));
    return 1 - distanceFromCenter * 0.35;
  });

  const episode = episodes[currentIndex];
  if (!episode) return null;

  const colors = [
    episode.themeColor.accent,
    episode.themeColor.vinylLabel,
    episode.themeColor.glow.replace(/rgba?\(([^)]+)\).*/, 'rgb($1)'),
  ];
  const recognition = episode.takeaways[0]?.label ?? 'Editorial conversation';

  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90vw] max-w-[640px] atelier-info-card p-5 md:p-6"
      style={{ opacity: transitionProgress }}
    >
      <motion.div
        key={episode.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={() => onSelectEpisode(episode)}
          className="w-full text-left group cursor-pointer"
          aria-label={`Open episode ${episode.episodeNumber} with ${episode.guestName}`}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="atelier-pill">EP {String(episode.episodeNumber).padStart(2, '0')}</span>
                <span className="atelier-pill opacity-70">{episode.releaseDate}</span>
              </div>
              <h2 className="font-editorial text-xl md:text-2xl font-bold leading-tight uppercase tracking-tight">
                {episode.guestName}
              </h2>
            </div>
            <div className="flex gap-1.5 shrink-0 pt-1">
              {colors.map((color, i) => (
                <span
                  key={i}
                  className="atelier-swatch"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-mono-tech uppercase tracking-widest opacity-50">Recognition</p>
              <p className="text-sm font-sans-clean leading-snug opacity-90">{recognition}</p>
              <p className="text-xs font-sans-clean opacity-60 line-clamp-2 max-w-sm">
                {episode.synopsis}
              </p>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono-tech uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
              <span>View episode</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </button>
      </motion.div>
    </motion.div>
  );
};
