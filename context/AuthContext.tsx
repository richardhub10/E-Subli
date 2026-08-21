import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

export const AUTO_LOGOUT_HOURS = 2; // 2 hours inactivity limit
const INACTIVITY_TIMEOUT_MS = AUTO_LOGOUT_HOURS * 60 * 60 * 1000;
const LAST_ACTIVE_KEY = '@esubli_last_active_time';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  recordActivity: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  recordActivity: async () => {},
  signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);

  // Update last active timestamp
  const recordActivity = async () => {
    try {
      await AsyncStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    } catch (e) {
      console.log('Error recording activity timestamp:', e);
    }
  };

  // Sign out user and clear session
  const signOut = async (isAutoLogout = false) => {
    try {
      await AsyncStorage.removeItem(LAST_ACTIVE_KEY);
      await supabase.auth.signOut();
      setUser(null);

      if (isAutoLogout) {
        Alert.alert(
          'Session Expired',
          `You have been automatically logged out due to ${AUTO_LOGOUT_HOURS} hours of inactivity for your account security.`
        );
      }
    } catch (e) {
      console.log('Error during sign out:', e);
    }
  };

  // Check if session has exceeded inactivity duration
  const checkSessionTimeout = async (currentUser: User | null) => {
    if (!currentUser) return;

    try {
      const lastActiveStr = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
      const now = Date.now();

      if (lastActiveStr) {
        const lastActive = parseInt(lastActiveStr, 10);
        if (!isNaN(lastActive)) {
          const elapsed = now - lastActive;

          if (elapsed > INACTIVITY_TIMEOUT_MS) {
            console.log(`Session expired: ${Math.round(elapsed / 1000 / 60)} minutes elapsed since last activity.`);
            await signOut(true);
            return;
          }
        }
      }

      // If valid, refresh last active timestamp
      await recordActivity();
    } catch (e) {
      console.log('Error checking session timeout:', e);
    }
  };

  useEffect(() => {
    // 1. Check active session on initial app start
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const activeUser = session?.user ?? null;
      if (activeUser) {
        await checkSessionTimeout(activeUser);
      }
      setUser(activeUser);
      setLoading(false);
    });

    // 2. Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      setLoading(false);

      if (authUser) {
        await recordActivity();
      }
    });

    // 3. AppState listener: Check timeout when user returns from background / unlocks device
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await checkSessionTimeout(session.user);
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App is entering background, record timestamp
        await recordActivity();
      }

      appState.current = nextAppState;
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // 4. Periodic heartbeat while app is in active use
    const heartbeatInterval = setInterval(() => {
      if (appState.current === 'active' && user) {
        recordActivity();
      }
    }, 5 * 60 * 1000); // every 5 minutes

    return () => {
      subscription.unsubscribe();
      appStateSubscription.remove();
      clearInterval(heartbeatInterval);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, recordActivity, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
