import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext, AuthProvider } from '../contexts/AuthContext';
import { useAuth } from '../hooks/useAuth';

// Mock Firebase modules
vi.mock('../shared/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    // Simulate auth state change
    callback(null);
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
 * Test AuthContext provider initialization and state management.
 */
describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide initial loading state', async () => {
    const TestComponent = (): React.ReactElement => {
      const authContext = React.useContext(AuthContext);
      return (
        <div>
          <p>{authContext?.loading ? 'loading' : 'loaded'}</p>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('loaded')).toBeInTheDocument();
    });
  });

  it('should initialize with null user when not authenticated', async () => {
    const TestComponent = (): React.ReactElement => {
      const authContext = React.useContext(AuthContext);
      return <div>{authContext?.user ? 'authenticated' : 'not-authenticated'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('not-authenticated')).toBeInTheDocument();
    });
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Mock console.error to avoid test output pollution
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const InvalidComponent = (): React.ReactElement => {
      useAuth();
      return <div>This should not render</div>;
    };

    expect(() => {
      render(<InvalidComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});
