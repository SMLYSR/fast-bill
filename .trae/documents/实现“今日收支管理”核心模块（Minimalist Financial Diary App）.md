## 目标与范围
- 在 `/(tabs)/index.tsx` 完整实现“今日收支管理”界面，覆盖顶部汇总、流水明细、右下悬浮操作、记录输入弹窗（AI/手动）与交互规则。
- 动效统一 300ms（登录品牌露出保持 600–800ms），移动优先，兼容 375px 与 768px 断点。

## 数据模型与状态
- 事务字段扩展：在现有 `Transaction` 增加可选 `payment_method?: string`（满足支出表单）。
- 原生端：`db/sqlite/schema.ts`/`database.native.ts` 增加列并通过 `ALTER TABLE` 迁移；Web 端：`database.web.ts` 扩展存储键 JSON 结构。
- 统计与分页：在 `store/useTransactionStore.ts` 增加当日统计选择器（总额/收入/支出/占比）与分页加载（limit/offset）。

## 顶部汇总展示区
- 组件：`components/SummaryCard.tsx`（或升级现有 `BalanceCard`）
  - 三分栏：总收支（黄 `#FFB800`）、总支出（红 `#FF3B30`）、总收入（绿 `#34C759`）。
  - 显示收入/支出占比（百分比，保留 1 位小数）。
  - 柔和阴影与较大圆角；自适字号不跳变；单位 `¥` 后置，收入带 `+`。

## 中部流水明细区
- 将 `index.tsx` 改为 `FlatList`：
  - 数据源：当日交易按时间倒序（精确到分钟）。
  - 列表项复用 `components/TransactionItem.tsx`，左侧半透明圆形底色（绿/红），右侧显示时间/类别/金额；下方地点/备注行（小图标）。
  - 下拉刷新：`RefreshControl` 触发 `loadByDate(today)`；
  - 上拉加载更多：`onEndReached` 触发 `loadMore()`（分页拼接）。
  - 骨架屏与懒加载：首次加载显示占位骨架。

## 右下角悬浮操作按钮
- 升级 `components/FloatingActionButton.tsx`：
  - 主按钮点击旋转 `45°`；
  - 从右向左平滑弹出两个“胶囊”次级按钮（带图标+文字）：`AI 记录`、`手动记录`；
  - 带半透明遮罩，点击遮罩收起；
  - 动效统一 300ms，Easing 统一。

## 记录输入弹窗（DailyFlow）
- 新建/升级两个模态：
  - `app/(modals)/ai-upload.tsx`：上传收支截图（`expo-image-picker`），显示“选择图片”按钮与加载状态；目前作为占位，不入库。
  - 升级 `app/(modals)/add-transaction.tsx`：
    - 类型切换：支出/收入；
    - 字段：金额（数字键盘）、分类、支付方式（仅支出）、备注、时间选择器；
    - 校验：金额>0、分类必选；错误提示在输入下方；
    - 提交：显示加载指示，成功后刷新顶部汇总与列表并关闭模态。

## 动效与响应式
- 动效：进入/显隐/展开/切换均为 300ms；列表项入场 `opacity+y`；主按钮旋转 45° 与子按钮淡入位移；遮罩淡入。
- 响应式：容器居中窄宽度，375px 基准；768px 增加间距与字号；触控尺寸保持友好。
- 减少动效偏好：仅淡入，无位移。

## 路由与入口
- `index.tsx`：
  - 头部显示“今日 + 日期（周几）”；
  - 浮动返回顶部按钮（滚动出现）；
  - FAB 打开 `/(modals)/ai-upload` 或 `/(modals)/add-transaction`。
- 在 `app/_layout.tsx` 注册 `ai-upload` 模态。

## 验证与测试
- 验收：三分栏数值与颜色规则、列表项内容结构、FAB 动效与次级按钮展示、模态遮罩与校验提示、提交后的实时刷新。
- 基础测试：为 `useTransactionStore` 的统计计算与分页函数编写单元测试；为格式化/占比计算编写工具测试。

## 修改文件清单
- `db/sqlite/schema.ts`、`db/sqlite/database.native.ts`、`db/sqlite/database.web.ts`：增加 `payment_method` 与迁移。
- `store/useTransactionStore.ts`：统计/分页/加载状态。
- `components/SummaryCard.tsx`（或更新 `BalanceCard.tsx`）、`components/TransactionItem.tsx` 升级显示占比与图标行。
- `components/FloatingActionButton.tsx`：子按钮与遮罩。
- `app/(tabs)/index.tsx`：重构为 `FlatList`，添加刷新与加载更多，接入新组件与 FAB。
- `app/(modals)/ai-upload.tsx`：新增；`app/(modals)/add-transaction.tsx`：扩展字段与校验。
- `utils/format.ts`：增加百分比计算与时间格式化到分钟。
- `app/_layout.tsx`：注册新模态路由。

## 交付
- 完成页面与交互实现，统一动效 300ms；响应式与可访问性符合规范；核心功能测试通过。

如确认，我将按此计划开始实现，并在实现后进行端到端验证与预览。