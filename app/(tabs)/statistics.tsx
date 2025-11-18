import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform, ScrollView } from 'react-native';
import CrossPressable from '@/components/CrossPressable';
import { useTransactionStore } from '@/store/useTransactionStore';
import { formatDateISO } from '@/utils/format';
import { LineChart } from 'react-native-gifted-charts';
import { Colors, Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { eachDayOfInterval, endOfMonth, startOfMonth, addMonths } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

type Period = 'week' | 'month' | 'year';

export default function StatisticsScreen() {
  const [period, setPeriod] = useState<Period>('week');
  const [kind, setKind] = useState<'income' | 'expense'>('expense');
  const { transactions, loadBetween } = useTransactionStore();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const maxW = Math.min(393, width - 32);

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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={[styles.pageTitle, { width: maxW, alignSelf: 'center' }]}>历史与统计</Text>
      <CalendarCard maxW={maxW} routerPush={router.push} transactions={transactions} />
      <LineChartCard maxW={maxW} period={period} setPeriod={setPeriod} kind={kind} setKind={setKind} transactions={transactions} />
    </ScrollView>
  );
}

function CalendarCard({ maxW, routerPush, transactions }: { maxW: number; routerPush: (path: string) => void; transactions: { type: 'income'|'expense'; amount: number; date: string }[] }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const base = new Date();
  const current = addMonths(base, monthOffset);
  const days = useMemo(() => eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) }), [current]);
  const mock = useMemo(() => getMonthlyMock(current), [current]);
  const circleSize = 30;
  return (
    <View style={[styles.card, { width: maxW, alignSelf: 'center' }] }>
      <View style={styles.cardHeader}>
        <CrossPressable style={styles.chevBtn} onPress={() => setMonthOffset(o => o - 1)}>
          <Ionicons name="chevron-back" size={20} color="#0B0B0F" />
        </CrossPressable>
        <Text style={styles.monthText}>{`${current.getFullYear()}年${current.getMonth()+1}月`}</Text>
        <CrossPressable style={styles.chevBtn} onPress={() => setMonthOffset(o => o + 1)}>
          <Ionicons name="chevron-forward" size={20} color="#0B0B0F" />
        </CrossPressable>
      </View>
      <View style={styles.weekRow}>
        {['日','一','二','三','四','五','六'].map(w => (
          <View key={w} style={styles.weekCell}><Text style={styles.weekText}>{w}</Text></View>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map(d => {
          const id = formatDateISO(d);
          const entry = mock[id];
          const display = getDayDisplay(id, transactions, entry);
          return (
            <CrossPressable key={id} style={styles.dayCell} onPress={() => routerPush(`/history/${id}`)}>
              <View style={[styles.dayCircle, { width: circleSize, height: circleSize }] }>
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

function LineChartCard({ maxW, period, setPeriod, kind, setKind, transactions }: { maxW: number; period: Period; setPeriod: (p:Period)=>void; kind: 'income'|'expense'; setKind: (k:'income'|'expense')=>void; transactions: { type: 'income'|'expense'; amount: number; date: string }[] }) {
  const chartColor = kind === 'income' ? '#34C759' : '#FF3B30';
  const { data, labels } = buildSeriesWithLabels(period, kind, transactions);
  const total = data.reduce((s, p) => s + p.value, 0);
  const avg = data.length ? total / data.length : 0;
  const chartW = Math.max(240, maxW - 48);
  const filtered = data.filter(p => p.value > 0);
  const dataForChart = filtered.length ? data : Array(labels.length).fill(0).map(() => ({ value: 0 }));
  const spacing = labels.length > 1 ? chartW / (labels.length - 1) : chartW;
  return (
    <View style={[styles.card, { width: maxW }] }>
      <View style={styles.lineHeader}>
        <View style={styles.segmentWrap}>
          <View style={styles.segmentOuter}>
            {(['week','month','year'] as Period[]).map(p => (
              <CrossPressable key={p} style={[styles.segmentInner, period===p && styles.segmentInnerActive]} onPress={() => setPeriod(p)}>
                <Text style={[styles.segmentLabel, period===p && styles.segmentLabelActive]}>{p==='week'?'周':p==='month'?'月':'年'}</Text>
              </CrossPressable>
            ))}
          </View>
        </View>
        <View style={styles.kindRow}>
          {(['income','expense'] as const).map(k => (
            <CrossPressable key={k} style={[styles.kindBtn, k==='income'?styles.kindIncome:styles.kindExpense, kind===k && styles.kindActive]} onPress={() => setKind(k)}>
              <Text style={[styles.kindText, kind===k && styles.kindTextActive]}>{k==='income'?'收入':'支出'}</Text>
            </CrossPressable>
          ))}
        </View>
      </View>
      <View style={styles.chartBox}>
        <LineChart
          data={dataForChart}
          thickness={3}
          hideDataPoints={filtered.length === 0}
          dataPointsRadius={4}
          focusedDataPointRadius={4}
          color={filtered.length === 0 ? 'transparent' : chartColor}
          curved
          yAxisTextStyle={{ color: '#999' }}
          xAxisTextStyle={{ color: '#999' }}
          hideRules={false}
          rulesColor={'#eee'}
          rulesType={'dashed'}
          width={chartW}
          height={216}
          initialSpacing={0}
          spacing={spacing}
          xAxisLabelTexts={labels}
          isAnimated={false}
        />
      </View>
      <View style={styles.summaryRow}>
        <View style={styles.sumCol}>
          <Text style={styles.sumLabel}>{kind==='expense'?'本期总支出':'本期总收入'}</Text>
          <Text style={[styles.sumValue, { color: kind==='income'?'#34C759':'#FF3B30' }]}>¥{total.toFixed(2)}</Text>
        </View>
        <View style={styles.sumColRight}>
          <Text style={styles.sumLabelRight}>日均</Text>
          <Text style={styles.avgValue}>¥{avg.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

function getMonthlyMock(current: Date): Record<string, { type: 'income'|'expense'|'none'; value?: number }> {
  const res: Record<string, { type: 'income'|'expense'|'none'; value?: number }> = {};
  const start = startOfMonth(current); const end = endOfMonth(current);
  eachDayOfInterval({ start, end }).forEach((d, idx) => {
    const day = d.getDate();
    if ([1,2,5,8,9,12,14,15,18,20,22,24,28,30].includes(day)) {
      const map: Record<number, number> = {1:45,2:120,5:89,8:4955,9:234,12:56,14:200,15:145,18:67,20:234,22:89,24:156,28:234,30:123};
      const val = map[day] ?? 0;
      res[formatDateISO(d)] = { type: day===8||day===14 ? 'income' : 'expense', value: val };
    } else {
      res[formatDateISO(d)] = { type: 'none' };
    }
  });
  return res;
}

function buildSeriesWithLabels(period: Period, kind: 'income'|'expense', transactions: { type: 'income'|'expense'; amount: number; date: string }[]) {
  const now = new Date();
  const hasData = transactions && transactions.length > 0;
  if (period === 'week') {
    const start = new Date(now); start.setDate(now.getDate() - 6);
    const days = eachDayOfInterval({ start, end: now });
    const labels = days.map(d => ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()]);
    const values = days.map(d => {
      const id = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const sum = hasData ? transactions.filter(t => t.type === kind && t.date === id).reduce((s, t) => s + t.amount, 0) : 0;
      return { value: sum };
    });
    return { data: values, labels };
  }
  if (period === 'month') {
    const y = now.getFullYear(); const m = String(now.getMonth()+1).padStart(2,'0');
    const last = endOfMonth(now).getDate();
    const daysSel = [1,5,10,20,30].map(d => Math.min(d, last));
    const labels = daysSel.map(d => `${d}日`);
    const values = daysSel.map(d => {
      const id = `${y}-${m}-${String(d).padStart(2,'0')}`;
      const sum = hasData ? transactions.filter(t => t.type === kind && t.date === id).reduce((s, t) => s + t.amount, 0) : 0;
      return { value: sum };
    });
    return { data: values, labels };
  }
  // year
  const labels = Array.from({ length: 12 }, (_, i) => `${i+1}月`);
  const values = labels.map((lab, i) => {
    const prefix = `${now.getFullYear()}-${String(i+1).padStart(2,'0')}-`;
    const sum = hasData ? transactions.filter(t => t.type === kind && t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0) : 0;
    return { value: sum };
  });
  return { data: values, labels };
}

function getDayDisplay(id: string, transactions: { type: 'income'|'expense'; amount: number; date: string }[], mockEntry?: { type: 'income'|'expense'|'none'; value?: number }) {
  const dayTs = transactions.filter(t => t.date === id);
  const exp = dayTs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const inc = dayTs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  if (exp > 0) return { text: `-${exp}`, color: '#FF3B30' };
  if (inc > 0) return { text: `+${inc}`, color: '#34C759' };
  if (mockEntry) {
    if (mockEntry.type === 'expense' && (mockEntry.value ?? 0) > 0) return { text: `-${mockEntry.value}`, color: '#FF3B30' };
    if (mockEntry.type === 'income' && (mockEntry.value ?? 0) > 0) return { text: `+${mockEntry.value}`, color: '#34C759' };
  }
  return { text: '无', color: '#99A1AF' };
}

function getXLabels(period: Period) {
  if (period === 'week') return ['周一','周二','周三','周四','周五','周六','周日'];
  if (period === 'month') return ['1日','5日','10日','20日','30日'];
  return ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 16 },
  pageTitle: { fontSize: 20, fontWeight: '500', color: '#101828', textAlign: 'center', marginTop: 24, marginBottom: 16, fontFamily: Fonts.rounded },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, ...Platform.select({ web: { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)' } }) },
  // Calendar styles
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  chevBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
  monthText: { fontSize: 16, color: '#0B0B0F', fontWeight: '500' },
  weekRow: { flexDirection: 'row', marginTop: 4 },
  weekCell: { width: `${100/7}%`, alignItems: 'center', paddingVertical: 4 },
  weekText: { color: '#6A7282', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100/7}%`, paddingVertical: 6, alignItems: 'center', gap: 4 },
  dayCircle: { borderRadius: 14, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, ...Platform.select({ web: { boxShadow: '0 2px 6px rgba(0,0,0,0.06)' } }) },
  dayNum: { color: '#1E2939', fontSize: 10 },
  dayValIn: { fontSize: 10, marginTop: 2 },
  // Line chart card
  lineHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  segmentWrap: { },
  segmentOuter: { backgroundColor: '#F3F4F6', borderRadius: 9999, padding: 4, flexDirection: 'row', minWidth: 180 },
  segmentInner: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 9999, backgroundColor: '#fff', marginHorizontal: 2 },
  segmentInnerActive: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 },
  segmentLabel: { fontSize: 14, color: '#0A0A0A' },
  segmentLabelActive: { fontWeight: '600' },
  kindRow: { flexDirection: 'row', gap: 8 },
  kindBtn: { borderRadius: 9999, paddingVertical: 5, paddingHorizontal: 12 },
  kindIncome: { backgroundColor: '#34C759' },
  kindExpense: { backgroundColor: '#FF3B30' },
  kindActive: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4 },
  kindText: { color: '#fff', fontSize: 12 },
  kindTextActive: { fontWeight: '600' },
  chartBox: { marginTop: 8, backgroundColor: '#fff', borderRadius: 12, padding: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, height: 77 },
  sumCol: { },
  sumLabel: { color: '#6A7282', fontSize: 12 },
  sumValue: { fontSize: 24 },
  sumColRight: { alignItems: 'flex-end' },
  sumLabelRight: { color: '#6A7282', fontSize: 12 },
  avgValue: { color: '#364153', fontSize: 18 },
});