
'use server';

import type { Task, Project, User, Activity } from '@/types';
import { revalidatePath } from 'next/cache';
import { getFirestore, doc, updateDoc, arrayUnion, getDoc, arrayRemove, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

const db = getFirestore(app);

type NewTaskData = {
    title: string;
    priority: Task['priority'];
    status: Task['status'];
    dueDate: Date | null;
    assignee: User | null;
}

function calculateCompletionPercentage(tasks: Task[]): number {
    if (!tasks || tasks.length === 0) {
        return 0;
    }
    const doneTasks = tasks.filter(task => task.status === 'Done').length;
    return Math.round((doneTasks / tasks.length) * 100);
}

const createActivity = (user: User, text: string): Activity => ({
    id: uuidv4(),
    user,
    text,
    timestamp: new Date().toISOString(),
});

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


export async function addTask(projectId: string, taskData: NewTaskData, user: User) {
    const projectRef = doc(db, 'projects', projectId);

    const newTask: Task = {
        id: uuidv4(),
        title: taskData.title,
        priority: taskData.priority,
        status: taskData.status,
        dueDate: taskData.dueDate ? taskData.dueDate.toISOString() : null,
        assignee: taskData.assignee,
    };

    try {
        const projectDoc = await getDoc(projectRef);
        if (!projectDoc.exists()) {
            throw new Error("Project not found");
        }
        const projectData = projectDoc.data() as Project;
        const existingTasks = projectData.tasks || [];
        const newTasks = [...existingTasks, newTask];
        const completionPercentage = calculateCompletionPercentage(newTasks);
        let activityText = `created a new task: "${newTask.title}"`;
        if (newTask.assignee) {
            activityText += ` and assigned it to ${newTask.assignee.name}`;
        }
        const activity = createActivity(user, activityText);

        await updateDoc(projectRef, {
            tasks: arrayUnion(toPlainObject(newTask)),
            completionPercentage: completionPercentage,
            activities: arrayUnion(toPlainObject(activity)),
        });
        revalidatePath(`/projects/${projectId}`);
        revalidatePath('/dashboard');
        revalidatePath('/projects');
    } catch (error) {
        console.error("Error adding task: ", error);
        throw new Error('Failed to create task');
    }
}

export async function updateTask(projectId: string, updatedTask: Task, user: User) {
    const projectRef = doc(db, 'projects', projectId);

    try {
        const projectDoc = await getDoc(projectRef);
        if (!projectDoc.exists()) {
            throw new Error("Project not found");
        }

        const projectData = projectDoc.data() as Project;
        const tasks = projectData.tasks || [];

        const originalTask = tasks.find((task: Task) => task.id === updatedTask.id);

        if (!originalTask) {
            throw new Error("Task not found");
        }
        
        let activityText = `updated task: "${updatedTask.title}"`;
        if(originalTask.status !== updatedTask.status) {
            activityText = `moved task "${updatedTask.title}" from ${originalTask.status} to ${updatedTask.status}`;
        }
        if (originalTask.assignee?.id !== updatedTask.assignee?.id) {
             if (updatedTask.assignee) {
                activityText = `assigned task "${updatedTask.title}" to ${updatedTask.assignee.name}`;
            } else {
                activityText = `unassigned task "${updatedTask.title}"`;
            }
        }
        const activity = createActivity(user, activityText);
        
        const newTasks = tasks.map((task: Task) => task.id === updatedTask.id ? updatedTask : task);
        
        const completionPercentage = calculateCompletionPercentage(newTasks);

        await updateDoc(projectRef, { 
            tasks: toPlainObject(newTasks),
            completionPercentage: completionPercentage,
            activities: arrayUnion(toPlainObject(activity)),
        });

        revalidatePath(`/projects/${projectId}`);
        revalidatePath('/dashboard');
        revalidatePath('/projects');

    } catch (error) {
        console.error("Error updating task: ", error);
        throw new Error('Failed to update task');
    }
}
