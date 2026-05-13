import React, { useRef, useState } from 'react';

import { analyzeMusicFile } from '../../shared/api/analyzeMusicFile';
import type { MusicTags as MusicTagsData } from '../../shared/types/MusicTags';
import { MusicTags } from './MusicTags';

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
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      type: 'too-large',
      message: 'File too large. Please upload files under 50MB.',
    };
  }

  // Check MIME type
  if (!SUPPORTED_TYPES.has(file.type)) {
    // Also check file extension as fallback
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

function formatTags(tags: MusicTagsData): string {
  const list = (arr: string[]) => (arr.length ? arr.join(', ') : '(none)');
  return [
    `Genres:       ${list(tags.genres)}`,
    `Instruments:  ${list(tags.instruments)}`,
    `Vocal Traits: ${list(tags.vocalTraits)}`,
    `Sounds Like:  ${list(tags.soundsLike ?? [])}`,
    `Confidence:   ${Math.round(tags.confidenceScore * 100)}%`,
  ].join('\n');
}

export function AudioTagger(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [tagText, setTagText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<FileValidationError | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setTagText('');
    setError(null);
    setValidationError(null);

    if (selected) {
      const validationResult = validateAudioFile(selected);
      if (validationResult) {
        setValidationError(validationResult);
        setFile(null); // Clear invalid file
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeMusicFile(file);
      setTagText(formatTags(result));
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

        <MusicTags
          value={tagText}
          onChange={setTagText}
          placeholder="Tags will appear here after analysis…"
        />
      </div>
    </section>
  );
}
