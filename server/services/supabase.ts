import { createClient, SupabaseClient } from '@supabase/supabase-js';

type AdminClient = SupabaseClient;

export function getAdminClient(): AdminClient {
  const url = process.env.SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !key) throw Object.assign(new Error('supabase_env_missing'), { status: 500, code: 50001 });
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function findUserByEmail(client: AdminClient, email: string) {
  try {
    const { data, error } = await (client.auth as any).admin.listUsers({ email });
    if (error) return null;
    const u = (data?.users || []).find((x: any) => x.email === email);
    return u || null;
  } catch {
    return null;
  }
}

export async function findUserByPhone(client: AdminClient, phone: string) {
  try {
    const { data, error } = await (client.auth as any).admin.listUsers();
    if (error) return null;
    const u = (data?.users || []).find((x: any) => x.user_metadata?.phone === phone);
    return u || null;
  } catch {
    return null;
  }
}

export async function createUserForEmail(client: AdminClient, email: string, password: string) {
  const { data, error } = await (client.auth as any).admin.createUser({ email, password, email_confirm: true });
  if (error) throw Object.assign(new Error('create_user_failed'), { status: 500, code: 50002, message: error.message });
  return data.user;
}

function aliasEmailForPhone(phone: string) {
  const domain = process.env.PHONE_ALIAS_DOMAIN || 'alias.local';
  return `${phone}@${domain}`;
}

export async function createUserForPhone(client: AdminClient, phone: string, password: string) {
  const email = aliasEmailForPhone(phone);
  const { data, error } = await (client.auth as any).admin.createUser({ email, password, email_confirm: true, user_metadata: { phone } });
  if (error) throw Object.assign(new Error('create_user_failed'), { status: 500, code: 50003, message: error.message });
  return data.user;
}

export async function signInWithEmail(email: string, password: string) {
  const url = process.env.SUPABASE_URL as string;
  const anon = process.env.SUPABASE_ANON_KEY as string;
  if (!url || !anon) return null;
  const client = createClient(url, anon, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) return null;
  return data.session;
}