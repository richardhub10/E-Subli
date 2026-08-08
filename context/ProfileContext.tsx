import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

type ProfileData = {
  xp: number;
  level: number;
  flashcardsRead: number;
  writingPractices: number;
  email?: string;
};

type ProfileContextType = {
  profile: ProfileData;
  addXP: (amount: number) => Promise<void>;
  incrementFlashcards: () => Promise<void>;
  incrementWriting: () => Promise<void>;
};

const defaultProfile: ProfileData = {
  xp: 0,
  level: 1,
  flashcardsRead: 0,
  writingPractices: 0,
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        
        // Listen to realtime updates
        const unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as ProfileData);
          } else {
            // Initialize new profile
            setDoc(docRef, defaultProfile).catch(console.error);
            setProfile(defaultProfile);
          }
        }, (error) => {
          console.error("Error listening to profile:", error);
        });

        return () => unsubscribeSnapshot();
      } else {
        setProfile(defaultProfile);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const calculateLevel = (currentXp: number) => {
    // Basic level calculation: level up every 100 XP
    return Math.floor(currentXp / 100) + 1;
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    const user = auth.currentUser;
    if (!user) return;
    
    const newProfile = { ...profile, ...updates };
    if (!newProfile.email && user.email) {
      newProfile.email = user.email;
    }
    
    // Recalculate level if XP changes
    if (updates.xp !== undefined) {
      newProfile.level = calculateLevel(newProfile.xp);
    }
    
    // Optimistic update
    setProfile(newProfile);
    
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, newProfile, { merge: true });
  };

  const addXP = async (amount: number) => {
    await updateProfile({ xp: profile.xp + amount });
  };

  const incrementFlashcards = async () => {
    await updateProfile({ flashcardsRead: profile.flashcardsRead + 1 });
  };

  const incrementWriting = async () => {
    await updateProfile({ writingPractices: profile.writingPractices + 1 });
  };

  return (
    <ProfileContext.Provider value={{ profile, addXP, incrementFlashcards, incrementWriting }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
