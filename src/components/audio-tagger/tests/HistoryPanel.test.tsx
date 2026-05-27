import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AnalysisRecord } from '../../../shared/api/saveAnalysis';
import { HistoryPanel } from '../HistoryPanel';

vi.mock('../../../shared/firebase', () => ({ db: {} }));

const mockOnSnapshot = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
}));

function makeFakeTimestamp(date: Date) {
  return { toDate: () => date };
}

const record1: AnalysisRecord = {
  analysisId: 'id-1',
  uid: 'user-1',
  fileName: 'song-one.mp3',
  tags: {
    genre: ['Electronic', 'Ambient'],
    instruments: ['Synth'],
    lyricThemes: [],
    mood: ['Dreamy'],
    tempo: 'Midtempo',
    type: [],
    vocals: ['Instrumental'],
    soundsLike: [],
  },
  audioContext: {
    bpm: 95,
    key: 'A minor',
    key_strength: 0.8,
    energy_level: 'Medium',
    tempo_feel: 'Medium',
    danceability_score: 1.2,
    harmonic_to_percussive_ratio: 0.68,
    onset_density_per_second: 2.1,
    instrument_hints: [],
    vocal_presence: false,
    lyrics: null,
  },
  analyzedAt: makeFakeTimestamp(new Date('2026-05-25T10:00:00')) as never,
};

const record2: AnalysisRecord = {
  ...record1,
  analysisId: 'id-2',
  fileName: 'song-two.wav',
  tags: { ...record1.tags, genre: ['Jazz'] },
};

function setupSnapshot(records: AnalysisRecord[]) {
  mockOnSnapshot.mockImplementation((_query, callback: (snap: unknown) => void) => {
    callback({
      docs: records.map((r) => ({
        id: r.analysisId,
        data: () => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { analysisId, ...rest } = r;
          return rest;
        },
      })),
    });
    return vi.fn();
  });
}

describe('HistoryPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing while loading (before onSnapshot fires)', () => {
    mockOnSnapshot.mockReturnValue(vi.fn());
    const { container } = render(<HistoryPanel uid="user-1" onSelect={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when there are no records', () => {
    setupSnapshot([]);
    const { container } = render(<HistoryPanel uid="user-1" onSelect={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a list item for each analysis record', () => {
    setupSnapshot([record1, record2]);
    render(<HistoryPanel uid="user-1" onSelect={vi.fn()} />);
    expect(screen.getByText('song-one.mp3')).toBeInTheDocument();
    expect(screen.getByText('song-two.wav')).toBeInTheDocument();
  });

  it('shows genre tags as a subtitle for each record', () => {
    setupSnapshot([record1]);
    render(<HistoryPanel uid="user-1" onSelect={vi.fn()} />);
    expect(screen.getByText(/Electronic/)).toBeInTheDocument();
  });

  it('calls onSelect with the correct record when a history item is clicked', async () => {
    const onSelect = vi.fn();
    setupSnapshot([record1, record2]);
    render(<HistoryPanel uid="user-1" onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button', { name: /song-one\.mp3/i }));

    expect(onSelect).toHaveBeenCalledOnce();
    const arg = onSelect.mock.calls[0][0] as AnalysisRecord;
    expect(arg.analysisId).toBe('id-1');
    expect(arg.fileName).toBe('song-one.mp3');
  });

  it('renders the section with the "Analysis history" accessible label', () => {
    setupSnapshot([record1]);
    render(<HistoryPanel uid="user-1" onSelect={vi.fn()} />);
    expect(screen.getByRole('region', { name: /analysis history/i })).toBeInTheDocument();
  });
});
