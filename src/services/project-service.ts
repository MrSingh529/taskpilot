
'use server';

import type { Project, Task, User } from '@/types';
import { revalidatePath } from 'next/cache';
import { getFirestore, collection, getDocs, addDoc, query, where, getDoc, doc, updateDoc, arrayUnion, deleteDoc, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { auth } from 'firebase-admin';

const db = getFirestore(app);
const projectsCollection = collection(db, 'projects');

function calculateCompletionPercentage(tasks: Task[]): number {
    if (!tasks || tasks.length === 0) {
        return 0;
    }
    const doneTasks = tasks.filter(task => task.status === 'Done').length;
    return Math.round((doneTasks / tasks.length) * 100);
}

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


export async function getProjects(): Promise<Project[]> {
    try {
        const snapshot = await getDocs(projectsCollection);
        if (snapshot.empty) {
            return [];
        }
        const projects = snapshot.docs.map(doc => {
            const data = toPlainObject(doc.data());
            return { 
                id: doc.id, 
                ...data,
                completionPercentage: calculateCompletionPercentage(data.tasks || []),
            } as Project;
        });
        return projects;
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
}

export async function getProjectById(id: string): Promise<Project | null> {
    try {
        const projectDocRef = doc(db, 'projects', id);
        const projectDoc = await getDoc(projectDocRef);
        
        if (projectDoc.exists()) {
            const data = toPlainObject(projectDoc.data());
            return { 
                id: projectDoc.id, 
                ...data,
                completionPercentage: calculateCompletionPercentage(data.tasks || []),
            } as Project;
        } else {
            console.log("No such project!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching project by ID:", error);
        return null;
    }
}

export async function addProject(projectData: { name: string, description: string, deadline: Date }, tasks: Task[] = [], user: User) {
    const newProject: Omit<Project, 'id'> = {
        name: projectData.name,
        progressNotes: projectData.description,
        deadline: projectData.deadline.toISOString(),
        owner: user,
        completionPercentage: 0,
        tasks: tasks,
        activities: [],
        files: [],
    };

    try {
        const docRef = await addDoc(projectsCollection, toPlainObject(newProject));
        revalidatePath('/projects');
        revalidatePath('/dashboard');
        return docRef.id;
    } catch (error) {
        console.error("Error adding project: ", error);
        throw new Error('Failed to create project');
    }
}

export async function updateProject(projectId: string, projectData: { name: string, description: string, deadline: Date }) {
    const projectRef = doc(db, 'projects', projectId);
    try {
        await updateDoc(projectRef, {
            name: projectData.name,
            progressNotes: projectData.description,
            deadline: projectData.deadline.toISOString(),
        });
        revalidatePath(`/projects/${projectId}`);
        revalidatePath('/projects');
        revalidatePath('/dashboard');
    } catch (error) {
        console.error("Error updating project: ", error);
        throw new Error('Failed to update project');
    }
}

export async function deleteProject(projectId: string) {
    const projectRef = doc(db, 'projects', projectId);
    try {
        await deleteDoc(projectRef);
        revalidatePath('/projects');
        revalidatePath('/dashboard');
    } catch (error) {
        console.error("Error deleting project: ", error);
        throw new Error('Failed to delete project');
    }
}


export async function addFileToProject(projectId: string, file: { name: string; type: string; size: string, url: string }) {
    const projectRef = doc(db, 'projects', projectId);
    try {
        await updateDoc(projectRef, {
            files: arrayUnion(file)
        });
        revalidatePath(`/projects/${projectId}`);
    } catch (error) {
        console.error("Error adding file to project: ", error);
        throw new Error('Failed to add file');
    }
}
