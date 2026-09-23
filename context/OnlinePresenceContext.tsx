import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { useProfile } from './ProfileContext';

export type OnlinePlayer = {
  id: string;
  name: string;
  avatarUrl?: string;
  eloRating: number;
  activity?: string;
  online_at: number;
};

type OnlinePresenceContextType = {
  onlineCount: number;
  onlinePlayers: OnlinePlayer[];
  setActivity: (activity: string) => void;
};

const OnlinePresenceContext = createContext<OnlinePresenceContextType>({
  onlineCount: 1,
  onlinePlayers: [],
  setActivity: () => {},
});

export const useOnlinePresence = () => useContext(OnlinePresenceContext);

export const OnlinePresenceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const channelRef = useRef<any>(null);
  const currentActivityRef = useRef<string>('Online');
  const sessionKeyRef = useRef<string>(
    user?.id || `guest_${Math.random().toString(36).slice(2, 9)}`
  );

  useEffect(() => {
    if (user?.id) {
      sessionKeyRef.current = user.id;
    }
  }, [user?.id]);

  const trackPresence = async (act?: string) => {
    if (!channelRef.current) return;
    const activity = act || currentActivityRef.current || 'Online';
    const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') 
      || profile?.firstName 
      || (user?.email ? user.email.split('@')[0] : 'Scholar');

    try {
      await channelRef.current.track({
        user_id: sessionKeyRef.current,
        name: displayName,
        avatarUrl: profile?.avatarUrl,
        eloRating: profile?.eloRating || 1000,
        activity,
        online_at: Date.now(),
      });
    } catch (e) {
      console.log('Error tracking online presence:', e);
    }
  };

  const setActivity = (newActivity: string) => {
    currentActivityRef.current = newActivity;
    trackPresence(newActivity);
  };

  useEffect(() => {
    const key = sessionKeyRef.current;
    const channel = supabase.channel('online_global_players', {
      config: { presence: { key } },
    });
    channelRef.current = channel;

    const syncPresence = () => {
      const state = channel.presenceState();
      const players: OnlinePlayer[] = [];
      Object.entries(state).forEach(([pKey, presences]: [string, any]) => {
        if (Array.isArray(presences) && presences.length > 0) {
          const latest = presences[presences.length - 1];
          players.push({
            id: pKey,
            name: latest.name || 'Scholar',
            avatarUrl: latest.avatarUrl,
            eloRating: latest.eloRating || 1000,
            activity: latest.activity || 'Online',
            online_at: latest.online_at || Date.now(),
          });
        }
      });

      // Sort so current user is at the top, then by rating
      players.sort((a, b) => {
        if (a.id === key) return -1;
        if (b.id === key) return 1;
        return (b.eloRating || 1000) - (a.eloRating || 1000);
      });

      setOnlinePlayers(players);
      setOnlineCount(Math.max(1, players.length));
    };

    channel.on('presence', { event: 'sync' }, syncPresence);
    channel.on('presence', { event: 'join' }, syncPresence);
    channel.on('presence', { event: 'leave' }, syncPresence);

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await trackPresence();
      }
    });

    const appStateSub = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        await trackPresence();
      } else if (nextState === 'background') {
        if (channelRef.current) {
          try {
            await channelRef.current.untrack();
          } catch (_) {}
        }
      }
    });

    return () => {
      appStateSub.remove();
      channel.untrack().catch(() => {});
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user?.id, profile?.firstName, profile?.lastName, profile?.eloRating, profile?.avatarUrl]);

  return (
    <OnlinePresenceContext.Provider value={{ onlineCount, onlinePlayers, setActivity }}>
      {children}
    </OnlinePresenceContext.Provider>
  );
};
