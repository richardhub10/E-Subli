import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '../supabaseClient';

type ProfileData = {
  xp: number;
  level: number;
  flashcardsRead: number;
  writingPractices: number;
  email?: string;
  firstName?: string;
  lastName?: string;
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

      // Fetch initial profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          xp: data.xp || 0,
          level: data.level || 1,
          flashcardsRead: data.flashcardsRead || 0,
          writingPractices: data.writingPractices || 0,
          email: data.email || user.email,
          firstName: data.first_name || user.user_metadata?.first_name || '',
          lastName: data.last_name || user.user_metadata?.last_name || '',
        });
      } else {
        // Initialize new profile
        const initialProfile = { 
          ...defaultProfile, 
          id: user.id, 
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
        };
        await supabase.from('profiles').insert([initialProfile]);
        
        // Map back to camelCase for frontend
        setProfile({
          ...initialProfile,
          firstName: initialProfile.first_name,
          lastName: initialProfile.last_name,
        });
      }

      // Listen to realtime updates
      subscription = supabase.channel(`public:profiles:id=eq.${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
          const newData = payload.new as any;
          if (newData) {
            setProfile({
              xp: newData.xp || 0,
              level: newData.level || 1,
              flashcardsRead: newData.flashcardsRead || 0,
              writingPractices: newData.writingPractices || 0,
              email: newData.email || user.email,
              firstName: newData.first_name || '',
              lastName: newData.last_name || '',
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

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const calculateLevel = (currentXp: number) => {
    // Basic level calculation: level up every 100 XP
    return Math.floor(currentXp / 100) + 1;
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Bypassing stale closures by using the latest ref
    const currentProfile = profileRef.current;
    const newProfile = { ...currentProfile, ...updates };
    
    if (!newProfile.email && user.email) {
      newProfile.email = user.email;
    }
    
    // Recalculate level if XP changes
    if (updates.xp !== undefined) {
      newProfile.level = calculateLevel(newProfile.xp);
    }
    
    // Synchronously update the ref so subsequent calls in the same tick use the new data
    profileRef.current = newProfile;
    // Optimistic update
    setProfile(newProfile);
    
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        first_name: newProfile.firstName,
        last_name: newProfile.lastName,
        ...newProfile,
        firstName: undefined,
        lastName: undefined,
      });
    } catch (error) {
      console.error("Supabase Sync Error:", error);
    }
  };

  const addXP = async (amount: number) => {
    await updateProfile({ xp: profileRef.current.xp + amount });
  };

  const incrementFlashcards = async () => {
    await updateProfile({ flashcardsRead: (profileRef.current.flashcardsRead || 0) + 1 });
  };

  const incrementWriting = async () => {
    await updateProfile({ writingPractices: (profileRef.current.writingPractices || 0) + 1 });
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
