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
    expect(screen.getByLabelText(/music tags/i)).toBeInTheDocument();
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

  it('shows "Analyzing…" while loading and then populates the music tags textarea', async () => {
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
      const textarea = screen.getByLabelText(/music tags/i) as HTMLTextAreaElement;
      expect(textarea.value).toContain('Cinematic');
    });
    const textarea = screen.getByLabelText(/music tags/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Synthesizer');
    expect(textarea.value).toContain('87%');
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
});
