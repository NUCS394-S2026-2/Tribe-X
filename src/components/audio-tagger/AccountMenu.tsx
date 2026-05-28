import { type ReactElement, useState } from 'react';

import { SignOutButton } from '../SignOutButton/SignOutButton';

interface AccountMenuProps {
  displayName: string;
}

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function AccountMenu({ displayName }: AccountMenuProps): ReactElement {
  const [open, setOpen] = useState(false);
  const initials = getInitials(displayName);

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 py-1 pl-1 pr-2 text-slate-100 shadow-sm shadow-black/20 transition-colors hover:border-violet-300/50 hover:bg-slate-800 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#8b7cf6]"
        aria-label="Open account menu"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#8b7cf6] to-[#4c3b99] text-sm font-bold text-white shadow-md shadow-violet-950/40">
          {initials}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-slate-300 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 w-56 rounded-xl border border-white/10 bg-slate-950 p-3 shadow-2xl shadow-black/40">
          <div className="mb-3 flex items-center gap-3 border-b border-white/10 pb-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b7cf6] to-[#4c3b99] text-sm font-bold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="text-xs text-slate-400">Account</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      )}
    </div>
  );
}
