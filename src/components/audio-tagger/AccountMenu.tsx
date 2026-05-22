import { type ReactElement, useState } from 'react';

import { SignOutButton } from '../SignOutButton/SignOutButton';

interface AccountMenuProps {
  displayName: string;
}

export function AccountMenu({ displayName }: AccountMenuProps): ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex items-center gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">Signed in as</p>
        <p className="mt-0.5 text-base font-bold text-slate-950">{displayName}</p>
      </div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-full p-2 text-slate-950 transition-colors hover:bg-slate-100 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#3d1de2]"
        aria-label="Open account menu"
        aria-expanded={open}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`}
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
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 min-w-36 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl shadow-slate-200/70">
          <SignOutButton />
        </div>
      )}
    </div>
  );
}
