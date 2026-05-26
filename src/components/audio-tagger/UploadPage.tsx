import type { ChangeEvent, ReactElement, ReactNode, RefObject } from 'react';

import type { FileValidationError } from './AudioTagger';

const waveBars = [3, 6, 12, 20, 32, 48, 66, 84, 104, 120, 90, 112, 96, 76];

interface UploadPageProps {
  file: File | null;
  audioPreviewUrl: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  loading: boolean;
  error: string | null;
  validationError: FileValidationError | null;
  onAnalyze: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  historySlot?: ReactNode;
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
  audioPreviewUrl,
  inputRef,
  loading,
  error,
  validationError,
  onAnalyze,
  onFileChange,
  onReset,
  historySlot,
}: UploadPageProps): ReactElement {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-4">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3">
          <section className="grid items-center gap-4 lg:grid-cols-[1fr_320px]">
            <div>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-950">
                Upload a track.
                <br />
                Get <span className="text-[#4f46a5]">sync</span> licensing tags.
              </h2>
              <p className="mt-2 max-w-xl text-base leading-relaxed text-slate-600">
                AI-powered metadata that helps your music get discovered and licensed.
              </p>
            </div>

            <div
              className="relative hidden h-24 items-center justify-end lg:flex"
              aria-hidden="true"
            >
              <div className="flex h-full items-end gap-2">
                {waveBars.map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className="w-1.5 rounded-full bg-gradient-to-t from-[#4f46a5] via-[#9b8be0] to-[#bfdbfe]"
                    style={{ height }}
                  />
                ))}
              </div>
              <div className="absolute left-16 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-[#4f46a5] shadow-xl shadow-slate-200/80">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
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
            className={`flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-5 text-center transition-colors duration-200 ${
              validationError
                ? 'border-red-300 bg-red-50 text-red-600 hover:border-red-400'
                : 'border-[#b8b2e6] bg-white text-slate-950 hover:border-[#4f46a5] hover:bg-violet-50/30'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-12 w-12 text-[#4f46a5]"
            >
              <path d="M12 19V9" />
              <path d="m7.5 13.5 4.5-4.5 4.5 4.5" />
              <path d="M20 16.6A4.4 4.4 0 0 0 17.3 8a6 6 0 0 0-11.1 2.2A4.7 4.7 0 0 0 6.7 19H8" />
            </svg>
            <span className="mt-2 text-base font-medium">
              Drag & drop an audio file here
            </span>
            <span className="mt-2 text-base text-slate-700">or</span>
            <span className="mt-2 inline-flex rounded-lg bg-gradient-to-r from-[#6b5bd6] to-[#4f46a5] px-8 py-2.5 text-base font-bold text-white shadow-lg shadow-violet-200">
              Choose File
            </span>
            <span className="mt-3 text-base text-slate-500">
              MP3, WAV, FLAC, OGG up to 50MB
            </span>
          </label>

          {validationError && (
            <p className="text-base text-red-600" role="alert">
              {validationError.message}
            </p>
          )}

          {file && !validationError && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.31a1 1 0 0 1-1.42.002L3.29 9.22a1 1 0 0 1 1.42-1.408l4.04 4.078 6.54-6.596a1 1 0 0 1 1.414-.006Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6ed1] to-[#4f46a5] text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-slate-950">
                    {file.name}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {getFileExtension(file.name)} <span className="mx-2">•</span>
                    {file.type || 'audio file'} <span className="mx-2">•</span>
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onReset}
                  className="text-base font-semibold text-[#4f46a5] hover:text-[#44378f]"
                >
                  Remove
                </button>
              </div>
              {audioPreviewUrl && (
                // eslint-disable-next-line jsx-a11y/media-has-caption -- Local uploaded audio previews do not have authored caption tracks.
                <audio
                  controls
                  src={audioPreviewUrl}
                  className="mt-3 w-full"
                  aria-label={`Preview ${file.name}`}
                />
              )}
            </div>
          )}

          <button
            onClick={onAnalyze}
            disabled={!file || loading || !!validationError}
            className="w-full rounded-lg bg-gradient-to-r from-[#6b5bd6] to-[#4f46a5] py-3 text-base font-bold text-white shadow-lg shadow-violet-200 transition-all hover:brightness-105 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#4f46a5] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {loading ? 'Analyzing…' : '✦ Analyze Track'}
          </button>

          <p className="text-center text-base text-slate-500">
            {file
              ? 'Ready to analyze your selected track'
              : 'Upload a file to enable analysis'}
          </p>

          {error && (
            <p role="alert" className="text-center text-base text-red-600">
              {error}
            </p>
          )}

          <section className="grid overflow-hidden rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm md:grid-cols-[1fr_140px]">
            <div>
              <h3 className="text-base font-bold text-[#4f46a5]">What you get</h3>
              <ul className="mt-3 flex flex-col gap-2 text-base text-slate-800">
                {[
                  'Detailed sync licensing metadata',
                  'Industry-standard tag categories',
                  'Confidence score for reliability',
                  'Ready to copy and use',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-base text-slate-700">✓</span>
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
              <div className="absolute flex h-28 w-24 flex-col gap-3 rounded-tl-2xl rounded-tr-[28px] rounded-br-2xl rounded-bl-2xl bg-gradient-to-br from-violet-200 to-violet-100 px-4 py-5">
                <span className="h-1.5 w-10 rounded-full bg-violet-300" />
                <span className="h-1.5 w-20 rounded-full bg-violet-400" />
                <span className="h-1.5 w-20 rounded-full bg-violet-400" />
                <span className="h-1.5 w-20 rounded-full bg-violet-400" />
              </div>
              <div className="absolute bottom-2 right-7 flex h-10 w-10 items-center justify-center rounded-full bg-[#5b50b6] text-white shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-6 w-6"
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
      {historySlot}
    </div>
  );
}
