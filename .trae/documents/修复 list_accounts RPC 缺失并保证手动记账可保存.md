## 问题
- 保存时调用账户列表，前端使用 `rpc('list_accounts')`，但 Supabase 未创建该 RPC，抛出 “Could not find the function public.list_accounts(limit, offset)”。

## 解决方案
1) 前端容错与降级
- 为 `supabase/accounts.ts` 所有方法添加降级：当 RPC 不存在或报错时，自动改为 `from('accounts')` 表查询/写入，确保功能可用。
  - listAccounts → `from('accounts').select('*').order('created_at', { descending: true }).range(offset, offset+limit-1)`
  - createAccount → `from('accounts').insert({...}).select('*').single()`（生成 id 与 created_at 由客户端/服务端）
  - readAccount/updateAccount/deleteAccount 同理以表操作实现
- 打印结构化日志以便排查（入参、返回、异常）。

2) 手动记账默认账户策略
- 在 `AddTransactionForm` 保存时，如果当前无账户：
  - 先刷新账户列表；若仍为空，自动创建“默认账户”，并使用新账户 id 保存交易。
- 保证用户无需先创建账户也能完成记账。

3) 验证
- 打开手动记账弹窗，输入数据并保存：
  - 若无账户，自动创建并保存；
  - 若 RPC 缺失，使用表查询/写入也可正常完成。

4) 后续建议（可选）
- 在 Supabase 控制台创建 `list_accounts` RPC 并 Reset API Cache，前端将自动回切到 RPC 路径。

如你确认，我将立即实现上述代码改动并完成验证。