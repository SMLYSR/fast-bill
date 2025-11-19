-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ACCOUNTS TABLE
create table if not exists public.accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) default auth.uid() not null,
  name text not null,
  balance numeric not null default 0,
  icon text,
  created_at timestamptz default now() not null
);

-- TRANSACTIONS TABLE
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) default auth.uid() not null,
  account_id uuid references public.accounts(id) on delete cascade not null,
  type text check (type in ('income', 'expense')) not null,
  amount numeric not null,
  category text not null,
  date date not null,
  location text,
  description text,
  created_at timestamptz default now() not null
);

-- RLS POLICIES
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;

-- Accounts Policies
create policy "Users can view their own accounts"
  on public.accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own accounts"
  on public.accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own accounts"
  on public.accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own accounts"
  on public.accounts for delete
  using (auth.uid() = user_id);

-- Transactions Policies
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);


-- RPC FUNCTIONS

-- create_account
create or replace function create_account(name text, balance numeric, icon text)
returns json as $$
declare
  new_account record;
begin
  insert into public.accounts (name, balance, icon)
  values (name, balance, icon)
  returning * into new_account;
  
  return row_to_json(new_account);
end;
$$ language plpgsql security definer;

-- read_account
create or replace function read_account(id uuid)
returns json as $$
declare
  acc record;
begin
  select * from public.accounts where public.accounts.id = read_account.id and user_id = auth.uid() into acc;
  return row_to_json(acc);
end;
$$ language plpgsql security definer;

-- update_account
create or replace function update_account(id uuid, name text default null, balance numeric default null, icon text default null)
returns json as $$
declare
  updated_account record;
begin
  update public.accounts
  set
    name = coalesce(update_account.name, public.accounts.name),
    balance = coalesce(update_account.balance, public.accounts.balance),
    icon = coalesce(update_account.icon, public.accounts.icon)
  where public.accounts.id = update_account.id and user_id = auth.uid()
  returning * into updated_account;
  
  return row_to_json(updated_account);
end;
$$ language plpgsql security definer;

-- delete_account
create or replace function delete_account(id uuid)
returns void as $$
begin
  delete from public.accounts where public.accounts.id = delete_account.id and user_id = auth.uid();
end;
$$ language plpgsql security definer;

-- list_accounts
create or replace function list_accounts(limit_val int default 100, offset_val int default 0)
returns json as $$
declare
  result json;
begin
  select json_agg(t) from (
    select * from public.accounts
    where user_id = auth.uid()
    order by created_at desc
    limit limit_val offset offset_val
  ) t into result;
  return coalesce(result, '[]'::json);
end;
$$ language plpgsql security definer;

-- create_transaction
create or replace function create_transaction(
  account_id uuid,
  type text,
  amount numeric,
  category text,
  date date,
  location text default null,
  description text default null
)
returns json as $$
declare
  new_tx record;
begin
  insert into public.transactions (account_id, type, amount, category, date, location, description)
  values (account_id, type, amount, category, date, location, description)
  returning * into new_tx;
  
  return row_to_json(new_tx);
end;
$$ language plpgsql security definer;

-- get_transaction
create or replace function get_transaction(id uuid)
returns json as $$
declare
  tx record;
begin
  select * from public.transactions where public.transactions.id = get_transaction.id and user_id = auth.uid() into tx;
  return row_to_json(tx);
end;
$$ language plpgsql security definer;

-- update_transaction
create or replace function update_transaction(
  id uuid,
  patch json
)
returns json as $$
declare
  updated_tx record;
begin
  update public.transactions
  set
    account_id = coalesce((patch->>'account_id')::uuid, account_id),
    type = coalesce(patch->>'type', type),
    amount = coalesce((patch->>'amount')::numeric, amount),
    category = coalesce(patch->>'category', category),
    date = coalesce((patch->>'date')::date, date),
    location = coalesce(patch->>'location', location),
    description = coalesce(patch->>'description', description)
  where public.transactions.id = update_transaction.id and user_id = auth.uid()
  returning * into updated_tx;
  
  return row_to_json(updated_tx);
end;
$$ language plpgsql security definer;

-- delete_transaction
create or replace function delete_transaction(id uuid)
returns void as $$
begin
  delete from public.transactions where public.transactions.id = delete_transaction.id and user_id = auth.uid();
end;
$$ language plpgsql security definer;

-- filter_transactions
create or replace function filter_transactions(
  filters json,
  limit_val int default 200,
  offset_val int default 0
)
returns json as $$
declare
  result json;
begin
  select json_agg(t) from (
    select * from public.transactions
    where user_id = auth.uid()
    and (filters->>'type' is null or type = filters->>'type')
    and (filters->>'category' is null or category = filters->>'category')
    and (filters->>'account_id' is null or account_id = (filters->>'account_id')::uuid)
    and (filters->>'date' is null or date = (filters->>'date')::date)
    and (filters->>'start_date' is null or date >= (filters->>'start_date')::date)
    and (filters->>'end_date' is null or date <= (filters->>'end_date')::date)
    order by date desc, created_at desc
    limit limit_val offset offset_val
  ) t into result;
  return coalesce(result, '[]'::json);
end;
$$ language plpgsql security definer;


-- STATS FUNCTIONS

-- daily_summary
create or replace function daily_summary(start_date date, end_date date, account_id uuid default null)
returns json as $$
declare
  result json;
begin
  select json_agg(t) from (
    select 
      date,
      sum(case when type = 'income' then amount else 0 end) as income_sum,
      sum(case when type = 'expense' then amount else 0 end) as expense_sum,
      json_object_agg(category, json_build_object(
        'income', sum(case when type = 'income' then amount else 0 end),
        'expense', sum(case when type = 'expense' then amount else 0 end)
      )) as by_category
    from public.transactions
    where user_id = auth.uid()
    and date >= start_date and date <= end_date
    and (daily_summary.account_id is null or transactions.account_id = daily_summary.account_id)
    group by date
    order by date
  ) t into result;
  return coalesce(result, '[]'::json);
end;
$$ language plpgsql security definer;

-- monthly_trend
create or replace function monthly_trend(year int, account_id uuid default null)
returns json as $$
declare
  result json;
begin
  select json_agg(t) from (
    select 
      to_char(date, 'YYYY-MM') as month,
      sum(case when type = 'income' then amount else 0 end) as income_sum,
      sum(case when type = 'expense' then amount else 0 end) as expense_sum
    from public.transactions
    where user_id = auth.uid()
    and extract(year from date) = monthly_trend.year
    and (monthly_trend.account_id is null or transactions.account_id = monthly_trend.account_id)
    group by to_char(date, 'YYYY-MM')
    order by month
  ) t into result;
  return coalesce(result, '[]'::json);
end;
$$ language plpgsql security definer;

-- yearly_trend
create or replace function yearly_trend(start_year int, end_year int, account_id uuid default null)
returns json as $$
declare
  result json;
begin
  select json_agg(t) from (
    select 
      extract(year from date) as year,
      sum(case when type = 'income' then amount else 0 end) as income_sum,
      sum(case when type = 'expense' then amount else 0 end) as expense_sum
    from public.transactions
    where user_id = auth.uid()
    and extract(year from date) >= start_year
    and extract(year from date) <= end_year
    and (yearly_trend.account_id is null or transactions.account_id = yearly_trend.account_id)
    group by extract(year from date)
    order by year
  ) t into result;
  return coalesce(result, '[]'::json);
end;
$$ language plpgsql security definer;

-- category_breakdown
create or replace function category_breakdown(start_date date, end_date date, account_id uuid default null, kind text default 'expense')
returns json as $$
declare
  result json;
  total numeric;
begin
  -- Calculate total for percentage
  select sum(amount) from public.transactions
  where user_id = auth.uid()
  and date >= start_date and date <= end_date
  and type = kind
  and (category_breakdown.account_id is null or transactions.account_id = category_breakdown.account_id)
  into total;

  select json_agg(t) from (
    select 
      category,
      sum(amount) as amount_sum,
      case when total > 0 then round((sum(amount) / total * 100), 2) else 0 end as percent
    from public.transactions
    where user_id = auth.uid()
    and date >= start_date and date <= end_date
    and type = kind
    and (category_breakdown.account_id is null or transactions.account_id = category_breakdown.account_id)
    group by category
    order by amount_sum desc
  ) t into result;
  return coalesce(result, '[]'::json);
end;
$$ language plpgsql security definer;

-- balance_history
create or replace function balance_history(start_date date, end_date date, account_id uuid default null)
returns json as $$
declare
  result json;
begin
  -- This is a bit complex because we need running balance. 
  -- For simplicity, we'll just return the daily net change for now, 
  -- or we can calculate it if we know the starting balance.
  -- Assuming the frontend just wants daily balance snapshots.
  
  -- Strategy: Calculate cumulative sum ordered by date.
  -- Note: This might be slow for large datasets.
  
  select json_agg(t) from (
    select 
      date,
      sum(case when type = 'income' then amount else -amount end) as balance
    from public.transactions
    where user_id = auth.uid()
    and date >= start_date and date <= end_date
    and (balance_history.account_id is null or transactions.account_id = balance_history.account_id)
    group by date
    order by date
  ) t into result;
  
  return coalesce(result, '[]'::json);
end;
$$ language plpgsql security definer;
