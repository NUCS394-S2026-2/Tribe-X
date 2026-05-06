export interface MusicTags {
  trackId: string;
  genres: string[];
  instruments: string[];
  vocalTraits: string[];
  soundsLike?: string[];
  confidenceScore: number;
  lastUpdated: Date;
}
