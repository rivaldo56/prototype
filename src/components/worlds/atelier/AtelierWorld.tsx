import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Episode, WorldType } from '../../../types';
import { audioEngine } from '../../../utils/audioEngine';
import { EpisodesView } from './episodes/EpisodesView';
import { EpisodeDetailView } from './episode/EpisodeDetailView';
import { ShowView } from './show/ShowView';
import { AtelierNav } from './AtelierNav';
import { AtelierMenu } from './AtelierMenu';
import { AtelierAudioToggle } from './AtelierAudioToggle';
import { AtelierLoadCover } from './AtelierLoadCover';
import './atelier.css';

export type AtelierView = 'episodes' | 'episode' | 'show';

interface AtelierWorldProps {
  episode: Episode;
  episodes: Episode[];
  isPlaying: boolean;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onSelectEpisode?: (ep: Episode) => void;
  onSelectWorld?: (w: WorldType) => void;
}

const viewFromUrl = (): AtelierView => {
  const value = new URLSearchParams(window.location.search).get('atelierView');
  return value === 'episode' || value === 'show' ? value : 'episodes';
};

export const AtelierWorld: React.FC<AtelierWorldProps> = ({
  episode,
  episodes,
  isPlaying,
  currentTime,
  onSeek,
  onSelectEpisode,
  onSelectWorld,
}) => {
  const [view, setView] = useState<AtelierView>(viewFromUrl);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadComplete, setLoadComplete] = useState(false);
  const [detailEpisode, setDetailEpisode] = useState<Episode>(episode);

  // Keep detail episode in sync when the global active episode changes.
  useEffect(() => {
    setDetailEpisode(episode);
  }, [episode]);

  // Sync internal view with URL query param without reloading the page.
  useEffect(() => {
    const onPopState = () => setView(viewFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (nextView: AtelierView, ep?: Episode) => {
    if (ep && ep.id !== detailEpisode.id) {
      setDetailEpisode(ep);
      onSelectEpisode?.(ep);
    }
    setView(nextView);
    setMenuOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set('atelierView', nextView);
    window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEpisode = (ep: Episode) => {
    navigate('episode', ep);
  };

  const handleNextEpisode = () => {
    const index = episodes.findIndex((ep) => ep.id === detailEpisode.id);
    const next = episodes[(index + 1) % episodes.length];
    navigate('episode', next);
  };

  const handlePrevEpisode = () => {
    const index = episodes.findIndex((ep) => ep.id === detailEpisode.id);
    const prev = episodes[(index - 1 + episodes.length) % episodes.length];
    navigate('episode', prev);
  };

  const goToShow = () => navigate('show');
  const goToEpisodes = () => navigate('episodes');

  const activeView = useMemo(() => {
    switch (view) {
      case 'episode':
        return (
          <EpisodeDetailView
            key={detailEpisode.id}
            episode={detailEpisode}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onSeek={onSeek}
            onNext={handleNextEpisode}
            onPrev={handlePrevEpisode}
          />
        );
      case 'show':
        return <ShowView episodes={episodes} onSelectEpisode={handleSelectEpisode} />;
      default:
        return (
          <EpisodesView
            episodes={episodes}
            activeEpisode={episode}
            onSelectEpisode={handleSelectEpisode}
            onGoToShow={goToShow}
          />
        );
    }
  }, [view, detailEpisode, episode, episodes, isPlaying, currentTime, onSeek]);

  return (
    <div className="atelier-world min-h-screen relative">
      <AtelierLoadCover onComplete={() => setLoadComplete(true)} />

      <AtelierNav
        currentView={view}
        onOpenMenu={() => setMenuOpen(true)}
      />

      <AnimatePresence>
        {menuOpen && (
          <AtelierMenu
            currentView={view}
            onClose={() => setMenuOpen(false)}
            onNavigate={navigate}
            onSelectWorld={onSelectWorld}
          />
        )}
      </AnimatePresence>

      <AtelierAudioToggle isPlaying={isPlaying} />

      <AnimatePresence mode="wait">
        {loadComplete && (
          <motion.main
            key={view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeView}
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
};
