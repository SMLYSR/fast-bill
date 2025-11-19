import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

let cached: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (cached) return cached;
  const extra: any = (Constants as any).expoConfig?.extra || (Constants as any).manifestExtra || {};
  const url = (extra.EXPO_PUBLIC_SUPABASE_URL || extra.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) as string;
  const anon = (extra.EXPO_PUBLIC_SUPABASE_ANON_KEY || extra.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY) as string;
  if (!url || !anon) return null;
  cached = createClient(url, anon, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
    },
  });
  return cached;
}