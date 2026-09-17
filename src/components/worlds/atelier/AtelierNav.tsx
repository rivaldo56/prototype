import React from 'react';
import { motion } from 'motion/react';
import { Menu, ArrowUpRight } from 'lucide-react';
import { AtelierView } from './AtelierWorld';

interface AtelierNavProps {
  currentView: AtelierView;
  onOpenMenu: () => void;
}

const viewLabels: Record<AtelierView, string> = {
  episodes: 'EPISODES',
  episode: 'EPISODE',
  show: 'SHOW',
};

export const AtelierNav: React.FC<AtelierNavProps> = ({ currentView, onOpenMenu }) => {
  return (
    <nav className="atelier-nav atelier-difference flex items-start justify-between">
      <button
        onClick={onOpenMenu}
        className="flex items-center gap-2 text-[11px] font-mono-tech uppercase tracking-widest hover:opacity-60 transition-opacity"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
        <span>Menu</span>
      </button>

      <div className="hidden md:flex items-center gap-8 text-[11px] font-mono-tech uppercase tracking-widest">
        <span className="opacity-50">{viewLabels[currentView]}</span>
        <span className="flex items-center gap-1 opacity-80">
          Working globally <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </nav>
  );
};
