'use server';

import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';

const auth = getAuth(app);

export async function signOutUser() {
    return signOut(auth);
}
