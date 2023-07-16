import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const config = {
  apiKey: 'AIzaSyAs71mazWJwZyYuOluRUMNkPxE5_-hH-J0',
  authDomain: 'ayahay-f89b6.firebaseapp.com',
  projectId: 'ayahay-f89b6',
  storageBucket: 'ayahay-f89b6.appspot.com',
  messagingSenderId: '1011801913478',
  appId: '1:1011801913478:web:7fc3be78d145bb7771f907',
  measurementId: 'G-6K4KCB6DBZ',
};

export const app = initializeApp(config);

export const initFirebase = () => {
  return app;
};
