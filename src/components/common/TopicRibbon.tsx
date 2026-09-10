import { useRef, useState } from 'react';
import { useInView } from 'motion/react';
import './topic-ribbon.css';

const TOPICS = {
  jukebox: ['Independent voices', 'Unexpected turns', 'Good stories', 'No skips'],
  eco: ['Field notes', 'Living systems', 'Common ground', 'Listen closer'],
};

export function TopicRibbon({ world, paused = false }: { world: keyof typeof TOPICS; paused?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [stopped, setStopped] = useState(false);
  return <div ref={ref} className={`topic-ribbon topic-ribbon--${world}`} data-paused={paused || stopped || !inView}>
    <div className="topic-ribbon-window" aria-label={TOPICS[world].join(' · ')}>
      <div className="topic-ribbon-track" aria-hidden="true">
        {[0, 1].map(copy => <div className="topic-ribbon-group" key={copy}>{TOPICS[world].map(topic => <span key={topic}>{topic}<i>✳</i></span>)}</div>)}
      </div>
    </div>
    <button type="button" onClick={() => setStopped(value => !value)} disabled={paused} aria-pressed={paused || stopped} aria-label={stopped ? 'Resume topic motion' : 'Pause topic motion'}>{paused || stopped ? 'Play' : 'Pause'}</button>
  </div>;
}
