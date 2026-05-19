import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../../contexts/AuthContext';
import { SignOutButton } from './SignOutButton';

// Mock Firebase modules
vi.mock('../../shared/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null); // No user initially
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

// Top-level mock — must be hoisted by Vitest before any test runs.
// useAuth is mocked here so individual tests can override the return value
// via mockReturnValueOnce without triggering the "not at top level" warning.
const mockSignOut = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    signOut: mockSignOut,
    loading: false,
  })),
}));

/**
 * Test SignOutButton component.
 * AC-1: Given a user is on the app, When they click "Sign out", Then button is clickable and triggers sign-out.
 */
describe('SignOutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sign-out button with correct text', () => {
    render(
      <AuthProvider>
        <SignOutButton />
      </AuthProvider>,
    );

    const button = screen.getByRole('button', { name: /sign out/i });
    expect(button).toBeInTheDocument();
  });

  it('should call signOut when clicked', async () => {
    mockSignOut.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <SignOutButton />
      </AuthProvider>,
    );

    const button = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  it('should be disabled when loading', async () => {
    const { useAuth } = await import('../../hooks/useAuth');
    vi.mocked(useAuth).mockReturnValueOnce({
      signOut: mockSignOut,
      loading: true,
      user: null,
      error: null,
      signUpWithGoogle: vi.fn(),
    });

    render(
      <AuthProvider>
        <SignOutButton />
      </AuthProvider>,
    );

    const button = screen.getByRole('button', { name: /sign out/i });
    expect(button).toBeDisabled();
  });
});
