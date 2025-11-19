import { sb, withRetry } from './client';

export type DailySummaryRow = { date: string; income_sum: number; expense_sum: number; by_category: Record<string, { income?: number; expense?: number }> };
export type TrendRow = { month?: string; year?: number; income_sum: number; expense_sum: number };
export type BalanceRow = { date: string; balance: number };
export type CategoryRow = { category: string; amount_sum: number; percent: number };

export async function dailySummary(start_date: string, end_date: string, account_id?: string): Promise<DailySummaryRow[]> {
  console.log('[rpc] daily_summary', { start_date, end_date, account_id });
  const res = await withRetry(async () => sb().rpc('daily_summary', { start_date, end_date, account_id: account_id ?? null }));
  if ((res as any).error) throw new Error((res as any).error.message);
  return ((res as any).data as DailySummaryRow[]) ?? [];
}

export async function monthlyTrend(year: number, account_id?: string): Promise<TrendRow[]> {
  console.log('[rpc] monthly_trend', { year, account_id });
  const res = await withRetry(async () => sb().rpc('monthly_trend', { year, account_id: account_id ?? null }));
  if ((res as any).error) throw new Error((res as any).error.message);
  return ((res as any).data as TrendRow[]) ?? [];
}

export async function yearlyTrend(start_year: number, end_year: number, account_id?: string): Promise<TrendRow[]> {
  console.log('[rpc] yearly_trend', { start_year, end_year, account_id });
  const res = await withRetry(async () => sb().rpc('yearly_trend', { start_year, end_year, account_id: account_id ?? null }));
  if ((res as any).error) throw new Error((res as any).error.message);
  return ((res as any).data as TrendRow[]) ?? [];
}

export async function balanceHistory(start_date: string, end_date: string, account_id?: string): Promise<BalanceRow[]> {
  console.log('[rpc] balance_history', { start_date, end_date, account_id });
  const res = await withRetry(async () => sb().rpc('balance_history', { start_date, end_date, account_id: account_id ?? null }));
  if ((res as any).error) throw new Error((res as any).error.message);
  return ((res as any).data as BalanceRow[]) ?? [];
}

export async function categoryBreakdown(start_date: string, end_date: string, account_id: string | undefined, kind: 'income' | 'expense'): Promise<CategoryRow[]> {
  console.log('[rpc] category_breakdown', { start_date, end_date, account_id, kind });
  const res = await withRetry(async () => sb().rpc('category_breakdown', { start_date, end_date, account_id: account_id ?? null, kind }));
  if ((res as any).error) throw new Error((res as any).error.message);
  return ((res as any).data as CategoryRow[]) ?? [];
}