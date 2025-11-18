## 目标
- 今日页右下角 `+` 展开后的两个圆形按钮可点击，并在“当前页面”以模态弹窗方式出现。
- 两个弹窗样式严格对齐你提供的原型：
  - 弹窗一：上传收支截图（AI 一键记录），居中白色圆角卡片、相机图标、标题、副标题、主按钮“选择图片”、右上角关闭。
  - 弹窗二：手动记账，顶部“支出/收入”切换、金额/时间/类别/地点/备注输入、底部主按钮“保存”。

## 现状与接线点
- FAB 组件：`components/FABCapsule.tsx:7–27, 31–57` 已提供 `onAI` 与 `onManual` 两个回调，展开遮罩与动画完整。
- 今日页：`app/(tabs)/index.tsx:43` 已挂载 `<FABCapsule onAI={() => {}} onManual={() => {}} />`，但尚未接线。
- 现有路由模态：`app/(modals)/add-transaction.tsx:10–26, 28–47` 为“手动记账”路由模态，具备完整表单与保存逻辑。

## 具体改动
1. 在今日页内实现两个“页内模态”（不跳路由）：
   - 在 `app/(tabs)/index.tsx` 增加本地状态 `aiVisible`, `manualVisible` 与开闭函数。
   - 将 `FABCapsule` 的 `onAI`/`onManual` 分别绑定为 `setAiVisible(true)` 与 `setManualVisible(true)`；点击遮罩或右上角关闭按钮关闭。
   - 使用 React Native `Modal` + 居中卡片视图实现遮罩与弹出层。

2. 复用并抽取“手动记账”表单为共享组件：
   - 从 `app/(modals)/add-transaction.tsx` 抽取核心表单为 `components/AddTransactionForm.tsx`（保留 `type/amount/category/date/location/description` 状态与 `onSave` 写库逻辑）。
   - 原路由文件改为简单包裹该表单以保持原功能；今日页模态也直接渲染该表单组件，以满足“一页内弹窗”。

3. 新增“上传收支截图”页内模态组件：
   - 在今日页定义 `UploadReceiptModal`（文件内本地组件即可，避免不必要文件增加）。
   - 内容包含：相机图标（`Ionicons`）、标题“上传收支截图”、副标题“AI 一键记录”、主按钮“选择图片”、右上角关闭按钮。
   - 目前仅实现样式与交互；图片选择功能预留（如需接入将增添 `expo-image-picker` 并实现解析流程）。

## 样式细节
- 遮罩：`rgba(0,0,0,0.35)` 全屏；点击遮罩关闭。
- 卡片：白色背景、`borderRadius: 24`、居中、内边距 20–24；阴影 `shadowOpacity: 0.18/shadowRadius: 12`，web 端 `boxShadow: '0 12px 32px rgba(16,24,40,0.18)'`。
- 颜色：主按钮 `#007AFF`，支出 `#FF3B30`，收入 `#34C759`；文本用 `#101828/#667085`。
- 布局：卡片宽度约移动端 88–90%（最大 360），按钮圆角 24，字体大小对照原型。

## 动效与交互
- 保留现有 FAB 展开/收起动效；点击子按钮时先收起 FAB（复用 `toggle()`），再打开对应页内模态。
- 模态淡入淡出：`Animated` 透明度 0→1/1→0，时长 200–300ms。
- 关闭方式：点击遮罩、右上角 `X`、手动记账保存成功后自动关闭。

## 数据与保存
- “手动记账”表单沿用现有保存逻辑：`useTransactionStore.add` → 本地数据库；成功后关闭模态并刷新今日列表（保持与当前首页 mock 数据兼容）。
- “上传收支截图”当前仅样式与入口，选择图片逻辑待你确认是否接入解析（可后续迭代）。

## 文件级改动清单
- `app/(tabs)/index.tsx`：
  - 增加 `aiVisible`, `manualVisible` 状态与两个 `Modal` JSX。
  - 为 `FABCapsule` 绑定 `onAI/onManual` 回调。
- `components/AddTransactionForm.tsx`（新增）：
  - 从 `app/(modals)/add-transaction.tsx` 抽取表单与保存逻辑，导出可复用组件。
- `app/(modals)/add-transaction.tsx`：
  - 改为引入并渲染 `AddTransactionForm`，保持原路由模态仍可使用。

## 验证与回归
- Web 与模拟器验证：点击 `+` → 展开 → 点击两个子按钮分别出现对应页内模态；遮罩与关闭行为正常；“保存”能写库并关闭。
- 视觉对齐：对照原型核验边距、圆角、颜色、阴影；必要时微调间距。
- 无破坏性：不影响原路由模态；FAB 动画与返回顶部按钮保持现状。

如你确认该方案，我将按上述改动实施并推送具体代码。