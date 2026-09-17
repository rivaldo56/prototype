import React from 'react';
import { motion } from 'motion/react';
import { X, ArrowUpRight, Globe } from 'lucide-react';
import { AtelierView } from './AtelierWorld';
import { WorldType } from '../../../types';

interface AtelierMenuProps {
  currentView: AtelierView;
  onClose: () => void;
  onNavigate: (view: AtelierView) => void;
  onSelectWorld?: (w: WorldType) => void;
}

const links: { view: AtelierView; label: string }[] = [
  { view: 'episodes', label: 'Episodes' },
  { view: 'episode', label: 'Episode' },
  { view: 'show', label: 'Show' },
];

export const AtelierMenu: React.FC<AtelierMenuProps> = ({
  currentView,
  onClose,
  onNavigate,
  onSelectWorld,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="atelier-menu"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)]">
            Independent podcast
          </p>
          <p className="text-[11px] font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)] flex items-center gap-1">
            <Globe className="w-3 h-3" /> Working globally
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[11px] font-mono-tech uppercase tracking-widest hover:opacity-60 transition-opacity"
          aria-label="Close menu"
        >
          <span>Close</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex flex-col gap-2 py-8" aria-label="Atelier navigation">
        {links.map(({ view, label }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`atelier-menu-link text-left ${currentView === view ? 'opacity-100' : 'opacity-60'}`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <button
          onClick={() => {
            onSelectWorld?.('jukebox');
            onClose();
          }}
          className="group inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[var(--atelier-fg)] text-[11px] font-mono-tech uppercase tracking-widest hover:bg-[var(--atelier-fg)] hover:text-[var(--atelier-bg)] transition-colors"
        >
          <span>‘26 showreel</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>

        <div className="text-right space-y-1">
          <p className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)]">
            For inquiries
          </p>
          <a
            href="mailto:hello@mangomagic.fm"
            className="text-sm font-sans-clean font-medium hover:opacity-60 transition-opacity"
          >
            hello@mangomagic.fm
          </a>
        </div>
      </div>
    </motion.div>
  );
};
