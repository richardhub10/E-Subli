import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wrczffxomjksnryeunvw.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyY3pmZnhvbWprc25yeWV1bnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MDgyMzMsImV4cCI6MjA1NDA4NDIzM30.F_P9F91x1n8G9G0Z3q_gYc3m8K7uYy_6o0B0hN9M6xQ';

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
