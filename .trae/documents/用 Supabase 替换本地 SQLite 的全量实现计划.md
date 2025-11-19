## 数据模型与约束
- 表结构与本地一致（类型保持 text/real/timestamp 兼容）：
  - accounts(id text PK, name text, balance real default 0, icon text, created_at timestamp)
  - transactions(id text PK, type text CHECK('income'/'expense'), amount real, category text, account_id text FK→accounts(id) ON DELETE CASCADE, date text(YYYY-MM-DD), location text, description text, created_at timestamp)
- 索引：
  - transactions(date), transactions(account_id), transactions(type, category), accounts(created_at)

## RPC 设计（全部通过 supabase.rpc 调用）
- Accounts：
  1. create_account(name text, balance real, icon text) → returns account
  2. read_account(id text) → returns account
  3. update_account(id text, name?, balance?, icon?) → returns account
  4. delete_account(id text) → returns void
  5. list_accounts(limit int default 100, offset int default 0) → returns setof account
- Transactions：
  1. create_transaction(type text, amount real, category text, account_id text, date text, location text, description text) → returns transaction
  2. get_transaction(id text) → returns transaction
  3. update_transaction(id text, patch jsonb) → returns transaction（仅更新 patch 中字段）
  4. delete_transaction(id text) → returns void
  5. filter_transactions(filters jsonb, limit int default 200, offset int default 0) → returns setof transaction
- 统计 RPC：
  1. daily_summary(start_date text, end_date text, account_id text NULL) → returns rows(date, income_sum, expense_sum, by_category jsonb)
  2. monthly_trend(year int, account_id text NULL) → returns rows(month, income_sum, expense_sum)
  3. yearly_trend(start_year int, end_year int, account_id text NULL) → returns rows(year, income_sum, expense_sum)
  4. balance_history(start_date text, end_date text, account_id text NULL) → returns rows(date, balance)
  5. category_breakdown(start_date text, end_date text, account_id text NULL, kind text 'income'|'expense') → returns rows(category, amount_sum, percent)
- 错误码与日志：所有函数 `RAISE EXCEPTION` 返回特定 SQLSTATE；在前端打印结构化日志。
- 我会提供每个 RPC 的 SQL 定义（函数/视图与示例），你可直接在 Supabase SQL 编辑器执行。

## 前端代码改造
- 新增 `supabase/` 服务层：
  - `supabase/client.ts`：包装现有 `getSupabase()`，保证 EXPO_PUBLIC_* 变量读取与持久化；统一拦截器（重试）。
  - `supabase/accounts.ts`：封装 `createAccount/readAccount/updateAccount/deleteAccount/listAccounts`（调用 `rpc`）。
  - `supabase/transactions.ts`：封装 `createTransaction/getTransaction/updateTransaction/deleteTransaction/filterTransactions`。
  - `supabase/stats.ts`：封装统计 RPC（daily/monthly/yearly/balance/category）。
  - 错误处理：统一 `try/catch`，重试 3 次（指数退避），在失败时抛出带 `code/message/context` 的 Error。
- 类型定义：
  - 新增 `types/models.ts`，复制并强化现有 `Account`、`Transaction`、统计返回类型（TS 类型安全）。
- 数据访问层替换：
  - 替换 `store/useAccountStore.ts` 与 `store/useTransactionStore.ts` 的本地 SQLite 方法为 Supabase 服务层调用。
  - 移除/屏蔽所有 mock 数据（`constants/mock/*` 与页面内 fallback）。
- UI Loading/错误：
  - 在列表、详情、提交时加入 `loading` 状态与错误提示；页面/组件级别显示。
  - 统一日志打印（浏览器控制台 + 开发终端）

## 统计页面增强
- 首页与历史页面：
  - 使用 `daily_summary` 拉取所选日期范围统计（按账户可选）。
  - 列表数据来自 `filter_transactions` 带条件查询。
- 统计页：
  - 月/年维度趋势图：使用 `monthly_trend`、`yearly_trend`；可自定义时间范围（改为调用 `daily_summary` 合并为趋势）。
  - 余额变化曲线：使用 `balance_history`（按起始余额 + 交易累计）。
  - 分类占比饼图：使用 `category_breakdown`（收入/支出切换）。
- 性能目标：
  - RPC 查询加索引与聚合，单次响应 < 1s；必要时分页与范围限制。

## 错误处理与重试
- 前端服务层：
  - 对网络错误/5xx 实施指数退避重试（默认 3 次，50ms→200ms→600ms）。
  - 统一错误结构：`{ code, message, context }`，页面显示友好文案；控制台打印详细日志。

## 测试
- 单元测试（Jest）：
  - 服务层每个方法的参数校验与错误分支（mock `rpc` 返回）。
  - 统计方法的聚合逻辑在客户端拼装时的正确性（如百分比、余额曲线）。
- 集成测试：
  - 使用测试 Supabase 项目与 `EXPO_PUBLIC_*` 环境；跑 CRUD 与统计 RPC 的真实调用（带唯一前缀）。
- 性能测试：
  - 开发环境压测统计 RPC，验证 P95 < 1s（数据量使用 1w+ 行测试集）。

## 迁移与清理
- 移除 SQLite：
  - 删除 `db/sqlite/*` 与相关 imports；用 Supabase 服务替代。
- 清理 mock：
  - 移除 `constants/mock/*` 与页面内的 `mockForDate` 等 fallback。
- 验证：
  - 全应用路径（登录→首页→统计→历史→新增/编辑/删除）在 Supabase 数据下正常工作。

## 交付内容
- Supabase SQL 文件：全部 RPC（accounts/transactions/stats）函数定义与索引建议。
- 前端实现：完整服务层、类型、Store 改造、UI Loading/错误、日志。
- 测试：Jest 单测与基本集成测脚手架。
- 文档注释：每个服务方法/类型/RPC 调用均含 JSDoc（参数、错误、返回）。

## 风险与说明
- 由于“所有 Supabase 操作都经过 RPC 封装”，统计/过滤将优先在 SQL/函数侧执行，客户端仅做展示与少量变换。
- 若你的 Supabase 项目当前未创建这些函数，我会附完整 SQL；你需在控制台执行一次。

确认后我将：
1) 提交 RPC SQL 文件；2) 创建 `supabase/*` 服务层与类型；3) 替换 Stores 与页面调用；4) 移除 SQLite 与 mock；5) 补充 Loading/错误与日志；6) 添加测试并验证性能。