import React from 'react';

import { useAuth } from '../../hooks/useAuth';

export const SignOutButton = (): React.ReactElement => {
  const { signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // error is already stored in AuthContext, handle display there if needed
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
    >
      Sign out
    </button>
  );
};
