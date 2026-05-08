import React, { useRef, useState } from 'react';

import { analyzeMusicFile } from '../../shared/api/analyzeMusicFile';
import { MusicTags } from '../../shared/types/MusicTags';

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

function MusicTagsDisplay({ tags }: { tags: MusicTags }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
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
