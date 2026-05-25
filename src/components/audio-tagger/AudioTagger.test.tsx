import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as analyzeModule from '../../shared/api/analyzeMusicFile';
import * as chatModule from '../../shared/api/chatWithGemini';
import type { AnalyzeResult, ChatResult } from '../../shared/types/MusicTags';
import { AudioTagger } from './AudioTagger';

const mockResult: AnalyzeResult = {
  audioContext: {
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
  },
  tags: {
    genre: ['Electronic'],
    instruments: ['Synth', 'Drums'],
    lyricThemes: [],
    mood: ['Cinematic', 'Atmospheric'],
    tempo: 'Up-tempo',
    type: [],
    vocals: ['Instrumental'],
    soundsLike: ['Hans Zimmer'],
  },
  conversationHistory: [
    { role: 'model', parts: [{ text: 'This track has a high harmonic ratio.' }] },
  ],
};

const mockChatResult: ChatResult = {
  message: 'Updated the mood based on your feedback.',
  updatedTags: {
    ...mockResult.tags,
    mood: ['Dark', 'Mysterious'],
  },
  conversationHistory: [
    ...mockResult.conversationHistory,
    { role: 'user', parts: [{ text: 'make it darker' }] },
    { role: 'model', parts: [{ text: 'Updated the mood based on your feedback.' }] },
  ],
};

describe('AudioTagger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the file input and analyze button', () => {
    render(<AudioTagger />);
    expect(screen.getByLabelText(/select audio file/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
  });

  it('disables the analyze button when no file is selected', () => {
    render(<AudioTagger />);
    expect(screen.getByRole('button', { name: /analyze/i })).toBeDisabled();
  });

  it('enables the analyze button after a valid file is selected', async () => {
    render(<AudioTagger />);
    const input = screen.getByLabelText(/select audio file/i);
    const file = new File(['audio'], 'track.mp3', { type: 'audio/mpeg' });
    await userEvent.upload(input, file);
    expect(screen.getByRole('button', { name: /analyze/i })).toBeEnabled();
  });

  it('shows "Analyzing…" while loading then displays tags', async () => {
    let resolveAnalyze!: (result: AnalyzeResult) => void;
    const deferred = new Promise<AnalyzeResult>((resolve) => {
      resolveAnalyze = resolve;
    });
    vi.spyOn(analyzeModule, 'analyzeMusicFile').mockReturnValue(deferred);
    render(<AudioTagger />);

    const input = screen.getByLabelText(/select audio file/i);
    await userEvent.upload(
      input,
      new File(['audio'], 'track.mp3', { type: 'audio/mpeg' }),
    );
    await userEvent.click(screen.getByRole('button', { name: /analyze/i }));

    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled();

    resolveAnalyze(mockResult);

    await waitFor(() => {
      expect(screen.getByText('Electronic')).toBeInTheDocument();
    });
    expect(screen.getByText('Cinematic')).toBeInTheDocument();
    expect(screen.getByText('Hans Zimmer')).toBeInTheDocument();
  });

  it('shows an error message when analysis fails', async () => {
    vi.spyOn(analyzeModule, 'analyzeMusicFile').mockRejectedValue(
      new Error('network error'),
    );
    render(<AudioTagger />);

    const input = screen.getByLabelText(/select audio file/i);
    await userEvent.upload(
      input,
      new File(['audio'], 'track.mp3', { type: 'audio/mpeg' }),
    );
    await userEvent.click(screen.getByRole('button', { name: /analyze/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/network error/i);
    });
  });

  it('shows the chat input after analysis completes', async () => {
    vi.spyOn(analyzeModule, 'analyzeMusicFile').mockResolvedValue(mockResult);
    render(<AudioTagger />);

    const input = screen.getByLabelText(/select audio file/i);
    await userEvent.upload(
      input,
      new File(['audio'], 'track.mp3', { type: 'audio/mpeg' }),
    );
    await userEvent.click(screen.getByRole('button', { name: /analyze/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/make the mood darker/i)).toBeInTheDocument();
    });
  });

  it('sends a chat message and updates tags', async () => {
    vi.spyOn(analyzeModule, 'analyzeMusicFile').mockResolvedValue(mockResult);
    vi.spyOn(chatModule, 'chatWithGemini').mockResolvedValue(mockChatResult);
    render(<AudioTagger />);

    const input = screen.getByLabelText(/select audio file/i);
    await userEvent.upload(
      input,
      new File(['audio'], 'track.mp3', { type: 'audio/mpeg' }),
    );
    await userEvent.click(screen.getByRole('button', { name: /analyze/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/make the mood darker/i)).toBeInTheDocument();
    });

    const chatInput = screen.getByPlaceholderText(/make the mood darker/i);
    await userEvent.type(chatInput, 'make it darker');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });
  });

  it('rejects invalid file types and shows error', async () => {
    render(<AudioTagger />);
    const input = screen.getByLabelText(/select audio file/i);
    const invalidFile = new File(['text'], 'document.exe', { type: 'text/plain' });
    await userEvent.upload(input, invalidFile);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/unsupported file type/i);
    });
    expect(screen.getByRole('button', { name: /analyze/i })).toBeDisabled();
  });

  it('rejects files that are too large', async () => {
    render(<AudioTagger />);
    const input = screen.getByLabelText(/select audio file/i);
    const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.mp3', {
      type: 'audio/mpeg',
    });
    await userEvent.upload(input, largeFile);
    expect(screen.getByRole('alert')).toHaveTextContent(/file too large/i);
    expect(screen.getByRole('button', { name: /analyze/i })).toBeDisabled();
  });

  it('clears validation errors when a valid file replaces an invalid one', async () => {
    render(<AudioTagger />);
    const input = screen.getByLabelText(/select audio file/i);

    await userEvent.upload(
      input,
      new File(['text'], 'document.exe', { type: 'text/plain' }),
    );
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/unsupported file type/i);
    });

    await userEvent.upload(
      input,
      new File(['audio'], 'track.mp3', { type: 'audio/mpeg' }),
    );
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /analyze/i })).toBeEnabled();
  });
});
