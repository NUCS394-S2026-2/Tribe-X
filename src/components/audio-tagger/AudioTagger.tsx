import React, { useRef, useState } from 'react';

import { analyzeMusicFile } from '../../shared/api/analyzeMusicFile';
import type { MusicTags } from '../../shared/types/MusicTags';

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

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Confidence
        </span>
        <span className="text-xs font-semibold text-green-600">{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

function formatTagsForClipboard(tags: MusicTags): string {
  const pct = Math.round(tags.confidenceScore * 100);
  const lines: string[] = [
    `Genres: ${tags.genres.join(', ') || '(none)'}`,
    `Instruments: ${tags.instruments.join(', ') || '(none)'}`,
    `Vocal Traits: ${tags.vocalTraits.join(', ') || '(none)'}`,
    `Sounds Like: ${(tags.soundsLike ?? []).join(', ') || '(none)'}`,
    `Confidence: ${pct}%`,
  ];
  return lines.join('\n');
}

function CopyButton({ tags }: { tags: MusicTags }) {
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
      {copied ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-3.5 w-3.5 text-green-500"
          >
            <path
              fillRule="evenodd"
              d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-3.5 w-3.5"
          >
            <path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h5.793a1.5 1.5 0 0 0 1.06-.44l2.707-2.706A1.5 1.5 0 0 0 13.5 9.75V6.5A1.5 1.5 0 0 0 12 5h-1V3.5A1.5 1.5 0 0 0 9.5 2h-6ZM9.5 6.5H12l-2.5 2.5V6.5Z" />
          </svg>
        </>
      )}
    </button>
  );
}

function MusicTagsDisplay({ tags }: { tags: MusicTags }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Results
        </span>
        <CopyButton tags={tags} />
      </div>
      <TagRow label="Genres" items={tags.genres} />
      <TagRow label="Instruments" items={tags.instruments} />
      <TagRow label="Vocal Traits" items={tags.vocalTraits} />
      <TagRow label="Sounds Like" items={tags.soundsLike ?? []} />
      <ConfidenceBar score={tags.confidenceScore} />
    </div>
  );
}

export function AudioTagger(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<MusicTags | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<FileValidationError | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setTags(null);
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
      setTags(result);
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
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
