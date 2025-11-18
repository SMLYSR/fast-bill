import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account, Transaction } from './schema';

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function listAccounts(): Promise<Account[]> {
  const raw = await AsyncStorage.getItem('fatsbill_accounts');
  const arr: Account[] = raw ? JSON.parse(raw) : [];
  return arr.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function upsertAccount(payload: Omit<Account, 'id' | 'created_at'> & { id?: string }) {
  const id = payload.id ?? uuid();
  const created_at = new Date().toISOString();
  const raw = await AsyncStorage.getItem('fatsbill_accounts');
  const arr: Account[] = raw ? JSON.parse(raw) : [];
  const next = arr.filter(a => a.id !== id).concat([{ id, name: payload.name, balance: payload.balance ?? 0, icon: payload.icon ?? undefined, created_at }]);
  await AsyncStorage.setItem('fatsbill_accounts', JSON.stringify(next));
  return id;
}

export async function deleteAccount(id: string) {
  const raw = await AsyncStorage.getItem('fatsbill_accounts');
  const arr: Account[] = raw ? JSON.parse(raw) : [];
  await AsyncStorage.setItem('fatsbill_accounts', JSON.stringify(arr.filter(a => a.id !== id)));
  const trRaw = await AsyncStorage.getItem('fatsbill_transactions');
  const trs: Transaction[] = trRaw ? JSON.parse(trRaw) : [];
  await AsyncStorage.setItem('fatsbill_transactions', JSON.stringify(trs.filter(t => t.account_id !== id)));
}

export async function listTransactionsByDate(dateISO: string): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem('fatsbill_transactions');
  const arr: Transaction[] = raw ? JSON.parse(raw) : [];
  return arr.filter(t => t.date === dateISO).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function listTransactionsBetween(startISO: string, endISO: string): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem('fatsbill_transactions');
  const arr: Transaction[] = raw ? JSON.parse(raw) : [];
  return arr
    .filter(t => t.date >= startISO && t.date <= endISO)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export async function addTransaction(payload: Omit<Transaction, 'id' | 'created_at'>) {
  const id = uuid();
  const created_at = new Date().toISOString();
  const raw = await AsyncStorage.getItem('fatsbill_transactions');
  const arr: Transaction[] = raw ? JSON.parse(raw) : [];
  const next = arr.concat([{ id, created_at, ...payload }]);
  await AsyncStorage.setItem('fatsbill_transactions', JSON.stringify(next));
  return id;
}

export async function updateTransaction(id: string, payload: Partial<Omit<Transaction, 'id' | 'created_at'>>) {
  const raw = await AsyncStorage.getItem('fatsbill_transactions');
  const arr: Transaction[] = raw ? JSON.parse(raw) : [];
  const next = arr.map(t => (t.id === id ? { ...t, ...payload } : t));
  await AsyncStorage.setItem('fatsbill_transactions', JSON.stringify(next));
}

export async function deleteTransaction(id: string) {
  const raw = await AsyncStorage.getItem('fatsbill_transactions');
  const arr: Transaction[] = raw ? JSON.parse(raw) : [];
  await AsyncStorage.setItem('fatsbill_transactions', JSON.stringify(arr.filter(t => t.id !== id)));
}

export async function backupToJSON() {
  const accounts = JSON.parse((await AsyncStorage.getItem('fatsbill_accounts')) || '[]');
  const transactions = JSON.parse((await AsyncStorage.getItem('fatsbill_transactions')) || '[]');
  return { accounts, transactions } as { accounts: Account[]; transactions: Transaction[] };
}

export async function restoreFromJSON(data: { accounts: Account[]; transactions: Transaction[] }) {
  await AsyncStorage.setItem('fatsbill_accounts', JSON.stringify(data.accounts));
  await AsyncStorage.setItem('fatsbill_transactions', JSON.stringify(data.transactions));
}