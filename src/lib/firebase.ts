import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "trim-matrix-q5xj8",
  appId: "1:485180754750:web:6392f91b8673ab10383a6f",
  apiKey: "AIzaSyB7Yg9I8wW0Dem2iG-0qyiL3xt4gR0pxFc",
  authDomain: "trim-matrix-q5xj8.firebaseapp.com",
  storageBucket: "trim-matrix-q5xj8.firebasestorage.app",
  messagingSenderId: "485180754750"
};

const app = initializeApp(firebaseConfig);

// Initialize named Firestore database
export const db = getFirestore(app, "ai-studio-payrollandtaxcal-8d56c924-221f-4eaf-bb3e-2fe3022861aa");
