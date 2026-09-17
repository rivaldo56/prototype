import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface AtelierFooterProps {
  onGoToShow: () => void;
}

const socialGroups = [
  {
    label: 'Hear us on',
    links: [
      { label: 'Spotify', href: 'https://open.spotify.com/' },
      { label: 'Apple Podcasts', href: 'https://podcasts.apple.com/' },
      { label: 'YouTube', href: 'https://www.youtube.com/' },
    ],
  },
  {
    label: 'More design stuff',
    links: [
      { label: 'Behance', href: 'https://behance.net/' },
      { label: 'Dribbble', href: 'https://dribbble.com/' },
    ],
  },
  {
    label: 'Design & life updates',
    links: [
      { label: 'LinkedIn', href: 'https://linkedin.com/' },
      { label: 'Instagram', href: 'https://instagram.com/' },
    ],
  },
];

export const AtelierFooter: React.FC<AtelierFooterProps> = ({ onGoToShow }) => {
  return (
    <footer className="bg-[var(--atelier-bg)] text-[var(--atelier-fg)] px-6 md:px-12 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          <div className="md:col-span-5">
            <h2 className="font-editorial text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
              Come say hi
            </h2>
            <p className="text-sm text-[var(--atelier-muted)] mb-6">Drop us a line</p>
            <a
              href="mailto:hello@mangomagic.fm"
              className="inline-flex items-center gap-2 text-lg font-sans-clean font-medium hover:opacity-60 transition-opacity"
            >
              hello@mangomagic.fm
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {socialGroups.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)] mb-3">
                  {group.label}
                </p>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-sans-clean hover:opacity-60 transition-opacity inline-flex items-center gap-1"
                      >
                        {link.label}
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--atelier-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-[10px] font-mono-tech uppercase tracking-widest text-[var(--atelier-muted)]">
            <span className="block md:inline">Development & Motion — MangoMagic Studio</span>
            <span className="hidden md:inline mx-2">·</span>
            <span className="block md:inline">Fonts — Fraunces, Syne, Plus Jakarta Sans</span>
          </div>
          <button
            onClick={onGoToShow}
            className="text-[11px] font-mono-tech uppercase tracking-widest hover:opacity-60 transition-opacity"
          >
            About the show →
          </button>
        </div>
      </div>
    </footer>
  );
};
