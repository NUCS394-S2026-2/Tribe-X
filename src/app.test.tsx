import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import App from './App';

// Mock Firebase and Auth
vi.mock('./shared/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (auth, callback: any) => {
      // Simulate authenticated user
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
      };
      if (typeof callback === 'function') {
        Promise.resolve().then(() => callback(mockUser));
      }
      return vi.fn();
    },
  ),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoUrl: 'https://example.com/photo.jpg',
        team: 'blue',
      }),
    }),
  ),
}));

describe('App component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the AudioTagger when user is authenticated', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText(/select audio file/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
      expect(screen.getByText(/music tags/i)).toBeInTheDocument();
    });
  });

  test('renders sign-up button when user is not authenticated', async () => {
    // Override the mock to return no user
    const { onAuthStateChanged } = await import('firebase/auth');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback: any) => {
      if (typeof callback === 'function') {
        Promise.resolve().then(() => callback(null));
      }
      return vi.fn();
    });

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /sign up with google/i }),
      ).toBeInTheDocument();
    });
  });
});
