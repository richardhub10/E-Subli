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
  streakCount: number;
  lastLogin?: string; // ISO string YYYY-MM-DD
  srsData?: Record<string, { interval: number, easeFactor: number, nextReview: number }>;
  eloRating: number;
  avatarUrl?: string;
};

type ProfileContextType = {
  profile: ProfileData;
  updateProfile: (updates: Partial<ProfileData>, amount?: number) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  incrementFlashcards: () => Promise<void>;
  incrementWriting: () => Promise<void>;
  updateSrsData: (cardId: string, rating: 'Hard' | 'Good' | 'Easy') => Promise<void>;
};

const defaultProfile: ProfileData = {
  xp: 0,
  level: 1,
  flashcardsRead: 0,
  writingPractices: 0,
  readHubIndex: 0,
  readHubCategory: 'All',
  streakCount: 0,
  eloRating: 1000,
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
          streakCount: data.streak_count || 0,
          lastLogin: data.last_login,
          srsData: data.srs_data || {},
          eloRating: data.elo_rating || 1000,
          avatarUrl: data.avatar_url,
        });

        // Calculate Streaks
        const todayStr = new Date().toISOString().split('T')[0]; // Local date YYYY-MM-DD
        const lastLoginStr = data.last_login;
        let newStreak = data.streak_count || 0;

        if (lastLoginStr !== todayStr) {
          const today = new Date(todayStr);
          const lastLogin = lastLoginStr ? new Date(lastLoginStr) : null;
          
          if (lastLogin) {
            // Check if last login was exactly yesterday
            const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              newStreak += 1;
            } else {
              newStreak = 1; // Broke the streak, reset to 1
            }
          } else {
            newStreak = 1; // First time logging in
          }
          
          // Update Supabase with new streak
          const { error: streakError } = await supabase
            .from('profiles')
            .update({ streak_count: newStreak, last_login: todayStr })
            .eq('id', user.id);
            
          if (!streakError) {
            setProfile(prev => ({
              ...prev,
              streakCount: newStreak,
              lastLogin: todayStr,
            }));
          }
        }

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
          streak_count: 1,
          last_login: new Date().toISOString().split('T')[0],
          srs_data: {},
          elo_rating: 1000,
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
          streakCount: initialProfileToInsert.streak_count,
          lastLogin: initialProfileToInsert.last_login,
          srsData: initialProfileToInsert.srs_data,
          eloRating: initialProfileToInsert.elo_rating,
          avatarUrl: initialProfileToInsert.avatar_url,
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
              streakCount: newData.streak_count || 0,
              lastLogin: newData.last_login,
              srsData: newData.srs_data || {},
              eloRating: newData.elo_rating || 1000,
              avatarUrl: newData.avatar_url,
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
          email: profileToSync.email,
          first_name: profileToSync.firstName,
          last_name: profileToSync.lastName,
          xp: profileToSync.xp,
          level: profileToSync.level,
          flashcardsread: profileToSync.flashcardsRead,
          writingpractices: profileToSync.writingPractices,
          read_hub_index: profileToSync.readHubIndex,
          read_hub_category: profileToSync.readHubCategory,
          srs_data: profileToSync.srsData,
          elo_rating: profileToSync.eloRating,
          avatar_url: profileToSync.avatarUrl,
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

  const updateSrsData = async (cardId: string, rating: 'Hard' | 'Good' | 'Easy') => {
    const srs = profileRef.current.srsData || {};
    const cardSrs = srs[cardId] || { interval: 0, easeFactor: 2.5, nextReview: 0 };
    
    let nextInterval = cardSrs.interval;
    let nextEase = cardSrs.easeFactor;
    
    if (rating === 'Hard') {
      nextInterval = 0;
      nextEase = Math.max(1.3, nextEase - 0.2);
    } else if (rating === 'Good') {
      nextInterval = nextInterval === 0 ? 1 : Math.round(nextInterval * nextEase);
    } else if (rating === 'Easy') {
      nextEase += 0.15;
      nextInterval = nextInterval === 0 ? 4 : Math.round(nextInterval * nextEase * 1.3);
    }
    
    // Calculate next review timestamp (Date.now() + days in ms)
    const nextReview = Date.now() + (nextInterval * 24 * 60 * 60 * 1000);
    
    const newSrsData = {
      ...srs,
      [cardId]: { interval: nextInterval, easeFactor: nextEase, nextReview }
    };
    
    updateProfile({ srsData: newSrsData });
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, addXP, incrementFlashcards, incrementWriting, updateSrsData }}>
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
