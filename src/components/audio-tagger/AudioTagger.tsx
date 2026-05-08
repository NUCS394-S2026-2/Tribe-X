import React, { useRef, useState } from 'react';

import { analyzeMusicFile } from '../../shared/api/analyzeMusicFile';
import { MusicTags } from '../../shared/types/MusicTags';

function formatTags(tags: MusicTags): string {
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
  const [tags, setTags] = useState<MusicTags | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setTags(null);
    setError(null);
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
            accept="audio/*,.mp3"
            onChange={handleFileChange}
            className="sr-only"
            id="audio-file-input"
            aria-label="Select audio file"
          />
          <label
            htmlFor="audio-file-input"
            className="inline-flex cursor-pointer items-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-4 text-sm font-medium text-gray-600 transition-colors duration-200 hover:border-team-blue hover:text-team-blue focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-team-blue"
          >
            {file ? file.name : 'Choose an audio file…'}
          </label>
        </div>

        <div className="mt-4">
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
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
          <label
            htmlFor="music-tags"
            className="block text-sm font-semibold text-gray-700"
          >
            Music Tags
          </label>
          <textarea
            id="music-tags"
            readOnly
            rows={7}
            value={tags ? formatTags(tags) : ''}
            placeholder="Tags will appear here after analysis…"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-team-blue focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-team-blue"
          />
        </div>
      </div>
    </section>
  );
}
