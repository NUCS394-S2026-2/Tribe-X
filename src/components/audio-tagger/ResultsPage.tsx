import { type FormEvent, useState } from 'react';

import type { AudioContext, DiscoTags } from '../../shared/types/MusicTags';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface ResultsPageProps {
  audioContext: AudioContext | null;
  audioPreviewUrl: string | null;
  chatLoading: boolean;
  chatMessages: ChatMessage[];
  error: string | null;
  file: File | null;
  tags: DiscoTags;
  onChat: (message: string) => void;
  onNewTrack: () => void;
}

const tagSections = [
  { key: 'genre', label: 'Genre' },
  { key: 'instruments', label: 'Instruments' },
  { key: 'mood', label: 'Mood / Feel' },
  { key: 'vocals', label: 'Vocals' },
  { key: 'lyricThemes', label: 'Lyric Themes' },
  { key: 'tempo', label: 'Tempo' },
  { key: 'soundsLike', label: 'Sounds Like' },
] as const;

const tabs = ['Tags', 'Overview', 'Insights', 'Similar Tracks'] as const;

type ResultsTab = (typeof tabs)[number];

const waveformBars = [
  10, 18, 24, 14, 30, 20, 36, 28, 42, 18, 32, 26, 48, 34, 22, 40, 30, 46, 24, 36, 18, 32,
  28, 44, 34, 20, 30, 26, 38, 22, 16, 12,
];

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

function buildPlainText(tags: DiscoTags): string {
  return [
    `Genre: ${tags.genre.join(', ')}`,
    `Instruments: ${tags.instruments.join(', ')}`,
    `Lyric Themes: ${tags.lyricThemes.join(', ')}`,
    `Mood/Feel: ${tags.mood.join(', ')}`,
    `Tempo: ${tags.tempo}`,
    `Vocals: ${tags.vocals.join(', ')}`,
    `Sounds Like: ${tags.soundsLike.join(', ')}`,
  ].join('\n');
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileExtension(fileName: string): string {
  const ext = fileName.split('.').pop();
  return ext ? ext.toUpperCase() : 'AUDIO';
}

function downloadText(content: string, fileName: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function MusicNoteIcon({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v7.69L6.53 7.72a.75.75 0 0 0-1.06 1.06l4 4a.75.75 0 0 0 1.06 0l4-4a.75.75 0 1 0-1.06-1.06l-2.72 2.72V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 17h10.5A2.75 2.75 0 0 0 18 14.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M7 3.25A2.25 2.25 0 0 1 9.25 1h6.5A2.25 2.25 0 0 1 18 3.25v6.5A2.25 2.25 0 0 1 15.75 12h-6.5A2.25 2.25 0 0 1 7 9.75v-6.5Z" />
      <path d="M3.25 8A2.25 2.25 0 0 0 1 10.25v6.5A2.25 2.25 0 0 0 3.25 19h6.5A2.25 2.25 0 0 0 12 16.75V14.5h-1.5v2.25a.75.75 0 0 1-.75.75h-6.5a.75.75 0 0 1-.75-.75v-6.5a.75.75 0 0 1 .75-.75H5.5V8h-2.25Z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5 text-emerald-500"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.86-9.8a.75.75 0 0 0-1.22-.88l-3.236 4.53-1.53-1.53a.75.75 0 0 0-1.061 1.06l2.158 2.159a.75.75 0 0 0 1.14-.094L13.86 8.2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TagPills({ items }: { items: string[] }) {
  if (!items.length) {
    return <span className="text-sm font-medium text-slate-400">(none)</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900 shadow-sm"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function tagsForSection(tags: DiscoTags, key: (typeof tagSections)[number]['key']) {
  if (key === 'tempo') return tags.tempo ? [tags.tempo] : [];
  return tags[key];
}

function Confidence({ audioContext }: { audioContext: AudioContext | null }) {
  const confidence = audioContext ? Math.round(audioContext.key_strength * 100) : null;

  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
      <span>Confidence</span>
      <span className="text-emerald-500">
        {confidence === null ? '-' : `${confidence}%`}
      </span>
    </div>
  );
}

function ReasoningCard({ message }: { message?: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-bold text-slate-950">Why these tags?</h3>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
        {message ||
          'The tags reflect the measured tempo, energy, rhythm, and tonal features detected in the uploaded track.'}
      </p>
    </section>
  );
}

function OverviewPanel({ tags }: { tags: DiscoTags }) {
  const foundSections = tagSections.filter(
    (section) => tagsForSection(tags, section.key).length > 0,
  );
  const missingSections = tagSections.filter(
    (section) => tagsForSection(tags, section.key).length === 0,
  );

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-950">Tags found</h3>
        <div className="mt-3 flex flex-col gap-3">
          {foundSections.map((section) => (
            <div key={section.key}>
              <p className="text-xs font-semibold uppercase text-slate-400">
                {section.label}
              </p>
              <div className="mt-1">
                <TagPills items={tagsForSection(tags, section.key)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-950">Tags not found</h3>
        {missingSections.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {missingSections.map((section) => (
              <span
                key={section.key}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-500"
              >
                {section.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            All tag categories include at least one value.
          </p>
        )}
      </div>
    </section>
  );
}

function SimilarTracksPanel({ tags }: { tags: DiscoTags }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-950">Similar tracks</h3>
      <p className="mt-1 text-sm text-slate-500">
        Artist references returned by the analysis.
      </p>
      <div className="mt-4">
        <TagPills items={tags.soundsLike} />
      </div>
    </section>
  );
}

function ChatMessages({
  messages,
  loading,
}: {
  messages: ChatMessage[];
  loading: boolean;
}) {
  const visibleMessages = messages.slice(1);
  if (!visibleMessages.length && !loading) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      {visibleMessages.map((message, index) => (
        <div
          key={`${message.role}-${index}-${message.text}`}
          className={`rounded-xl px-4 py-2.5 text-sm ${
            message.role === 'user'
              ? 'ml-auto max-w-[80%] bg-[#f1effb] text-slate-900'
              : 'mr-auto max-w-[80%] border border-slate-200 bg-white text-slate-700'
          }`}
        >
          {message.text}
        </div>
      ))}
      {loading && (
        <div className="mr-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm italic text-slate-400">
          Thinking...
        </div>
      )}
    </div>
  );
}

function ChatInputBar({
  loading,
  onSend,
}: {
  loading: boolean;
  onSend: (message: string) => void;
}) {
  const [input, setInput] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setInput('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2.5 rounded-xl border border-violet-200/70 bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-2 shadow-sm shadow-violet-100/70"
    >
      <div className="min-w-0 flex-1 px-1">
        <label
          htmlFor="tag-adjustment"
          className="block text-sm font-bold text-slate-700"
        >
          Give feedback on the analysis
        </label>
        <input
          id="tag-adjustment"
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder='e.g. "make the mood darker"'
          disabled={loading}
          className="mt-0.5 w-full border-0 bg-transparent text-sm text-slate-500 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={!input.trim() || loading}
        className="rounded-lg bg-gradient-to-r from-[#7c6ed1] to-[#5b50b6] px-4 py-2 text-sm font-bold text-white shadow-sm shadow-violet-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:from-violet-100 disabled:to-violet-100 disabled:text-violet-300 disabled:shadow-none"
      >
        Send
      </button>
    </form>
  );
}

export function ResultsPage({
  audioContext,
  audioPreviewUrl,
  chatLoading,
  chatMessages,
  error,
  file,
  tags,
  onChat,
  onNewTrack,
}: ResultsPageProps): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultsTab>('Tags');
  const reasoning = chatMessages.find((message) => message.role === 'model')?.text;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildPlainText(tags));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-4">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onNewTrack}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#5b50b6] hover:text-[#44378f]"
          >
            <span aria-hidden="true">←</span>
            Back to upload
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                downloadText(buildCSV(tags), 'disco-tags.csv', 'text/csv;charset=utf-8;')
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm hover:border-[#5b50b6] hover:text-[#5b50b6]"
            >
              <DownloadIcon />
              CSV
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6b5bd6] to-[#4f46a5] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-violet-200"
            >
              <CopyIcon />
              {copied ? 'Copied!' : 'Copy All Tags'}
            </button>
          </div>
        </div>

        <section className="grid gap-4 rounded-xl border border-violet-100 bg-violet-50/30 px-4 py-3 shadow-sm lg:grid-cols-[68px_1fr_auto]">
          <span className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c6ed1] to-[#4f46a5] text-white shadow-lg shadow-violet-200">
            <MusicNoteIcon className="h-9 w-9" />
          </span>

          <div className="min-w-0">
            <p className="flex min-w-0 items-center gap-2">
              <span className="truncate text-base font-bold text-slate-950">
                {file?.name ?? 'Uploaded track'}
              </span>
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
              <span>{file ? fileExtension(file.name) : 'AUDIO'}</span>
              {file && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>{file.type || 'audio file'}</span>
                  <span aria-hidden="true">•</span>
                  <span>{formatFileSize(file.size)}</span>
                </>
              )}
            </p>

            <div className="mt-2 flex items-center gap-3">
              {audioPreviewUrl ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption -- Local uploaded audio previews do not have authored caption tracks.
                <audio
                  controls
                  src={audioPreviewUrl}
                  className="min-w-0 flex-1"
                  aria-label={`Preview ${file?.name ?? 'uploaded track'}`}
                />
              ) : (
                <>
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6f63c7] to-[#4f46a5] text-white shadow-md shadow-violet-200"
                    aria-hidden="true"
                  >
                    ▶
                  </span>
                  <span className="text-sm font-semibold text-slate-500">0:00</span>
                </>
              )}
              <div
                className="hidden min-w-0 flex-1 items-center gap-1 overflow-hidden md:flex"
                aria-hidden="true"
              >
                {waveformBars.map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className="w-1 shrink-0 rounded-full bg-violet-200"
                    style={{ height }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 whitespace-nowrap text-sm font-medium text-slate-500">
            <CheckCircleIcon />
            <span>Analyzed just now</span>
          </div>
        </section>

        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-9">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 text-sm font-semibold ${
                  activeTab === tab
                    ? 'border-b-4 border-[#5b50b6] text-slate-950'
                    : 'border-b-4 border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <Confidence audioContext={audioContext} />
        </div>

        {activeTab === 'Tags' && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="divide-y divide-slate-200">
              {tagSections.map((section) => (
                <div key={section.key} className="py-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">{section.label}</h3>
                    <div className="mt-2">
                      <TagPills items={tagsForSection(tags, section.key)} />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <aside>
              <ReasoningCard message={reasoning} />
            </aside>
          </div>
        )}

        {activeTab === 'Overview' && <OverviewPanel tags={tags} />}

        {activeTab === 'Insights' && <ReasoningCard message={reasoning} />}

        {activeTab === 'Similar Tracks' && <SimilarTracksPanel tags={tags} />}

        <div>
          <ChatInputBar loading={chatLoading} onSend={onChat} />
          <ChatMessages messages={chatMessages} loading={chatLoading} />
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <p className="rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500">
          These tags are AI generated. Please review before use.
        </p>
      </div>
    </div>
  );
}
