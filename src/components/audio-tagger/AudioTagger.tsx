import React, { useRef, useState } from 'react';

import { analyzeMusicFile } from '../../shared/api/analyzeMusicFile';
import { chatWithGemini } from '../../shared/api/chatWithGemini';
import type {
  AudioContext,
  ConversationMessage,
  DiscoTags,
} from '../../shared/types/MusicTags';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const SUPPORTED_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/flac',
  'audio/ogg',
  'audio/m4a',
  'audio/aiff',
]);
const SUPPORTED_EXTENSIONS = new Set(['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aiff']);

interface FileValidationError {
  type: 'invalid-type' | 'too-large' | 'corrupted';
  message: string;
}

function validateAudioFile(file: File): FileValidationError | null {
  if (file.size > MAX_FILE_SIZE) {
    return {
      type: 'too-large',
      message: 'File too large. Please upload files under 50MB.',
    };
  }
  if (!SUPPORTED_TYPES.has(file.type)) {
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      return {
        type: 'invalid-type',
        message:
          'Unsupported file type. Please upload MP3, WAV, FLAC, OGG, M4A, or AIFF files.',
      };
    }
  }
  return null;
}

// ─── Tag display ─────────────────────────────────────────────────────────────

function TagPills({ items }: { items: string[] }) {
  if (!items.length) return <span className="text-sm text-gray-400 italic">(none)</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-full bg-team-blue/10 px-3 py-1 text-xs font-medium text-team-blue ring-1 ring-inset ring-team-blue/20"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function TagRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <TagPills items={items} />
    </div>
  );
}

function buildCSV(tags: DiscoTags): string {
  const headers = [
    'Genre',
    'Instruments',
    'Lyric Themes',
    'Mood/Feel',
    'Tempo',
    'Vocals',
    'Sounds Like',
  ];
  const values = [
    tags.genre.join('; '),
    tags.instruments.join('; '),
    tags.lyricThemes.join('; '),
    tags.mood.join('; '),
    tags.tempo,
    tags.vocals.join('; '),
    tags.soundsLike.join('; '),
  ];
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  return [headers.map(escape).join(','), values.map(escape).join(',')].join('\n');
}

function DownloadCSVButton({ tags }: { tags: DiscoTags }) {
  const handleDownload = () => {
    const blob = new Blob([buildCSV(tags)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'disco-tags.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:border-team-blue hover:text-team-blue"
      aria-label="Download tags as CSV"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="h-3.5 w-3.5"
      >
        <path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z" />
        <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
      </svg>
      CSV
    </button>
  );
}

function CopyButton({ tags }: { tags: DiscoTags }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const lines = [
      `Genre: ${tags.genre.join(', ')}`,
      `Instruments: ${tags.instruments.join(', ')}`,
      `Lyric Themes: ${tags.lyricThemes.join(', ')}`,
      `Mood/Feel: ${tags.mood.join(', ')}`,
      `Tempo: ${tags.tempo}`,
      `Vocals: ${tags.vocals.join(', ')}`,
      `Sounds Like: ${tags.soundsLike.join(', ')}`,
    ].join('\n');
    await navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:border-team-blue hover:text-team-blue"
      aria-label="Copy tags to clipboard"
    >
      {copied ? <span className="text-green-600">Copied!</span> : <span>Copy</span>}
    </button>
  );
}

function MusicTagsDisplay({ tags, flash }: { tags: DiscoTags; flash: boolean }) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-lg border-2 bg-white px-4 py-4 transition-colors duration-700 ${
        flash ? 'border-green-400' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Results
        </span>
        <div className="flex gap-2">
          <DownloadCSVButton tags={tags} />
          <CopyButton tags={tags} />
        </div>
      </div>
      <TagRow label="Genre" items={tags.genre} />
      <TagRow label="Instruments" items={tags.instruments} />
      <TagRow label="Mood / Feel" items={tags.mood} />
      <TagRow label="Vocals" items={tags.vocals} />
      <TagRow label="Lyric Themes" items={tags.lyricThemes} />
      <TagRow label="Tempo" items={tags.tempo ? [tags.tempo] : []} />
      <TagRow label="Sounds Like" items={tags.soundsLike} />
    </div>
  );
}

// ─── Chat ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const BotIcon = () => (
  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-team-blue/10 text-team-blue">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M10 2a1 1 0 0 1 1 1v1h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V3a1 1 0 0 1 1-1ZM7.5 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
    </svg>
  </div>
);

const PersonIcon = () => (
  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  </div>
);

function ChatMessages({
  messages,
  loading,
}: {
  messages: ChatMessage[];
  loading: boolean;
}) {
  if (!messages.length && !loading) return null;
  return (
    <div className="mt-6 flex flex-col gap-3">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {msg.role === 'model' && <BotIcon />}
          <span
            className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-team-blue text-black'
                : 'border border-gray-200 bg-white text-gray-700'
            }`}
          >
            {msg.text}
          </span>
          {msg.role === 'user' && <PersonIcon />}
        </div>
      ))}
      {loading && (
        <div className="flex items-end gap-2">
          <BotIcon />
          <span className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm italic text-gray-400">
            Thinking…
          </span>
        </div>
      )}
    </div>
  );
}

function ChatInputBar({
  onSend,
  loading,
  onNewTrack,
}: {
  onSend: (message: string) => void;
  loading: boolean;
  onNewTrack: () => void;
}) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setInput('');
  };

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='e.g. "make the mood darker" or "reconsider the genre"'
          disabled={loading}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-team-blue focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="rounded-lg bg-team-blue px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition-all hover:bg-team-blue/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </form>
      <button
        onClick={onNewTrack}
        className="self-start text-xs text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline"
      >
        + New track
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AudioTagger(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<DiscoTags | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>(
    [],
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [tagsFlash, setTagsFlash] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<FileValidationError | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const resetAll = () => {
    setFile(null);
    setTags(null);
    setAudioContext(null);
    setConversationHistory([]);
    setChatMessages([]);
    setError(null);
    setValidationError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    resetAll();
    if (selected) {
      const err = validateAudioFile(selected);
      if (err) {
        setValidationError(err);
      } else {
        setFile(selected);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeMusicFile(file);
      setTags(result.tags);
      setAudioContext(result.audioContext);
      setConversationHistory(result.conversationHistory);
      setChatMessages(
        result.conversationHistory.map((m) => ({
          role: m.role,
          text: m.parts[0]?.text ?? '',
        })),
      );
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (message: string) => {
    if (!audioContext) return;
    setChatMessages((prev) => [...prev, { role: 'user', text: message }]);
    setChatLoading(true);
    setError(null);
    try {
      const result = await chatWithGemini(message, conversationHistory, audioContext);
      setTags(result.updatedTags);
      setConversationHistory(result.conversationHistory);
      setChatMessages((prev) => [...prev, { role: 'model', text: result.message }]);
      setTagsFlash(true);
      setTimeout(() => setTagsFlash(false), 5000);
    } catch {
      setError('Chat failed. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Narrow nav sidebar */}
      <aside className="flex w-16 shrink-0 flex-col items-center gap-4 border-r border-gray-800 bg-gray-900 py-5">
        {/* Logo mark */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-team-blue">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-black"
          >
            <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
          </svg>
        </div>

        {/* Saved tracks placeholder */}
        <button
          disabled
          title="Saved Tracks (coming soon)"
          className="mt-2 flex flex-col items-center gap-1 opacity-30"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-gray-400"
          >
            <path d="M5.566 4.657A4.505 4.505 0 0 1 6.75 4.5h10.5c.41 0 .806.055 1.183.157A3 3 0 0 0 15.75 3h-7.5a3 3 0 0 0-2.684 1.657ZM2.25 12a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3v-6ZM5.25 7.5c-.41 0-.806.055-1.184.157A3 3 0 0 1 6.75 6h10.5a3 3 0 0 1 2.683 1.657A4.505 4.505 0 0 0 18.75 7.5H5.25Z" />
          </svg>
          <span className="text-xs text-gray-500">Tracks</span>
        </button>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        {!tags ? (
          /* ── Upload screen ── */
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-team-blue shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-7 w-7 text-black"
              >
                <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
              MetaMusic
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Upload a track and get Disco-ready sync licensing tags in seconds
            </p>

            <div className="mt-8 w-full max-w-md">
              <input
                ref={inputRef}
                type="file"
                onChange={handleFileChange}
                className="sr-only"
                id="audio-file-input"
                aria-label="Select audio file"
              />
              <label
                htmlFor="audio-file-input"
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-200 ${
                  validationError
                    ? 'border-red-300 bg-red-50 text-red-500 hover:border-red-400'
                    : 'border-gray-300 bg-white text-gray-500 hover:border-team-blue hover:text-team-blue'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-10 w-10 opacity-30"
                >
                  <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
                </svg>
                <span className="mt-3 text-sm font-medium">
                  {file ? file.name : 'Choose an audio file'}
                </span>
                <span className="mt-1 text-xs text-gray-400">
                  MP3, WAV, FLAC, OGG up to 50MB
                </span>
              </label>

              {validationError && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {validationError.message}
                </p>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!file || loading || !!validationError}
                className="mt-4 w-full rounded-xl bg-team-blue py-3 text-sm font-semibold text-black shadow-sm transition-all hover:bg-team-blue/90 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-team-blue disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? 'Analyzing…' : 'Analyze'}
              </button>

              {error && (
                <p role="alert" className="mt-3 text-center text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* ── Chat screen ── */
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="mx-auto max-w-2xl">
                <MusicTagsDisplay tags={tags} flash={tagsFlash} />
                <ChatMessages messages={chatMessages} loading={chatLoading} />
                {error && (
                  <p role="alert" className="mt-4 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Fixed bottom chat input */}
            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="mx-auto max-w-2xl">
                <ChatInputBar
                  onSend={handleChat}
                  loading={chatLoading}
                  onNewTrack={resetAll}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
