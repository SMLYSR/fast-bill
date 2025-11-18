## 目标
- 使用本地 Mock 数据实现登录；登录成功跳转至首页（今日）。
- 在“我的”页面点击退出登录后跳转回登录页。
- 加入轻量路由守卫：未登录只能访问 `(auth)/login`；已登录访问 `(tabs)`。

## 变更范围
1. 新增：`store/useAuthStore.ts`
2. 修改：`app/_layout.tsx`（路由守卫）
3. 修改：`app/(auth)/login.tsx`（登录按钮接入）
4. 修改：`app/(tabs)/profile.tsx`（退出登录按钮接入）

## 实现步骤
### 步骤 1：创建认证状态（Mock）
- 新增 `store/useAuthStore.ts`（Zustand + AsyncStorage）：
  - 状态：`user: string | null`、`loading: boolean`。
  - 方法：`hydrate()` 从 `AsyncStorage` 恢复；`login(name)` 保存用户名并更新状态；`logout()` 清除存储并置空。

### 步骤 2：在根布局添加路由守卫
- 编辑 `app/_layout.tsx`：
  - 引入 `useRouter`、`useSegments` 与 `useAuthStore`。
  - `useEffect` 首次运行 `hydrate()`；当 `loading` 结束后根据 `segments` 与 `user` 判断：
    - 未登录且不在 `(auth)`：`router.replace('/(auth)/login')`。
    - 已登录且在 `(auth)`：`router.replace('/')`（锚点到 Tabs）。
  - 保持原有 `Stack` 注册。

### 步骤 3：接入登录页交互
- 编辑 `app/(auth)/login.tsx`：
  - 引入 `useAuthStore` 与 `useRouter`。
  - 登录按钮 `onPress`：`await login(username); router.replace('/')`。
  - 维持原有 UI 与禁用态（例如用户名为空时禁用）。

### 步骤 4：接入“我的”页退出登录
- 编辑 `app/(tabs)/profile.tsx`：
  - 引入 `useAuthStore` 与 `useRouter`。
  - 退出按钮 `onPress`：`await logout(); router.replace('/(auth)/login')`。

## 交互与细节
- 防闪烁：在 `loading` 为 `true` 期间不进行跳转，待 `hydrate` 完毕后再决定。
- 导航方式使用 `replace`，避免历史堆栈残留导致返回异常。
- Mock 用户名直接取登录输入框文本；无需后端。

## 验证方案
- 启动 Web 端：未登录应自动重定向到登录页；输入用户名点击登录后进入“今日”页面。
- 切到“我的”页，点击退出登录后返回登录页；刷新后仍为未登录状态。
- 在移动端模拟器运行做同样验证（AsyncStorage 跨平台可用）。

## 下一步
- 如需持久显示用户信息，可在“我的”页读取 `useAuthStore.user`；后续可扩展为 token/过期策略。

请确认是否按以上方案实施，我将提交对应代码改动。