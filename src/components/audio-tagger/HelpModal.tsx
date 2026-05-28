import type { ReactElement } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps): ReactElement | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-lg bg-[#0f1831] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Help</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
            aria-label="Close help"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <path d="M18 6l-12 12" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 text-white/80">
            {/* TODO: Add your help content here */}
            <p className="text-sm">Placeholder</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#7c6ed1] px-4 py-2 font-medium text-white hover:bg-[#6f63c7]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
