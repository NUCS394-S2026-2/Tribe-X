import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../../contexts/AuthContext';
import { SignUpButton } from './SignUpButton';

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

/**
 * Test SignUpButton component.
 * AC-1: Given a user is on the app unauthenticated, When they click "Sign up with Google", Then button is clickable.
 */
describe('SignUpButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sign-up button with correct text', () => {
    render(
      <AuthProvider>
        <SignUpButton />
      </AuthProvider>,
    );

    const button = screen.getByRole('button', { name: /sign up with google/i });
    expect(button).toBeInTheDocument();
  });

  it('should display loading state when clicked', async () => {
    const { signInWithPopup } = await import('firebase/auth');
    vi.mocked(signInWithPopup).mockImplementation(() => new Promise(() => {})); // Pending

    render(
      <AuthProvider>
        <SignUpButton />
      </AuthProvider>,
    );

    const button = screen.getByRole('button', { name: /sign up with google/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Signing up...')).toBeInTheDocument();
    });
  });

  it('should accept custom className prop', () => {
    render(
      <AuthProvider>
        <SignUpButton className="custom-class" />
      </AuthProvider>,
    );

    const button = screen.getByRole('button', { name: /sign up with google/i });
    expect(button).toHaveClass('custom-class');
  });
});
