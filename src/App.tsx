import React, { useState, useEffect } from 'react';
import { WorldType, Episode } from './types';
import { EPISODES } from './data/podcastData';
import { audioEngine } from './utils/audioEngine';
import { StudioBar } from './components/common/StudioBar';
import { ManifestoModal } from './components/common/ManifestoModal';
import { EcoEditorialWorld } from './components/worlds/EcoEditorialWorld';
import { ExecutiveInterviewWorld } from './components/worlds/ExecutiveInterviewWorld';
import { MangoJukeboxWorld } from './components/worlds/MangoJukeboxWorld';
import { AtelierReplicaWorld as AtelierWorld } from './components/worlds/atelier/AtelierReplicaWorld';

import { MarginWorld, ShuffleWorld, FrequencyWorld } from './components/worlds/PrototypeWorlds';

const worldKeys: WorldType[] = ['eco', 'executive', 'jukebox', 'margin', 'shuffle', 'frequency', 'atelier'];
const worldFromUrl = (): WorldType => {
  const value = new URLSearchParams(window.location.search).get('variant') as WorldType;
  return worldKeys.includes(value) ? value : 'jukebox';
};

export default function App() {
  const [currentWorld, setCurrentWorld] = useState<WorldType>(worldFromUrl);
  const [activeEpisode, setActiveEpisode] = useState<Episode>(EPISODES[2]); // Start with Clint Carlos (The Polymath's Engine) or Jeffrey Yorzyk
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isManifestoOpen, setIsManifestoOpen] = useState<boolean>(false);

  useEffect(() => {
    const onPopState = () => setCurrentWorld(worldFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Sync with AudioEngine
  useEffect(() => {
    audioEngine.setDuration(activeEpisode.durationSeconds);

    const unsubTime = audioEngine.onTimeUpdate((time) => {
      setCurrentTime(time);
    });

    const unsubState = audioEngine.onStateChange((playing) => {
      setIsPlaying(playing);
    });

    return () => {
      unsubTime();
      unsubState();
    };
  }, [activeEpisode]);

  const handleSelectWorld = (world: WorldType) => {
    setCurrentWorld(world);
    const url = new URL(window.location.href);
    url.searchParams.set('variant', world);
    window.history.pushState({}, '', url);
    audioEngine.triggerHapticClick(0.08);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEpisode = (episode: Episode) => {
    setActiveEpisode(episode);
    audioEngine.setDuration(episode.durationSeconds);
    audioEngine.seek(0);
  };

  const handleSeek = (seconds: number) => {
    audioEngine.seek(seconds);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Universal Floating Studio Director Bar */}
      <StudioBar
        currentWorld={currentWorld}
        onSelectWorld={handleSelectWorld}
        episodes={EPISODES}
        activeEpisode={activeEpisode}
        onSelectEpisode={handleSelectEpisode}
        isPlaying={isPlaying}
        currentTime={currentTime}
        onOpenManifesto={() => setIsManifestoOpen(true)}
      />

      {/* World Canvas */}
      <div className="flex-1">
        {(['margin', 'shuffle', 'frequency'] as WorldType[]).includes(currentWorld) && (() => {
          const World = currentWorld === 'margin' ? MarginWorld : currentWorld === 'shuffle' ? ShuffleWorld : FrequencyWorld;
          return <World episode={activeEpisode} episodes={EPISODES} isPlaying={isPlaying} currentTime={currentTime} onSeek={handleSeek} onSelectEpisode={handleSelectEpisode} />;
        })()}
        {currentWorld === 'eco' && (
          <EcoEditorialWorld
            episode={activeEpisode}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onSeek={handleSeek}
            onSelectWorld={handleSelectWorld}
            onSelectEpisode={handleSelectEpisode}
            episodes={EPISODES}
          />
        )}

        {currentWorld === 'executive' && (
          <ExecutiveInterviewWorld
            episode={activeEpisode}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onSeek={handleSeek}
            onSelectWorld={handleSelectWorld}
            onSelectEpisode={handleSelectEpisode}
            episodes={EPISODES}
          />
        )}

        {currentWorld === 'jukebox' && (
          <MangoJukeboxWorld
            episodes={EPISODES}
            activeEpisode={activeEpisode}
            onSelectEpisode={handleSelectEpisode}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onSeek={handleSeek}
            onSelectWorld={handleSelectWorld}
          />
        )}

        {currentWorld === 'atelier' && (
          <AtelierWorld
            episode={activeEpisode}
            episodes={EPISODES}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onSeek={handleSeek}
            onSelectEpisode={handleSelectEpisode}
            onSelectWorld={handleSelectWorld}
          />
        )}
      </div>

      {/* Creative Director's Manifesto & Concept Critique Modal */}
      <ManifestoModal
        isOpen={isManifestoOpen}
        onClose={() => setIsManifestoOpen(false)}
        onSelectWorld={handleSelectWorld}
      />
    </div>
  );
}
