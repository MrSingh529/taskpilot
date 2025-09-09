'use server';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';
import { addFileToProject } from './project-service';

const storage = getStorage(app);

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export async function uploadFile(projectId: string, file: File): Promise<void> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const storageRef = ref(storage, `projects/${projectId}/${file.name}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const fileMetadata = {
      name: file.name,
      type: file.type,
      size: formatBytes(file.size),
      url: downloadURL,
    };

    await addFileToProject(projectId, fileMetadata);

  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('File upload failed.');
  }
}
