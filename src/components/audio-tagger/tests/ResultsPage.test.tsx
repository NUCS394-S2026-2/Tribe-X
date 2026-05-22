import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AudioContext, DiscoTags } from '../../../shared/types/MusicTags';
import type { ChatMessage } from '../ResultsPage';
import { ResultsPage } from '../ResultsPage';

// jsdom does not implement URL.createObjectURL or HTMLAnchorElement.click.
vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

const mockTags: DiscoTags = {
  genre: ['Electronic', 'Ambient'],
  instruments: ['Synth', 'Piano'],
  lyricThemes: [],
  mood: ['Dreamy', 'Atmospheric'],
  tempo: 'Midtempo',
  type: [],
  vocals: ['Instrumental'],
  soundsLike: ['Brian Eno'],
};

const mockAudioContext: AudioContext = {
  bpm: 95,
  key: 'A minor',
  key_strength: 0.8,
  energy_level: 'Medium',
  tempo_feel: 'Medium',
  danceability_score: 1.2,
  harmonic_to_percussive_ratio: 0.68,
  onset_density_per_second: 2.1,
  instrument_hints: ['synth pad', 'piano'],
  vocal_presence: false,
  lyrics: null,
};

const initialModelMessage: ChatMessage = {
  role: 'model',
  text: 'The high harmonic ratio and low onset density suggest an ambient, melodic track.',
};

const baseProps = {
  audioContext: mockAudioContext,
  audioPreviewUrl: null,
  chatLoading: false,
  chatMessages: [initialModelMessage],
  error: null,
  file: new File(['audio'], 'session.wav', { type: 'audio/wav' }),
  tags: mockTags,
  onChat: vi.fn(),
  onNewTrack: vi.fn(),
};

describe('ResultsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Navigation
  it('renders the "Back to upload" button', () => {
    render(<ResultsPage {...baseProps} />);
    expect(screen.getByRole('button', { name: /back to upload/i })).toBeInTheDocument();
  });

  it('calls onNewTrack when "Back to upload" is clicked', async () => {
    render(<ResultsPage {...baseProps} />);
    await userEvent.click(screen.getByRole('button', { name: /back to upload/i }));
    expect(baseProps.onNewTrack).toHaveBeenCalledTimes(1);
  });

  // Tag sections
  it('renders all tag section headings', () => {
    render(<ResultsPage {...baseProps} />);
    expect(screen.getByText('Genre')).toBeInTheDocument();
    expect(screen.getByText('Instruments')).toBeInTheDocument();
    expect(screen.getByText('Mood / Feel')).toBeInTheDocument();
    expect(screen.getByText('Vocals')).toBeInTheDocument();
    expect(screen.getByText('Lyric Themes')).toBeInTheDocument();
    expect(screen.getByText('Tempo')).toBeInTheDocument();
    expect(screen.getByText('Sounds Like')).toBeInTheDocument();
  });

  it('renders tag pills for populated arrays', () => {
    render(<ResultsPage {...baseProps} />);
    expect(screen.getByText('Electronic')).toBeInTheDocument();
    expect(screen.getByText('Ambient')).toBeInTheDocument();
    expect(screen.getByText('Brian Eno')).toBeInTheDocument();
    expect(screen.getByText('Dreamy')).toBeInTheDocument();
  });

  it('shows "(none)" for empty tag arrays', () => {
    render(<ResultsPage {...baseProps} />);
    // lyricThemes is [] so its section should display (none)
    expect(screen.getByText('(none)')).toBeInTheDocument();
  });

  it('renders the tempo value as a tag pill', () => {
    render(<ResultsPage {...baseProps} />);
    expect(screen.getByText('Midtempo')).toBeInTheDocument();
  });

  it('renders "(none)" for tempo when tags.tempo is empty', () => {
    render(<ResultsPage {...baseProps} tags={{ ...mockTags, tempo: '' }} />);
    // There will be multiple (none) entries — just check at least one exists
    expect(screen.getAllByText('(none)').length).toBeGreaterThan(0);
  });

  // Tabs

  it('renders all four tabs', () => {
    render(<ResultsPage {...baseProps} />);
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
    expect(screen.getByText('Similar Tracks')).toBeInTheDocument();
  });

  it('marks the Tags tab as active with a bottom border class', () => {
    render(<ResultsPage {...baseProps} />);
    const tagsTab = screen.getByText('Tags');
    expect(tagsTab).toHaveClass('border-b-4');
  });

  // Reasoning card

  it('shows the first model message as the reasoning text', () => {
    render(<ResultsPage {...baseProps} />);
    expect(
      screen.getByText(/high harmonic ratio and low onset density/i),
    ).toBeInTheDocument();
  });

  it('shows fallback reasoning text when chatMessages is empty', () => {
    render(<ResultsPage {...baseProps} chatMessages={[]} />);
    expect(screen.getByText(/tags reflect the measured tempo/i)).toBeInTheDocument();
  });

  // Confidence
  it('shows key_strength as a percentage confidence', () => {
    render(<ResultsPage {...baseProps} />);
    // key_strength 0.8 → "80%"
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('shows "-" for confidence when audioContext is null', () => {
    render(<ResultsPage {...baseProps} audioContext={null} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  // Track card

  it('shows the file name in the track card', () => {
    render(<ResultsPage {...baseProps} />);
    expect(screen.getByText('session.wav')).toBeInTheDocument();
  });

  it('shows the file extension in uppercase', () => {
    render(<ResultsPage {...baseProps} />);
    expect(screen.getByText('WAV')).toBeInTheDocument();
  });

  it('renders an audio player when audioPreviewUrl is provided', () => {
    render(<ResultsPage {...baseProps} audioPreviewUrl="blob:preview" />);
    expect(screen.getByLabelText(/preview session\.wav/i)).toBeInTheDocument();
  });

  it('does not render an audio player when audioPreviewUrl is null', () => {
    render(<ResultsPage {...baseProps} audioPreviewUrl={null} />);
    expect(screen.queryByLabelText(/preview session\.wav/i)).not.toBeInTheDocument();
  });

  // Copy button

  it('calls clipboard.writeText when the copy button is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ResultsPage {...baseProps} />);
    await userEvent.click(screen.getByRole('button', { name: /copy all tags/i }));

    expect(writeText).toHaveBeenCalledOnce();
    const written = writeText.mock.calls[0][0] as string;
    expect(written).toContain('Electronic');
    expect(written).toContain('Brian Eno');
  });

  it('shows "Copied!" briefly after the copy button is clicked', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(<ResultsPage {...baseProps} />);
    await userEvent.click(screen.getByRole('button', { name: /copy all tags/i }));

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  // CSV download

  it('triggers a CSV download when the CSV button is clicked', async () => {
    render(<ResultsPage {...baseProps} />);
    await userEvent.click(screen.getByRole('button', { name: /csv/i }));
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  // Chat input
  it('the Send button is disabled when the input is empty', () => {
    render(<ResultsPage {...baseProps} />);
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  it('the Send button is disabled while chatLoading is true', () => {
    render(<ResultsPage {...baseProps} chatLoading={true} />);
    // Type something to verify it is still disabled due to loading
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  it('enables the Send button when there is input text', async () => {
    render(<ResultsPage {...baseProps} />);
    await userEvent.type(
      screen.getByLabelText(/give feedback on the analysis/i),
      'make it darker',
    );
    expect(screen.getByRole('button', { name: /send/i })).toBeEnabled();
  });

  it('calls onChat with the message when Send is clicked', async () => {
    render(<ResultsPage {...baseProps} />);
    await userEvent.type(
      screen.getByLabelText(/give feedback on the analysis/i),
      'make it darker',
    );
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(baseProps.onChat).toHaveBeenCalledWith('make it darker');
  });

  it('clears the chat input after sending', async () => {
    render(<ResultsPage {...baseProps} />);
    const input = screen.getByLabelText(/give feedback on the analysis/i);
    await userEvent.type(input, 'make it darker');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(input).toHaveValue('');
  });

  // Chat message display

  it('does not render the initial model reasoning message in the chat thread', () => {
    // The first model message is shown in ReasoningCard, not in the chat thread.
    render(<ResultsPage {...baseProps} />);
    const bubbles = document.querySelectorAll('[class*="rounded-xl px-5 py-3"]');
    expect(bubbles.length).toBe(0);
  });

  it('renders subsequent chat messages in the thread', () => {
    const messages: ChatMessage[] = [
      initialModelMessage,
      { role: 'user', text: 'make it darker' },
      { role: 'model', text: 'Updated mood to Dark and Tense.' },
    ];
    render(<ResultsPage {...baseProps} chatMessages={messages} />);
    expect(screen.getByText('make it darker')).toBeInTheDocument();
    expect(screen.getByText('Updated mood to Dark and Tense.')).toBeInTheDocument();
  });

  it('shows "Thinking..." while chatLoading is true', () => {
    const messages: ChatMessage[] = [
      initialModelMessage,
      { role: 'user', text: 'make it darker' },
    ];
    render(<ResultsPage {...baseProps} chatMessages={messages} chatLoading={true} />);
    expect(screen.getByText(/thinking\.\.\./i)).toBeInTheDocument();
  });

  // Error state
  it('displays the error message when the error prop is set', () => {
    render(<ResultsPage {...baseProps} error="Chat failed. Please try again." />);
    expect(screen.getByRole('alert')).toHaveTextContent(/chat failed/i);
  });

  //AI disclaimer

  it('renders the AI-generated disclaimer', () => {
    render(<ResultsPage {...baseProps} />);
    expect(screen.getByText(/ai generated/i)).toBeInTheDocument();
  });
});
