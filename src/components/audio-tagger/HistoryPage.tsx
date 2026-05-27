import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import type { AnalysisRecord } from '../../shared/api/saveAnalysis';
import { db } from '../../shared/firebase';

interface HistoryPageProps {
  uid: string;
  onSelect: (record: AnalysisRecord) => void;
}

function formatDate(record: AnalysisRecord): string {
  if (!record.analyzedAt) return '';
  const date = record.analyzedAt.toDate();
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HistoryPage({ uid, onSelect }: HistoryPageProps) {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryError, setQueryError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'analyses'),
      where('uid', '==', uid),
      orderBy('analyzedAt', 'desc'),
      limit(200),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as Omit<AnalysisRecord, 'analysisId'>),
          analysisId: docSnap.id,
        }));
        setRecords(docs);
        setLoading(false);
        setQueryError(null);
      },
      (err) => {
        console.error('HistoryPage query failed:', err);
        setQueryError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [uid]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto w-full max-w-[860px]">
          <h2 className="mb-1 text-3xl font-bold tracking-tight text-slate-950">
            Upload History
          </h2>
          <p className="mb-6 text-base text-slate-600">
            All your previously analyzed tracks. Click one to load it.
          </p>

          {loading && (
            <p className="text-center text-sm text-slate-500">Loading history…</p>
          )}

          {queryError && (
            <p className="text-center text-sm text-red-500">
              Could not load history. Check the browser console for details (a Firestore
              index may be missing).
            </p>
          )}

          {!loading && !queryError && records.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-8 py-16 text-center">
              <p className="text-base font-medium text-slate-500">No uploads yet.</p>
              <p className="mt-1 text-sm text-slate-400">
                Analyze a track and it will appear here.
              </p>
            </div>
          )}

          {!loading && !queryError && records.length > 0 && (
            <ul className="flex flex-col gap-2">
              {records.map((record) => (
                <li key={record.analysisId}>
                  <button
                    type="button"
                    onClick={() => onSelect(record)}
                    className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-[#5b50b6] hover:bg-violet-50/30"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6ed1] to-[#4f46a5] text-white">
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
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {record.fileName}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {record.tags.genre.slice(0, 4).join(', ')}
                        {record.tags.genre.length > 4
                          ? ` +${record.tags.genre.length - 4} more`
                          : ''}
                      </p>
                    </div>
                    {record.analyzedAt && (
                      <span className="shrink-0 text-xs text-slate-400">
                        {formatDate(record)}
                      </span>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4 shrink-0 text-slate-300"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
