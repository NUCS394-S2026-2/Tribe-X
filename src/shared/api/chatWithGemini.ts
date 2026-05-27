import type { AudioContext, ChatResult, ConversationMessage } from '../types/MusicTags';

const ANALYSIS_API = import.meta.env.VITE_ANALYSIS_API_URL ?? 'http://localhost:8000';

export async function chatWithGemini(
  message: string,
  conversationHistory: ConversationMessage[],
  audioContext: AudioContext,
  apiKey: string,
): Promise<ChatResult> {
  const res = await fetch(`${ANALYSIS_API}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Gemini-Api-Key': apiKey },
    body: JSON.stringify({ message, conversationHistory, audioContext }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(detail);
  }

  return res.json() as Promise<ChatResult>;
}
