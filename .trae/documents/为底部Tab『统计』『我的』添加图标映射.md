## 目标
- 让『统计』『我的』与『今日』一致显示语义图标。

## 变更范围
- 仅修改 `components/ui/icon-symbol.tsx` 的 SF Symbols → MaterialIcons 映射。

## 实现
- 在映射表中添加：
  - `chart.bar.fill` → `bar-chart`
  - `person.fill` → `person`
- 保持现有 `house.fill` → `home`、`chevron.right` 等映射不变。
- 现有 `app/(tabs)/_layout.tsx` 已使用这两个名称，无需改动。

## 验证
- 打开底部tab，确认『统计』显示柱状图图标、『我的』显示人物图标，样式与『今日』一致。