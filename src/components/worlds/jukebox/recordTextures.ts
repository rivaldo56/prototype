import * as THREE from 'three';
import type { Episode } from '../../../types';
import { HOST } from './SleeveJourneyParts';

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const element = document.createElement('canvas'); element.width = element.height = size;
  return [element, element.getContext('2d')!];
}
function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, lineHeight: number): number {
  let line = '';
  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > width && line) { ctx.fillText(line, x, y); y += lineHeight; line = word; } else line = candidate;
  }
  ctx.fillText(line, x, y); return y + lineHeight;
}
function photo(url: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => { const image = new Image(); const timeout = window.setTimeout(() => resolve(null), 4500); image.crossOrigin = 'anonymous'; image.onload = () => { clearTimeout(timeout); resolve(image); }; image.onerror = () => { clearTimeout(timeout); resolve(null); }; image.src = url; });
}
function crop(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number, focus = .35): void {
  const scale = Math.max(width / image.width, height / image.height); ctx.save(); ctx.beginPath(); ctx.rect(x, y, width, height); ctx.clip(); ctx.drawImage(image, x + (width - image.width * scale) / 2, y + (height - image.height * scale) * focus, image.width * scale, image.height * scale); ctx.restore();
}
function texture(element: HTMLCanvasElement): THREE.CanvasTexture {
  const map = new THREE.CanvasTexture(element); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8; return map;
}

export async function createRecordArtwork(episode: Episode, withPhotos = true): Promise<{ front: THREE.CanvasTexture; back: THREE.CanvasTexture; label: THREE.CanvasTexture }> {
  const [cover, host, portrait] = withPhotos ? await Promise.all([photo(episode.coverImage), photo(HOST.photo), photo(episode.portraitImage), Promise.race([document.fonts.ready, new Promise(resolve => window.setTimeout(resolve, 3000))])]) : [null, null, null];
  const [front, f] = canvas(1024);
  f.fillStyle = '#a6492f'; f.fillRect(0, 0, 1024, 1024);
  if (cover) { f.save(); f.globalCompositeOperation = 'multiply'; f.filter = 'grayscale(1) contrast(1.15)'; crop(f, cover, 0, 0, 1024, 1024); f.restore(); }
  const shade = f.createLinearGradient(0, 0, 0, 1024); shade.addColorStop(0, '#00000015'); shade.addColorStop(.45, '#00000000'); shade.addColorStop(1, '#15160cf0'); f.fillStyle = shade; f.fillRect(0, 0, 1024, 1024);
  f.fillStyle = '#f1e6cd'; f.font = '800 116px Syne'; f.fillText('MANGO', 70, 155); f.fillText('MAGIC', 70, 253);
  f.font = '22px "JetBrains Mono"'; f.fillText(`VOL. ${episode.episodeNumber}`, 805, 100);
  f.font = '500 88px Fraunces'; const titleEnd = wrap(f, episode.guestName, 70, 713, 850, 92);
  f.font = '26px "Plus Jakarta Sans"'; wrap(f, episode.title, 74, titleEnd + 20, 750, 35);
  f.fillRect(70, 925, 884, 1); f.font = '16px "JetBrains Mono"'; f.fillText('A CONVERSATION WORTH KEEPING.', 70, 965); f.fillText('33⅓ / STEREO', 815, 965);

  // One immutable back-cover composition. Scroll moves the camera across this print.
  const [back, b] = canvas(2048);
  b.fillStyle = '#e9dfc6'; b.fillRect(0, 0, 2048, 2048);
  b.fillStyle = '#36392c'; b.font = '26px "JetBrains Mono"'; b.fillText('MANGO MAGIC / INDEPENDENT CONVERSATIONS', 112, 110); b.fillText(`MM—${episode.episodeNumber} / SIDE B`, 1640, 110);
  b.fillRect(112, 154, 1824, 2);
  b.font = '700 100px Syne'; const episodeEnd = wrap(b, episode.title, 112, 285, 1740, 110);
  b.font = '34px "JetBrains Mono"'; b.fillText(`WITH ${episode.guestName.toUpperCase()}   /   ${episode.duration}`, 116, episodeEnd + 18);
  b.font = 'italic 41px Fraunces'; wrap(b, `“${episode.heroQuote}”`, 116, episodeEnd + 95, 1730, 55);
  b.fillStyle = '#858872'; b.fillRect(1024, 760, 2, 1120); b.fillRect(112, 718, 1824, 2);

  b.fillStyle = '#36392c'; b.font = '26px "JetBrains Mono"'; b.fillText('02 / THE PODCAST', 1120, 825);
  b.font = '500 112px Fraunces'; b.fillText('Good stories.', 1114, 990); b.font = 'italic 112px Fraunces'; b.fillText('No skips.', 1114, 1105);
  b.font = '38px "Plus Jakarta Sans"'; let by = wrap(b, 'MangoMagic is a collection of conversations with people who see the world a little differently.', 1120, 1220, 765, 58);
  by = wrap(b, 'Artists. Builders. Beautifully curious minds. We follow the unexpected turns and give big ideas room to breathe.', 1120, by + 30, 765, 58);
  b.fillRect(1120, by + 20, 750, 2); b.font = 'italic 36px Fraunces'; wrap(b, 'Made for listening. Kept for later.', 1120, by + 85, 755, 46);

  // A small lower-left host imprint makes the right-to-left close-up deliberate.
  b.fillStyle = '#a6492f'; b.fillRect(112, 910, 690, 900);
  b.fillStyle = '#e9dfc6'; b.font = '23px "JetBrains Mono"'; b.fillText('SIDE B / THE HUMAN CONNECTION', 152, 963);
  if (host) { b.save(); b.filter = 'grayscale(1) sepia(.18)'; crop(b, host, 152, 1000, 610, 350, .2); b.restore(); }
  b.fillStyle = '#f2e6cd'; b.font = '22px "JetBrains Mono"'; b.fillText('03 / BEHIND THE QUESTIONS', 152, 1415);
  b.font = 'italic 78px Fraunces'; b.fillText(HOST.name, 146, 1510);
  b.font = '28px "Plus Jakarta Sans"'; wrap(b, HOST.bio, 152, 1575, 600, 40);
  b.fillStyle = '#36392c';
  b.fillRect(112, 1920, 1824, 2); b.font = '23px "JetBrains Mono"'; b.fillText('FIRST PRESSING / GOOD CONVERSATIONS HAVE NO EXPIRY DATE.', 112, 1980);
  for (let i = 0; i < 50; i++) { b.fillRect(1660 + i * 5, 1950, i % 3 === 0 ? 3 : 1, 52); }

  const [label, l] = canvas(512); l.fillStyle = '#c45b36'; l.fillRect(0, 0, 512, 512);
  if (portrait) { l.save(); l.globalAlpha = .7; l.filter = 'grayscale(1)'; crop(l, portrait, 0, 0, 512, 512); l.restore(); }
  l.fillStyle = '#fff1d4'; l.textAlign = 'center'; l.font = '800 46px Syne'; l.fillText('MANGO MAGIC', 256, 95); l.font = '23px "JetBrains Mono"'; l.fillText(`SIDE A / ${episode.episodeNumber}`, 256, 417); l.fillText('33⅓ RPM', 256, 451);
  return { front: texture(front), back: texture(back), label: texture(label) };
}

export function createSurface(kind: 'grooves' | 'wood' | 'metal'): THREE.CanvasTexture {
  const [element, ctx] = canvas(512);
  ctx.fillStyle = kind === 'wood' ? '#473022' : kind === 'grooves' ? '#131514' : '#b7b7af'; ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) {
    ctx.strokeStyle = kind === 'wood' ? `rgba(12,7,2,${.04 + (i % 7) * .015})` : `rgba(255,255,255,${.025 + (i % 5) * .008})`;
    ctx.lineWidth = kind === 'wood' ? 1 + i % 3 : .5; ctx.beginPath();
    if (kind === 'grooves') ctx.arc(256, 256, 72 + i * .7, 0, Math.PI * 2);
    else { ctx.moveTo(0, i * 2); ctx.bezierCurveTo(170, i * 2 + Math.sin(i) * 3, 340, i * 2 - 3, 512, i * 2); }
    ctx.stroke();
  }
  return texture(element);
}
