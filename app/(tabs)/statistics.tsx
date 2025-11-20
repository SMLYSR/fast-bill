import CrossPressable from '@/components/CrossPressable';
import { Fonts } from '@/constants/theme';
import { useTransactionStore } from '@/store/useTransactionStore';
import { getDailySummary } from '@/supabase/transactions';
import { formatDateISO } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { addMonths, eachDayOfInterval, endOfMonth, startOfMonth } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Period = 'week' | 'month' | 'year';

export default function StatisticsScreen() {
  const [period, setPeriod] = useState<Period>('week');
  const [kind, setKind] = useState<'income' | 'expense'>('expense');
  const { transactions, loadBetween } = useTransactionStore();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(393, width - 32);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    if (period === 'week') start.setDate(now.getDate() - 6);
    if (period === 'month') start.setMonth(now.getMonth());
    if (period === 'year') start.setFullYear(now.getFullYear());
    loadBetween(formatDateISO(start), formatDateISO(now));
  }, [period]);

  // 统计图数据在组件内根据 period/kind 生成

  return (
    <View style={styles.container}>
      {/* Prominent Header Area */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>历史与统计</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }}>
        {/* Add some top spacing since header is now separate */}
        <View style={{ height: 16 }} />
        <CalendarCard maxW={maxW} routerPush={router.push} transactions={transactions} />
        <LineChartCard maxW={maxW} period={period} setPeriod={setPeriod} kind={kind} setKind={setKind} transactions={transactions} />
      </ScrollView>
    </View>
  );
}

function CalendarCard({ maxW, routerPush, transactions }: { maxW: number; routerPush: (path: string) => void; transactions: { type: 'income' | 'expense'; amount: number; date: string }[] }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const current = useMemo(() => addMonths(new Date(), monthOffset), [monthOffset]);
  const days = useMemo(() => eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) }), [current]);
  const [summary, setSummary] = useState<Record<string, { income: number; expense: number }>>({});

  useEffect(() => {
    const start = startOfMonth(current);
    const end = endOfMonth(current);
    getDailySummary(formatDateISO(start), formatDateISO(end)).then(res => {
      const map: Record<string, { income: number; expense: number }> = {};
      res.forEach(r => { map[r.date] = { income: r.income_sum, expense: r.expense_sum }; });
      setSummary(map);
    });
  }, [current]);

  const circleSize = 30;
  return (
    <View style={[styles.card, { width: maxW, alignSelf: 'center' }]}>
      <View style={styles.cardHeader}>
        <CrossPressable style={styles.chevBtn} onPress={() => setMonthOffset(o => o - 1)}>
          <Ionicons name="chevron-back" size={20} color="#0B0B0F" />
        </CrossPressable>
        <Text style={styles.monthText}>{`${current.getFullYear()}年${current.getMonth() + 1}月`}</Text>
        <CrossPressable style={styles.chevBtn} onPress={() => setMonthOffset(o => o + 1)}>
          <Ionicons name="chevron-forward" size={20} color="#0B0B0F" />
        </CrossPressable>
      </View>
      <View style={styles.weekRow}>
        {['日', '一', '二', '三', '四', '五', '六'].map(w => (
          <View key={w} style={styles.weekCell}><Text style={styles.weekText}>{w}</Text></View>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map(d => {
          const id = formatDateISO(d);
          const entry = summary[id];
          const display = getDayDisplay(id, transactions, entry);
          return (
            <CrossPressable key={id} style={styles.dayCell} onPress={() => routerPush(`/history/${id}`)}>
              <View style={[styles.dayCircle, { width: circleSize, height: circleSize }]}>
                <Text style={styles.dayNum}>{d.getDate()}</Text>
                <Text style={[styles.dayValIn, { color: display.color }]}>{display.text}</Text>
              </View>
            </CrossPressable>
          );
        })}
      </View>
    </View>
  );
}

function LineChartCard({ maxW, period, setPeriod, kind, setKind, transactions }: { maxW: number; period: Period; setPeriod: (p: Period) => void; kind: 'income' | 'expense'; setKind: (k: 'income' | 'expense') => void; transactions: { type: 'income' | 'expense'; amount: number; date: string }[] }) {
  const chartColor = kind === 'income' ? '#34C759' : '#FF3B30';
  const { data, labels } = buildSeriesWithLabels(period, kind, transactions);
  const total = data.reduce((s, p) => s + p.value, 0);
  const values = data.map(d => d.value).filter(v => v > 0);
  const maxVal = values.length > 0 ? Math.max(...values) : 0;
  const avg = data.length ? total / data.length : 0;

  // Chart dimensions
  // To ensure labels are not cut off, we use initialSpacing and endSpacing inside the chart
  // instead of just padding the container. This pushes the data points inward.
  // We still need some container padding for the chart itself.
  const cardPadding = 24;
  const chartContainerPadding = 12; // Reduced from 20 since we use spacing
  const availableWidth = maxW - (cardPadding * 2) - (chartContainerPadding * 2);

  // Spacing calculation
  const initialSpacing = 20;
  const endSpacing = 20;
  const usableWidth = availableWidth - initialSpacing - endSpacing;
  const spacing = data.length > 1 ? usableWidth / (data.length - 1) : usableWidth;

  // Y-Axis Scaling
  const { maxValue, noOfSections } = getYAxisScale(data);

  return (
    <View style={[styles.card, { width: maxW, alignSelf: 'center' }]}>
      {/* Segmented Control Style Tabs */}
      <View style={styles.lineHeader}>
        <View style={styles.segmentWrap}>
          <View style={styles.segmentOuter}>
            {(['week', 'month', 'year'] as Period[]).map(p => (
              <CrossPressable key={p} style={[styles.segmentInner, period === p && styles.segmentInnerActive]} onPress={() => setPeriod(p)}>
                <Text style={[styles.segmentLabel, period === p && styles.segmentLabelActive]}>{p === 'week' ? '周' : p === 'month' ? '月' : '年'}</Text>
              </CrossPressable>
            ))}
          </View>
        </View>
        <View style={styles.kindRow}>
          {(['income', 'expense'] as const).map(k => (
            <CrossPressable key={k} style={[styles.kindBtn, k === 'income' ? styles.kindIncome : styles.kindExpense, kind === k && styles.kindActive]} onPress={() => setKind(k)}>
              <Text style={[styles.kindText, kind === k && styles.kindTextActive]}>{k === 'income' ? '收入' : '支出'}</Text>
            </CrossPressable>
          ))}
        </View>
      </View>

      {/* Summary Above Chart */}
      <View style={styles.summaryBlock}>
        <Text style={styles.summaryLabel}>总{kind === 'income' ? '收入' : '支出'}: {total.toFixed(2)}</Text>
        <Text style={styles.summaryLabel}>平均值: {avg.toFixed(2)}</Text>
      </View>

      {/* Chart */}
      <View style={[styles.chartBox, { paddingHorizontal: chartContainerPadding }]}>
        <LineChart
          data={data}
          thickness={2}
          color={chartColor}
          curved
          curveType={1} // Smooth curve
          hideDataPoints={false}
          dataPointsRadius={4}
          dataPointsColor={chartColor}
          hideYAxisText
          hideAxesAndRules={false}
          hideRules
          xAxisColor="#E5E5EA"
          xAxisThickness={1}
          yAxisThickness={0}
          width={availableWidth}
          height={180}
          initialSpacing={initialSpacing}
          endSpacing={endSpacing}
          spacing={spacing}
          xAxisLabelTexts={labels}
          // Removed fixed width: 40 to allow labels to take necessary space without truncation
          // Added minWidth to ensure some consistency if needed, but usually auto is best for variable text
          xAxisLabelTextStyle={{ color: '#999', fontSize: 10, textAlign: 'center' }}
          yAxisLabelWidth={0}
          maxValue={maxValue}
          noOfSections={noOfSections}
          isAnimated={true}
          animationDuration={600}
          disableScroll
          // Interactive Tooltip Configuration
          pointerConfig={{
            pointerStripHeight: 160,
            pointerStripColor: 'lightgray',
            pointerStripWidth: 2,
            pointerColor: 'lightgray',
            radius: 6,
            pointerLabelWidth: 100,
            pointerLabelHeight: 90,
            activatePointersOnLongPress: false, // Activate on tap
            autoAdjustPointerLabelPosition: true,
            pointerLabelComponent: (items: any) => {
              const item = items[0];
              return (
                <View style={{
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  marginLeft: -30, // Center adjustment
                  marginTop: -10,
                }}>
                  <Text style={{ color: '#666', fontSize: 10, marginBottom: 2 }}>
                    {item.dateLabel}
                  </Text>
                  <Text style={{ color: '#333', fontSize: 12, fontWeight: '600' }}>
                    {item.value.toFixed(2)}
                  </Text>
                </View>
              );
            },
          }}
          // Average Value Reference Line (Dashed)
          showReferenceLine1
          referenceLine1Position={avg}
          referenceLine1Config={{ color: '#C7C7CC', dashWidth: 4, dashGap: 4, thickness: 1 }}
          // Max Value Reference Line (Dashed)
          showReferenceLine2
          referenceLine2Position={maxVal}
          referenceLine2Config={{ color: '#C7C7CC', dashWidth: 4, dashGap: 4, thickness: 1 }}
        />
        {/* Max Value Label (Top Right) */}
        {maxVal > 0 && (
          <Text style={{
            position: 'absolute',
            right: chartContainerPadding,
            top: 0,
            color: '#666',
            fontSize: 10
          }}>
            {maxVal.toFixed(2)}
          </Text>
        )}
        {/* Average Value Label (Right Side, aligned with reference line) */}
        {avg > 0 && (
          <Text style={{
            position: 'absolute',
            left: chartContainerPadding,
            top: 180 * (1 - avg / maxValue) - 6,
            color: '#999',
            fontSize: 10
          }}>
            平均值: {avg.toFixed(2)}
          </Text>
        )}
      </View>
    </View>
  );
}

function buildSeriesWithLabels(period: Period, kind: 'income' | 'expense', transactions: { type: 'income' | 'expense'; amount: number; date: string }[]) {
  const now = new Date();
  const hasData = transactions && transactions.length > 0;

  if (period === 'week') {
    // Natural Week: Monday to Sunday
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });

    const labels = days.map((_, i) => ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i]);
    const values = days.map((d, i) => {
      const id = formatDateISO(d);
      const sum = hasData ? transactions.filter(t => t.type === kind && t.date === id).reduce((s, t) => s + t.amount, 0) : 0;
      // Add dateLabel for tooltip
      const dateLabel = `${d.getMonth() + 1}月${d.getDate()}日 ${labels[i]}`;
      return { value: sum, dateLabel };
    });
    return { data: values, labels };
  }

  if (period === 'month') {
    // Natural Month: 1st to End of Month
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const daysInMonth = eachDayOfInterval({ start, end });

    const values = daysInMonth.map(d => {
      const id = formatDateISO(d);
      const sum = hasData ? transactions.filter(t => t.type === kind && t.date === id).reduce((s, t) => s + t.amount, 0) : 0;
      const dateLabel = `${d.getMonth() + 1}月${d.getDate()}日`;
      return { value: sum, dateLabel };
    });

    // Smart Labels: "01", "05", "10"...
    const labels = daysInMonth.map(d => {
      const date = d.getDate();
      if (date === 1 || date % 5 === 0) {
        return String(date).padStart(2, '0');
      }
      return ''; // Hide other labels
    });

    return { data: values, labels };
  }

  // Year: Jan to Dec
  const labels = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const values = labels.map((_, i) => {
    const prefix = `${now.getFullYear()}-${String(i + 1).padStart(2, '0')}-`;
    const sum = hasData ? transactions.filter(t => t.type === kind && t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0) : 0;
    const dateLabel = `${now.getFullYear()}年${i + 1}月`;
    return { value: sum, dateLabel };
  });

  return { data: values, labels };
}

function getDayDisplay(id: string, transactions: { type: 'income' | 'expense'; amount: number; date: string }[], mockEntry?: { income: number; expense: number }) {
  let inc = 0;
  let exp = 0;

  // Calculate from transactions (if available locally)
  const dayTs = transactions.filter(t => t.date === id);
  if (dayTs.length > 0) {
    inc = dayTs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    exp = dayTs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  }
  // Or use summary data if available (which is preferred for calendar view as it covers the whole month)
  else if (mockEntry) {
    inc = mockEntry.income || 0;
    exp = mockEntry.expense || 0;
  }

  const net = inc - exp;
  if (net > 0) return { text: `+${net.toFixed(0)}`, color: '#34C759' };
  if (net < 0) return { text: `${net.toFixed(0)}`, color: '#FF3B30' };

  return { text: '无', color: '#99A1AF' };
}

function getXLabels(period: Period) {
  if (period === 'week') return ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  if (period === 'month') return ['1日', '5日', '10日', '20日', '30日'];
  return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
}

function getYAxisScale(data: { value: number }[]) {
  const max = Math.max(0, ...data.map(d => d.value));
  if (max <= 0) return { maxValue: 10, noOfSections: 10 };
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const base = pow;
  const stepCandidates = [1, 2, 5, 10];
  let step = base;
  for (const s of stepCandidates) {
    const candidate = s * base;
    if (max / candidate <= 10) { step = candidate; break; }
  }
  const sections = Math.ceil(max / step);
  return { maxValue: sections * step, noOfSections: Math.min(Math.max(sections, 4), 10) };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' }, // Removed paddingHorizontal from container to allow full-width header
  headerContainer: {
    backgroundColor: '#fff',
    paddingBottom: 12, // Slightly reduced padding
    paddingHorizontal: 16,
    // Removed rounded corners to match History page style
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA', // Subtle separator line
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // Removed heavy shadow, using border instead for cleaner look
  },
  headerTitle: {
    fontSize: 17, // Standard navigation title size
    fontWeight: '600',
    color: '#101828',
    marginTop: 8,
    fontFamily: Fonts.rounded
  },
  // pageTitle style is removed as it's replaced by headerTitle
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, ...Platform.select({ web: { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)' } }) },
  // Calendar styles
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  chevBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
  monthText: { fontSize: 16, color: '#0B0B0F', fontWeight: '500' },
  weekRow: { flexDirection: 'row', marginTop: 4 },
  weekCell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4 },
  weekText: { color: '#6A7282', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, paddingVertical: 6, alignItems: 'center', gap: 4 },
  dayCircle: { borderRadius: 14, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, ...Platform.select({ web: { boxShadow: '0 2px 6px rgba(0,0,0,0.06)' } }) },
  dayNum: { color: '#1E2939', fontSize: 10 },
  dayValIn: { fontSize: 10, marginTop: 2 },
  // Line chart card
  lineHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  segmentWrap: {},
  segmentOuter: { backgroundColor: '#F3F4F6', borderRadius: 9999, padding: 4, flexDirection: 'row', minWidth: 180 },
  segmentInner: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 9999, backgroundColor: 'transparent', marginHorizontal: 2 },
  segmentInnerActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 },
  segmentLabel: { fontSize: 14, color: '#0A0A0A' },
  segmentLabelActive: { fontWeight: '600' },
  kindRow: { flexDirection: 'row', gap: 8 },
  kindBtn: { borderRadius: 9999, paddingVertical: 5, paddingHorizontal: 12 },
  kindIncome: { backgroundColor: '#34C759' },
  kindExpense: { backgroundColor: '#FF3B30' },
  kindActive: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4 },
  kindText: { color: '#fff', fontSize: 12 },
  kindTextActive: { fontWeight: '600' },
  chartBox: { marginTop: 8, backgroundColor: '#fff', borderRadius: 12, padding: 12, overflow: 'hidden', position: 'relative' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, height: 77 },
  sumCol: {},
  sumLabel: { color: '#6A7282', fontSize: 12 },
  sumValue: { fontSize: 24 },
  sumColRight: { alignItems: 'flex-end' },
  sumLabelRight: { color: '#6A7282', fontSize: 12 },
  avgValue: { color: '#364153', fontSize: 18 },

  // New Chart Styles
  summaryBlock: { paddingHorizontal: 24, marginBottom: 8, gap: 4 },
  summaryLabel: { fontSize: 13, color: '#6A7282' },
});