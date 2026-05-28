import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

  // History button

  it('renders the History button as enabled', () => {
    render(<AudioSidebar />);
    expect(screen.getByRole('button', { name: /history/i })).toBeEnabled();
  });

  it('calls onHistoryOpen when History button is clicked', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const onHistoryOpen = vi.fn();
    render(<AudioSidebar onHistoryOpen={onHistoryOpen} />);
    await userEvent.setup().click(screen.getByRole('button', { name: /history/i }));
    expect(onHistoryOpen).toHaveBeenCalledOnce();
  });

  // Help button

  it('renders the Help button as enabled', () => {
    render(<AudioSidebar />);
    expect(screen.getByRole('button', { name: /help/i })).toBeEnabled();
  });

  it('opens the help modal when Help button is clicked', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    render(<AudioSidebar />);
    await userEvent.setup().click(screen.getByRole('button', { name: /help/i }));
    expect(screen.getByRole('heading', { name: /help/i })).toBeInTheDocument();
  });

  // Disabled placeholder items

  it('renders the Settings button as disabled', () => {
    render(<AudioSidebar />);
    expect(screen.getByRole('button', { name: /settings/i })).toBeDisabled();
  });

  it('disabled buttons carry "coming soon" title attributes', () => {
    render(<AudioSidebar />);
    expect(screen.getByTitle(/settings \(coming soon\)/i)).toBeInTheDocument();
  });
});
