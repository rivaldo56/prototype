import type { CSSProperties, FC } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import type { Episode } from '../../../types';
import { SPONSOR_PREVIEWS } from '../../../data/podcastConnections';

export const HOST = {
  name: 'Elena Vance',
  role: 'Your host. An endlessly curious listener.',
  bio: 'Elena brings artists, builders and unconventional thinkers to the same table. Less small talk. More of the stories, strange turns and small discoveries that make us human.',
  photo: '/assets/jukebox/elena-vance.jpg',
};

export const formatRecordTime = (time: number): string => `${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, '0')}`;

export const SleeveFront: FC<{ episode: Episode; compact?: boolean }> = ({ episode, compact = false }) => (
  <div className={`sleeve-print ${compact ? 'sleeve-print--compact' : ''}`}>
    <img className="sleeve-photo" src={episode.coverImage} alt="" draggable={false} referrerPolicy="no-referrer" />
    <div className="sleeve-ink" />
    <div className="sleeve-masthead"><span>MANGO<br />MAGIC</span><span>VOL.<br />{episode.episodeNumber}</span></div>
    <div className="sleeve-title">{episode.guestName}<span>{episode.title}</span></div>
    <div className="sleeve-bottom"><span>A conversation worth keeping.</span><span>33⅓ / STEREO</span></div>
    <span className="sleeve-spine" />
  </div>
);

export const VinylDisc: FC<{ episode: Episode; playing: boolean }> = ({ episode, playing }) => (
  <div className="journey-vinyl" data-playing={playing}>
    <div className="journey-vinyl-label"><img src={episode.portraitImage} alt="" referrerPolicy="no-referrer" /><span>MM / {episode.episodeNumber}</span></div>
    <span className="journey-spindle" />
  </div>
);

export const SleeveBack: FC<{ episode: Episode; mode: 'latest' | 'about' | 'host' }> = ({ episode, mode }) => (
  <div className="back-board" data-focus={mode}>
    <div className="back-board-imprint">MANGO MAGIC / SIDE B / MM—{episode.episodeNumber}</div>
    <div className="back-board-episode"><span>01 / THE EPISODE</span><h3>{episode.title}</h3><p>With {episode.guestName} · {episode.duration}</p><blockquote>“{episode.heroQuote}”</blockquote></div>
    <div className="back-board-host"><img src={HOST.photo} alt={HOST.name} referrerPolicy="no-referrer" /><span>03 / BEHIND THE QUESTIONS</span><h2>{HOST.name}</h2><p>{HOST.bio}</p></div>
    <div className="back-board-podcast"><span>02 / THE PODCAST</span><h2>Good stories.<br /><em>No skips.</em></h2><p>MangoMagic is a collection of conversations with people who see the world a little differently.</p><p>Artists. Builders. Beautifully curious minds. We follow the unexpected turns and give big ideas room to breathe.</p><i>Made for listening. Kept for later.</i></div>
    <div className="back-board-footer">FIRST PRESSING / INDEPENDENT CONVERSATIONS</div>
  </div>
);

interface CrateProps {
  episodes: Episode[];
  selected: Episode;
  onSelect: (episode: Episode) => void;
  onStep: (direction: number) => void;
}

export const EpisodeCrate: FC<CrateProps> = ({ episodes, selected, onSelect, onStep }) => (
  <div className="episode-crate-area">
    <motion.div className="episode-crate" onPanEnd={(_, info) => { if (Math.abs(info.offset.x) > 45) onStep(info.offset.x < 0 ? 1 : -1); }}>
      <div className="crate-back" />
      {episodes.map((ep, index) => {
        const selectedIndex = episodes.findIndex(item => item.id === selected.id);
        const relative = (index - selectedIndex + episodes.length) % episodes.length;
        return <button
          key={ep.id}
          className="crate-sleeve"
          aria-label={`Select episode ${ep.episodeNumber}: ${ep.guestName}`}
          aria-pressed={selected.id === ep.id}
          onClick={() => onSelect(ep)}
          style={{ '--crate-offset': relative, '--crate-depth': episodes.length - relative } as CSSProperties}
        ><SleeveFront episode={ep} compact /></button>;
      })}
      <div className="crate-front"><span>THE GOOD STUFF.</span><span>{episodes.length.toString().padStart(2, '0')} RECORDS / MANGO MAGIC</span></div>
    </motion.div>
    <div className="crate-controls"><button onClick={() => onStep(-1)} aria-label="Previous episode"><ArrowLeft size={20} /></button><span>FLIP THROUGH THE CRATE</span><button onClick={() => onStep(1)} aria-label="Next episode"><ArrowRight size={20} /></button></div>
  </div>
);

export const SponsorSleeves: FC = () => (
  <div className="journey-sponsor-pile" aria-label="Sample sponsor sleeves">
    {SPONSOR_PREVIEWS.jukebox.map((sponsor, index) => <div className="journey-sponsor-sleeve" key={sponsor.name} style={{ '--pile-index': index } as CSSProperties}>
      <span className="sponsor-sleeve-number">MM / SUPPORTING ACT 0{index + 1}</span>
      <span className="sponsor-sleeve-symbol" aria-hidden="true">{index === 0 ? '◎' : index === 1 ? '↗' : '≋'}</span>
      <strong>{sponsor.name}</strong><span>{sponsor.discipline}</span>
    </div>)}
  </div>
);

export const PlayRecordButton: FC<{ playing: boolean; onClick: () => void; label?: string }> = ({ playing, onClick, label }) => (
  <button className="record-play-button" onClick={onClick} aria-label={playing ? 'Pause record' : 'Play record'}>
    {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}<span>{playing ? 'Pause record' : label || 'Play the record'}</span>
  </button>
);
