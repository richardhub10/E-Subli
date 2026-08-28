import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://sydkkzowpuoxrobusomc.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5ZGtrem93cHVveHJvYnVzb21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNzQ3NTcsImV4cCI6MjEwMTc1MDc1N30.5JhlrouVQ_4omR2x1kItH8pAIllWQOzlu46Ae3HxTfQ';

// Ensure we have a storage mechanism that works on both Web and Native
const storage = Platform.OS === 'web' ? window.localStorage : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
