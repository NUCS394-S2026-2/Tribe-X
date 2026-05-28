import type { ReactElement } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps): ReactElement {
  const dark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-900/70 text-slate-300 shadow-sm shadow-black/20 transition-colors hover:border-violet-300/50 hover:text-violet-200 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#8b7cf6]"
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M10 2a.75.75 0 0 1 .75.75V4a.75.75 0 0 1-1.5 0V2.75A.75.75 0 0 1 10 2ZM10 15.25a.75.75 0 0 1 .75.75v1.25a.75.75 0 0 1-1.5 0V16a.75.75 0 0 1 .75-.75ZM17.25 9.25a.75.75 0 0 1 0 1.5H16a.75.75 0 0 1 0-1.5h1.25ZM4.75 10a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1 0-1.5H4a.75.75 0 0 1 .75.75ZM15.126 4.874a.75.75 0 0 1 0 1.06l-.884.884a.75.75 0 1 1-1.06-1.06l.883-.884a.75.75 0 0 1 1.061 0ZM6.818 13.182a.75.75 0 0 1 0 1.06l-.884.884a.75.75 0 0 1-1.06-1.06l.884-.884a.75.75 0 0 1 1.06 0ZM15.126 15.126a.75.75 0 0 1-1.06 0l-.884-.884a.75.75 0 0 1 1.06-1.06l.884.883a.75.75 0 0 1 0 1.061ZM6.818 6.818a.75.75 0 0 1-1.06 0l-.884-.884a.75.75 0 1 1 1.06-1.06l.884.884a.75.75 0 0 1 0 1.06ZM10 6.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 8.514 8.514.75.75 0 0 1 .77.26.75.75 0 0 1 .084.808A8.5 8.5 0 1 1 6.647 1.92a.75.75 0 0 1 .808.084Z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
