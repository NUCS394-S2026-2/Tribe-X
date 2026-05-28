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
      className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
    >
      Sign out
    </button>
  );
};
