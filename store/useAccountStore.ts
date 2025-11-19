import { create } from 'zustand';
import { Account } from '@/db/sqlite/schema';
import { listAccounts, createAccount, deleteAccount } from '@/supabase/accounts';

type State = {
  accounts: Account[];
  loading: boolean;
};

type Actions = {
  load: () => Promise<void>;
  add: (name: string, balance?: number, icon?: string) => Promise<string>;
  remove: (id: string) => Promise<void>;
};

export const useAccountStore = create<State & Actions>((set, get) => ({
  accounts: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    const rows = await listAccounts();
    set({ accounts: rows, loading: false });
  },
  add: async (name, balance = 0, icon) => {
    const a = await createAccount({ name, balance, icon });
    await get().load();
    return a.id;
  },
  remove: async id => {
    await deleteAccount(id);
    await get().load();
  },
}));