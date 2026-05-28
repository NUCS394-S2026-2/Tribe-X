import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AccountMenu } from '../AccountMenu';

// AccountMenu renders SignOutButton, which calls useAuth and needs Firebase.
vi.mock('../../../shared/firebase', () => ({ auth: {}, db: {} }));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, cb) => {
    cb(null);
    return vi.fn();
  }),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ signOut: vi.fn(), loading: false })),
}));

describe('AccountMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Account identity

  it('renders initials from the displayName prop', () => {
    render(<AccountMenu displayName="Alice Smith" />);
    expect(screen.getByText('AS')).toBeInTheDocument();
  });

  it('shows the displayName in the open menu', async () => {
    render(<AccountMenu displayName="Alice Smith" />);
    await userEvent.click(screen.getByRole('button', { name: /open account menu/i }));
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  // Dropdown closed by default

  it('does not show the sign-out option by default', () => {
    render(<AccountMenu displayName="Alice Smith" />);
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
  });

  it('chevron button has aria-expanded="false" by default', () => {
    render(<AccountMenu displayName="Alice Smith" />);
    expect(screen.getByRole('button', { name: /open account menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  // Dropdown opens
  it('shows the sign-out button after clicking the chevron', async () => {
    render(<AccountMenu displayName="Alice Smith" />);
    await userEvent.click(screen.getByRole('button', { name: /open account menu/i }));
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('sets aria-expanded="true" when the dropdown is open', async () => {
    render(<AccountMenu displayName="Alice Smith" />);
    await userEvent.click(screen.getByRole('button', { name: /open account menu/i }));
    expect(screen.getByRole('button', { name: /open account menu/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('applies the rotate-180 class to the chevron icon when open', async () => {
    render(<AccountMenu displayName="Alice Smith" />);
    const chevron = screen.getByRole('button', { name: /open account menu/i });
    await userEvent.click(chevron);
    expect(chevron.querySelector('svg')).toHaveClass('rotate-180');
  });

  // Dropdown closes

  it('hides the sign-out button after a second chevron click', async () => {
    render(<AccountMenu displayName="Alice Smith" />);
    const chevron = screen.getByRole('button', { name: /open account menu/i });
    await userEvent.click(chevron);
    await userEvent.click(chevron);
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
  });

  it('resets aria-expanded to "false" after closing the dropdown', async () => {
    render(<AccountMenu displayName="Alice Smith" />);
    const chevron = screen.getByRole('button', { name: /open account menu/i });
    await userEvent.click(chevron);
    await userEvent.click(chevron);
    expect(chevron).toHaveAttribute('aria-expanded', 'false');
  });
});
