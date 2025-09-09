'use server';

import { getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { addUserOnLogin } from './user-service';

const auth = getAuth(app);

export async function signOutUser() {
    return signOut(auth);
}

export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        // addUserOnLogin will be called by the onAuthStateChanged listener in the AuthProvider
    }
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
}
