import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Profile = { avatarUri?: string; email?: string; username?: string; crop?: { x: number; y: number; size: number; zoom: number } };
type Language = 'zh' | 'en' | 'ja';
type ThemeMode = 'light' | 'dark' | 'system';

type State = {
  profile: Profile;
  language: Language;
  theme: ThemeMode;
  saving: boolean;
  load: () => Promise<void>;
  setProfile: (p: Profile) => Promise<void>;
  setLanguage: (l: Language) => Promise<void>;
  setTheme: (t: ThemeMode) => Promise<void>;
};

const KEY_PROFILE = 'pref.profile';
const KEY_LANGUAGE = 'pref.language';
const KEY_THEME = 'pref.theme';

export const usePreferenceStore = create<State>((set, get) => ({
  profile: {},
  language: 'zh',
  theme: 'system',
  saving: false,
  load: async () => {
    const [p, l, t] = await Promise.all([
      AsyncStorage.getItem(KEY_PROFILE),
      AsyncStorage.getItem(KEY_LANGUAGE),
      AsyncStorage.getItem(KEY_THEME),
    ]);
    set({
      profile: p ? JSON.parse(p) : {},
      language: (l as Language) || 'zh',
      theme: (t as ThemeMode) || 'system',
    });
  },
  setProfile: async (p) => {
    set({ saving: true });
    await AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(p));
    set({ profile: p, saving: false });
  },
  setLanguage: async (l) => {
    set({ saving: true });
    await AsyncStorage.setItem(KEY_LANGUAGE, l);
    set({ language: l, saving: false });
  },
  setTheme: async (t) => {
    set({ saving: true });
    await AsyncStorage.setItem(KEY_THEME, t);
    set({ theme: t, saving: false });
  },
}));