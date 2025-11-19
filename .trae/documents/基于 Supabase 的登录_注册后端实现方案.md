## 架构与技术栈
- 后端框架：Node.js + Express（RESTful API）
- 鉴权：`@supabase/supabase-js`（使用 Service Role Key 进行服务器端管理）
- 令牌：直接使用 Supabase 返回的 `access_token`（JWT，默认短期有效）或以服务端签名颁发会话令牌（可选）
- 安全与限流：`express-rate-limit` + IP + 用户名维度；失败次数计数与锁定策略
- 日志：`pino` 或 `winston`，记录核心操作与错误
- 测试：Jest + Supertest（单测与集成测），压力测试使用 `autocannon` 或 `artillery`

## 环境变量
- `SUPABASE_URL`：Supabase 项目 URL
- `SUPABASE_SERVICE_ROLE_KEY`：服务端密钥（仅后端使用）
- `JWT_SECRET`（可选）：如需后端自签 JWT
- `RATE_LIMIT_WINDOW_MS`、`RATE_LIMIT_MAX_FAILS`：限流与暴力破解防护参数

## 目录与文件
- `server/`
  - `index.ts`：Express 启动入口
  - `routes/auth.ts`：`POST /api/auth/login` 路由
  - `services/supabase.ts`：Supabase 客户端与用户管理封装
  - `middleware/rateLimiter.ts`：限流与失败次数控制
  - `utils/validate.ts`：输入校验（邮箱、手机号、密码）
  - `utils/response.ts`：统一响应封装
  - `logger.ts`：日志
  - `tests/`：Jest + Supertest 集成测试；压力测试脚本

## 接口规范
- 路径与方法：`POST /api/auth/login`
- 请求体：`{ username: string, password: string }`
- 响应：
  - 成功（200）：`{ code: 0, message: 'ok', data: { token, user: { id, email, phone } } }`
  - 失败：
    - 400（校验失败）：`{ code: 40001, message }`
    - 401（密码不正确）：`{ code: 40101, message }`
    - 429（过多失败）：`{ code: 42901, message }`
    - 500（服务器错误）：`{ code: 50000, message }`

## 输入与校验
- 允许 `username` 为邮箱或中国大陆手机号（11位数字）
- 校验规则：
  - 邮箱：必须包含 `@` 和 `.` 且匹配标准邮箱正则
  - 手机：`^\d{11}$`
  - 密码：至少 8 位，必须包含字母与数字
- 校验失败直接返回 400

## 用户存在性检查
- 邮箱用户名：通过 `supabase.auth.admin.getUserByEmail(email)`（或 `listUsers` 过滤）
- 手机用户名：通过 `supabase.auth.admin.listUsers()`，匹配 `user_metadata.phone === username`
  - 若项目已开启 Phone Auth 并绑定身份，可根据 `identities` 搜索手机号身份；否则采用 `user_metadata.phone`

## 登录/注册流程
- 若用户存在：
  - 登录：`supabase.auth.signInWithPassword({ email, password })`
    - 手机路径：先通过元数据找到用户的邮箱，再走邮箱密码登录
  - 成功返回：`session.access_token`（JWT）与用户信息
  - 失败：记录失败次数，超过阈值返回 429
- 若用户不存在：
  - 注册：`supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { phone? } })`
    - 手机路径：使用“别名邮箱”模式：`<phone>@alias.local` 写入 `user_metadata.phone = <phone>`（满足邮箱登录 + 密码要求，同时保留手机号）
  - 注册成功后立即 `signInWithPassword`，返回令牌

## 安全策略
- 密钥管理：仅后端持有 `SERVICE_ROLE_KEY`；客户端不暴露
- 密码加密：使用 Supabase Auth 内置安全存储（bcrypt）
- 防暴力破解：
  - 以 `IP + username` 为维度统计失败次数
  - 例如：15 分钟窗口内最多 5 次失败；超限锁定 15 分钟
  - 失败计数在登录成功后清零
- 令牌有效期：使用 Supabase 默认 `access_token`（短期有效，通常 1 小时）；如需更长会话，结合 `refresh_token` 或服务端自签二级会话令牌（可选）

## 组件封装（“访问外部均封装一个组件”）
- `services/supabase.ts`
  - `getClient()`：返回服务端 Supabase 客户端
  - `findUserByEmail(email)`、`findUserByPhone(phone)`
  - `createUserForEmail(email, password, metadata)`、`createUserForPhone(phone, password)`（生成别名邮箱写入 `user_metadata.phone`）
  - `signInWithEmail(email, password)`：返回 session（含 token）
- `middleware/rateLimiter.ts`
  - 从 `req.ip` 和 `username` 派生键
  - 失败记数与锁定；支持内存或 Redis（生产建议 Redis）

## 路由与错误处理示例流程
1. 解析并校验 `username` 与 `password`
2. 检查是否被锁定（429）
3. 查询用户是否存在（邮箱或手机号）
4. 存在 → 调用 `signInWithPassword` 验证密码
   - 成功：返回 200（token + user）
   - 失败：累计失败次数；未超限返回 401；超限返回 429
5. 不存在 → 自动注册，并登录后返回 200（token + user）
6. 错误：统一回复（标准错误码与 message），日志记录 `username`、IP、错误类型

## 测试方案
- 单元测试（Jest）：
  - `utils/validate.ts`：邮箱/手机号/密码校验
  - 失败次数与锁定策略逻辑（模拟多次失败）
  - 响应格式化
- 集成测试（Supertest + Supabase 测试项目）：
  - 场景：
    - 首次邮箱登录（自动注册）→ 返回 token
    - 已存在邮箱登录（密码正确/错误）→ 200 / 401 / 429
    - 手机号路径（自动注册别名邮箱 + 登录）→ 返回 token
  - 每次测试使用唯一邮箱/手机号前缀（防污染）
- 压力测试：`autocannon`/`artillery`
  - 目标：QPS、P95/P99 延迟、错误率
  - 负载模型：混合登录/注册请求比例（例如 80% 登录，20% 注册）

## 可交付物
- 完整的后端代码（含路由、服务封装、限流与日志）
- `.env.example`（所需环境变量示例）与配置说明
- Jest 单测与 Supertest 集成测，压力测试脚本与报告模板
- `npm scripts`：`dev`（本地启动）、`test`、`test:int`、`perf`

## 上线与配置
- Supabase 控制台开启邮箱登录；如需手机号支持，采用“别名邮箱 + metadata.phone”方案或配置 OTP 流（本方案按密码要求选用别名邮箱）
- 部署到可运行 Node 的平台（Render/Fly/自托管），确保环境变量安全

## 后续可选增强
- 使用 Redis 持久化失败计数与锁定状态
- 增加登录审计（审计表 + 设备指纹）
- 引入 Web Application Firewall（WAF）与 IP 黑名单

请确认方案后，我将落地具体代码与测试，并在项目中创建 `server/` 目录提交实现。