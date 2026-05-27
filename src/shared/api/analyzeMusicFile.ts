import type { AnalyzeResult } from '../types/MusicTags';

const ANALYSIS_API = import.meta.env.VITE_ANALYSIS_API_URL ?? 'http://localhost:8000';

export async function analyzeMusicFile(
  file: File,
  apiKey: string,
): Promise<AnalyzeResult> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${ANALYSIS_API}/analyze`, {
    method: 'POST',
    headers: { 'X-Gemini-Api-Key': apiKey },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(detail);
  }

  return res.json() as Promise<AnalyzeResult>;
}
