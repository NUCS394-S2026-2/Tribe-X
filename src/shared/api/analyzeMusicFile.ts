import type { AnalyzeResult } from '../types/MusicTags';

const ANALYSIS_API = import.meta.env.VITE_ANALYSIS_API_URL ?? 'http://localhost:8000';

export async function analyzeMusicFile(file: File): Promise<AnalyzeResult> {
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

  return res.json() as Promise<AnalyzeResult>;
}
