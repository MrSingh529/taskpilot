'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { signOutUser as signOutService } from '@/services/auth-service';
import { app } from '@/lib/firebase';
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
        // Create a plain object to avoid passing non-serializable data
        const plainUser = {
            uid: authUser.uid,
            displayName: authUser.displayName,
            email: authUser.email,
            photoURL: authUser.photoURL
        };
        await addUserOnLogin(plainUser);
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
        await signOutService();
        setUser(null); // Explicitly set user to null
        router.push('/'); // Redirect to login
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
     if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        // The onAuthStateChanged listener will handle adding the user to the db
     }
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
