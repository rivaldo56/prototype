import type { WorldType } from '../types';

// Replace these homepage URLs with the published show's URLs when available.
export const PODCAST_PLATFORMS = [
  { id: 'spotify', name: 'Spotify', href: 'https://open.spotify.com/', action: 'Explore audio' },
  { id: 'apple', name: 'Apple Podcasts', href: 'https://podcasts.apple.com/', action: 'Discover podcasts' },
  { id: 'youtube', name: 'YouTube', href: 'https://www.youtube.com/', action: 'Watch conversations' },
] as const;

// Fictional identities for the sponsor design preview, not actual endorsements.
export const SPONSOR_PREVIEWS: Record<WorldType, { name: string; discipline: string }[]> = {
  eco: [
    { name: 'canopy', discipline: 'Rooted in nature' },
    { name: 'fieldwork', discipline: 'Made for the outdoors' },
    { name: 'COMMON GROUND', discipline: 'A shared future' },
  ],
  executive: [
    { name: 'FORM', discipline: 'Considered design' },
    { name: 'AXIOM', discipline: 'Independent thinking' },
    { name: 'MONO', discipline: 'Essential by design' },
  ],
  jukebox: [
    { name: 'SIDE A', discipline: 'Independent sound' },
    { name: 'OFFBEAT', discipline: 'A different rhythm' },
    { name: 'GOOD TONE', discipline: 'For the love of listening' },
  ],
};
