import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AudioSidebar } from '../AudioSidebar';

describe('AudioSidebar', () => {
  // Rendering

  it('renders the sidebar element', () => {
    render(<AudioSidebar />);
    expect(document.querySelector('aside')).toBeInTheDocument();
  });

  // Active nav item

  it('renders Generate as an enabled button (active nav item)', () => {
    render(<AudioSidebar />);
    expect(screen.getByRole('button', { name: /generate/i })).toBeEnabled();
  });

  // Disabled placeholder items

  it('renders the History button as disabled', () => {
    render(<AudioSidebar />);
    expect(screen.getByRole('button', { name: /history/i })).toBeDisabled();
  });

  it('renders the Settings button as disabled', () => {
    render(<AudioSidebar />);
    expect(screen.getByRole('button', { name: /settings/i })).toBeDisabled();
  });

  it('renders the Help button as disabled', () => {
    render(<AudioSidebar />);
    expect(screen.getByRole('button', { name: /help/i })).toBeDisabled();
  });

  it('disabled buttons carry "coming soon" title attributes', () => {
    render(<AudioSidebar />);
    expect(screen.getByTitle(/history \(coming soon\)/i)).toBeInTheDocument();
    expect(screen.getByTitle(/settings \(coming soon\)/i)).toBeInTheDocument();
    expect(screen.getByTitle(/help \(coming soon\)/i)).toBeInTheDocument();
  });
});
