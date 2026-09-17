import React from 'react';
import { motion, MotionValue, useTransform } from 'motion/react';
import { Episode } from '../../../../types';

interface EpisodeStageProps {
  episodes: Episode[];
  progress: MotionValue<number>;
  activeIndex: MotionValue<number>;
}

export const EpisodeStage: React.FC<EpisodeStageProps> = ({ episodes, progress, activeIndex }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {episodes.map((episode, index) => (
        <EpisodeCover
          key={episode.id}
          episode={episode}
          index={index}
          total={episodes.length}
          progress={progress}
          activeIndex={activeIndex}
        />
      ))}
    </div>
  );
};

interface EpisodeCoverProps {
  episode: Episode;
  index: number;
  total: number;
  progress: MotionValue<number>;
  activeIndex: MotionValue<number>;
}

const EpisodeCover: React.FC<EpisodeCoverProps> = ({
  episode,
  index,
  total,
  progress,
  activeIndex,
}) => {
  // Each episode occupies a slice of the scroll range.
  const start = index / (total - 1 || 1);
  const end = (index + 1) / (total - 1 || 1);

  // Distance from active index (negative = before, positive = after).
  const offset = useTransform(activeIndex, (value: number) => value - index);

  const y = useTransform(offset, [-1.5, 0, 1.5], ['-80vh', '0vh', '80vh']);
  const scale = useTransform(offset, [-1.5, 0, 1.5], [0.72, 1, 0.72]);
  const opacity = useTransform(offset, [-1.2, -0.8, 0, 0.8, 1.2], [0, 0.25, 1, 0.25, 0]);
  const rotateZ = useTransform(offset, [-1, 0, 1], [-4, 0, 4]);

  // Tint the image with the episode accent.
  const tintOpacity = useTransform(
    progress,
    [Math.max(0, start - 0.05), start, Math.min(1, end + 0.05)],
    [0, 0.15, 0]
  );

  return (
    <motion.div
      className="absolute w-[72vw] max-w-[520px] aspect-square will-change-transform"
      style={{
        y,
        scale,
        opacity,
        rotateZ,
      }}
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
        <img
          src={episode.coverImage}
          alt={episode.title}
          className="w-full h-full object-cover"
          loading={index === 0 ? 'eager' : 'lazy'}
        />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: episode.themeColor.accent,
            opacity: tintOpacity,
            mixBlendMode: 'multiply',
          }}
        />
      </div>

      {/* Subtle shadow plane */}
      <div
        className="absolute -inset-4 -z-10 rounded-[28px] opacity-30 blur-2xl"
        style={{ backgroundColor: episode.themeColor.glow }}
      />
    </motion.div>
  );
};
