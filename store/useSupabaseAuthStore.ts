import { create } from 'zustand';
import { getSupabase } from '@/lib/supabase';

type State = {
  session: any | null;
  user: any | null;
  loading: boolean;
  error?: string;
};

type Actions = {
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

export const useSupabaseAuthStore = create<State & Actions>((set) => ({
  session: null,
  user: null,
  loading: true,
  error: undefined,
  hydrate: async () => {
    const client = getSupabase();
    if (!client) { set({ loading: false, error: 'Supabase 配置缺失，请设置 EXPO_PUBLIC_SUPABASE_URL/ANON_KEY' }); return; }
    const { data } = await client.auth.getSession();
    const session = data.session;
    set({ session, user: session?.user ?? null, loading: false });
    client.auth.onAuthStateChange((_event, s) => {
      set({ session: s, user: s?.user ?? null });
    });
  },
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: undefined });
      const client = getSupabase();
      if (!client) { set({ loading: false, error: 'Supabase 配置缺失，请设置 EXPO_PUBLIC_SUPABASE_URL/ANON_KEY' }); return { ok: false, error: '配置缺失' }; }
      console.log('[auth/signIn] request', { email, password_len: password.length });
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      console.log('[auth/signIn] response', { ok: !error, userId: data?.session?.user?.id, error: error?.message });
      if (error) {
        if (String(error.message).includes('Invalid login credentials')) {
          console.log('[auth/signIn] try signUp then login');
          const { data: sData, error: sError } = await client.auth.signUp({ email, password });
          console.log('[auth/signUp] response', { ok: !sError, hasSession: !!sData?.session, error: sError?.message });
          if (sError) { set({ loading: false, error: sError.message }); return { ok: false, error: sError.message }; }
          if (!sData?.session) {
            const notice = '注册成功，请查收验证邮件后再登录';
            set({ loading: false, error: notice });
            return { ok: false, error: notice };
          }
          set({ session: sData.session, user: sData.session?.user ?? null, loading: false });
          return { ok: true };
        }
        set({ loading: false, error: error.message });
        return { ok: false, error: error.message };
      }
      set({ session: data.session, user: data.session?.user ?? null, loading: false });
      return { ok: true };
    } catch (e: any) {
      console.error('[auth/signIn] exception', { message: e?.message, stack: e?.stack });
      set({ loading: false, error: e?.message || '配置错误，请检查 Supabase 环境变量' });
      return { ok: false, error: e?.message };
    }
  },
  signOut: async () => {
    const client = getSupabase();
    if (!client) { set({ session: null, user: null }); return; }
    try { await client.auth.signOut({ scope: 'local' }); } catch (e: any) { console.error('[auth/signOut] error', { message: e?.message }); }
    set({ session: null, user: null });
  },
}));