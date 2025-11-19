## 诊断
- 运行时报错极可能源于 `lib/supabase.ts` 读取 `process.env.SUPABASE_URL/ANON_KEY` 在 React Native/Web 端为 `undefined`，导致 `createClient` 初始化失败。
- Expo 环境下需使用 `EXPO_PUBLIC_` 前缀使变量在客户端可用（参考官方 RN 指南）。

## 修复方案
1. 更新 `lib/supabase.ts`：
- 改为读取 `process.env.EXPO_PUBLIC_SUPABASE_URL` 与 `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY`。
- 增加运行期防护：若缺失，抛出可读错误或在登录页显示友好提示。

2. 登录页增强保护：
- 在 `useSupabaseAuthStore.signIn` 内捕获初始化失败错误并反馈到 UI。
- 登录按钮在配置缺失时禁用，展示指引信息。

3. 验证
- 刷新 Web 预览，检查是否恢复渲染。
- 执行邮箱/密码登录流程，观察加载与错误提示是否正确。

## 交付
- 更新 `lib/supabase.ts` 环境变量读取与保护逻辑
- 适配登录页与 Store 的错误处理（禁用按钮、清晰提示）

若你确认，我将立即进行代码修复并验证。