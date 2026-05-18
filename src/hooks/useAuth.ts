import { useContext } from 'react';

import { AuthContext, AuthContextType } from '../contexts/AuthContext';

/**
 * Custom hook to access auth state and functions.
 * Must be used within an <AuthProvider>.
 *
 * @example
 * const { user, signUpWithGoogle, error } = useAuth();
 * if (user) return <Dashboard />;
 * return <SignUpButton onClick={() => signUpWithGoogle()} />;
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
