import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, ReactNode, useEffect, useState } from 'react';

import { auth, db } from '../shared/firebase';
import { User } from '../shared/types/User';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signUpWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Converts Firebase User to Firestore User type.
 * Assigns 'blue' team by default (future: admin assignment).
 */
const mapFirebaseUserToUser = (firebaseUser: FirebaseUser): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || '',
  };
};

/**
 * Fetches or creates a Firestore User document.
 * If user doesn't exist in Firestore, creates one with profile data from Firebase Auth.
 */
const ensureUserDocument = async (firebaseUser: FirebaseUser): Promise<User> => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as User;
  }

  // Create new user document
  const newUser = mapFirebaseUserToUser(firebaseUser);
  await setDoc(userRef, newUser);
  return newUser;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Unblock the UI immediately using data already in Firebase Auth.
        setUser(mapFirebaseUserToUser(firebaseUser));
        setError(null);
        setLoading(false);
        // Ensure the Firestore document exists in the background.
        ensureUserDocument(firebaseUser).catch((err) => {
          setError(err instanceof Error ? err : new Error('Auth initialization failed'));
        });
      } else {
        setUser(null);
        setError(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  /**
   * Sign up with Google OAuth.
   * Triggers Google popup, creates Firebase User, ensures Firestore User document.
   */
  const signUpWithGoogle = async (): Promise<void> => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle creating the user document
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Google sign-up failed');
      setError(error);
      throw error;
    }
  };

  /**
   * Sign out and clear user state.
   */
  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign out failed');
      setError(error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signUpWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
