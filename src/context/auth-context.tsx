'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { addUserOnLogin, updateUserProfile } from '@/services/user-service';
import { useRouter } from 'next/navigation';

const auth = getAuth(app);

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  updateUserDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        const plainUser = {
            uid: authUser.uid,
            displayName: authUser.displayName,
            email: authUser.email,
            photoURL: authUser.photoURL
        };
        await addUserOnLogin(plainUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const signInWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  const signOutUser = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/');
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
     if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        // The onAuthStateChanged listener will handle adding the user to the db and setting state
        setUser({...userCredential.user, displayName: name});
     }
  }
  
  const updateUserDisplayName = async (name: string) => {
    if (!auth.currentUser) {
        throw new Error("You must be logged in to update your profile.");
    }
    await updateProfile(auth.currentUser, { displayName: name });
    await updateUserProfile(auth.currentUser.uid, name);

    // To update the user object in the context, create a new object
    const updatedUser = Object.assign(Object.create(Object.getPrototypeOf(auth.currentUser)), auth.currentUser, { displayName: name });
    setUser(updatedUser);
  }


  const value = {
    user,
    loading,
    signInWithGoogle,
    signOutUser,
    signInWithEmail,
    signUpWithEmail,
    updateUserDisplayName,
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
