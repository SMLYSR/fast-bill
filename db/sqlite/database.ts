import { Account, Transaction } from './schema';

export async function listAccounts(): Promise<Account[]> { throw new Error('Not implemented'); }
export async function upsertAccount(payload: Omit<Account, 'id' | 'created_at'> & { id?: string }): Promise<string> { throw new Error('Not implemented'); }
export async function deleteAccount(id: string): Promise<void> { throw new Error('Not implemented'); }
export async function listTransactionsByDate(dateISO: string): Promise<Transaction[]> { throw new Error('Not implemented'); }
export async function listTransactionsBetween(startISO: string, endISO: string): Promise<Transaction[]> { throw new Error('Not implemented'); }
export async function addTransaction(payload: Omit<Transaction, 'id' | 'created_at'>): Promise<string> { throw new Error('Not implemented'); }
export async function updateTransaction(id: string, payload: Partial<Omit<Transaction, 'id' | 'created_at'>>): Promise<void> { throw new Error('Not implemented'); }
export async function deleteTransaction(id: string): Promise<void> { throw new Error('Not implemented'); }
export async function backupToJSON(): Promise<{ accounts: Account[]; transactions: Transaction[] }> { throw new Error('Not implemented'); }
export async function restoreFromJSON(data: { accounts: Account[]; transactions: Transaction[] }): Promise<void> { throw new Error('Not implemented'); }
