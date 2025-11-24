import { Transaction } from '@/db/sqlite/schema';
import { sb, withRetry } from './client';

export async function createTransaction(payload: Omit<Transaction, 'id' | 'created_at' | 'user_id'>): Promise<Transaction> {
  console.log('[rpc] create_transaction', payload);
  const res = await withRetry(async () => sb().rpc('create_transaction', { ...payload }));
  if ((res as any).error) throw new Error((res as any).error.message);
  return (res as any).data as Transaction;
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  console.log('[rpc] get_transaction', { id });
  const res = await withRetry(async () => sb().rpc('get_transaction', { id }));
  if ((res as any).error) throw new Error((res as any).error.message);
  return ((res as any).data as Transaction) ?? null;
}

export async function updateTransaction(id: string, patch: Partial<Omit<Transaction, 'id' | 'created_at' | 'user_id'>>): Promise<Transaction> {
  console.log('[rpc] update_transaction', { id, patch });
  const res = await withRetry(async () => sb().rpc('update_transaction', { id, patch }));
  if ((res as any).error) throw new Error((res as any).error.message);
  return (res as any).data as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  console.log('[rpc] delete_transaction', { id });
  const res = await withRetry(async () => sb().rpc('delete_transaction', { id }));
  if ((res as any).error) throw new Error((res as any).error.message);
}

export async function filterTransactions(filters: Partial<Pick<Transaction, 'type' | 'category' | 'account_id' | 'date'>> & { start_date?: string; end_date?: string }, limit = 200, offset = 0): Promise<Transaction[]> {
  console.log('[rpc] filter_transactions', { filters, limit, offset });
  const res = await withRetry(async () => sb().rpc('filter_transactions', { filters, limit_val: limit, offset_val: offset }));
  const err = (res as any).error;
  if (err && String(err.message).includes('Could not find the function')) {
    console.log('[fallback] querying table transactions');
    let q = sb().from('transactions').select('*').order('date', { ascending: true }).order('created_at', { ascending: true }).range(offset, offset + limit - 1);
    if (filters.type) q = q.eq('type', filters.type);
    if (filters.category) q = q.eq('category', filters.category);
    if (filters.account_id) q = q.eq('account_id', filters.account_id);
    if (filters.date) q = q.eq('date', filters.date);
    if (filters.start_date) q = q.gte('date', filters.start_date);
    if (filters.end_date) q = q.lte('date', filters.end_date);
    const out = await q;
    if (out.error) throw new Error(out.error.message);
    return (out.data as Transaction[]) ?? [];
  }
  if (err) throw new Error(err.message);
  return ((res as any).data as Transaction[]) ?? [];
}

export async function listTransactionsByDate(dateISO: string, limit = 10, offset = 0): Promise<Transaction[]> {
  return filterTransactions({ date: dateISO }, limit, offset);
}

export async function listTransactionsBetween(startISO: string, endISO: string): Promise<Transaction[]> {
  return filterTransactions({ start_date: startISO, end_date: endISO }, 200, 0);
}

export async function getDailySummary(startISO: string, endISO: string): Promise<{ date: string; income_sum: number; expense_sum: number }[]> {
  console.log('[client] daily_summary aggregation', { startISO, endISO });
  const txs = await listTransactionsBetween(startISO, endISO);
  const map = new Map<string, { date: string; income_sum: number; expense_sum: number }>();

  txs.forEach(t => {
    const d = t.date;
    if (!map.has(d)) {
      map.set(d, { date: d, income_sum: 0, expense_sum: 0 });
    }
    const entry = map.get(d)!;
    if (t.type === 'income') entry.income_sum += t.amount;
    else if (t.type === 'expense') entry.expense_sum += t.amount;
  });

  return Array.from(map.values());
}