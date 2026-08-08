import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, browserLocalPersistence, Auth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from "firebase/firestore";
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyCqLPMvcWMdcVj9uzgZ1yIz4V-fSygBAvk",
  authDomain: "e-subli-app.firebaseapp.com",
  projectId: "e-subli-app",
  storageBucket: "e-subli-app.firebasestorage.app",
  messagingSenderId: "915875179300",
  appId: "1:915875179300:web:27c4411f1a8a375cea61b1",
  measurementId: "G-0N8372ZDKD"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;
if (Platform.OS === 'web') {
  try {
    // Force local storage on web to survive localhost refreshes
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence
    });
  } catch (error) {
    // Fallback if already initialized (hot reloads)
    auth = getAuth(app);
  }
} else {
  auth = getAuth(app);
}

let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
  });
} catch (e) {
  // Fallback if already initialized (hot reloads)
  db = getFirestore(app);
}

export { app, auth, db };