import type { ReactElement } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpPanel({ isOpen, onClose }: HelpModalProps): ReactElement | null {
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

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-3 text-white/80">
            <div>
              <h3 className="mb-2 font-semibold text-white">Getting Started</h3>
              <ol className="space-y-2 text-sm">
                <li>
                  <span className="font-medium text-white">1. Sign In</span> — Click the
                  Sign In button and authenticate using your Google account.
                </li>
                <li>
                  <span className="font-medium text-white">2. Upload Audio</span> — Go to
                  the Generate tab and upload an audio file (MP3). Maximum file size is
                  50MB.
                </li>
                <li>
                  <span className="font-medium text-white">3. Analyze</span> — Click the
                  Analyze button to process your audio file. The app will generate tags
                  describing the music.
                </li>
                <li>
                  <span className="font-medium text-white">4. Review Tags</span> — Once
                  analysis completes, view the generated tags and insights on the Results
                  page.
                </li>
                <li>
                  <span className="font-medium text-white">5. Edit Tags</span> —
                  Double-click any tag to edit it, or use the × button to remove tags. Add
                  new tags using the text input below each section.
                </li>
                <li>
                  <span className="font-medium text-white">6. View History</span> — Click
                  the History tab to see all your previous analyses and results.
                </li>
              </ol>
            </div>
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
