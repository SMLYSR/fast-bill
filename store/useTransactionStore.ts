import { Transaction } from '@/db/sqlite/schema';
import { createTransaction, deleteTransaction, listTransactionsBetween, listTransactionsByDate, updateTransaction } from '@/supabase/transactions';
import { create } from 'zustand';

type State = {
  todayTransactions: Transaction[];
  statsTransactions: Transaction[];
  historyTransactions: Transaction[];
  loadingToday: boolean;
  loadingStats: boolean;
  loadingHistory: boolean;
  todayOffset: number;
  hasMoreToday: boolean;
  currentDate: string;
  historyOffset: number;
  hasMoreHistory: boolean;
  currentHistoryDate: string;
};

type Actions = {
  loadToday: (dateISO: string) => Promise<void>;
  loadMoreToday: () => Promise<void>;
  loadStats: (startISO: string, endISO: string) => Promise<void>;
  loadHistory: (dateISO: string) => Promise<void>;
  loadMoreHistory: () => Promise<void>;
  add: (t: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => Promise<string>;
  update: (id: string, patch: Partial<Omit<Transaction, 'id' | 'created_at' | 'user_id'>>) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useTransactionStore = create<State & Actions>((set, get) => ({
  todayTransactions: [],
  statsTransactions: [],
  historyTransactions: [],
  loadingToday: false,
  loadingStats: false,
  loadingHistory: false,
  todayOffset: 0,
  hasMoreToday: true,
  currentDate: '',
  historyOffset: 0,
  hasMoreHistory: true,
  currentHistoryDate: '',
  loadToday: async dateISO => {
    set({ loadingToday: true, todayOffset: 0, hasMoreToday: true, currentDate: dateISO });
    try {
      const rows = await listTransactionsByDate(dateISO, 10, 0);
      set({ todayTransactions: rows, todayOffset: 10, hasMoreToday: rows.length >= 10 });
    } catch (e) {
      console.error('loadToday error:', e);
    } finally {
      set({ loadingToday: false });
    }
  },
  loadMoreToday: async () => {
    const { loadingToday, hasMoreToday, currentDate, todayOffset, todayTransactions } = get();
    if (loadingToday || !hasMoreToday) return;
    set({ loadingToday: true });
    try {
      const rows = await listTransactionsByDate(currentDate, 10, todayOffset);
      set({
        todayTransactions: [...todayTransactions, ...rows],
        todayOffset: todayOffset + 10,
        hasMoreToday: rows.length >= 10,
      });
    } catch (e) {
      console.error('loadMoreToday error:', e);
    } finally {
      set({ loadingToday: false });
    }
  },
  loadStats: async (startISO, endISO) => {
    set({ loadingStats: true });
    try {
      const rows = await listTransactionsBetween(startISO, endISO);
      set({ statsTransactions: rows });
    } catch (e) {
      console.error('loadStats error:', e);
    } finally {
      set({ loadingStats: false });
    }
  },
  loadHistory: async dateISO => {
    set({ loadingHistory: true, historyOffset: 0, hasMoreHistory: true, currentHistoryDate: dateISO });
    try {
      const rows = await listTransactionsByDate(dateISO, 10, 0);
      set({ historyTransactions: rows, historyOffset: 10, hasMoreHistory: rows.length >= 10 });
    } catch (e) {
      console.error('loadHistory error:', e);
    } finally {
      set({ loadingHistory: false });
    }
  },
  loadMoreHistory: async () => {
    const { loadingHistory, hasMoreHistory, currentHistoryDate, historyOffset, historyTransactions } = get();
    if (loadingHistory || !hasMoreHistory) return;
    set({ loadingHistory: true });
    try {
      const rows = await listTransactionsByDate(currentHistoryDate, 10, historyOffset);
      set({
        historyTransactions: [...historyTransactions, ...rows],
        historyOffset: historyOffset + 10,
        hasMoreHistory: rows.length >= 10,
      });
    } catch (e) {
      console.error('loadMoreHistory error:', e);
    } finally {
      set({ loadingHistory: false });
    }
  },
  add: async t => {
    const tx = await createTransaction(t);
    set(state => ({
      todayTransactions: [tx, ...state.todayTransactions],
      statsTransactions: [tx, ...state.statsTransactions],
      historyTransactions: [tx, ...state.historyTransactions],
      todayOffset: state.todayOffset + 1, // Increment offset to keep pagination consistent
    }));
    return tx.id;
  },
  update: async (id, patch) => {
    const tx = await updateTransaction(id, patch);
    set(state => ({
      todayTransactions: state.todayTransactions.map(t => (t.id === id ? tx : t)),
      statsTransactions: state.statsTransactions.map(t => (t.id === id ? tx : t)),
      historyTransactions: state.historyTransactions.map(t => (t.id === id ? tx : t)),
    }));
  },
  remove: async id => {
    await deleteTransaction(id);
    set(state => ({
      todayTransactions: state.todayTransactions.filter(t => t.id !== id),
      statsTransactions: state.statsTransactions.filter(t => t.id !== id),
      historyTransactions: state.historyTransactions.filter(t => t.id !== id),
      todayOffset: Math.max(0, state.todayOffset - 1), // Decrement offset
    }));
  },
}));
