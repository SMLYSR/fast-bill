import { Account } from '@/db/sqlite/schema';
import { sb, withRetry } from './client';

export async function createAccount(payload: { name: string; balance?: number; icon?: string }): Promise<Account> {
  console.log('[rpc] create_account', payload);
  const res = await withRetry(async () => sb().rpc('create_account', { name: payload.name, balance: payload.balance ?? 0, icon: payload.icon ?? null }));
  const err = (res as any).error;
  if (err && String(err.message).includes('Could not find the function')) {
    const id = cryptoRandomId();
    const out = await sb().from('accounts').insert({ id, name: payload.name, balance: payload.balance ?? 0, icon: payload.icon ?? null }).select('*').single();
    if (out.error) throw new Error(out.error.message);
    return out.data as Account;
  }
  if (err) throw new Error(err.message);
  return (res as any).data as Account;
}

export async function readAccount(id: string): Promise<Account | null> {
  console.log('[rpc] read_account', { id });
  const res = await withRetry(async () => sb().rpc('read_account', { id }));
  const err = (res as any).error;
  if (err && String(err.message).includes('Could not find the function')) {
    const out = await sb().from('accounts').select('*').eq('id', id).single();
    if (out.error) throw new Error(out.error.message);
    return (out.data as Account) ?? null;
  }
  if (err) throw new Error(err.message);
  return ((res as any).data as Account) ?? null;
}

export async function updateAccount(id: string, patch: Partial<Pick<Account, 'name' | 'balance' | 'icon'>>): Promise<Account> {
  console.log('[rpc] update_account', { id, patch });
  const res = await withRetry(async () => sb().rpc('update_account', { id, name: patch.name ?? null, balance: patch.balance ?? null, icon: patch.icon ?? null }));
  const err = (res as any).error;
  if (err && String(err.message).includes('Could not find the function')) {
    const out = await sb().from('accounts').update(patch).eq('id', id).select('*').single();
    if (out.error) throw new Error(out.error.message);
    return out.data as Account;
  }
  if (err) throw new Error(err.message);
  return (res as any).data as Account;
}

export async function deleteAccount(id: string): Promise<void> {
  console.log('[rpc] delete_account', { id });
  const res = await withRetry(async () => sb().rpc('delete_account', { id }));
  const err = (res as any).error;
  if (err && String(err.message).includes('Could not find the function')) {
    const out = await sb().from('accounts').delete().eq('id', id);
    if (out.error) throw new Error(out.error.message);
    return;
  }
  if (err) throw new Error(err.message);
}

export async function listAccounts(limit = 100, offset = 0): Promise<Account[]> {
  console.log('[rpc] list_accounts', { limit, offset });
  const res = await withRetry(async () => sb().rpc('list_accounts', { limit_val: limit, offset_val: offset }));
  const err = (res as any).error;
  if (err && String(err.message).includes('Could not find the function')) {
    const out = await sb().from('accounts').select('*').order('created_at', { descending: true }).range(offset, offset + limit - 1);
    if (out.error) throw new Error(out.error.message);
    return (out.data as Account[]) ?? [];
  }
  if (err) throw new Error(err.message);
  return ((res as any).data as Account[]) ?? [];
}

function cryptoRandomId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}