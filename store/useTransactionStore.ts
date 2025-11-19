import { Transaction } from '@/db/sqlite/schema';
import { createTransaction, deleteTransaction, listTransactionsBetween, listTransactionsByDate, updateTransaction } from '@/supabase/transactions';
import { create } from 'zustand';

type State = {
  transactions: Transaction[];
  loading: boolean;
};

type Actions = {
  loadByDate: (dateISO: string) => Promise<void>;
  loadBetween: (startISO: string, endISO: string) => Promise<void>;
  add: (t: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => Promise<string>;
  update: (id: string, patch: Partial<Omit<Transaction, 'id' | 'created_at' | 'user_id'>>) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useTransactionStore = create<State & Actions>((set, get) => ({
  transactions: [],
  loading: false,
  loadByDate: async dateISO => {
    set({ loading: true });
    try {
      const rows = await listTransactionsByDate(dateISO);
      set({ transactions: rows });
    } catch (e) {
      console.error('loadByDate error:', e);
    } finally {
      set({ loading: false });
    }
  },
  loadBetween: async (startISO, endISO) => {
    set({ loading: true });
    try {
      const rows = await listTransactionsBetween(startISO, endISO);
      set({ transactions: rows });
    } catch (e) {
      console.error('loadBetween error:', e);
    } finally {
      set({ loading: false });
    }
  },
  add: async t => {
    const tx = await createTransaction(t);
    return tx.id;
  },
  update: async (id, patch) => {
    await updateTransaction(id, patch);
  },
  remove: async id => {
    await deleteTransaction(id);
  },
}));
