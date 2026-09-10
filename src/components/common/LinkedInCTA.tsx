import { ArrowUpRight, Linkedin } from 'lucide-react';
import type { WorldType } from '../../types';
import './linkedin-cta.css';

export function LinkedInCTA({ name, profileUrl, world }: { name: string; profileUrl?: string; world: WorldType }) {
  return <a className={`linkedin-cta linkedin-cta--${world}`} href={profileUrl || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(name)}`} target="_blank" rel="noopener noreferrer" aria-label={`${profileUrl ? 'Connect with' : 'Find'} ${name} on LinkedIn (opens in a new tab)`}>
    <Linkedin size={16} /><span>{profileUrl ? 'Connect on LinkedIn' : 'Find on LinkedIn'}</span><ArrowUpRight size={15} />
  </a>;
}
