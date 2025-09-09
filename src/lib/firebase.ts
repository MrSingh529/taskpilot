import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  projectId: "taskpilot-nizkc",
  appId: "1:229632763646:web:f92415bc88c973257267af",
  storageBucket: "taskpilot-nizkc.firebasestorage.app",
  apiKey: "AIzaSyBuiMRG_AwFu7ddbBJNaCYlvP_2FDV0NCU",
  authDomain: "taskpilot-nizkc.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "229632763646"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();


export { app };
