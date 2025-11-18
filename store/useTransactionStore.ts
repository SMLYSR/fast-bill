import {
    addTransaction,
    deleteTransaction,
    listTransactionsBetween,
    listTransactionsByDate,
    updateTransaction,
} from '@/db/sqlite/database';
import { Transaction } from '@/db/sqlite/schema';
import { create } from 'zustand';

type State = {
  transactions: Transaction[];
  loading: boolean;
};

type Actions = {
  loadByDate: (dateISO: string) => Promise<void>;
  loadBetween: (startISO: string, endISO: string) => Promise<void>;
  add: (t: Omit<Transaction, 'id' | 'created_at'>) => Promise<string>;
  update: (id: string, patch: Partial<Omit<Transaction, 'id' | 'created_at'>>) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useTransactionStore = create<State & Actions>((set, get) => ({
  transactions: [],
  loading: false,
  loadByDate: async dateISO => {
    set({ loading: true });
    const rows = await listTransactionsByDate(dateISO);
    set({ transactions: rows, loading: false });
  },
  loadBetween: async (startISO, endISO) => {
    set({ loading: true });
    const rows = await listTransactionsBetween(startISO, endISO);
    set({ transactions: rows, loading: false });
  },
  add: async t => {
    const id = await addTransaction(t);
    return id;
  },
  update: async (id, patch) => {
    await updateTransaction(id, patch);
  },
  remove: async id => {
    await deleteTransaction(id);
  },
}));
