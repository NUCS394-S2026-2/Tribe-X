import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as analyzeModule from '../../shared/api/analyzeMusicFile';
import { MusicTags } from '../../shared/types/MusicTags';
import { AudioTagger } from './AudioTagger';

const mockTags: MusicTags = {
  trackId: 'test-track',
  genres: ['Cinematic', 'Electronic'],
  instruments: ['Synthesizer', 'Drums'],
  vocalTraits: [],
  soundsLike: ['Hans Zimmer'],
  confidenceScore: 0.87,
  lastUpdated: new Date('2026-01-01'),
};

describe('AudioTagger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the file input and analyze button', () => {
    render(<AudioTagger />);
    expect(screen.getByLabelText(/select audio file/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
    expect(screen.getByText(/music tags/i)).toBeInTheDocument();
  });

  it('disables the analyze button when no file is selected', () => {
    render(<AudioTagger />);
    expect(screen.getByRole('button', { name: /analyze/i })).toBeDisabled();
  });

  it('enables the analyze button after a file is selected', async () => {
    render(<AudioTagger />);
    const input = screen.getByLabelText(/select audio file/i);
    const file = new File(['audio'], 'track.mp3', { type: 'audio/mpeg' });
    await userEvent.upload(input, file);
    expect(screen.getByRole('button', { name: /analyze/i })).toBeEnabled();
  });

  it('shows "Analyzing…" while loading and then populates the music tags display', async () => {
    let resolveAnalyze!: (tags: MusicTags) => void;
    const deferred = new Promise<MusicTags>((resolve) => {
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

    // While the promise is pending the button should show "Analyzing…" and be disabled
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled();

    resolveAnalyze(mockTags);

    await waitFor(() => {
      expect(screen.getByText('Cinematic')).toBeInTheDocument();
    });
    expect(screen.getByText('Synthesizer')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '87');
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
      expect(screen.getByRole('alert')).toHaveTextContent(/analysis failed/i);
    });
  });

  it('accepts valid audio files and enables analyze button', async () => {
    render(<AudioTagger />);
    const input = screen.getByLabelText(/select audio file/i);

    // Test MP3
    const mp3File = new File(['audio'], 'track.mp3', { type: 'audio/mpeg' });
    await userEvent.upload(input, mp3File);
    expect(screen.getByRole('button', { name: /analyze/i })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Test WAV
    const wavFile = new File(['audio'], 'track.wav', { type: 'audio/wav' });
    await userEvent.upload(input, wavFile);
    expect(screen.getByRole('button', { name: /analyze/i })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('rejects invalid file types and shows error message', async () => {
    render(<AudioTagger />);
    const input = screen.getByLabelText(/select audio file/i);

    const invalidFile = new File(['text'], 'document.exe', { type: 'text/plain' });
    await userEvent.upload(input, invalidFile);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/unsupported file type/i);
    });
    expect(screen.getByRole('button', { name: /analyze/i })).toBeDisabled();
  });

  it('rejects files that are too large and shows error message', async () => {
    render(<AudioTagger />);
    const input = screen.getByLabelText(/select audio file/i);

    // Create a file larger than 50MB
    const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.mp3', {
      type: 'audio/mpeg',
    });
    await userEvent.upload(input, largeFile);

    expect(screen.getByRole('alert')).toHaveTextContent(/file too large/i);
    expect(screen.getByRole('button', { name: /analyze/i })).toBeDisabled();
  });

  it('clears validation errors when a valid file is selected after an invalid one', async () => {
    render(<AudioTagger />);
    const input = screen.getByLabelText(/select audio file/i);

    // First upload invalid file
    const invalidFile = new File(['text'], 'document.exe', { type: 'text/plain' });
    await userEvent.upload(input, invalidFile);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/unsupported file type/i);
    });

    // Then upload valid file
    const validFile = new File(['audio'], 'track.mp3', { type: 'audio/mpeg' });
    await userEvent.upload(input, validFile);
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /analyze/i })).toBeEnabled();
  });
});
