<!-- 1d9a06b8-bd4b-4fa2-b583-f1e0eb64d6e7 c4f865bc-d89d-42e0-9bfc-4613f010b36c -->
# 每日流水记账App完整实现

## 1. 安装依赖包

安装必需的依赖：

- `expo-sqlite` - 本地数据库
- `nativewind` 和 `tailwindcss` - 样式
- `zustand` - 状态管理
- `date-fns` - 日期处理
- `lucide-react-native` - 图标
- `react-native-gifted-charts` - 图表展示
- `sonner-native` - Toast提示

## 2. 数据库设计与初始化

**创建 `db/sqlite/schema.ts`**
定义数据库表结构：

- `accounts` 表：账户信息（id, name, balance, icon, created_at）
- `transactions` 表：交易记录（id, type, amount, category, account_id, date, location, description, created_at）

**创建 `db/sqlite/database.ts`**

- 初始化SQLite数据库连接
- 创建表结构
- 提供CRUD操作的工具函数

## 3. 状态管理

**创建 `store/useAccountStore.ts`**

- 账户列表状态
- 每日收支/总余额计算
- 账户CRUD操作

**创建 `store/useTransactionStore.ts`**

- 交易记录列表
- 收入/支出统计
- 交易CRUD操作

## 4. 实现三个Tab页面

**修改 `app/(tabs)/_layout.tsx`**
创建3个tab：

- 首页 (index) - house图标
- 统计 (statistics) - chart-bar图标  
- 我的 (profile) - user图标

**创建 `app/(tabs)/index.tsx` - 首页**

- 顶部今日总余额卡片（显示今日总余额、收入、支出）
- 下部为今日流水明细的时间线，纵向布局
- 右下角浮动添加按钮（+常规表单、文本输入、上传交易图片）

**创建 `app/(tabs)/statistics.tsx` - 统计页面**

- 标题栏「统计」
- 时间周期切换（每周/每月/每年）
- 柱状图展示支出数据
- 账单列表展示

**创建 `app/(tabs)/profile.tsx` - 我的页面**

- 头像和邮箱显示
- 功能列表：编辑资料、界面设置、隐私政策、登出

## 5. 模态框页面

**创建 `app/(modals)/add-transaction.tsx`**
添加/编辑账单表单：

- 类型选择（支出/收入）
- 类别选择（下拉菜单）
- 日期选择
- 金额输入
- 位置信息输入
- 描述输入（可选）
- 提交按钮

## 6. 可复用组件

**创建 `components/BalanceCard.tsx`**

- 总余额卡片组件
- 显示总余额、收入、支出

**创建 `components/TransactionItem.tsx`**

- 交易记录列表项
- 显示类别图标、名称、金额、日期

**创建 `components/AccountItem.tsx`**

- 账户列表项组件
- 显示图标、名称、余额

**创建 `components/FloatingActionButton.tsx`**

- 右下角浮动按钮组
- 主按钮+子按钮展开动画

**创建 `components/CategoryPicker.tsx`**

- 类别选择器
- 预定义类别（餐饮、交通、购物、娱乐等）

## 7. 工具函数

**创建 `utils/format.ts`**

- 货币格式化函数
- 日期格式化函数

**创建 `utils/categories.ts`**

- 预定义支出类别
- 类别图标映射

## 8. 样式配置

**配置 `tailwind.config.js`**

- 配置主题色：pink-400, sky-400
- 配置dark mode

**更新 `constants/theme.ts`**

- 添加应用主题色配置

### To-dos

- [ ] 安装所有必需的npm包（expo-sqlite、nativewind、zustand、date-fns、lucide-react-native、react-native-gifted-charts等）
- [ ] 配置NativeWind和Tailwind CSS，包括tailwind.config.js和babel配置
- [ ] 创建数据库schema定义和初始化逻辑（db/sqlite目录）
- [ ] 创建Zustand状态管理stores（账户和交易）
- [ ] 更新tab布局，创建3个tab页面（首页、统计、我的）
- [ ] 实现首页：总余额卡片、最近账单列表、浮动按钮
- [ ] 实现统计页面：图表展示、时间筛选、账单列表
- [ ] 实现个人资料页面：用户信息、设置选项
- [ ] 创建可复用组件（BalanceCard、TransactionItem、AccountItem、FloatingActionButton等）
- [ ] 创建工具函数（格式化、类别定义等）