## 差异定位
- 当前弹出按钮使用 Emoji（🤖/✍️）与系统字体，原型为相机/笔图标和中文标签（AI 记录/手动记账）。
- 主按钮打开后应显示白色「×」图标（蓝底），而非旋转加号。
- 子胶囊尺寸、圆角、阴影与文字排版需与原型一致；右侧有红/绿的货币符号装饰。
- 需保持统一 300ms 动画，并继续兼容 Web（避免 Responder 事件与 shadow* 警告）。

## 调整目标
1. 主按钮：蓝底圆形 56×56，关闭态为「＋」，开启态切换为「×」，图标白色。
2. 子胶囊：白底 160×48，圆角 24，左侧图标（相机/笔），右侧装饰「¥」（AI 记录为红色，手动记账为绿色），中间中文标签使用品牌字体。
3. 字体：统一使用 `Fonts.rounded`（iOS 对应 SF Rounded / Web fallback），字号 14，字重 500，颜色 `#0B0B0F`。
4. 阴影：原生保持当前 Shadow，Web 使用 `boxShadow` 改写。
5. 动效：维持现有平移与透明度动画（300ms），主按钮使用图标切换而非 45° 旋转以贴合原型。

## 具体实现
1. 图标替换
- 在 `components/FABCapsule.tsx` 引入 `Ionicons`：`import { Ionicons } from '@expo/vector-icons';`
- 子胶囊左侧：AI 记录 → `camera-outline`，手动记账 → `pencil-outline`，尺寸 18，颜色 `#667085`。
- 主按钮图标：关闭态 `add`，开启态 `close`（直接切换，不旋转）。

2. 结构与样式
- 胶囊结构：`[iconBox(24×24) | label("AI 记录"/"手动记账") | currencyMark("¥")]`，水平居中，左右内边距 14，元素间距 10。
- 新增 `styles.iconBox`（24×24，圆角 12，浅灰底 `#F3F4F6`，居中放置图标）。
- 文字样式：`fontFamily: Fonts.rounded`，`fontSize: 14`，`fontWeight: '500'`，`color: '#0B0B0F'`。
- 右侧货币符 `¥`：`fontSize: 16`，AI 红色 `#FF3B30`；手动记账绿色 `#34C759`。
- Web 阴影：在 `styles.main`、`styles.capsule` 添加 `boxShadow`（如 `0 6px 16px rgba(0,122,255,0.4)` 与 `0 4px 12px rgba(0,0,0,0.1)`）。

3. 行为逻辑
- 打开/关闭：保持 `open` 状态与 `fade/tx1/tx2` 动画。
- 主按钮图标切换：根据 `open` 直接渲染 `Ionicons` 名称，移除旋转插值。
- 点击事件：继续使用 `CrossPressable`，确保 Web 使用 `onClick`，避免控制台错误。

4. 接口与路由
- `onAI`：后续连接到 `/(modals)/ai-upload`（现阶段保留回调）。
- `onManual`：连接现有 `/(modals)/add-transaction`。

## 代码改动点（不立即执行）
- `components/FABCapsule.tsx`：
  - 引入 `Ionicons` 与 `Fonts`；调整主按钮图标切换；替换两处胶囊内部结构（移除 Emoji，加入 `iconBox`、中文标签、`¥` 装饰）；更新样式。
- 若需统一中文标签的字体回退，在 Web 设置 `fontFamily: Fonts.rounded || 'PingFang SC', 'Microsoft YaHei', sans-serif'`。

## 验收
- 视觉完全贴合原型：主按钮蓝底白「×」，子胶囊白底圆角、相机/笔图标、中文标签、红/绿「¥」装饰。
- 动效平滑，300ms；Web 控制台无未知事件与阴影警告。
- 移动端 375px 基线下布局与间距一致，胶囊与主按钮间距约 12。

## 风险与回退
- 字体在 Web 的可用性：若 `Fonts.rounded` 未加载，采用系统中文字体回退不影响布局。
- 若用户需要自定义图标库（如 `lucide-react-native`），可在后续替换 `Ionicons` 保持样式不变。