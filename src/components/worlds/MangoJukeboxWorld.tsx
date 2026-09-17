import { LinkedInCTA } from '../common/LinkedInCTA';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { FC, ReactNode } from 'react';
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import { ArrowDown, ArrowUpRight, ChevronRight, Disc3 } from 'lucide-react';
import type { Episode, WorldType } from '../../types';
import { audioEngine } from '../../utils/audioEngine';
import { PodcastPlatformLinks } from '../common/PodcastConnections';
import { PlayRecordButton, SleeveBack, SleeveFront, SponsorSleeves, VinylDisc, formatRecordTime } from './jukebox/SleeveJourneyParts';
import { CoverflowCarousel } from '../ui/coverflow-carousel';
import { PhysicalRecordStage } from './jukebox/PhysicalRecordStage';
import { HOST } from './jukebox/SleeveJourneyParts';
import './jukebox/sleeve-journey.css';
import '../ui/record-collection.css';

interface MangoJukeboxWorldProps {
  episodes: Episode[];
  activeEpisode: Episode;
  onSelectEpisode: (episode: Episode) => void;
  isPlaying: boolean;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onSelectWorld?: (world: WorldType) => void;
}

const STOPS = ['The sleeve', 'Latest episode', 'The crate', 'The podcast', 'The host', 'Our sponsors', 'Keep it going'];
const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const subscribeMotion = (notify: () => void): (() => void) => {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};
const getMotionPreference = (): boolean => window.matchMedia(MOTION_QUERY).matches;

interface SceneProps {
  index: number;
  position: MotionValue<number>;
  active: number;
  simplified: boolean;
  children: ReactNode;
  className?: string;
}

const JourneyScene: FC<SceneProps> = ({ index, position, active, simplified, children, className = '' }) => {
  const opacity = useTransform(position, [index - .48, index - .2, index + .22, index + .48], [0, 1, 1, 0]);
  return <motion.section
    id={`record-stop-${index}`}
    className={`journey-scene journey-scene--${index} ${className}`}
    style={{ opacity: simplified ? 1 : opacity }}
    aria-hidden={!simplified && active !== index}
    inert={!simplified && active !== index}
    data-active={simplified || active === index}
  >{children}</motion.section>;
};

export const MangoJukeboxWorld: FC<MangoJukeboxWorldProps> = ({ episodes, activeEpisode, onSelectEpisode, isPlaying, currentTime, onSeek }) => {
  const runway = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1440, height: 820 });
  const [activeStop, setActiveStop] = useState(0);
  const [landing, setLanding] = useState({ x: -350, y: 20, scale: .7 });
  const reducedMotion = useSyncExternalStore(subscribeMotion, getMotionPreference, () => false);
  const [motionOff, setMotionOff] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [baseSize, setBaseSize] = useState(420);
  const handleWebglUnavailable = useCallback(() => setWebglUnavailable(true), []);
  const simplified = reducedMotion || motionOff || webglUnavailable;
  const mobile = size.width < 760;
  const shortScreen = mobile && size.height < 550;
  const { scrollYProgress } = useScroll({ target: runway, offset: ['start start', 'end end'] });
  const position = useTransform(scrollYProgress, [0, 1], [0, 6]);
  useMotionValueEvent(position, 'change', value => { if (!simplified) setActiveStop(Math.max(0, Math.min(6, Math.round(value)))); });

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: Math.min(entry.contentRect.height, window.innerHeight) });
      element.style.setProperty('--stage-height', `${entry.contentRect.height}px`);
      const platter = element.querySelector<HTMLElement>('.deck-platter');
      const record = element.querySelector<HTMLElement>('.journey-object-measure');
      if (platter && record) {
        setBaseSize(record.offsetWidth);
        const bounds = element.getBoundingClientRect();
        const target = platter.getBoundingClientRect();
        setLanding({ x: target.left + target.width / 2 - bounds.left - bounds.width / 2, y: target.top + target.height / 2 - bounds.top - bounds.height / 2, scale: (target.width - 12) / record.offsetWidth / .94 });
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [simplified]);

  const aboutZoom = mobile ? (shortScreen ? 2.25 : 2.9) : 3;
  const hostZoom = mobile ? (shortScreen ? 3 : 3.5) : 4.1;
  const aboutX = (mobile ? 0 : size.width * .17) - baseSize * aboutZoom * .24;
  const hostX = (mobile ? 0 : -size.width * .12) + baseSize * hostZoom * .28;
  const aboutY = size.height * .04 - baseSize * aboutZoom * .15;
  const hostY = size.height * .04 - baseSize * hostZoom * .23;
  const sponsorX = size.width * (mobile ? .025 : .12);
  const stops = [0, .45, 1, 1.45, 2, 2.35, 3, 3.5, 4, 4.6, 5, 5.32, 5.85, 6];
  const x = useTransform(position, stops, [size.width * (mobile ? .07 : .25), 0, size.width * (mobile ? -.1 : -.23), -size.width * .12, 0, -.08 * size.width, aboutX, (aboutX + hostX) / 2, hostX, size.width * .1, sponsorX, sponsorX, sponsorX, sponsorX]);
  const y = useTransform(position, stops, [size.height * (shortScreen ? -.03 : -.02), 0, size.height * .04, 0, -size.height * .02, -size.height * .07, aboutY, (aboutY + hostY) / 2, hostY, -size.height * .1, size.height * .14, size.height * .14, -size.height, -size.height]);
  const scale = useTransform(position, stops, [mobile ? (shortScreen ? .58 : .8) : Math.min(size.width * .51, size.height * .87) / baseSize, .94, mobile ? .7 : .94, .75, .53, 1.25, aboutZoom, (aboutZoom + hostZoom) / 2, hostZoom, 1, .43, .43, .43, .43]);
  const rotateY = useTransform(position, stops, [-24, 65, 180, 260, 360, 460, 540, 540, 540, 630, 720, 720, 720, 720]);
  const rotateZ = useTransform(position, stops, [-9, 2, -5, -10, -5, 0, 0, 0, 0, -18, 14, 14, 14, 14]);
  const objectOpacity = useTransform(position, [0, 5.75, 5.85, 6], [1, 1, 0, 0]);
  const playExposure = useSpring(isPlaying ? .52 : .08, { stiffness: 70, damping: 18 });
  useEffect(() => { playExposure.set(isPlaying ? .52 : .08); }, [isPlaying, playExposure]);
  const extractionWindow = useTransform(position, [0, .25, .65, 6], [1, 1, 0, 0]);
  const vinylExposure = useTransform(() => playExposure.get() * extractionWindow.get());
  const stageBackground = useTransform(position, [0, 1, 2, 3, 4, 5, 6], ['#dfd8c8', '#e7dfcf', '#c7bb9f', '#292b23', '#292b23', '#b5b89a', '#d5cbb7']);
  const latestEpisode = episodes.reduce((latest, episode) => episode.episodeNumber > latest.episodeNumber ? episode : latest, episodes[0] || activeEpisode);

  const togglePlay = useCallback(() => {
    if (!audioEngine.getIsPlaying()) {
      if (audioEngine.getCurrentTime() >= activeEpisode.durationSeconds) audioEngine.seek(0);
      audioEngine.playNeedleDrop();
    }
    audioEngine.togglePlay();
  }, [activeEpisode.durationSeconds]);

  const stepEpisode = useCallback((direction: number) => {
    if (!episodes.length) return;
    const index = episodes.findIndex(episode => episode.id === activeEpisode.id);
    onSelectEpisode(episodes[(index + direction + episodes.length) % episodes.length]);
  }, [episodes, activeEpisode.id, onSelectEpisode]);

  const goToStop = useCallback((index: number) => {
    if (simplified) {
      setActiveStop(index);
      document.getElementById(`record-stop-${index}`)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      return;
    }
    const element = runway.current;
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (element.offsetHeight - window.innerHeight) * index / 6, behavior: 'smooth' });
  }, [simplified]);

  const previousMode = useRef(simplified);
  useLayoutEffect(() => {
    if (previousMode.current !== simplified) {
      previousMode.current = simplified;
      if (simplified) {
        document.getElementById(`record-stop-${activeStop}`)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        const element = runway.current;
        if (element) window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY + (element.offsetHeight - window.innerHeight) * activeStop / 6, behavior: 'instant' });
      }
    }
  }, [simplified, activeStop]);

  const playLatest = (): void => {
    onSelectEpisode(latestEpisode);
    audioEngine.setDuration(latestEpisode.durationSeconds);
    audioEngine.seek(0);
    if (!audioEngine.getIsPlaying()) audioEngine.play();
  };


  const sceneProps = { position, active: activeStop, simplified };

  return <div className={`sleeve-journey ${simplified ? 'journey--simplified' : ''}`}>
    <div ref={runway} className="journey-runway">
      <motion.div ref={stage} className="journey-stage" style={{ backgroundColor: simplified ? '#dfd8c8' : stageBackground }} data-stop={STOPS[activeStop]}>
        <div className="journey-grain" aria-hidden="true" />
        <div className="journey-edition"><span>MANGO MAGIC / THE LISTENING ROOM</span><button onClick={() => setMotionOff(value => !value)} disabled={reducedMotion || webglUnavailable} aria-pressed={simplified}>{simplified ? 'Motion off' : 'Motion on'}</button></div>

        <JourneyScene index={0} {...sceneProps}>
          <div className="journey-hero-copy"><p className="journey-kicker">Independent voices. On the record.</p><h1>Every voice <br />has a <br /><em>side B.</em></h1><p>Pull out a record. <br />Stay for the conversation.</p></div>
          <div className="journey-static-art"><SleeveFront episode={activeEpisode} /></div>
          <div className="journey-hero-controls"><span className="journey-kicker">ON THE TURNTABLE</span><strong>{activeEpisode.guestName}</strong><span>{activeEpisode.duration} / EP {activeEpisode.episodeNumber}</span><PlayRecordButton playing={isPlaying} onClick={togglePlay} /><button className="journey-text-button" onClick={() => goToStop(2)}>Explore the crate <ArrowUpRight size={16} /></button></div>
          <button className="journey-scroll-cue" onClick={() => goToStop(1)}><ArrowDown size={16} /> SCROLL TO TURN THE SLEEVE</button>
        </JourneyScene>


        <JourneyScene index={1} {...sceneProps}>
          <div className="journey-latest-copy"><p className="journey-kicker">{activeEpisode.id === latestEpisode.id ? '01 / The latest pressing' : '01 / On this record'}</p><h2>{activeEpisode.title}</h2><p className="journey-guest">With {activeEpisode.guestName}</p><p>{activeEpisode.synopsis}</p><button className="record-play-button" onClick={playLatest}><Disc3 size={19} /> Play latest episode</button><div className="journey-latest-meta">EP {activeEpisode.episodeNumber} <span>{activeEpisode.duration}</span></div></div>
          <div className="journey-static-art"><SleeveFront episode={activeEpisode} /></div>
          <div className="journey-side-caption">THE SLEEVE TURNS. <br />THE STORY OPENS.</div>
        </JourneyScene>

        <JourneyScene index={2} {...sceneProps}>
          <div className="journey-crate-heading"><p className="journey-kicker">02 / The episode collection</p><h2>Go on. Dig a little.</h2><p>Every sleeve has a story. Find your next one.</p></div>
          <CoverflowCarousel
            className="journey-crate-carousel"
            cardClassName="journey-cover-card"
            label="Episode crate"
            reducedMotion={simplified}
            cardWidth="clamp(160px, min(23vw, 36svh), 310px)"
            renderSlide={(_, index) => <SleeveFront episode={episodes[index]} compact />}
            showPagination
            showNavigation
            defaultIndex={episodes.findIndex(episode => episode.id === activeEpisode.id)}
            onSlideChange={index => onSelectEpisode(episodes[index])}
            slides={episodes.map(episode => ({
              src: episode.portraitImage,
              alt: `Sleeve portrait of ${episode.guestName}`,
              title: episode.title,
              subtitle: `With ${episode.guestName}`,
              meta: [
                { label: 'Episode', value: `EP ${episode.episodeNumber}` },
                { label: 'Length', value: episode.duration },
                { label: 'Released', value: episode.releaseDate },
              ],
            }))}
          />
          <div className="journey-crate-selection" aria-live="polite"><span className="journey-kicker">SELECTED / EP {activeEpisode.episodeNumber}</span><h3>{activeEpisode.guestName}</h3><p>{activeEpisode.title}</p><PlayRecordButton playing={isPlaying} onClick={togglePlay} /></div>
        </JourneyScene>

        <JourneyScene index={3} {...sceneProps}>
          <div className="journey-margin-note"><p className="journey-kicker">03 / Read the back cover</p><span>A little more <br />between <br /><em>the grooves.</em></span></div>
          <div className="journey-static-back"><SleeveBack episode={activeEpisode} mode="about" /></div>{!simplified && <div className="sr-only"><h2>Good stories. No skips.</h2><p>MangoMagic is a collection of conversations with people who see the world a little differently. Artists, builders and beautifully curious minds.</p></div>}
          <div className="journey-side-caption">THE PODCAST / EST. FOR THE CURIOUS</div>
        </JourneyScene>

        <JourneyScene index={4} {...sceneProps}>
          <div className="journey-margin-note"><p className="journey-kicker">04 / Behind the microphone</p><span>The person <br />who asks <br /><em>one more question.</em></span></div>
          <div className="journey-static-back"><SleeveBack episode={activeEpisode} mode="host" /></div>{!simplified && <div className="sr-only"><h2>{HOST.name}</h2><p>{HOST.bio}</p></div>}
          <div className="journey-host-connect"><LinkedInCTA name={HOST.name} world="jukebox" /></div>
          <div className="journey-side-caption">GOOD CONVERSATIONS START WITH LISTENING.</div>
        </JourneyScene>

        <JourneyScene index={5} {...sceneProps}>
          <div className="journey-sponsors-heading"><p className="journey-kicker">05 / Our supporting acts</p><h2>No great record <br />is made alone.</h2><p>A place for the brands that help the conversations keep coming.</p></div>
          <SponsorSleeves />
          <p className="journey-sponsor-disclaimer">Sponsor preview / Sample identities</p>
        </JourneyScene>

        <JourneyScene index={6} {...sceneProps}>
          <div className="journey-deck"><div className="deck-top-label"><span>MANGO MAGIC</span><span>DIRECT DRIVE / MM—01</span></div><div className="deck-platter"><div className="journey-static-disc"><VinylDisc episode={activeEpisode} playing={isPlaying} /></div></div><div className={`deck-tonearm ${isPlaying ? 'deck-tonearm--playing' : ''}`} aria-hidden="true"><span /></div><div className="deck-switches"><span className={isPlaying ? 'deck-led is-on' : 'deck-led'} /><span>{isPlaying ? 'PLAYING' : 'READY'} / {formatRecordTime(currentTime)}</span><button onClick={togglePlay} aria-label={isPlaying ? 'Stop turntable' : 'Start turntable'}>{isPlaying ? 'STOP' : 'START'}</button></div></div>
          <div className="journey-final-copy"><p className="journey-kicker">06 / One more side</p><h2>Keep the <br />record <br /><em>going.</em></h2><p>Some conversations deserve another spin.</p><PlayRecordButton playing={isPlaying} onClick={togglePlay} label="Drop the needle" /><button className="journey-text-button" onClick={() => { stepEpisode(1); onSeek(0); }}>Put on the next record <ChevronRight size={17} /></button><a className="journey-text-button" href="#platforms-jukebox">Find your platform <ArrowDown size={17} /></a></div>
        </JourneyScene>

        <div className="journey-object-measure" aria-hidden="true" />
        {!simplified && <PhysicalRecordStage episode={activeEpisode} playing={isPlaying} position={position} x={x} y={y} scale={scale} rotateY={rotateY} rotateZ={rotateZ} exposure={vinylExposure} opacity={objectOpacity} width={size.width} height={size.height} baseSize={baseSize} landing={landing} onUnavailable={handleWebglUnavailable} />}

        <nav className="journey-stop-nav" aria-label="Record journey"><span className="journey-stop-count">0{activeStop + 1} / 07</span>{STOPS.map((label, index) => <button key={label} onClick={() => goToStop(index)} aria-label={`Go to ${label}`} aria-current={!simplified && activeStop === index ? 'step' : undefined}><span /> <span className="journey-stop-label">{label}</span></button>)}<span className="journey-scroll-word">SCROLL TO EXPLORE ↓</span></nav>
      </motion.div>
    </div>
    <div id="jukebox-platforms"><PodcastPlatformLinks world="jukebox" /></div>
  </div>;
};
