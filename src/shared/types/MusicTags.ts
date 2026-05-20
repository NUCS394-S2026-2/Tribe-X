export interface DiscoTags {
  genre: string[];
  instruments: string[];
  lyricThemes: string[];
  mood: string[];
  tempo: string;
  type: string[];
  vocals: string[];
  soundsLike: string[];
}

export interface AudioContext {
  bpm: number;
  key: string;
  mode: string;
  energy_level: string;
  tempo_feel: string;
  danceability: string;
  harmonic_ratio: string;
  instrument_hints: string[];
  vocal_presence: boolean;
  lyrics: string | null;
}

export interface ConversationMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface AnalyzeResult {
  audioContext: AudioContext;
  tags: DiscoTags;
  conversationHistory: ConversationMessage[];
}

export interface ChatResult {
  message: string;
  updatedTags: DiscoTags;
  conversationHistory: ConversationMessage[];
}

/** @deprecated — kept so old tests compile while we migrate */
export interface MusicTags {
  trackId: string;
  genres: string[];
  instruments: string[];
  vocalTraits: string[];
  soundsLike?: string[];
  confidenceScore: number;
  lastUpdated: Date;
}
