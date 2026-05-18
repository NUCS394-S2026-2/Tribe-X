import React, { useState } from 'react';

import { useAuth } from '../../hooks/useAuth';

interface SignUpButtonProps {
  className?: string;
}

/**
 * Google Sign-Up Button Component
 * Triggers OAuth flow on click. Displays error if sign-up fails.
 */
export const SignUpButton: React.FC<SignUpButtonProps> = ({ className = '' }) => {
  const { signUpWithGoogle, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signUpWithGoogle();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSignUp}
        disabled={isLoading}
        className={`rounded-lg bg-white px-6 py-3 font-semibold text-gray-800 shadow-md transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label="Sign up with Google"
      >
        {isLoading ? 'Signing up...' : 'Sign up with Google'}
      </button>
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
};
