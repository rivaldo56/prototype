import React, { useState } from 'react';
import { WorldType, Episode } from '../../types';
import {
  Sparkles,
  Disc3,
  Play,
  Pause,
  ChevronDown,
  Volume2,
  VolumeX,
  Compass,
  Layers
} from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface StudioBarProps {
  currentWorld: WorldType;
  onSelectWorld: (w: WorldType) => void;
  episodes: Episode[];
  activeEpisode: Episode;
  onSelectEpisode: (ep: Episode) => void;
  isPlaying: boolean;
  currentTime: number;
  onOpenManifesto: () => void;
}

export const StudioBar: React.FC<StudioBarProps> = ({
  currentWorld,
  onSelectWorld,
  episodes,
  activeEpisode,
  onSelectEpisode,
  isPlaying,
  currentTime,
  onOpenManifesto,
}) => {
  const [showEpisodeDropdown, setShowEpisodeDropdown] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (isMuted) {
      audioEngine.setVolume(0.8);
      setIsMuted(false);
    } else {
      audioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 md:px-6 py-2.5 bg-black/80 backdrop-blur-xl border-b border-white/10 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Episode Quick Select */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-black text-xs font-mono-tech">
              MM
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-display tracking-tight">MangoMagic</span>
              <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                10X FUTURE
              </span>
            </div>
          </div>

          {/* Episode Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowEpisodeDropdown(!showEpisodeDropdown)}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-xs font-mono-tech text-neutral-200 transition-colors"
            >
              <span className="text-amber-400 font-bold">EP {activeEpisode.episodeNumber}:</span>
              <span className="truncate max-w-[120px] sm:max-w-[150px]">{activeEpisode.guestName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {showEpisodeDropdown && (
              <div className="absolute top-full mt-2 left-0 w-72 bg-neutral-900/95 border border-neutral-700 rounded-xl shadow-2xl p-1.5 z-50 space-y-1 backdrop-blur-2xl">
                <div className="px-3 py-1.5 text-[10px] font-mono-tech text-neutral-400 uppercase border-b border-neutral-800">
                  Select Podcast Episode
                </div>
                {episodes.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => {
                      onSelectEpisode(ep);
                      setShowEpisodeDropdown(false);
                      audioEngine.triggerHapticClick(0.08);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      ep.id === activeEpisode.id
                        ? 'bg-amber-500/20 text-amber-300 font-semibold'
                        : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <div>
                      <div className="truncate font-medium">{ep.guestName}</div>
                      <div className="text-[10px] text-neutral-400 truncate">{ep.title}</div>
                    </div>
                    <span className="text-[10px] font-mono-tech text-neutral-400 shrink-0 ml-2">
                      EP 0{ep.episodeNumber}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: The Three Paradigms Switcher */}
        <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-full border border-neutral-800 text-xs font-mono-tech">
          <button
            onClick={() => onSelectWorld('eco')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              currentWorld === 'eco'
                ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            I. Eco Editorial
          </button>
          <button
            onClick={() => onSelectWorld('executive')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              currentWorld === 'executive'
                ? 'bg-white text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            II. Executive Monolith
          </button>
          <button
            onClick={() => onSelectWorld('jukebox')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              currentWorld === 'jukebox'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            III. 3D Jukebox
          </button>
        </div>

        {/* Right: Master Audio Quick-Controller & Director's Manifesto */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono-tech">
            <button
              onClick={() => audioEngine.togglePlay()}
              className="p-1 text-white hover:text-amber-400 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <span className="text-neutral-400 text-[11px] font-mono-tech min-w-[36px]">
              {formatTime(currentTime)}
            </span>
            <button
              onClick={toggleMute}
              className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={onOpenManifesto}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-mono-tech font-semibold transition-all hover:scale-105 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>MANIFESTO</span>
          </button>
        </div>
      </div>
    </header>
  );
};
