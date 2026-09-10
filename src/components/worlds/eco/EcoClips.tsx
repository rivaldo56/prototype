import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Pause, Play, VolumeX } from 'lucide-react';
import type { FC } from 'react';
import type { Chapter, Episode } from '../../../types';
import './eco-clips.css';

const SAMPLE_CLIPS = ['forest-stream', 'forest-aerial', 'cloud-forest'];
const timecode = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

const ClipRow: FC<{ chapter: Chapter; index: number; onSeek: (time: number) => void }> = ({ chapter, index, onSeek }) => {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const visible = useInView(frame, { amount: .35 });
  const reducedMotion = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const [intent, setIntent] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const sample = `/assets/eco/${SAMPLE_CLIPS[index % SAMPLE_CLIPS.length]}`;
  const source = chapter.videoUrl || `${sample}.mp4`;
  const poster = chapter.videoPoster || (chapter.videoUrl ? undefined : `${sample}.jpg`);

  useEffect(() => { if (visible) setLoaded(true); }, [visible]);
  useEffect(() => {
    const element = video.current;
    if (!element || !loaded) return;
    let cancelled = false;
    const sync = () => {
      element.muted = true;
      if (visible && !document.hidden && !unavailable && (intent ?? !reducedMotion)) {
        void element.play().catch(() => { if (!cancelled) setPlaying(false); });
      } else element.pause();
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => { cancelled = true; document.removeEventListener('visibilitychange', sync); element.pause(); };
  }, [visible, loaded, intent, reducedMotion, unavailable]);

  return <article className="eco-clip-row">
    <div className="eco-clip-frame" ref={frame}>
      <video ref={video} src={loaded ? source : undefined} poster={poster} muted loop playsInline preload="none" aria-label={`B-roll for ${chapter.title}`} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setUnavailable(true)} />
      <div className="eco-clip-controls">
        <span><VolumeX size={14} /> {unavailable ? 'Preview unavailable' : 'Muted'}</span>
        <button type="button" disabled={unavailable} aria-label={`${playing ? 'Pause' : 'Play'} clip ${index + 1}`} onClick={() => setIntent(!playing)}>{playing ? <Pause size={17} /> : <Play size={17} />}</button>
      </div>
    </div>
    <div className="eco-clip-copy">
      <span className="eco-clip-number">{String(index + 1).padStart(2, '0')} / {timecode(chapter.time)}</span>
      <h3>{chapter.title}</h3>
      <p>{chapter.summary}</p>
      <button type="button" className="eco-clip-jump" onClick={() => onSeek(chapter.time)}>Jump to this moment <ArrowUpRight size={16} /></button>
    </div>
  </article>;
};

export function EcoClips({ episode, onSeek }: { episode: Episode; onSeek: (time: number) => void }) {
  return <section className="eco-clips" aria-labelledby="eco-clips-heading">
    <header className="eco-clips-heading"><p>In motion / Within the conversation</p><h2 id="eco-clips-heading">A closer look.</h2><span>{episode.chapters.some(chapter => !chapter.videoUrl) ? 'Sample B-roll accompanies these moments from the conversation.' : 'Moments from the conversation, in motion.'}</span></header>
    <div className="eco-clips-list">{episode.chapters.map((chapter, index) => <ClipRow key={chapter.id} chapter={chapter} index={index} onSeek={onSeek} />)}</div>
  </section>;
}
