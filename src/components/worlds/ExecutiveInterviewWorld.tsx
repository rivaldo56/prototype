import { LinkedInCTA } from '../common/LinkedInCTA';
import { SponsorsSection, PodcastPlatformLinks } from '../common/PodcastConnections';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Episode, KeyTakeaway, WorldType } from '../../types';
import { Play, Pause, Volume2, ArrowRight, ShieldCheck, ChevronRight, Download, Check, Terminal, Cpu, Radio, Sparkles } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';
import { Meteors } from '../magicui/meteors';
import { Text3DFlip } from '../magicui/text-3d-flip';

interface ExecutiveInterviewWorldProps {
  episode: Episode;
  isPlaying: boolean;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onSelectWorld?: (w: WorldType) => void;
  onSelectEpisode?: (ep: Episode) => void;
  episodes?: Episode[];
}

export const ExecutiveInterviewWorld: React.FC<ExecutiveInterviewWorldProps> = ({
  episode,
  isPlaying,
  currentTime,
  onSeek,
  onSelectWorld,
  onSelectEpisode,
  episodes = [],
}) => {
  const [activePillar, setActivePillar] = useState<number>(0);
  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showLiveTerminal, setShowLiveTerminal] = useState(true);

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseCoord({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const handleDownloadDossier = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2400);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#030305] text-[#e4e4e7] selection:bg-white selection:text-black relative overflow-x-hidden font-sans-clean"
    >
      {/* Specular Ambient Glow tracking mouse across liquid obsidian */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-300 opacity-25 z-0"
        style={{
          background: `radial-gradient(circle at ${mouseCoord.x * 100}% ${mouseCoord.y * 100}%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)`,
        }}
      />

      {/* Magic UI Meteors: Streaking in the deep dark obsidian background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <Meteors number={35} maxDuration={8} minDuration={3} />
      </div>

      {/* Top Precision Datum Bar */}
      <div className="border-b border-neutral-800/80 px-6 py-4 bg-[#050507]/90 relative z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tech text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold tracking-widest uppercase">
              EXECUTIVE CONVERSATION // ISSUE 0{episode.episodeNumber}
            </span>
            <span className="text-neutral-700">|</span>
            <span className="text-neutral-400">THE ARCHITECTURE OF SCALE</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-neutral-400">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300">
              <Sparkles className="w-3 h-3 text-white animate-pulse" />
              <span>METEORIC FIELD: ACTIVE</span>
            </div>
            <span>RECORDED AT THE MONOLITH PAVILION</span>
            <span>·</span>
            <span>DURATION: {episode.duration}</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. CINEMATIC HERO: PRODUCT LAUNCH LUXURY & RESTRAINT      */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-16 relative z-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-neutral-900 border border-neutral-700 text-neutral-300 text-[11px] font-mono-tech tracking-widest uppercase">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-white animate-ping' : 'bg-neutral-600'}`} />
              <span>DIRECT EXECUTIVE BRIEFING</span>
            </div>

            <Text3DFlip
              id="executive-monolith-title"
              as="h1"
              className="text-4xl sm:text-6xl md:text-7xl font-semibold font-display tracking-tight text-white leading-[0.98] drop-shadow-md"
              textClassName="text-white"
              flipTextClassName="text-neutral-300"
              rotateDirection="top"
              staggerDuration={0.03}
            >
              {episode.title}
            </Text3DFlip>

            <p className="text-lg md:text-xl text-neutral-300 font-light leading-relaxed max-w-2xl">
              {episode.subtitle}
            </p>
          </div>

          <p className="text-sm md:text-base text-neutral-400 leading-relaxed max-w-2xl font-light">
            {episode.synopsis}
          </p>

          <LinkedInCTA name={episode.guestName} profileUrl={episode.guestLinkedInUrl} world="executive" />

          {/* Protagonist Executive Lockup & Master Play */}
          <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-neutral-800">
            <button
              onClick={() => audioEngine.togglePlay()}
              className="flex items-center gap-3 px-7 py-3.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>PAUSE CONVERSATION</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  <span>BEGIN CONVERSATION</span>
                </>
              )}
            </button>

            <div className="text-xs font-mono-tech text-neutral-400 space-y-0.5">
              <div className="text-white font-medium">{episode.guestName}</div>
              <div>{episode.guestRole}, {episode.guestCompany}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. THE ARCHITECTURAL THESIS MONOLITHS                     */}
      {/* Three towering strategic pillars with perspective hover    */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-10 relative z-20">
        <div className="space-y-2">
          <div className="text-xs font-mono-tech text-neutral-400 tracking-widest uppercase">
            STRATEGIC FRAMEWORKS // 3 MONOLITHS
          </div>
          <Text3DFlip
            id="executive-theses-heading"
            as="h2"
            className="text-3xl sm:text-4xl font-display font-bold text-white"
            textClassName="text-white"
            flipTextClassName="text-neutral-300"
            rotateDirection="top"
            staggerDuration={0.03}
          >
            Core Theses of Execution
          </Text3DFlip>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {episode.takeaways.slice(0, 3).map((takeaway, idx) => (
            <div
              key={takeaway.id}
              onClick={() => {
                onSeek(takeaway.timestamp);
                setActivePillar(idx);
                audioEngine.triggerHapticClick(0.08);
              }}
              className={`p-8 rounded-sm border transition-all duration-300 cursor-pointer select-none space-y-6 ${
                activePillar === idx
                  ? 'bg-neutral-900/90 border-white shadow-2xl scale-[1.02]'
                  : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono-tech">
                <span className="text-neutral-500">PILLAR // 0{idx + 1}</span>
                <span className="text-neutral-400">{formatTimecode(takeaway.timestamp)}</span>
              </div>

              <Text3DFlip
                id={`executive-pillar-heading-${takeaway.id}`}
                as="h3"
                className="text-xl font-bold font-display text-white"
                textClassName="text-white"
                flipTextClassName="text-neutral-300"
                rotateDirection="top"
                staggerDuration={0.025}
              >
                {takeaway.label}
              </Text3DFlip>

              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                {takeaway.description}
              </p>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs font-mono-tech text-neutral-400">
                <span>JUMP TO TIMESTAMP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3.5. SYNCHRONIZED TELEMETRY TERMINAL (LIVE TRANSCRIPT)    */}
      {/* Real-time telemetry feed with active statement highlighting*/}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 relative z-20">
        <div className="p-6 md:p-8 rounded-xl bg-neutral-950/95 border border-neutral-800 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4 text-white" />
              <span className="text-xs font-mono-tech text-white font-semibold uppercase tracking-wider">
                SYNCHRONIZED AUDIT TERMINAL // LIVE TRANSCRIPT
              </span>
            </div>
            <button
              onClick={() => setShowLiveTerminal(!showLiveTerminal)}
              className="text-xs font-mono-tech text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              {showLiveTerminal ? '[MINIMIZE TERMINAL]' : '[EXPAND TERMINAL]'}
            </button>
          </div>

          {showLiveTerminal && (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-4 font-mono-tech text-xs scrollbar-thin">
              {episode.transcript.map((line) => {
                const isLineActive = currentTime >= line.timestamp && currentTime < (line.timestamp + 30);
                return (
                  <div
                    key={line.id}
                    onClick={() => {
                      onSeek(line.timestamp);
                      audioEngine.triggerHapticClick(0.06);
                    }}
                    className={`p-3 rounded transition-all cursor-pointer flex items-start gap-4 ${
                      isLineActive
                        ? 'bg-white/10 border-l-2 border-white text-white'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                    }`}
                  >
                    <span className="text-neutral-500 shrink-0 font-mono-tech">
                      {formatTimecode(line.timestamp)}
                    </span>
                    <div className="space-y-1">
                      <span className={`font-semibold uppercase tracking-wider text-[11px] ${
                        line.speaker === episode.guestName ? 'text-white' : 'text-neutral-500'
                      }`}>
                        {line.speaker}:
                      </span>
                      <p className="leading-relaxed font-light text-neutral-300">
                        {line.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. MONUMENTAL INTERRUPTING QUOTE                          */}
      {/* ========================================================= */}
      <section className="border-y border-neutral-800 bg-[#020203] py-24 px-6 md:px-16 text-center space-y-8">
        <blockquote className="max-w-4xl mx-auto text-3xl sm:text-5xl font-light font-display text-white leading-tight tracking-tight">
          "{episode.heroQuote}"
        </blockquote>
        <div className="text-xs font-mono-tech text-neutral-500">
          — {episode.guestName.toUpperCase()}, FOUNDER & CEO
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. BRIEFING EXPORT & SOVEREIGN HARDWARE TOKEN             */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-t border-neutral-900 text-xs font-mono-tech text-neutral-400">
        {/* Left: Hardware Token / Security Clearance (Physical Metaphor) */}
        <div className="md:col-span-6 p-6 rounded-lg bg-[#07070a] border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-2 text-white font-semibold">
              <Cpu className="w-3.5 h-3.5 text-neutral-400" />
              SOVEREIGN EXECUTIVE KEYCARD
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 text-[10px]">
              AUTHENTICATED
            </span>
          </div>

          <div className="space-y-1.5 text-neutral-400 text-[11px]">
            <div className="flex justify-between">
              <span>PRINCIPAL:</span>
              <span className="text-white font-medium">{episode.guestName.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>CLEARANCE:</span>
              <span className="text-white">TIER-1 ARCHITECTURE</span>
            </div>
            <div className="flex justify-between">
              <span>ACOUSTIC HASH:</span>
              <span className="font-mono-tech text-neutral-500">0x7F9B...4C21</span>
            </div>
          </div>
        </div>

        {/* Right: Export Briefing */}
        <div className="md:col-span-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="text-white font-medium">EXECUTIVE DOSSIER NO. {episode.episodeNumber}</span>
            <p className="text-neutral-500 text-[11px] pt-1">
              Compliant with executive briefing standards · All timestamps verified
            </p>
          </div>

          <button
            onClick={handleDownloadDossier}
            className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-sm transition-colors cursor-pointer shrink-0"
          >
            {downloadSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{downloadSuccess ? 'DOSSIER GENERATED' : 'EXPORT BRIEFING'}</span>
          </button>
        </div>
      </section>
      {/* ========================================================= */}
      {/* HOST ABOUT SECTION: EXECUTIVE MONOLITH STYLE              */}
      {/* ========================================================= */}
      <section className="border-t border-neutral-900 bg-black py-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center border border-neutral-800 bg-[#060606] p-6 shadow-[0_0_20px_rgba(255,255,255,0.02)] relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40"></div>
          
          <div className="relative w-32 h-32 shrink-0 border border-neutral-700 p-1">
            <div className="w-full h-full bg-neutral-900 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80" 
                alt="Elena Vance"
                className="w-full h-full object-cover grayscale contrast-125"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Target Reticle Corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/50"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/50"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
          </div>
          
          <div className="flex-1 space-y-3 z-10">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="text-white font-mono-tech tracking-widest text-sm font-semibold uppercase">Elena Vance</h3>
              <span className="text-[10px] font-mono-tech text-neutral-500 uppercase">Executive Host / Strategist</span>
            </div>
            <p className="text-neutral-400 font-light text-sm leading-relaxed">
              Elena extracts signal from noise. Focused strictly on high-stakes capital, deep infrastructure, and zero-compromise architectural hardware. No fluff. Strictly data and execution.
            </p>
            <LinkedInCTA name="Elena Vance" world="executive" />
          </div>
        </div>
      </section>

      <SponsorsSection world="executive" />

      {/* ========================================================= */}
      {/* CALL TO ACTION: EXECUTIVE MONOLITH STYLE                    */}
      {/* ========================================================= */}
      <section className="bg-neutral-950 border-t border-neutral-900 py-20 px-6 text-center relative z-20">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-2xl sm:text-3xl font-display text-white tracking-widest uppercase border-y border-neutral-800 py-6 inline-block w-full">
            REQUEST DIRECT CLEARANCE
          </h2>
          <p className="text-neutral-400 text-sm max-w-lg mx-auto font-mono-tech leading-relaxed">
            Obtain immediate access to all proprietary briefing documents, zero-latency audio archives, and raw data outputs. 
          </p>
          <div className="mt-8 flex items-center justify-center gap-2">
            <input 
              type="email" 
              placeholder="ENTER CREDENTIALS (EMAIL)"
              className="bg-black border border-neutral-700 rounded-none px-4 py-4 text-xs font-mono-tech text-white focus:outline-none focus:border-white transition-colors w-64 uppercase tracking-wider"
            />
            <button className="px-10 py-4 bg-white text-black font-mono-tech text-xs font-bold uppercase tracking-widest hover:bg-neutral-300 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]">
              Initiate
            </button>
          </div>
        </div>
      </section>
      <PodcastPlatformLinks world="executive" />
    </div>
  );
};
