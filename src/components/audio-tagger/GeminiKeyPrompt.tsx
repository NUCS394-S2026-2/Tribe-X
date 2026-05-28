import React, { useState } from 'react';

interface GeminiKeyPromptProps {
  onSave: (key: string) => void;
}

export function GeminiKeyPrompt({ onSave }: GeminiKeyPromptProps): React.ReactElement {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSave(trimmed);
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-slate-950 p-8">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-sm shadow-black/20">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b7cf6] to-[#4c3b99] text-white shadow-md shadow-violet-950/40">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M15.75 1.5a6.75 6.75 0 0 0-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 0 0-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 0 0 .75-.75v-1.5h1.5A.75.75 0 0 0 9 19.5V18h1.5a.75.75 0 0 0 .53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1 0 15.75 1.5Zm0 3a.75.75 0 0 0 0 1.5A2.25 2.25 0 0 1 18 8.25a.75.75 0 0 0 1.5 0 3.75 3.75 0 0 0-3.75-3.75Z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h2 className="mb-1 text-xl font-bold text-white">Enter your Gemini API key</h2>
        <p className="mb-6 text-sm text-slate-400">
          Get a free key at{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-violet-300 underline underline-offset-2 hover:text-violet-100"
          >
            aistudio.google.com
          </a>
          . Your key is stored locally and sent only with analysis requests.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="AIza..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-300/20"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="rounded-lg bg-gradient-to-r from-[#7c6ed1] to-[#4c3b99] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-950/40 disabled:opacity-40 hover:brightness-110"
          >
            Save key
          </button>
        </form>
      </div>
    </div>
  );
}
