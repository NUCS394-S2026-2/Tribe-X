import { MusicTags } from '../types/MusicTags';

// TODO: Replace with real backend call once the analysis function is implemented
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function analyzeMusicFile(_: File): Promise<MusicTags> {
  await new Promise((r) => setTimeout(r, 1500));
  return {
    trackId: 'stub-track-id',
    genres: ['Cinematic', 'Electronic'],
    instruments: ['Synthesizer', 'Drums'],
    vocalTraits: [],
    soundsLike: ['Hans Zimmer', 'Explosions in the Sky'],
    confidenceScore: 0.87,
    lastUpdated: new Date(),
  };
}
