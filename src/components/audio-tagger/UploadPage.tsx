import type { ChangeEvent, ReactElement, RefObject } from 'react';

import type { FileValidationError } from './AudioTagger';

const waveBars = [3, 6, 12, 20, 32, 48, 66, 84, 104, 120, 90, 112, 96, 76];

interface UploadPageProps {
  file: File | null;
  inputRef: RefObject<HTMLInputElement | null>;
  loading: boolean;
  error: string | null;
  validationError: FileValidationError | null;
  onAnalyze: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(fileName: string): string {
  const ext = fileName.split('.').pop();
  return ext ? ext.toUpperCase() : 'AUDIO';
}

export function UploadPage({
  file,
  inputRef,
  loading,
  error,
  validationError,
  onAnalyze,
  onFileChange,
  onReset,
}: UploadPageProps): ReactElement {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-7">
      <div className="mx-auto flex max-w-[960px] flex-col gap-5">
        <section className="grid items-center gap-6 lg:grid-cols-[1fr_300px]">
          <div>
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-slate-950">
              Upload a track.
              <br />
              Get <span className="text-[#3d1de2]">sync</span> licensing tags.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
              AI-powered metadata that helps your music get discovered and licensed.
            </p>
          </div>

          <div
            className="relative hidden h-32 items-center justify-end lg:flex"
            aria-hidden="true"
          >
            <div className="flex h-full items-end gap-3">
              {waveBars.map((height, index) => (
                <span
                  key={`${height}-${index}`}
                  className="w-2 rounded-full bg-gradient-to-t from-[#3d1de2] via-[#a855f7] to-[#bfdbfe]"
                  style={{ height }}
                />
              ))}
            </div>
            <div className="absolute left-20 top-8 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white text-[#3d1de2] shadow-xl shadow-slate-200/80">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-8 w-8"
              >
                <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
              </svg>
            </div>
          </div>
        </section>

        <input
          ref={inputRef}
          type="file"
          onChange={onFileChange}
          className="sr-only"
          id="audio-file-input"
          aria-label="Select audio file"
        />
        <label
          htmlFor="audio-file-input"
          className={`flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-7 text-center transition-colors duration-200 ${
            validationError
              ? 'border-red-300 bg-red-50 text-red-600 hover:border-red-400'
              : 'border-[#a893ff] bg-white text-slate-950 hover:border-[#3d1de2] hover:bg-violet-50/30'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-16 w-16 text-[#3d1de2]"
          >
            <path d="M12 19V9" />
            <path d="m7.5 13.5 4.5-4.5 4.5 4.5" />
            <path d="M20 16.6A4.4 4.4 0 0 0 17.3 8a6 6 0 0 0-11.1 2.2A4.7 4.7 0 0 0 6.7 19H8" />
          </svg>
          <span className="mt-3 text-base font-medium">
            Drag & drop an audio file here
          </span>
          <span className="mt-3 text-sm text-slate-700">or</span>
          <span className="mt-3 inline-flex rounded-lg bg-gradient-to-r from-[#6d35f2] to-[#3d1de2] px-10 py-3 text-base font-bold text-white shadow-lg shadow-violet-200">
            Choose File
          </span>
          <span className="mt-5 text-sm text-slate-500">
            MP3, WAV, FLAC, OGG up to 50MB
          </span>
        </label>

        {validationError && (
          <p className="text-sm text-red-600" role="alert">
            {validationError.message}
          </p>
        )}

        {file && !validationError && (
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.31a1 1 0 0 1-1.42.002L3.29 9.22a1 1 0 0 1 1.42-1.408l4.04 4.078 6.54-6.596a1 1 0 0 1 1.414-.006Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#3d1de2] text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-slate-950">{file.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                {getFileExtension(file.name)} <span className="mx-3">•</span>
                {file.type || 'audio file'} <span className="mx-3">•</span>
                {formatFileSize(file.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="text-base font-semibold text-[#3d1de2] hover:text-[#27108f]"
            >
              Remove
            </button>
          </div>
        )}

        <button
          onClick={onAnalyze}
          disabled={!file || loading || !!validationError}
          className="w-full rounded-lg bg-gradient-to-r from-[#6d35f2] to-[#3d1de2] py-4 text-xl font-bold text-white shadow-lg shadow-violet-200 transition-all hover:brightness-105 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#3d1de2] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {loading ? 'Analyzing…' : '✦ Analyze Track'}
        </button>

        <p className="text-center text-sm text-slate-500">
          {file
            ? 'Ready to analyze your selected track'
            : 'Upload a file to enable analysis'}
        </p>

        {error && (
          <p role="alert" className="text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <section className="grid overflow-hidden rounded-xl border border-slate-200 bg-white px-10 py-7 shadow-sm md:grid-cols-[1fr_220px]">
          <div>
            <h3 className="text-xl font-bold text-[#3d1de2]">What you get</h3>
            <ul className="mt-5 flex flex-col gap-3 text-base text-slate-800">
              {[
                'Detailed sync licensing metadata',
                'Industry-standard tag categories',
                'Confidence score for reliability',
                'Ready to copy and use',
              ].map((item) => (
                <li key={item} className="flex items-center gap-5">
                  <span className="text-xl text-slate-700">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="relative hidden items-center justify-center md:flex"
            aria-hidden="true"
          >
            <div className="h-24 w-24 rounded-full bg-violet-100" />
            <div className="absolute flex h-28 w-24 flex-col gap-4 rounded-tl-2xl rounded-tr-[28px] rounded-br-2xl rounded-bl-2xl bg-gradient-to-br from-violet-200 to-violet-100 px-5 py-6">
              <span className="h-1.5 w-10 rounded-full bg-violet-300" />
              <span className="h-1.5 w-20 rounded-full bg-violet-400" />
              <span className="h-1.5 w-20 rounded-full bg-violet-400" />
              <span className="h-1.5 w-20 rounded-full bg-violet-400" />
            </div>
            <div className="absolute bottom-2 right-7 flex h-12 w-12 items-center justify-center rounded-full bg-[#4d2bd8] text-white shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-8 w-8"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.31a1 1 0 0 1-1.42.002L3.29 9.22a1 1 0 0 1 1.42-1.408l4.04 4.078 6.54-6.596a1 1 0 0 1 1.414-.006Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
