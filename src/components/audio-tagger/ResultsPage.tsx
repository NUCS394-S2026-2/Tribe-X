import { type FormEvent, useRef, useState } from 'react';

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
  suggestedTags: DiscoTags | null;
  saveError?: string | null;
  loadedFileName?: string | null;
  onChat: (message: string) => void;
  onNewTrack: () => void;
  onTagsChange: (tags: DiscoTags) => void;
  onSaveSuggested: () => void;
  onDismissSuggested: () => void;
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
    return <span className="text-sm font-medium text-slate-500">(none)</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-sm font-semibold text-slate-100 shadow-sm"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

type ArrayTagKey = Exclude<keyof DiscoTags, 'tempo'>;

function InteractiveTagPills({
  sectionKey,
  items,
  tags,
  onTagsChange,
}: {
  sectionKey: ArrayTagKey;
  items: string[];
  tags: DiscoTags;
  onTagsChange: (tags: DiscoTags) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addValue, setAddValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const isDuplicate = (value: string, excludeIndex?: number) =>
    items.some(
      (item, i) =>
        item.trim().toLowerCase() === value.trim().toLowerCase() && i !== excludeIndex,
    );

  const commitEdit = (index: number) => {
    const trimmed = editValue.trim();
    setEditingIndex(null);
    if (trimmed === '' || trimmed.toLowerCase() === items[index].toLowerCase()) {
      if (trimmed === '') {
        onTagsChange({ ...tags, [sectionKey]: items.filter((_, i) => i !== index) });
      }
      return;
    }
    if (isDuplicate(trimmed, index)) return;
    const updated = items.map((item, i) => (i === index ? trimmed : item));
    onTagsChange({ ...tags, [sectionKey]: updated });
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(items[index]);
    setTimeout(() => editInputRef.current?.select(), 0);
  };

  const handleRemove = (index: number) => {
    onTagsChange({ ...tags, [sectionKey]: items.filter((_, i) => i !== index) });
  };

  const handleAdd = () => {
    const trimmed = addValue.trim();
    if (!trimmed || isDuplicate(trimmed)) {
      setAddValue('');
      return;
    }
    onTagsChange({ ...tags, [sectionKey]: [...items, trimmed] });
    setAddValue('');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {items.length === 0 && editingIndex === null && (
          <span className="text-sm font-medium text-slate-500">(none)</span>
        )}
        {items.map((item, index) =>
          editingIndex === index ? (
            <input
              key={`edit-${index}`}
              ref={editInputRef}
              type="text"
              value={editValue}
              aria-label={`Edit tag ${item}`}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={(e) => {
                if (e.currentTarget.dataset.editCanceled === 'true') {
                  delete e.currentTarget.dataset.editCanceled;
                  return;
                }
                commitEdit(index);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitEdit(index);
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  e.currentTarget.dataset.editCanceled = 'true';
                  setEditValue(item);
                  setEditingIndex(null);
                }
              }}
              className="rounded-full border border-violet-300 bg-slate-950 px-3 py-1 text-sm font-semibold text-slate-100 shadow-sm outline-none ring-1 ring-violet-300"
            />
          ) : (
            <span
              key={item}
              className="group inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-sm font-semibold text-slate-100 shadow-sm"
            >
              <span
                role="button"
                tabIndex={0}
                aria-label={`Edit tag ${item}`}
                className="cursor-text"
                onDoubleClick={() => startEdit(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    startEdit(index);
                  }
                }}
              >
                {item}
              </span>
              <button
                type="button"
                aria-label={`Remove tag ${item}`}
                onClick={() => handleRemove(index)}
                className="ml-0.5 rounded-full text-slate-500 opacity-0 transition-opacity hover:text-slate-100 group-hover:opacity-100 focus:opacity-100"
              >
                ×
              </button>
            </span>
          ),
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        className="flex items-center gap-1.5"
      >
        <input
          type="text"
          value={addValue}
          aria-label={`Add tag to ${sectionKey}`}
          placeholder="Add tag…"
          onChange={(e) => setAddValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              const nextValue = addValue.trim();
              if (nextValue && !items.includes(nextValue)) {
                e.preventDefault();
                handleAdd();
              }
            }
          }}
          className="w-28 rounded-full border border-dashed border-slate-600 bg-transparent px-3 py-0.5 text-sm text-slate-300 placeholder:text-slate-500 focus:border-violet-300 focus:outline-none focus:ring-1 focus:ring-violet-300"
        />
        <button
          type="submit"
          disabled={!addValue.trim()}
          className="rounded-full border border-white/10 bg-slate-900 px-2.5 py-0.5 text-sm font-semibold text-slate-300 shadow-sm hover:border-violet-300 hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </form>
    </div>
  );
}

function EditableSingleValue({
  value,
  tags,
  onTagsChange,
}: {
  value: string;
  tags: DiscoTags;
  onTagsChange: (tags: DiscoTags) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setEditing(true);
    setEditValue(value);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = () => {
    setEditing(false);
    onTagsChange({ ...tags, tempo: editValue.trim() });
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        aria-label="Edit tempo"
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
          if (e.key === 'Escape') {
            setEditing(false);
          }
        }}
        className="rounded-full border border-violet-300 bg-slate-950 px-3 py-1 text-sm font-semibold text-slate-100 shadow-sm outline-none ring-1 ring-violet-300"
      />
    );
  }

  if (!value) {
    return (
      <span
        role="button"
        tabIndex={0}
        aria-label="Edit tempo"
        className="cursor-text text-sm font-medium text-slate-500"
        onDoubleClick={startEdit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') startEdit();
        }}
      >
        (none)
      </span>
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`Edit tempo: ${value}`}
      className="cursor-text rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-sm font-semibold text-slate-100 shadow-sm"
      onDoubleClick={startEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') startEdit();
      }}
    >
      {value}
    </span>
  );
}

function tagsForSection(tags: DiscoTags, key: (typeof tagSections)[number]['key']) {
  if (key === 'tempo') return tags.tempo ? [tags.tempo] : [];
  return tags[key];
}

function Confidence({ audioContext }: { audioContext: AudioContext | null }) {
  const confidence = audioContext ? Math.round(audioContext.key_strength * 100) : null;

  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
      <span>Confidence</span>
      <span className="text-emerald-500">
        {confidence === null ? '-' : `${confidence}%`}
      </span>
    </div>
  );
}

function ReasoningCard({ message }: { message?: string }) {
  return (
    <section className="rounded-xl border border-white/10 bg-slate-900 p-4 shadow-sm shadow-black/20">
      <h3 className="text-base font-bold text-white">Why these tags?</h3>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">
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
      <div className="rounded-xl border border-white/10 bg-slate-900 p-4 shadow-sm shadow-black/20">
        <h3 className="text-sm font-bold text-white">Tags found</h3>
        <div className="mt-3 flex flex-col gap-3">
          {foundSections.map((section) => (
            <div key={section.key}>
              <p className="text-xs font-semibold uppercase text-slate-500">
                {section.label}
              </p>
              <div className="mt-1">
                <TagPills items={tagsForSection(tags, section.key)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900 p-4 shadow-sm shadow-black/20">
        <h3 className="text-sm font-bold text-white">Tags not found</h3>
        {missingSections.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {missingSections.map((section) => (
              <span
                key={section.key}
                className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-sm font-semibold text-slate-400"
              >
                {section.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">
            All tag categories include at least one value.
          </p>
        )}
      </div>
    </section>
  );
}

function SimilarTracksPanel({ tags }: { tags: DiscoTags }) {
  return (
    <section className="rounded-xl border border-white/10 bg-slate-900 p-4 shadow-sm shadow-black/20">
      <h3 className="text-sm font-bold text-white">Similar tracks</h3>
      <p className="mt-1 text-sm text-slate-400">
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
              ? 'ml-auto max-w-[80%] bg-violet-500/20 text-violet-50'
              : 'mr-auto max-w-[80%] border border-white/10 bg-slate-900 text-slate-300'
          }`}
        >
          {message.text}
        </div>
      ))}
      {loading && (
        <div className="mr-auto rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm italic text-slate-500">
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
      className="flex items-center gap-2.5 rounded-xl border border-violet-300/20 bg-slate-900 p-2 shadow-sm shadow-black/20"
    >
      <div className="min-w-0 flex-1 px-1">
        <label
          htmlFor="tag-adjustment"
          className="block text-sm font-bold text-slate-200"
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
          className="mt-0.5 w-full border-0 bg-transparent text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={!input.trim() || loading}
        className="rounded-lg bg-gradient-to-r from-[#7c6ed1] to-[#5b50b6] px-4 py-2 text-sm font-bold text-white shadow-sm shadow-violet-950/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none"
      >
        Send
      </button>
    </form>
  );
}

function SuggestedTagsPanel({
  suggestedTags,
  onSave,
  onDismiss,
}: {
  suggestedTags: DiscoTags;
  onSave: () => void;
  onDismiss: () => void;
}) {
  return (
    <section
      aria-label="Suggested tags"
      className="rounded-xl border border-violet-300/30 bg-violet-400/10 p-4 shadow-sm shadow-black/20"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-white">Suggested tags</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-sm font-semibold text-slate-300 shadow-sm hover:border-slate-500 hover:text-white"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-lg bg-gradient-to-r from-[#7c6ed1] to-[#5b50b6] px-3 py-1.5 text-sm font-bold text-white shadow-sm shadow-violet-950/40 hover:brightness-110"
          >
            Save
          </button>
        </div>
      </div>

      <div className="mt-3 divide-y divide-violet-300/20">
        {tagSections.map((section) => {
          const items =
            section.key === 'tempo'
              ? suggestedTags.tempo
                ? [suggestedTags.tempo]
                : []
              : suggestedTags[section.key];
          return (
            <div key={section.key} className="flex items-baseline gap-3 py-2">
              <span className="w-28 shrink-0 text-xs font-semibold uppercase text-slate-500">
                {section.label}
              </span>
              <TagPills items={items} />
            </div>
          );
        })}
      </div>
    </section>
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
  suggestedTags,
  saveError,
  loadedFileName,
  onChat,
  onNewTrack,
  onTagsChange,
  onSaveSuggested,
  onDismissSuggested,
}: ResultsPageProps): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultsTab>('Tags');
  const reasoning = chatMessages.find((message) => message.role === 'model')?.text;
  const displayFileName = file?.name ?? loadedFileName ?? 'Uploaded track';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildPlainText(tags));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 px-8 py-6">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onNewTrack}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-300 hover:text-violet-100"
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
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm font-bold text-slate-200 shadow-sm shadow-black/20 hover:border-violet-300 hover:text-violet-200"
            >
              <DownloadIcon />
              CSV
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#7c6ed1] to-[#5b50b6] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-violet-950/40"
            >
              <CopyIcon />
              {copied ? 'Copied!' : 'Copy All Tags'}
            </button>
          </div>
        </div>

        <section className="grid gap-4 rounded-xl border border-violet-300/20 bg-slate-900 px-4 py-3 shadow-sm shadow-black/20 lg:grid-cols-[68px_1fr_auto]">
          <span className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b7cf6] to-[#5b50b6] text-white shadow-lg shadow-violet-950/40">
            <MusicNoteIcon className="h-9 w-9" />
          </span>

          <div className="min-w-0">
            <p className="flex min-w-0 items-center gap-2">
              <span className="truncate text-base font-bold text-white">
                {displayFileName}
              </span>
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-400">
              <span>
                {file ? fileExtension(file.name) : fileExtension(displayFileName)}
              </span>
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
                  aria-label={`Preview ${displayFileName}`}
                />
              ) : (
                <>
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7c6ed1] to-[#5b50b6] text-white shadow-md shadow-violet-950/40"
                    aria-hidden="true"
                  >
                    ▶
                  </span>
                  <span className="text-sm font-semibold text-slate-400">0:00</span>
                </>
              )}
              <div
                className="hidden min-w-0 flex-1 items-center gap-1 overflow-hidden md:flex"
                aria-hidden="true"
              >
                {waveformBars.map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className="w-1 shrink-0 rounded-full bg-violet-300/40"
                    style={{ height }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 whitespace-nowrap text-sm font-medium text-slate-400">
            <CheckCircleIcon />
            <span>Analyzed just now</span>
          </div>
        </section>

        <div className="flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-9">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 text-sm font-semibold ${
                  activeTab === tab
                    ? 'border-b-4 border-violet-300 text-white'
                    : 'border-b-4 border-transparent text-slate-400 hover:text-slate-200'
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
            <section className="divide-y divide-white/10">
              {tagSections.map((section) => (
                <div key={section.key} className="py-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{section.label}</h3>
                    <div className="mt-2">
                      {section.key === 'tempo' ? (
                        <EditableSingleValue
                          value={tags.tempo}
                          tags={tags}
                          onTagsChange={onTagsChange}
                        />
                      ) : (
                        <InteractiveTagPills
                          sectionKey={section.key}
                          items={tags[section.key]}
                          tags={tags}
                          onTagsChange={onTagsChange}
                        />
                      )}
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
            <p role="alert" className="mt-3 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>

        {suggestedTags && (
          <SuggestedTagsPanel
            suggestedTags={suggestedTags}
            onSave={onSaveSuggested}
            onDismiss={onDismissSuggested}
          />
        )}

        {saveError && (
          <p className="rounded-lg border border-amber-300/20 bg-amber-400/10 px-4 py-2.5 text-sm font-medium text-amber-200">
            {saveError}
          </p>
        )}

        <p className="rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-400">
          These tags are AI generated. Please review before use.
        </p>
      </div>
    </div>
  );
}
