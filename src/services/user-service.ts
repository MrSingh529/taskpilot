
'use server';

import type { User } from '@/types';
import { revalidatePath } from 'next/cache';
import { getFirestore, collection, getDocs, addDoc, setDoc, doc, query, where, getDoc, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);
const usersCollection = collection(db, 'users');

// Recursively converts Firestore Timestamps to ISO strings and handles nested objects/arrays
function toPlainObject(obj: any): any {
    if (obj instanceof Timestamp) {
        return obj.toDate().toISOString();
    }
    if (Array.isArray(obj)) {
        return obj.map(toPlainObject);
    }
    if (obj && typeof obj === 'object') {
        const res: { [key: string]: any } = {};
        for (const key in obj) {
            res[key] = toPlainObject(obj[key]);
        }
        return res;
    }
    return obj;
}


/**
 * Adds a new user to the `users` collection in Firestore.
 * Before adding, it checks if a user with the same email already exists.
 */
export async function addUser(userData: { name: string; email: string }): Promise<User> {
    const userQuery = query(usersCollection, where("email", "==", userData.email));
    const querySnapshot = await getDocs(userQuery);
    if (!querySnapshot.empty) {
        throw new Error('A user with this email already exists.');
    }

    const docRef = doc(usersCollection);
    const name = userData.name || userData.email.split('@')[0];
    const newUser: User = {
        id: docRef.id,
        name: name,
        email: userData.email,
        avatarUrl: `https://picsum.photos/seed/${name}/200`,
        initials: (name.split(' ')[0][0] || '') + (name.split(' ')[1]?.[0] || ''),
    }
    
    await setDoc(docRef, toPlainObject(newUser));
    revalidatePath('/team');
    return newUser;
}


/**
 * Fetches all users from the `users` collection in Firestore.
 */
export async function getUsers(): Promise<User[]> {
    try {
        const snapshot = await getDocs(usersCollection);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => toPlainObject(doc.data()) as User);
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

/**
 * Adds the currently authenticated user to the `users` collection if they don't already exist.
 * This is useful for ensuring every logged-in user is in our users table.
 */
export async function addUserOnLogin(user: { uid: string, displayName?: string | null, email?: string | null, photoURL?: string | null }): Promise<void> {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists() && user.email) {
        const name = user.displayName || user.email.split('@')[0];
        const newUser: User = {
            id: user.uid,
            name: name,
            email: user.email,
            avatarUrl: user.photoURL || `https://picsum.photos/seed/${name}/200`,
            initials: (name.split(' ')[0][0] || '') + (name.split(' ')[1]?.[0] || ''),
        };
        await setDoc(userRef, toPlainObject(newUser));
    }
}
