## 问题
- 目前保存时调用 `rpc('create_transaction')`，但 Supabase 项目未创建该 RPC，报错导致无法新增交易。

## 解决方案
- 在前端 `supabase/transactions.ts` 中为 `createTransaction` 添加容错降级：
  - 当返回错误包含“Could not find the function”时，自动改为直接向 `public.transactions` 表执行插入（`from('transactions').insert({...}).select('*').single()`）。
  - 生成 `id`（uuid）并让 `created_at` 使用表默认值（或按需传入）。
  - 保留结构化日志与错误抛出，接口返回完整的交易对象。
- 同步在 `updateTransaction` 已做降级（若 RPC 缺失使用表更新），保证编辑也可用。

## 验证
- 打开手动记账弹窗，填入内容后保存：
  - 若 RPC 仍未创建，前端会走表插入路径完成保存；页面不再报错。
  - 控制台输出：`[rpc] create_transaction {...}` → 若函数缺失 → `[fallback] inserting into transactions`，随后返回新增记录。

## 备注
- 长期建议仍在 Supabase 控制台创建 `create_transaction` RPC 并 Reset API 缓存；前端将在函数存在时自动使用 RPC。