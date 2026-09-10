export interface Chapter {
  id: string;
  time: number; // in seconds
  title: string;
  summary: string;
  quote?: string;
  videoUrl?: string;
  videoPoster?: string;
}

export interface KeyTakeaway {
  id: string;
  timestamp: number;
  label: string;
  description: string;
  category: 'strategy' | 'infrastructure' | 'philosophy' | 'insight';
}

export interface TranscriptLine {
  id: string;
  timestamp: number;
  speaker: string;
  text: string;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  slug: string;
  title: string;
  subtitle: string;
  guestName: string;
  guestRole: string;
  guestCompany: string;
  guestBio: string;
  guestLinkedInUrl?: string;
  duration: string;
  durationSeconds: number;
  releaseDate: string;
  coverImage: string;
  portraitImage: string;
  heroQuote: string;
  synopsis: string;
  editorialBody: string[];
  chapters: Chapter[];
  takeaways: KeyTakeaway[];
  transcript: TranscriptLine[];
  themeColor: {
    accent: string;
    glow: string;
    vinylLabel: string;
    bgGlow: string;
  };
  metrics: {
    attentionSpanRatio: string;
    signalToNoise: string;
    topicDepthScore: number;
  };
}

export type WorldType = 'eco' | 'executive' | 'jukebox';
