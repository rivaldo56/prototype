import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowUpRight, Compass, Sparkles, Layers, Sliders, CheckCircle2, XCircle } from 'lucide-react';

interface ManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorld: (world: 'eco' | 'executive' | 'jukebox') => void;
}

export const ManifestoModal: React.FC<ManifestoModalProps> = ({
  isOpen,
  onClose,
  onSelectWorld,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-neutral-900 border border-neutral-700/60 rounded-2xl shadow-2xl p-6 md:p-10 text-neutral-200 z-10 space-y-10"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-neutral-800 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono-tech uppercase tracking-widest mb-3">
                  <Compass className="w-3.5 h-3.5" /> Creative Director Dossier
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
                  Ten Generations Forward: The MangoMagic Design Critique
                </h2>
                <p className="text-sm text-neutral-400 mt-1 max-w-2xl font-sans-clean">
                  How we moved past the conventional podcast baseline (Eco Champions, Winning Talent, MangoMagic) to architect three distinct, uncompromising worlds.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                aria-label="Close manifesto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* The Starting Line vs The Ten-Generation Leap */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-mono-tech">
                01 / The Baseline Deconstruction
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-neutral-950/60 border border-red-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-red-400 font-medium text-sm">
                    <XCircle className="w-4 h-4" /> The 2024 Baseline Cliché
                  </div>
                  <ul className="text-xs text-neutral-400 space-y-2 list-disc list-inside leading-relaxed">
                    <li>Hero section with a cookie-cutter headshot card and social icons.</li>
                    <li>Generic horizontal audio scrubber strip tacked onto the bottom.</li>
                    <li>Cards stacked inside cards with identical 3-column grids.</li>
                    <li>Content treated like passive data rows rather than valuable intellectual capital.</li>
                    <li>Flat touchscreens without tactile joy, friction, or somatic memory.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-xl bg-neutral-950/60 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                    <CheckCircle2 className="w-4 h-4" /> The 2036 Ten-Generation Leap
                  </div>
                  <ul className="text-xs text-neutral-300 space-y-2 list-disc list-inside leading-relaxed">
                    <li><strong className="text-white">Content-Centric Architecture:</strong> The interface exists to amplify WHO is speaking and WHY it matters.</li>
                    <li><strong className="text-white">Kinetic Typographic Storytelling:</strong> Quotes interrupt the page with monumental scale.</li>
                    <li><strong className="text-white">Product-Like Precision:</strong> Telemetry, synchronized transcripts, and live decision graphs.</li>
                    <li><strong className="text-white">Physical Metaphors & Tactile Jukebox:</strong> Turning ephemeral streaming into tangible vinyl ritual with real audio feedback.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Conceptual Comparison Matrix */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-mono-tech">
                02 / Creative Concepts Evaluated & Critical Decision Matrix
              </h3>

              <div className="space-y-3">
                {/* World 1 */}
                <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <h4 className="font-editorial text-lg font-bold text-white">
                        World 1: Eco Editorial (The Living Digital Magazine)
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-emerald-500/20 text-emerald-300">
                        Documentary Humanism
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-sans-clean leading-relaxed">
                      A living digital publication. Giant kinetic typography interweaves directly behind the protagonist's silhouette, while documentary light-table chapters and raw field audio excerpts turn the podcast into an immersive journalistic journey.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectWorld('eco');
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-colors self-start md:self-center shrink-0 cursor-pointer"
                  >
                    Launch World <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* World 2 */}
                <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-500/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-white" />
                      <h4 className="font-sans-clean text-lg font-semibold text-white">
                        World 2: Executive Monolith (Product Launch Luxury)
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-neutral-800 text-neutral-200">
                        Architectural Restraint
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-sans-clean leading-relaxed">
                      Extreme restraint designed like a million-dollar hardware launch. Deep liquid obsidian, sculptural monochrome photography, a continuous milled titanium chronometer scrubber, and towering architectural thesis monoliths.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectWorld('executive');
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-colors self-start md:self-center shrink-0 cursor-pointer"
                  >
                    Launch World <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* World 3 */}
                <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <h4 className="font-display text-lg font-bold text-white">
                        World 3: Mango Jukebox (Interactive 3D WebGL Vinyl Crate)
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-amber-500/20 text-amber-300">
                        True WebGL Physics
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-sans-clean leading-relaxed">
                      A full Three.js WebGL spatial audio installation. Interactive vinyl records in a tactile crate that flip in 3D perspective, slide onto an anodized turntable platter, engage an animated tonearm with needle drop haptics, and support radial groove click-to-seek.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectWorld('jukebox');
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-medium border border-amber-500/30 transition-colors self-start md:self-center shrink-0 cursor-pointer"
                  >
                    Launch World <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Core Principle Footer */}
            <div className="pt-4 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400 font-mono-tech">
              <div>MANGO MAGIC DIGITAL EXPEDITION · PROTOTYPE SUITE 2026</div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
              >
                Enter Prototype
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
