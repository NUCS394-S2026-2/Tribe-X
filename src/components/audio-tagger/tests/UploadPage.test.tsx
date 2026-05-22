import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FileValidationError } from '../AudioTagger';
import { UploadPage } from '../UploadPage';

const makeInputRef = () => createRef<HTMLInputElement | null>();

const baseProps = {
  file: null,
  audioPreviewUrl: null,
  inputRef: makeInputRef(),
  loading: false,
  error: null,
  validationError: null,
  onAnalyze: vi.fn(),
  onFileChange: vi.fn(),
  onReset: vi.fn(),
};

const mp3 = () => new File(['audio'], 'track.mp3', { type: 'audio/mpeg' });

describe('UploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders the hidden file input', () => {
    render(<UploadPage {...baseProps} />);
    expect(screen.getByLabelText(/select audio file/i)).toBeInTheDocument();
  });

  it('renders the Analyze Track button', () => {
    render(<UploadPage {...baseProps} />);
    expect(screen.getByRole('button', { name: /analyze track/i })).toBeInTheDocument();
  });

  it('renders the drag-and-drop upload label', () => {
    render(<UploadPage {...baseProps} />);
    expect(screen.getByText(/drag & drop an audio file/i)).toBeInTheDocument();
  });

  // ── Analyze button disabled states ────────────────────────────────────────

  it('disables the analyze button when no file is selected', () => {
    render(<UploadPage {...baseProps} />);
    expect(screen.getByRole('button', { name: /analyze track/i })).toBeDisabled();
  });

  it('disables the analyze button when a validationError is present', () => {
    const validationError: FileValidationError = {
      type: 'invalid-type',
      message: 'Unsupported file type.',
    };
    render(<UploadPage {...baseProps} file={mp3()} validationError={validationError} />);
    expect(screen.getByRole('button', { name: /analyze track/i })).toBeDisabled();
  });

  it('disables the analyze button and shows "Analyzing…" while loading', () => {
    render(<UploadPage {...baseProps} file={mp3()} loading={true} />);
    const btn = screen.getByRole('button', { name: /analyzing/i });
    expect(btn).toBeDisabled();
  });

  // ── Analyze button enabled ────────────────────────────────────────────────

  it('enables the analyze button when a valid file is provided', () => {
    render(<UploadPage {...baseProps} file={mp3()} />);
    expect(screen.getByRole('button', { name: /analyze track/i })).toBeEnabled();
  });

  // ── Callbacks ─────────────────────────────────────────────────────────────

  it('calls onAnalyze when the analyze button is clicked', async () => {
    render(<UploadPage {...baseProps} file={mp3()} />);
    await userEvent.click(screen.getByRole('button', { name: /analyze track/i }));
    expect(baseProps.onAnalyze).toHaveBeenCalledTimes(1);
  });

  it('calls onFileChange when a file is selected via the input', async () => {
    render(<UploadPage {...baseProps} />);
    await userEvent.upload(screen.getByLabelText(/select audio file/i), mp3());
    expect(baseProps.onFileChange).toHaveBeenCalled();
  });

  it('calls onReset when the Remove button is clicked', async () => {
    render(<UploadPage {...baseProps} file={mp3()} />);
    await userEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(baseProps.onReset).toHaveBeenCalledTimes(1);
  });

  // ── Error messages ────────────────────────────────────────────────────────

  it('shows the validation error message', () => {
    const validationError: FileValidationError = {
      type: 'too-large',
      message: 'File too large. Please upload files under 50MB.',
    };
    render(<UploadPage {...baseProps} validationError={validationError} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/file too large/i);
  });

  it('shows the general error message', () => {
    render(<UploadPage {...baseProps} error="Analysis failed. Please try again." />);
    expect(screen.getByRole('alert')).toHaveTextContent(/analysis failed/i);
  });

  // ── File card ─────────────────────────────────────────────────────────────

  it('shows file name when a valid file is selected', () => {
    render(<UploadPage {...baseProps} file={mp3()} />);
    expect(screen.getByText('track.mp3')).toBeInTheDocument();
  });

  it('shows the file extension in uppercase in the file card', () => {
    render(<UploadPage {...baseProps} file={mp3()} />);
    // Extension is a text node inside a <p> alongside MIME type and file size.
    // Check that it appears somewhere in the file card rather than exact element match.
    const filename = screen.getByText('track.mp3');
    expect(filename.closest('div')).toHaveTextContent('MP3');
  });

  it('does not show the file card when no file is selected', () => {
    render(<UploadPage {...baseProps} />);
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });

  // ── Audio preview ─────────────────────────────────────────────────────────

  it('renders an audio player when audioPreviewUrl is provided', () => {
    render(<UploadPage {...baseProps} file={mp3()} audioPreviewUrl="blob:preview" />);
    expect(screen.getByLabelText(/preview track\.mp3/i)).toBeInTheDocument();
  });

  it('does not render an audio player when audioPreviewUrl is null', () => {
    render(<UploadPage {...baseProps} file={mp3()} audioPreviewUrl={null} />);
    expect(screen.queryByLabelText(/preview/i)).not.toBeInTheDocument();
  });

  // ── Status text ───────────────────────────────────────────────────────────

  it('shows "Ready to analyze" when a valid file is selected', () => {
    render(<UploadPage {...baseProps} file={mp3()} />);
    expect(screen.getByText(/ready to analyze/i)).toBeInTheDocument();
  });

  it('shows "Upload a file to enable analysis" when no file is selected', () => {
    render(<UploadPage {...baseProps} />);
    expect(screen.getByText(/upload a file to enable analysis/i)).toBeInTheDocument();
  });
});
