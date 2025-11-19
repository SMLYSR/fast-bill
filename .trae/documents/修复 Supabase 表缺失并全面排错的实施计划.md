## 问题诊断

* 报错“Could not find the table 'public.transactions' in the schema cache”说明 Supabase 项目未创建 `public.transactions` 表，或 API schema 缓存未刷新，或当前 anon key 无权访问（RLS/Policy/权限）。

* 先确保两张表（accounts、transactions）在 Supabase 中存在，字段类型与本地一致；其次启用并配置 RLS 策略；最后重建 API 缓存。

## 修复步骤（Supabase 控制台）

### 1) 创建表与索引

* 在 SQL 编辑器执行：

```sql
create table if not exists public.accounts (
  id text primary key,
  name text not null,
  balance real not null default 0,
  icon text,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id text primary key,
  type text not null check (type in ('income','expense')),
  amount real not null,
  category text not null,
  account_id text not null references public.accounts(id) on delete cascade,
  date text not null,
  location text,
  description text,
  created_at timestamptz not null default now()
);

-- 索引（提升统计与过滤性能）
create index if not exists idx_transactions_date on public.transactions(date);
create index if not exists idx_transactions_account on public.transactions(account_id);
create index if not exists idx_transactions_type_category on public.transactions(type, category);
create index if not exists idx_accounts_created on public.accounts(created_at);
```

### 2) 开启 RLS 并设置策略（示例：允许已认证用户读写自身数据；如需更严格可后续细化）

```sql
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;

create policy if not exists accounts_read on public.accounts
  for select using (true);
create policy if not exists accounts_write on public.accounts
  for insert with check (true);
create policy if not exists accounts_update on public.accounts
  for update using (true) with check (true);
create policy if not exists accounts_delete on public.accounts
  for delete using (true);

create policy if not exists transactions_read on public.transactions
  for select using (true);
create policy if not exists transactions_write on public.transactions
  for insert with check (true);
create policy if not exists transactions_update on public.transactions
  for update using (true) with check (true);
create policy if not exists transactions_delete on public.transactions
  for delete using (true);
```

> 注意：以上策略是开放示例，生产环境建议按 `auth.uid()` 绑定所有行的所有权（通过额外 `user_id` 字段或 `accounts` 归属），我可在后续为你加严。

### 3) 创建 RPC（可选，前端已做降级，但推荐使用 RPC）

```sql
create or replace function public.filter_transactions(filters jsonb, limit int default 200, offset int default 0)
returns setof public.transactions
language sql stable as $$
  select * from public.transactions t
  where (coalesce(filters ? 'type', false) = false or t.type = filters->>'type')
    and (coalesce(filters ? 'category', false) = false or t.category = filters->>'category')
    and (coalesce(filters ? 'account_id', false) = false or t.account_id = filters->>'account_id')
    and (coalesce(filters ? 'date', false) = false or t.date = filters->>'date')
    and (coalesce(filters ? 'start_date', false) = false or t.date >= filters->>'start_date')
    and (coalesce(filters ? 'end_date', false) = false or t.date <= filters->>'end_date')
  order by t.date asc, t.created_at asc
  offset offset limit limit;
$$;
```

* 执行完毕后，在 Dashboard → API 页点击“Reset API Cache”。

## 前端验证与调整

* 变量：确保 `EXPO_PUBLIC_SUPABASE_URL`、`EXPO_PUBLIC_SUPABASE_ANON_KEY` 已配置在 `.env` 或 `app.config.ts.extra`。

* 验证顺序：

  1. 打开首页与历史页，观察是否正常拉取（降级路径会直接查询 `public.transactions` 表）
  2. 新增交易与账户（`AddTransactionForm` + 账户接口），确认写入成功
  3. 切换统计页，检查按区间筛选与趋势图渲染

* 日志：已在服务层打印结构化日志（方法、入参、返回、异常），用于排查。

## 全项目静态与运行错误排查计划

* 静态检查：

  * 运行 ESLint 与 TypeScript 编译（修复重复样式键如 `formCard`、潜在未使用变量、错误导入路径）

  * 校验所有 `@/*` 路径指向新 Supabase 服务层，移除 `db/sqlite/*` 引用

* 运行时检查：

  * 页面导航与路由守卫（基于 Supabase 会话）是否工作

  * 登录页邮箱/密码输入校验与错误提示是否一致

  * 数据空态与 Loading 展示是否一致

  * 统计页响应时间：通过索引与 RPC，确保常规数据量 < 1s

## 交付

* 你执行上述 SQL 后，我将继续：

  * 验证前端降级路径工作，并改为首选 RPC

  * 完成统计页对 `supabase/stats.ts` 的接入（每日统计、趋势、余额、占比）

  * 运行并修复 ESLint/TS 的警告与错误，补齐 JSDoc 注释与测试用例

