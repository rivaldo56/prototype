import { LinkedInCTA } from '../common/LinkedInCTA';
import { EcoClips } from './eco/EcoClips';
import { EcoRail } from './eco/EcoRail';
import { TopicRibbon } from '../common/TopicRibbon';
import { SponsorsSection, PodcastPlatformLinks } from '../common/PodcastConnections';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Episode, Chapter, WorldType } from '../../types';
import { Play, Pause, Compass, Volume2, Sparkles, ArrowDown, Eye, Share2, Check } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';
import { Ripple } from '../magicui/ripple';

interface EcoEditorialWorldProps {
  episode: Episode;
  isPlaying: boolean;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onSelectWorld?: (w: WorldType) => void;
  onSelectEpisode?: (ep: Episode) => void;
  episodes?: Episode[];
}

export const EcoEditorialWorld: React.FC<EcoEditorialWorldProps> = ({
  episode,
  isPlaying,
  currentTime,
  onSeek,
  onSelectWorld,
  onSelectEpisode,
  episodes = [],
}) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [copiedQuote, setCopiedQuote] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Track active chapter based on time
  useEffect(() => {
    const idx = episode.chapters.findIndex((ch, i) => {
      const nextTime = episode.chapters[i + 1]?.time ?? Infinity;
      return currentTime >= ch.time && currentTime < nextTime;
    });
    if (idx !== -1 && idx !== activeChapterIndex) {
      setActiveChapterIndex(idx);
    }
  }, [currentTime, episode.chapters, activeChapterIndex]);

  // Mouse parallax interaction on the hero
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyQuote = () => {
    navigator.clipboard?.writeText?.(episode.heroQuote);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070b09] text-[#edece6] selection:bg-emerald-600 selection:text-white relative overflow-hidden">
      {/* Editorial Folio Header Strip */}
      <div className="border-b border-emerald-950/80 px-6 py-3.5 bg-[#050806]/90 relative z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tech text-emerald-400/80">
          <div className="flex items-center gap-3">
            <span className="text-emerald-300 font-bold tracking-widest uppercase">
              DOCUMENTARY MONOGRAPH // VOL. 0{episode.episodeNumber}
            </span>
            <span className="text-emerald-800">/</span>
            <span className="text-neutral-400">PLANETARY ACOUSTICS & CIRCULAR SYSTEMS</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-emerald-500/70">
            <span>LOCATION: GOLDEN, COLORADO</span>
            <span>·</span>
            <span>DURATION: {episode.duration}</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. CINEMATIC HERO: THE LIVING COMPOSITION                 */}
      {/* Giant typography interweaves with masked protagonist       */}
      {/* ========================================================= */}
      <div
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[92vh] flex flex-col justify-between px-6 md:px-12 py-12 overflow-hidden select-none"
      >
        {/* Deep Forest Ambient Lighting */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(16, 185, 129, 0.25) 0%, transparent 60%)`,
          }}
        />

        {/* Top Tagline & Audio Play Beacon */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-xs font-mono-tech tracking-wider uppercase backdrop-blur-md">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-emerald-700'}`} />
            <span>THE LIVING DIGITAL MAGAZINE</span>
          </div>

          <button
            onClick={() => audioEngine.togglePlay()}
            className="group flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-sans-clean font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-950/50 hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE MONOGRAPH</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
                <span>LISTEN TO STORY ({episode.duration})</span>
              </>
            )}
          </button>
        </div>

        {/* LAYER 1: Continuous Slow-Paced Infinite Background Marquee (Right-to-Left) */}
        <div className="absolute inset-0 flex items-center justify-start pointer-events-none z-0 overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 38,
              ease: "linear",
              repeat: Infinity,
            }}
            className="flex items-center gap-16 font-editorial text-[18vw] font-black text-emerald-950/40 uppercase tracking-tighter leading-none select-none whitespace-nowrap will-change-transform"
          >
            <span>ECHO CHAMPION</span>
            <span className="text-emerald-800/30 text-[10vw]">✦</span>
            <span>ECHO CHAMPION</span>
            <span className="text-emerald-800/30 text-[10vw]">✦</span>
            <span>ECHO CHAMPION</span>
            <span className="text-emerald-800/30 text-[10vw]">✦</span>
            <span>ECHO CHAMPION</span>
            <span className="text-emerald-800/30 text-[10vw]">✦</span>
          </motion.div>
        </div>

        {/* LAYER 2: The Protagonist Silhouette & Portrait Collage */}
        <div className="relative z-10 my-auto flex flex-col lg:flex-row items-center justify-center gap-10 md:gap-16 py-8">
          {/* Protagonist Round Photographic Frame with Magic UI Ripple Resonance */}
          <div className="relative flex items-center justify-center p-6">
            {/* Magic UI Ripple expanding outward from the circular portrait */}
            <Ripple
              mainCircleSize={320}
              numCircles={7}
              mainCircleOpacity={0.35}
              circleClassName="border-emerald-500/35 shadow-[0_0_24px_rgba(16,185,129,0.15)]"
            />

            {/* Circular Portrait Frame */}
            <div
              className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden shadow-[0_0_60px_rgba(6,24,16,0.9),0_0_0_3px_rgba(16,185,129,0.35)] bg-neutral-900 z-10 group cursor-pointer"
              style={{
                transform: `perspective(1000px) rotateY(${(mousePos.x - 0.5) * 8}deg) rotateX(${(mousePos.y - 0.5) * -8}deg)`,
                transition: 'transform 0.15s ease-out',
              }}
            >
              <img
                src={episode.portraitImage}
                alt={episode.guestName}
                className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />

            </div>
          </div>

          {/* LAYER 3: Hero Title & Narrative Hook (Interweaving Layer) */}
          <div className="max-w-xl space-y-6 text-center lg:text-left">
            <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.08] tracking-normal text-[#f5f3eb]">
              {episode.title}
            </h1>

            <p className="font-editorial italic text-xl sm:text-2xl text-emerald-300/90 leading-relaxed">
              "{episode.subtitle}"
            </p>

            <p className="text-sm md:text-base text-neutral-300 font-sans-clean leading-relaxed">
              {episode.synopsis}
            </p>
            <LinkedInCTA name={episode.guestName} profileUrl={episode.guestLinkedInUrl} world="eco" />
          </div>
        </div>

        {/* Bottom Scroll Cue */}
        <div className="relative z-20 flex items-center justify-between text-xs font-mono-tech text-emerald-500/60 pt-6 border-t border-emerald-950/80">
          <span>SCROLL FOR MONOGRAPH CHAPTERS</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
          <span>CURATED BY MANGO MAGIC</span>
        </div>
      </div>

      {episodes.length > 0 && onSelectEpisode && <EcoRail
        title="The episode collection"
        eyebrow="From the field / Conversations"
        description="Different voices. Fresh perspectives. Find a conversation to spend time with."
        resetKey="episodes"
      >
        {episodes.map(item => <button type="button" className="eco-story-card eco-episode-card" key={item.id} aria-pressed={item.id === episode.id} aria-label={`Play episode ${item.episodeNumber}: ${item.guestName}`} onClick={() => { onSelectEpisode(item); audioEngine.play(); }}>
          <div className="eco-story-image"><img src={item.portraitImage} alt={item.guestName} loading="lazy" referrerPolicy="no-referrer" /></div>
          <div className="eco-story-body">
            <h3>{item.title}</h3>
            <div className="eco-episode-caption"><span>{item.guestName}</span><span>{item.duration}</span></div>
            <span className="eco-episode-play" aria-hidden="true"><Play size={17} fill="currentColor" /></span>
          </div>
        </button>)}
      </EcoRail>}

      <EcoClips episode={episode} onSeek={onSeek} />

      {/* ========================================================= */}
      {/* 3. MONUMENTAL INTERRUPTING QUOTE                          */}
      {/* High-contrast typography with generous negative space      */}
      {/* ========================================================= */}
      <section className="border-y border-emerald-950/80 bg-[#060907] py-24 md:py-32 px-6 md:px-16">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <span className="text-5xl text-emerald-500/40 font-editorial">“</span>
          <blockquote className="font-editorial text-3xl sm:text-5xl md:text-6xl text-[#f7f5ed] font-light leading-snug tracking-tight">
            {episode.heroQuote}
          </blockquote>
          <div className="flex items-center justify-center gap-4 text-xs font-mono-tech text-emerald-400 pt-4">
            <span>— {episode.guestName.toUpperCase()}</span>
            <span>·</span>
            <button
              onClick={handleCopyQuote}
              className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-white transition-colors cursor-pointer"
            >
              {copiedQuote ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedQuote ? 'COPIED TO CLIPBOARD' : 'COPY EXCERPT'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. THE LONG-FORM ARCHIVAL MONOGRAPH ESSAY                 */}
      {/* Luxury book styling with drop cap and generous margins    */}
      {/* ========================================================= */}
      <section className="max-w-3xl mx-auto px-6 py-24 space-y-10">
        <div className="border-b border-emerald-950 pb-4 flex items-center justify-between text-xs font-mono-tech text-emerald-400">
          <span>THE ESSAY // WRITTEN MONOGRAPH</span>
          <span>CURATED TRANSCRIPTION</span>
        </div>

        <div className="space-y-6 text-base md:text-lg text-neutral-300 font-sans-clean leading-relaxed">
          {episode.editorialBody.map((para, i) => (
            <p
              key={i}
              className={i === 0 ? 'first-letter:text-5xl first-letter:font-editorial first-letter:font-bold first-letter:text-emerald-400 first-letter:float-left first-letter:mr-3 first-letter:leading-none' : ''}
            >
              {para}
            </p>
          ))}
        </div>
      </section>
      {/* ========================================================= */}
      {/* HOST ABOUT SECTION: ECO EDITORIAL STYLE                   */}
      {/* ========================================================= */}
      <section className="bg-[#030604] border-t border-emerald-950/50 py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="text-xs font-mono-tech text-emerald-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-4">
              The Editor & Host
            </div>
            <h3 className="text-4xl md:text-5xl font-editorial text-[#f7f5ed] leading-tight">
              Julian Thorne
            </h3>
            <p className="text-neutral-400 font-sans-clean leading-relaxed text-lg max-w-md">
              A botanist turned audio documentarian, Julian explores the delicate intersection of ecology and human infrastructure. His conversations are deeply researched, intentionally paced, and grounded in the natural world.
            </p>
            <LinkedInCTA name="Julian Thorne" world="eco" />
          </div>
          <div className="relative aspect-[3/4] rounded-tr-[100px] rounded-bl-[100px] overflow-hidden border border-emerald-900/40 p-2">
            <div className="w-full h-full rounded-tr-[90px] rounded-bl-[90px] overflow-hidden bg-black relative">
              <img 
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop" 
                alt="Julian Thorne"
                className="w-full h-full object-cover mix-blend-luminosity opacity-80 hover:opacity-100 transition-opacity duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-emerald-900/20 mix-blend-color pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      <TopicRibbon world="eco" />
      <SponsorsSection world="eco" />

      {/* ========================================================= */}
      {/* CALL TO ACTION: ECO EDITORIAL STYLE                       */}
      {/* ========================================================= */}
      <section className="bg-emerald-950 py-24 px-6 md:px-16 text-center border-t border-emerald-900/60">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl sm:text-5xl font-editorial font-light text-[#f7f5ed] leading-tight">
            Cultivate the Conversation.
          </h2>
          <p className="text-emerald-100/70 font-sans-clean text-lg max-w-xl mx-auto leading-relaxed">
            Join the editorial newsletter. A weekly monograph delivered to your inbox, focusing on the symbiosis of design and nature.
          </p>
          <div className="pt-8">
            <button className="px-8 py-3 bg-[#f7f5ed] hover:bg-white text-emerald-950 font-mono-tech text-xs font-bold uppercase tracking-widest transition-colors rounded-full shadow-lg hover:shadow-emerald-900/50">
              Join the Expedition
            </button>
          </div>
        </div>
      </section>
      <PodcastPlatformLinks world="eco" />
    </div>
  );
};
