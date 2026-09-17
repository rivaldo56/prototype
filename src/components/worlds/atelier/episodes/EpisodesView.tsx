import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'motion/react';
import { Episode } from '../../../../types';
import { EpisodeStage } from './EpisodeStage';
import { EpisodeInfoCard } from './EpisodeInfoCard';
import { AtelierFooter } from './AtelierFooter';

interface EpisodesViewProps {
  episodes: Episode[];
  activeEpisode: Episode;
  onSelectEpisode: (ep: Episode) => void;
  onGoToShow: () => void;
}

export const EpisodesView: React.FC<EpisodesViewProps> = ({
  episodes,
  activeEpisode,
  onSelectEpisode,
  onGoToShow,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  const episodeCount = episodes.length;

  // Derive the active index from scroll progress.
  const activeIndex = useTransform(smoothProgress, [0, 1], [0, episodeCount - 1]);

  const [activeIndexRounded, setActiveIndexRounded] = useState(
    Math.min(episodeCount - 1, Math.max(0, episodes.findIndex((ep) => ep.id === activeEpisode.id)))
  );

  useMotionValueEvent(activeIndex, 'change', (latest) => {
    setActiveIndexRounded(Math.min(episodeCount - 1, Math.max(0, Math.round(latest))));
  });

  // Background hue shifts subtly based on active episode theme color.
  const backgroundColor = useTransform(
    smoothProgress,
    episodes.map((_, i) => i / (episodeCount - 1 || 1)),
    episodes.map((ep) => ep.themeColor.bgGlow.replace('0.15', '0.35'))
  );

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${episodeCount * 100}vh` }}
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ backgroundColor }}
        />

        {/* 16-column difference-mode grid overlay */}
        <div className="atelier-grid-overlay atelier-grid">
          <div className="col-span-4 md:col-span-3 self-start">
            <p className="text-[10px] font-mono-tech uppercase tracking-widest opacity-50">MangoMagic</p>
            <p className="text-[10px] font-mono-tech uppercase tracking-widest opacity-50">Atelier</p>
          </div>
          <div className="col-span-8 md:col-span-10 self-start text-center hidden md:block">
            <p className="text-[10px] font-mono-tech uppercase tracking-widest opacity-50">Selected work</p>
          </div>
          <div className="col-span-4 md:col-span-3 self-start text-right">
            <p className="text-[10px] font-mono-tech uppercase tracking-widest opacity-50">Scroll</p>
          </div>

          <div className="col-span-16 self-end flex items-end justify-between pb-4">
            <div className="text-[10px] font-mono-tech uppercase tracking-widest opacity-50">
              {episodes[activeIndexRounded]?.releaseDate ?? ''}
            </div>
            <div className="text-[clamp(4rem,12vw,10rem)] font-display leading-none font-bold tracking-tighter opacity-90">
              {String(activeIndexRounded + 1).padStart(2, '0')}
            </div>
            <div className="text-[10px] font-mono-tech uppercase tracking-widest opacity-50">
              /{String(episodeCount).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Episode visual stage */}
        <EpisodeStage
          episodes={episodes}
          progress={smoothProgress}
          activeIndex={activeIndex}
        />

        {/* Floating info card */}
        <EpisodeInfoCard
          episodes={episodes}
          progress={smoothProgress}
          activeIndex={activeIndex}
          onSelectEpisode={onSelectEpisode}
        />
      </div>

      {/* Footer appears after scroll gallery */}
      <div className="absolute bottom-0 left-0 right-0">
        <AtelierFooter onGoToShow={onGoToShow} />
      </div>
    </div>
  );
};
