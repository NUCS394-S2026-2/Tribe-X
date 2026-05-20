import React, { useRef, useState } from 'react';

import { analyzeMusicFile } from '../../shared/api/analyzeMusicFile';
import { chatWithGemini } from '../../shared/api/chatWithGemini';
import type {
  AudioContext,
  ConversationMessage,
  DiscoTags,
} from '../../shared/types/MusicTags';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
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
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      return {
        type: 'invalid-type',
        message:
          'Unsupported file type. Please upload MP3, WAV, FLAC, OGG, M4A, or AIFF files.',
      };
    }
  }

  return null;
}

function TagPills({ items }: { items: string[] }) {
  if (!items.length) {
    return <span className="text-sm text-gray-400 italic">(none)</span>;
  }
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

function formatTagsForClipboard(tags: DiscoTags): string {
  return [
    `Genre: ${tags.genre.join(', ') || '(none)'}`,
    `Instruments: ${tags.instruments.join(', ') || '(none)'}`,
    `Lyric Themes: ${tags.lyricThemes.join(', ') || '(none)'}`,
    `Mood/Feel: ${tags.mood.join(', ') || '(none)'}`,
    `Tempo: ${tags.tempo || '(none)'}`,
    `Vocals: ${tags.vocals.join(', ') || '(none)'}`,
    `Sounds Like: ${tags.soundsLike.join(', ') || '(none)'}`,
  ].join('\n');
}

function CopyButton({ tags }: { tags: DiscoTags }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatTagsForClipboard(tags));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-colors duration-150 hover:border-team-blue hover:text-team-blue focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-team-blue"
      aria-label="Copy tags to clipboard"
    >
      {copied ? <span className="text-green-600">Copied!</span> : <span>Copy</span>}
    </button>
  );
}

function MusicTagsDisplay({ tags }: { tags: DiscoTags }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Results
        </span>
        <CopyButton tags={tags} />
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

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

function ChatSection({
  chatMessages,
  onSend,
  loading,
}: {
  chatMessages: ChatMessage[];
  onSend: (message: string) => void;
  loading: boolean;
}) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setInput('');
  };

  return (
    <div className="mt-6 flex flex-col gap-3">
      <p className="text-sm font-semibold text-gray-700">Refine with Chat</p>

      {chatMessages.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <span
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-team-blue text-black'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {msg.text}
              </span>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <span className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400 italic">
                Thinking…
              </span>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='e.g. "make the mood darker" or "reconsider the genre"'
          disabled={loading}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-team-blue focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="rounded-lg bg-team-blue px-4 py-2 text-sm font-semibold text-black shadow-sm transition-all duration-200 hover:bg-team-blue/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export function AudioTagger(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<DiscoTags | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>(
    [],
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<FileValidationError | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setTags(null);
    setAudioContext(null);
    setConversationHistory([]);
    setChatMessages([]);
    setError(null);
    setValidationError(null);

    if (selected) {
      const validationResult = validateAudioFile(selected);
      if (validationResult) {
        setValidationError(validationResult);
        setFile(null);
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
    } catch {
      setError('Chat failed. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          MetaMusic Tag Generator
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload an MP3 to generate sync licensing metadata.
        </p>

        <div className="mt-6">
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
            className={`inline-flex cursor-pointer items-center rounded-lg border-2 border-dashed px-6 py-4 text-sm font-medium transition-colors duration-200 ${
              validationError
                ? 'border-red-300 text-red-600 hover:border-red-400 hover:text-red-700'
                : 'border-gray-300 text-gray-600 hover:border-team-blue hover:text-team-blue'
            } focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-team-blue`}
          >
            {file ? file.name : 'Choose an audio file…'}
          </label>
          {validationError && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {validationError.message}
            </p>
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={handleAnalyze}
            disabled={!file || loading || !!validationError}
            className="rounded-lg bg-team-blue px-6 py-2.5 text-sm font-semibold text-black shadow-sm transition-all duration-200 hover:bg-team-blue/90 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-team-blue disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6">
          <p className="block text-sm font-semibold text-gray-700">Music Tags</p>
          {tags ? (
            <div className="mt-2">
              <MusicTagsDisplay tags={tags} />
              <ChatSection
                chatMessages={chatMessages}
                onSend={handleChat}
                loading={chatLoading}
              />
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-400 italic">
              Tags will appear here after analysis…
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
