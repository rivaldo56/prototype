import React from 'react';
import { audioEngine } from '../../../utils/audioEngine';
import { Play, Pause } from 'lucide-react';

interface AtelierAudioToggleProps {
  isPlaying: boolean;
}

export const AtelierAudioToggle: React.FC<AtelierAudioToggleProps> = ({ isPlaying }) => {
  return (
    <button
      onClick={() => audioEngine.togglePlay()}
      className="atelier-audio-toggle"
      aria-label={isPlaying ? 'Pause showreel' : 'Play showreel'}
    >
      {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
      <span>‘26 showreel</span>
    </button>
  );
};
