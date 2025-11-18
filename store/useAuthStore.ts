import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type State = {
  user: string | null;
  loading: boolean;
};

type Actions = {
  hydrate: () => Promise<void>;
  login: (name: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<State & Actions>((set) => ({
  user: null,
  loading: true,
  hydrate: async () => {
    try {
      const u = await AsyncStorage.getItem('fatsbill_user');
      set({ user: u, loading: false });
    } catch (e) {
      set({ user: null, loading: false });
    }
  },
  login: async (name) => {
    await AsyncStorage.setItem('fatsbill_user', name);
    set({ user: name });
  },
  logout: async () => {
    await AsyncStorage.removeItem('fatsbill_user');
    set({ user: null });
  },
}));