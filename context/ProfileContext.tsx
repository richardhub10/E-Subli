import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabaseClient';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { navigationRef } from '../App';

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
  const [inAppAlert, setInAppAlert] = useState<{
    visible: boolean;
    type: 'challenge' | 'friend_request';
    title: string;
    subtitle: string;
    senderName: string;
    roomId?: string;
    onAccept?: () => void;
    onDecline?: () => void;
  } | null>(null);

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
          avatarUrl: defaultProfile.avatarUrl,
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

      // Listen to personal broadcast channel for notifications and challenges
      const personalChannel = supabase.channel(`user_${user.id}`)
        .on('broadcast', { event: 'friend_request' }, (payload) => {
          const sender = payload.payload.senderName || 'A scholar';
          setInAppAlert({
            visible: true,
            type: 'friend_request',
            title: 'New Friend Added! 🤝',
            subtitle: `${sender} has added you to their friends list!`,
            senderName: sender,
          });
        })
        .on('broadcast', { event: 'challenge' }, (payload) => {
          const challenger = payload.payload.challengerName || 'A scholar';
          setInAppAlert({
            visible: true,
            type: 'challenge',
            title: `${challenger} Challenged You!`,
            subtitle: 'Ready for a live Kulitan Quiz Battle? Tap Accept to jump straight into the duel arena!',
            senderName: challenger,
            roomId: payload.payload.roomId,
            onAccept: async () => {
              try {
                const myName = profileRef.current.firstName ? profileRef.current.firstName.toUpperCase() : (user?.email?.split('@')[0]?.toUpperCase() || 'PLAYER 2');
                await supabase
                  .from('quiz_room_players')
                  .insert([{ room_id: payload.payload.roomId, user_id: user.id, score: 0, player_name: myName }]);
                  
                await supabase
                  .from('quiz_rooms')
                  .update({ status: 'playing' })
                  .eq('id', payload.payload.roomId);

                const targetRoomId = payload.payload.roomId;
                const performNavigation = () => {
                  try {
                    if (navigationRef.isReady()) {
                      navigationRef.navigate('QuizBattle', { roomId: targetRoomId, isHost: false });
                    } else {
                      navigationRef.dispatch(
                        CommonActions.navigate({
                          name: 'QuizBattle',
                          params: { roomId: targetRoomId, isHost: false }
                        })
                      );
                    }
                  } catch (navErr) {
                    console.error("Navigation error:", navErr);
                  }
                };

                performNavigation();
                setTimeout(performNavigation, 150);
              } catch (e) {
                console.error("Error accepting challenge:", e);
              }
            },
            onDecline: () => {
              console.log("Challenge declined");
            }
          });
        })
        .subscribe();

      // We attach the personalChannel to the subscription so we can remove it later
      subscription.personalChannel = personalChannel;
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setupProfileSubscription(session?.user);
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setupProfileSubscription(session?.user);
    });

    return () => {
      authSub.unsubscribe();
      if (subscription) {
        supabase.removeChannel(subscription);
        if (subscription.personalChannel) {
          supabase.removeChannel(subscription.personalChannel);
        }
      }
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
      {inAppAlert && inAppAlert.visible && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setInAppAlert(null)}>
          <View style={modalStyles.modalOverlay}>
            <View style={modalStyles.modalContainer}>
              <LinearGradient
                colors={inAppAlert.type === 'challenge' ? ['#1E1B4B', '#0F172A'] : ['#0F2942', '#0A192F']}
                style={modalStyles.modalCard}
              >
                {/* Top Badge */}
                <View style={[modalStyles.modalBadge, inAppAlert.type === 'challenge' ? modalStyles.challengeBadge : modalStyles.friendBadge]}>
                  <Ionicons 
                    name={inAppAlert.type === 'challenge' ? 'flash' : 'people'} 
                    size={15} 
                    color={inAppAlert.type === 'challenge' ? '#F59E0B' : '#38BDF8'} 
                  />
                  <Text style={[modalStyles.modalBadgeText, inAppAlert.type === 'challenge' ? { color: '#F59E0B' } : { color: '#38BDF8' }]}>
                    {inAppAlert.type === 'challenge' ? 'DUEL CHALLENGE' : 'NEW FRIEND'}
                  </Text>
                </View>

                {/* Center Graphic */}
                <View style={[modalStyles.iconCircle, inAppAlert.type === 'challenge' ? modalStyles.challengeIconBg : modalStyles.friendIconBg]}>
                  <Ionicons 
                    name={inAppAlert.type === 'challenge' ? 'game-controller' : 'person-add'} 
                    size={40} 
                    color="#FFF" 
                  />
                </View>

                {/* Title & Subtitle */}
                <Text style={modalStyles.modalTitle}>{inAppAlert.title}</Text>
                <Text style={modalStyles.modalSubtitle}>{inAppAlert.subtitle}</Text>

                {/* Actions */}
                <View style={modalStyles.modalActions}>
                  {inAppAlert.type === 'challenge' ? (
                    <>
                      <TouchableOpacity 
                        style={modalStyles.declineButton}
                        activeOpacity={0.7}
                        onPress={() => {
                          inAppAlert.onDecline?.();
                          setInAppAlert(null);
                        }}
                      >
                        <Text style={modalStyles.declineButtonText}>Decline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={modalStyles.acceptButton}
                        activeOpacity={0.8}
                        onPress={() => {
                          const acceptFn = inAppAlert.onAccept;
                          setInAppAlert(null);
                          acceptFn?.();
                        }}
                      >
                        <LinearGradient colors={['#EF4444', '#DC2626']} style={modalStyles.acceptGradient}>
                          <Ionicons name="flash" size={16} color="#FFF" />
                          <Text style={modalStyles.acceptButtonText}>Accept</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity 
                      style={modalStyles.singleActionButton}
                      activeOpacity={0.8}
                      onPress={() => setInAppAlert(null)}
                    >
                      <LinearGradient colors={['#3B82F6', '#2563EB']} style={modalStyles.acceptGradient}>
                        <Text style={modalStyles.acceptButtonText}>Awesome! 🌟</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      )}
    </ProfileContext.Provider>
  );
};

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 20,
  },
  modalCard: {
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 28,
  },
  modalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
  },
  challengeBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  friendBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  modalBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  challengeIconBg: {
    backgroundColor: '#EF4444',
  },
  friendIconBg: {
    backgroundColor: '#3B82F6',
  },
  modalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  declineButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  declineButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#CBD5E1',
  },
  acceptButton: {
    flex: 1.2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  singleActionButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  acceptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  acceptButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#FFF',
  },
});

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
