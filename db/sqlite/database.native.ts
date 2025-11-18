import * as SQLite from 'expo-sqlite';
import { createTablesSQL, Account, Transaction } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function openDB() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('fatsbill.db');
  await db.execAsync(createTablesSQL);
  return db;
}

export async function listAccounts(): Promise<Account[]> {
  const database = await openDB();
  const res = await database.getAllAsync<Account>('SELECT * FROM accounts ORDER BY created_at DESC');
  return res;
}

export async function upsertAccount(payload: Omit<Account, 'id' | 'created_at'> & { id?: string }) {
  const database = await openDB();
  const id = payload.id ?? uuid();
  const created_at = new Date().toISOString();
  await database.runAsync(
    'INSERT OR REPLACE INTO accounts (id,name,balance,icon,created_at) VALUES (?,?,?,?,?)',
    [id, payload.name, payload.balance ?? 0, payload.icon ?? null, created_at]
  );
  return id;
}

export async function deleteAccount(id: string) {
  const database = await openDB();
  await database.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
}

export async function listTransactionsByDate(dateISO: string): Promise<Transaction[]> {
  const database = await openDB();
  const res = await database.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE date = ? ORDER BY created_at DESC',
    [dateISO]
  );
  return res;
}

export async function listTransactionsBetween(startISO: string, endISO: string): Promise<Transaction[]> {
  const database = await openDB();
  const res = await database.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date ASC',
    [startISO, endISO]
  );
  return res;
}

export async function addTransaction(payload: Omit<Transaction, 'id' | 'created_at'>) {
  const database = await openDB();
  const id = uuid();
  const created_at = new Date().toISOString();
  await database.runAsync(
    'INSERT INTO transactions (id,type,amount,category,account_id,date,location,description,created_at) VALUES (?,?,?,?,?,?,?,?,?)',
    [id, payload.type, payload.amount, payload.category, payload.account_id, payload.date, payload.location ?? null, payload.description ?? null, created_at]
  );
  return id;
}

export async function updateTransaction(id: string, payload: Partial<Omit<Transaction, 'id' | 'created_at'>>) {
  const database = await openDB();
  const fields: string[] = [];
  const values: any[] = [];
  Object.entries(payload).forEach(([k, v]) => {
    fields.push(`${k} = ?`);
    values.push(v);
  });
  if (fields.length === 0) return;
  values.push(id);
  await database.runAsync(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteTransaction(id: string) {
  const database = await openDB();
  await database.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function backupToJSON() {
  const database = await openDB();
  const accounts = await database.getAllAsync<Account>('SELECT * FROM accounts');
  const transactions = await database.getAllAsync<Transaction>('SELECT * FROM transactions');
  return { accounts, transactions };
}

export async function restoreFromJSON(data: { accounts: Account[]; transactions: Transaction[] }) {
  const database = await openDB();
  await database.execAsync('BEGIN TRANSACTION');
  try {
    await database.execAsync('DELETE FROM transactions');
    await database.execAsync('DELETE FROM accounts');
    for (const a of data.accounts) {
      await database.runAsync(
        'INSERT INTO accounts (id,name,balance,icon,created_at) VALUES (?,?,?,?,?)',
        [a.id, a.name, a.balance, a.icon ?? null, a.created_at]
      );
    }
    for (const t of data.transactions) {
      await database.runAsync(
        'INSERT INTO transactions (id,type,amount,category,account_id,date,location,description,created_at) VALUES (?,?,?,?,?,?,?,?,?)',
        [t.id, t.type, t.amount, t.category, t.account_id, t.date, t.location ?? null, t.description ?? null, t.created_at]
      );
    }
    await database.execAsync('COMMIT');
  } catch (e) {
    await database.execAsync('ROLLBACK');
    throw e;
  }
}