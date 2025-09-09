'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { signOutUser as signOut, signInWithEmail as signInWithEmailService, signUpWithEmail as signUpWithEmailService } from '@/services/auth-service';
import { app } from '@/lib/firebase'; // ensure firebase is initialized
import { addUserOnLogin } from '@/services/user-service';
import { useRouter } from 'next/navigation';

const auth = getAuth(app);

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        await addUserOnLogin({
            uid: authUser.uid,
            displayName: authUser.displayName,
            email: authUser.email,
            photoURL: authUser.photoURL
        });
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const signInWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error during Google sign-in:", error);
        throw error;
    }
  }

  const signOutUser = async () => {
    try {
        await signOut();
        // The onAuthStateChanged listener will handle setting user to null
        // and the AppLayout will handle the redirect.
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailService(email, password);
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    await signUpWithEmailService(email, password, name);
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOutUser,
    signInWithEmail,
    signUpWithEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
