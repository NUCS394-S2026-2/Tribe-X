import type { ReactElement } from 'react';

export function AudioSidebar(): ReactElement {
  return (
    <aside className="flex w-[92px] shrink-0 flex-col items-center border-r border-[#0f1831] bg-[#071227] px-2 py-6 text-white shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#3817c8] shadow-lg shadow-violet-950/40">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-7 w-7"
        >
          <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
        </svg>
      </div>

      <div className="mt-6 h-1 w-8 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#3d1de2]" />

      <div className="mt-8 flex flex-1 flex-col items-center justify-between">
        <div className="flex flex-col items-center gap-8">
          <button
            type="button"
            className="flex h-[68px] w-[68px] flex-col items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-[#7c4dff] to-[#3b18c7] text-xs font-semibold text-white shadow-lg shadow-violet-950/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-7 w-7"
            >
              <path d="m3 10.5 9-7 9 7" />
              <path d="M5 10v10h5v-6h4v6h5V10" />
            </svg>
            Generate
          </button>

          <button
            disabled
            title="History (coming soon)"
            className="flex flex-col items-center gap-2 text-sm font-medium text-white/90 disabled:cursor-not-allowed"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
            History
          </button>
        </div>

        <div className="flex flex-col items-center gap-7 pb-1">
          <button
            disabled
            title="Settings (coming soon)"
            className="flex flex-col items-center gap-2 text-sm font-medium text-white/90 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-7 w-7"
            >
              <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
              <path d="M19.4 15a1.75 1.75 0 0 0 .35 1.93l.05.05a2 2 0 0 1-2.83 2.83l-.05-.05A1.75 1.75 0 0 0 15 19.4a1.75 1.75 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.08a1.75 1.75 0 0 0-1-1.6 1.75 1.75 0 0 0-1.93.35l-.05.05a2 2 0 0 1-2.83-2.83l.05-.05A1.75 1.75 0 0 0 4.6 15a1.75 1.75 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.08a1.75 1.75 0 0 0 1.6-1 1.75 1.75 0 0 0-.35-1.93l-.05-.05a2 2 0 0 1 2.83-2.83l.05.05A1.75 1.75 0 0 0 9 4.6a1.75 1.75 0 0 0 1-1.6V3a2 2 0 0 1 4 0v.08a1.75 1.75 0 0 0 1 1.6 1.75 1.75 0 0 0 1.93-.35l.05-.05a2 2 0 0 1 2.83 2.83l-.05.05A1.75 1.75 0 0 0 19.4 9c.2.62.78 1 1.6 1H21a2 2 0 0 1 0 4h-.08a1.75 1.75 0 0 0-1.52 1Z" />
            </svg>
            Settings
          </button>

          <button
            disabled
            title="Help (coming soon)"
            className="flex flex-col items-center gap-2 text-sm font-medium text-white/90 disabled:cursor-not-allowed"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xl font-semibold">
              ?
            </span>
            Help
          </button>
        </div>
      </div>
    </aside>
  );
}
