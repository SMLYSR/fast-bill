export type Account = {
  id: string;
  name: string;
  balance: number;
  icon?: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  account_id: string;
  date: string;
  location?: string;
  description?: string;
  created_at: string;
};

export const createTablesSQL = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  balance REAL NOT NULL DEFAULT 0,
  icon TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT CHECK(type IN ('income','expense')) NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  account_id TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT,
  description TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
`;