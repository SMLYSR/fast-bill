## 目标
- 在 `app/(auth)/login.tsx` 完成邮箱/密码的登录 UI 与交互
- 集成 Supabase SDK，调用 `signInWithPassword`，管理会话并持久化
- 友好错误提示、加载状态、登录成功后自动重定向到受保护页
- 基本输入校验；说明 CSRF 在 RN/Token 场景的适用性并提供 Web 端防护思路

## 变更与新增文件
1. 新增 `lib/supabase.ts`
- 初始化 Supabase 客户端：`createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true } })`
- 导出 `supabase`

2. 新增 `store/useSupabaseAuthStore.ts`
- 状态：`session`, `user`, `loading`, `error`
- 方法：`hydrate()`（启动时读取现有会话）、`signIn(email, password)`、`signOut()`
- 监听 `supabase.auth.onAuthStateChange`，及时更新会话
- 持久化：依赖 Supabase 自带 AsyncStorage 持久化

3. 修改 `app/_layout.tsx`
- 使用 Supabase 会话判断受保护路由访问：优先 `session`，无会话则进入 `(auth)`，有会话进入 `(tabs)`
- 保留现有 `useAuthStore` 逻辑作为兜底（兼容现有 Demo），但实际以 Supabase 为主

4. 修改 `app/(auth)/login.tsx`
- UI：保留现有结构，新增/替换邮箱与密码输入、加载指示、错误消息展示
- 交互：点击 “登录” → 校验邮箱/密码 → `signIn` → 成功后 `router.replace('/')`
- 输入校验：邮箱正则、密码强度（≥8、含字母+数字）；错误提示聚合在 UI
- 安全：
  - RN 环境为 Token 持久化，不使用 Cookie，CSRF 风险较低；
  - Web 端可补充：添加隐藏 `csrfToken` 并在自有后端校验（如调用自建 API 时）；对 Supabase 直连 `signInWithPassword` 无 Cookie，不适用传统 CSRF
  - 敏感信息不落盘（仅通过 Supabase 管理的会话存储）

5. 测试与验证
- 交互测试：在登录页手动测试成功/失败（密码错误等）
- 会话验证：重启 App/刷新 Web，保持登录状态（Supabase 持久化）
- 兼容性：iOS/Android/Web 均验证基本交互
- 可选：新增 `app/tests-auth.tsx` 开发页，自动跑一次登录流程（仅在环境变量存在时启用）

## 完成标准
- 登录按钮触发 Supabase 认证，成功返回会话并重定向至首页
- 错误提示清晰，加载状态明显
- 会话跨设备持久化；路由守卫基于 Supabase 会话生效

## 参考实现要点
- Supabase RN 官方示例模式（`signInWithPassword` 与持久化）
- 将现有 AsyncStorage 用户态迁移/兼容到 Supabase 会话主导

确认后我将：
- 创建 `lib/supabase.ts` 与 `store/useSupabaseAuthStore.ts`
- 更新 `_layout.tsx` 守卫
- 改造登录页交互并完成验证，以及必要的开发测试页（可选）