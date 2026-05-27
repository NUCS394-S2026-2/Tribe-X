import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import type { AnalysisRecord } from '../../shared/api/saveAnalysis';
import { db } from '../../shared/firebase';

interface HistoryPanelProps {
  uid: string;
  onSelect: (record: AnalysisRecord) => void;
}

function formatDate(record: AnalysisRecord): string {
  if (!record.analyzedAt) return '';
  const date = record.analyzedAt.toDate();
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HistoryPanel({ uid, onSelect }: HistoryPanelProps) {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'analyses'),
      where('uid', '==', uid),
      orderBy('analyzedAt', 'desc'),
      limit(2),
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
        console.error('HistoryPanel query failed:', err);
        setQueryError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [uid]);

  if (loading) return null;
  if (queryError) {
    return (
      <section
        aria-label="Analysis history"
        className="shrink-0 border-t border-slate-200 bg-slate-50 px-8 py-4"
      >
        <p className="text-xs text-red-500">
          Could not load history. Check the browser console for details (a Firestore index
          may be missing).
        </p>
      </section>
    );
  }
  if (records.length === 0) return null;

  return (
    <section
      aria-label="Analysis history"
      className="shrink-0 border-t border-slate-200 bg-slate-50 px-8 py-4"
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between"
        aria-expanded={!collapsed}
      >
        <h2 className="text-sm font-bold text-slate-700">Recent Analyses</h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {!collapsed && (
        <ul
          className="mt-3 flex flex-col gap-2 overflow-y-auto"
          style={{ maxHeight: '180px' }}
        >
          {records.map((record) => (
            <li key={record.analysisId}>
              <button
                type="button"
                onClick={() => onSelect(record)}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left shadow-sm hover:border-[#5b50b6] hover:bg-violet-50/30"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6ed1] to-[#4f46a5] text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {record.fileName}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {record.tags.genre.slice(0, 2).join(', ')}
                    {record.tags.genre.length > 2
                      ? ` +${record.tags.genre.length - 2} more`
                      : ''}
                  </p>
                </div>
                {record.analyzedAt && (
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatDate(record)}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
