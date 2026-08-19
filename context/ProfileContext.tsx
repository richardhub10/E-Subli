import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabaseClient';

type ProfileData = {
  xp: number;
  level: number;
  flashcardsRead: number;
  writingPractices: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  readHubIndex?: number;
  readHubCategory?: string;
};

type ProfileContextType = {
  profile: ProfileData;
  updateProfile: (updates: Partial<ProfileData>, amount?: number) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  incrementFlashcards: () => Promise<void>;
  incrementWriting: () => Promise<void>;
};

const defaultProfile: ProfileData = {
  xp: 0,
  level: 1,
  flashcardsRead: 0,
  writingPractices: 0,
  readHubIndex: 0,
  readHubCategory: 'All',
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);

  useEffect(() => {
    let subscription: any = null;

    const setupProfileSubscription = async (user: any) => {
      if (!user) {
        setProfile(defaultProfile);
        if (subscription) {
          supabase.removeChannel(subscription);
          subscription = null;
        }
        return;
      }

      // Fetch initial profile (maybeSingle prevents 406 Not Acceptable if it doesn't exist yet)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        let currentRemoteXp = data.xp || 0;
        let currentRemoteLevel = data.level || 1;

        // Sync offline XP if it exists
        try {
          const storedOfflineXp = await AsyncStorage.getItem('offlineXP');
          if (storedOfflineXp) {
            const offlineAmount = parseInt(storedOfflineXp);
            if (offlineAmount > 0) {
              const newXp = currentRemoteXp + offlineAmount;
              const newLevel = Math.floor(newXp / 100) + 1;
              
              const { error: syncError } = await supabase
                .from('profiles')
                .update({ xp: newXp, level: newLevel })
                .eq('id', user.id);
                
              if (!syncError) {
                currentRemoteXp = newXp;
                currentRemoteLevel = newLevel;
                await AsyncStorage.removeItem('offlineXP');
                console.log(`Synced ${offlineAmount} offline XP!`);
              }
            }
          }
        } catch (e) {
          console.error("Error syncing offline XP:", e);
        }

        setProfile({
          xp: currentRemoteXp,
          level: currentRemoteLevel,
          flashcardsRead: data.flashcardsread ?? data.flashcardsRead ?? 0,
          writingPractices: data.writingpractices ?? data.writingPractices ?? 0,
          email: data.email || user.email,
          firstName: data.first_name || user.user_metadata?.first_name || '',
          lastName: data.last_name || user.user_metadata?.last_name || '',
          readHubIndex: data.read_hub_index || 0,
          readHubCategory: data.read_hub_category || 'All',
        });
      } else {
        // Initialize new profile (only send columns that exist in SQL)
        const initialProfileToInsert = { 
          id: user.id, 
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          xp: defaultProfile.xp,
          level: defaultProfile.level,
          flashcardsread: defaultProfile.flashcardsRead,
          writingpractices: defaultProfile.writingPractices,
          read_hub_index: defaultProfile.readHubIndex,
          read_hub_category: defaultProfile.readHubCategory,
        };
        const { error: insertError } = await supabase.from('profiles').insert([initialProfileToInsert]);
        if (insertError) console.error("Insert Profile Error:", insertError);
        
        // Map back to camelCase for frontend
        setProfile({
          ...defaultProfile,
          email: initialProfileToInsert.email,
          firstName: initialProfileToInsert.first_name,
          lastName: initialProfileToInsert.last_name,
          readHubIndex: initialProfileToInsert.read_hub_index,
          readHubCategory: initialProfileToInsert.read_hub_category,
        });
      }

      // Listen to realtime updates with unique channel name to prevent duplication error
      subscription = supabase.channel(`public:profiles:${user.id}:${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
          const newData = payload.new as any;
          if (newData) {
            setProfile({
              xp: newData.xp || 0,
              level: newData.level || 1,
              flashcardsRead: newData.flashcardsread ?? newData.flashcardsRead ?? 0,
              writingPractices: newData.writingpractices ?? newData.writingPractices ?? 0,
              email: newData.email || user.email,
              firstName: newData.first_name || '',
              lastName: newData.last_name || '',
              readHubIndex: newData.read_hub_index || 0,
              readHubCategory: newData.read_hub_category || 'All',
            });
          }
        })
        .subscribe();
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setupProfileSubscription(session?.user);
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setupProfileSubscription(session?.user);
    });

    return () => {
      authSub.unsubscribe();
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  const profileRef = useRef<ProfileData>(defaultProfile);
  const syncQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const calculateLevel = (currentXp: number) => {
    // Basic level calculation: level up every 100 XP
    return Math.floor(currentXp / 100) + 1;
  };

  const updateProfile = async (updates: Partial<ProfileData>, amount: number = 0) => {
    // 1. Synchronously bypass stale closures by using the latest ref
    const currentProfile = profileRef.current;
    const newProfile = { ...currentProfile, ...updates };
    
    // Recalculate level if XP changes
    if (updates.xp !== undefined) {
      newProfile.level = calculateLevel(newProfile.xp);
    }
    
    // Synchronously update the ref so subsequent rapid clicks see the new data immediately
    profileRef.current = newProfile;
    // Optimistic update for UI
    setProfile(newProfile);
    
    // 2. Async database sync via a Queue to prevent race conditions
    syncQueueRef.current = syncQueueRef.current.then(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const profileToSync = profileRef.current; // Always use latest accumulated state for this sync
      
      if (!profileToSync.email && user.email) {
        profileToSync.email = user.email;
      }
      
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          first_name: profileToSync.firstName,
          last_name: profileToSync.lastName,
          xp: profileToSync.xp,
          level: profileToSync.level,
          flashcardsread: profileToSync.flashcardsRead,
          writingpractices: profileToSync.writingPractices,
          read_hub_index: profileToSync.readHubIndex,
          read_hub_category: profileToSync.readHubCategory,
        });
      } catch (error) {
        console.error("Supabase Sync Error:", error);
        
        // If XP was updated, cache it offline
        if (updates.xp !== undefined && amount > 0) {
           try {
             const stored = await AsyncStorage.getItem('offlineXP');
             const currentOffline = stored ? parseInt(stored) : 0;
             await AsyncStorage.setItem('offlineXP', (currentOffline + amount).toString());
           } catch(e) {}
        }
      }
    });
  };

  const addXP = async (amount: number) => {
    // Pass amount to updateProfile for caching logic
    updateProfile({ xp: profileRef.current.xp + amount }, amount);
  };

  const incrementFlashcards = async () => {
    updateProfile({ flashcardsRead: (profileRef.current.flashcardsRead || 0) + 1 });
  };

  const incrementWriting = async () => {
    updateProfile({ writingPractices: (profileRef.current.writingPractices || 0) + 1 });
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, addXP, incrementFlashcards, incrementWriting }}>
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
