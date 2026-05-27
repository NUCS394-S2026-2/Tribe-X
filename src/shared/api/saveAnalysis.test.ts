import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AudioContext, DiscoTags } from '../types/MusicTags';
import { saveAnalysis, updateAnalysisTags } from './saveAnalysis';

vi.mock('../firebase', () => ({ db: {} }));

const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDoc = vi.fn();
const mockCollection = vi.fn();
const mockServerTimestamp = vi.fn(() => 'SERVER_TIMESTAMP');

vi.mock('firebase/firestore', () => ({
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  collection: (...args: unknown[]) => mockCollection(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

const mockTags: DiscoTags = {
  genre: ['Electronic'],
  instruments: ['Synth'],
  lyricThemes: [],
  mood: ['Cinematic'],
  tempo: 'Up-tempo',
  type: [],
  vocals: ['Instrumental'],
  soundsLike: ['Hans Zimmer'],
};

const mockAudioContext: AudioContext = {
  bpm: 124,
  key: 'C major',
  key_strength: 0.85,
  energy_level: 'High',
  tempo_feel: 'Upbeat',
  danceability_score: 1.8,
  harmonic_to_percussive_ratio: 0.71,
  onset_density_per_second: 2.3,
  instrument_hints: ['piano', 'drums'],
  vocal_presence: false,
  lyrics: null,
};

describe('saveAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCollection.mockReturnValue('collection-ref');
    mockAddDoc.mockResolvedValue({ id: 'doc-abc123' });
  });

  it('calls addDoc with the correct payload including uid and serverTimestamp', async () => {
    await saveAnalysis('user-uid-1', 'track.mp3', mockTags, mockAudioContext);

    expect(mockAddDoc).toHaveBeenCalledOnce();
    const [, payload] = mockAddDoc.mock.calls[0] as [unknown, Record<string, unknown>];
    expect(payload.uid).toBe('user-uid-1');
    expect(payload.fileName).toBe('track.mp3');
    expect(payload.tags).toEqual(mockTags);
    expect(payload.audioContext).toEqual(mockAudioContext);
    expect(payload.analyzedAt).toBe('SERVER_TIMESTAMP');
  });

  it('returns the Firestore document id', async () => {
    const id = await saveAnalysis('user-uid-1', 'track.mp3', mockTags, mockAudioContext);
    expect(id).toBe('doc-abc123');
  });

  it('uses the analyses collection', async () => {
    await saveAnalysis('user-uid-1', 'track.mp3', mockTags, mockAudioContext);
    expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'analyses');
  });
});

describe('updateAnalysisTags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDoc.mockReturnValue('doc-ref');
    mockUpdateDoc.mockResolvedValue(undefined);
  });

  it('calls updateDoc with only the tags field', async () => {
    await updateAnalysisTags('analysis-id-1', mockTags);

    expect(mockUpdateDoc).toHaveBeenCalledOnce();
    const [, payload] = mockUpdateDoc.mock.calls[0] as [unknown, Record<string, unknown>];
    expect(payload).toEqual({ tags: mockTags });
  });

  it('targets the correct document path', async () => {
    await updateAnalysisTags('analysis-id-1', mockTags);
    expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'analyses', 'analysis-id-1');
  });
});
