import { MusicTags } from '../types/MusicTags';

const ANALYSIS_API = import.meta.env.VITE_ANALYSIS_API_URL ?? 'http://localhost:8000';

export async function analyzeMusicFile(file: File): Promise<MusicTags> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${ANALYSIS_API}/analyze`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Analysis failed (${res.status}): ${detail}`);
  }

  const data = await res.json();

  return {
    trackId: crypto.randomUUID(),
    genres: data.genres,
    instruments: data.instruments,
    vocalTraits: data.vocalTraits,
    soundsLike: data.soundsLike,
    confidenceScore: data.confidenceScore,
    lastUpdated: new Date(),
  };
}
