import { getSupabase } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export function sb(): SupabaseClient<any, "public", any> {
  const c = getSupabase();
  if (!c) throw new Error('Supabase client not initialized');
  return c as SupabaseClient<any, "public", any>;
}

export async function withRetry<T>(fn: () => Promise<T>, attempts = 3) {
  let err: any;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (e) { err = e; await new Promise(r => setTimeout(r, Math.pow(4, i) * 50)); }
  }
  throw err;
}