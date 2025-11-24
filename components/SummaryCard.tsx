import FitText from '@/components/FitText';
import { Fonts } from '@/constants/theme';
import { Transaction } from '@/db/sqlite/schema';
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function SummaryCard({ transactions, titleLabel = '今日总收/支' }: { transactions: Transaction[]; titleLabel?: string }) {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  const total = income + expense;
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerIcon}>💰</Text>
        <Text style={styles.headerText}>{titleLabel}</Text>
      </View>
      <View style={styles.rows}>
        <View style={styles.col}>
          <Text style={[styles.label, { color: '#FFB800' }]}>总收支</Text>
          <FitText text={`${net >= 0 ? '+' : ''}${net.toFixed(2)}\u00A0¥`} color={'#FFB800'} baseSize={18} weight={'600'} containerStyle={{ maxWidth: '90%' }} minScale={0.75} />
        </View>
        <View style={styles.divider} />
        <View style={styles.col}>
          <Text style={[styles.label, { color: '#FF3B30' }]}>总支出</Text>
          <FitText text={`${expense.toFixed(2)}\u00A0¥`} color={'#FF3B30'} baseSize={18} weight={'600'} containerStyle={{ maxWidth: '90%' }} minScale={0.75} />
        </View>
        <View style={styles.divider} />
        <View style={styles.col}>
          <Text style={[styles.label, { color: '#34C759' }]}>总收入</Text>
          <FitText text={`${income.toFixed(2)}\u00A0¥`} color={'#34C759'} baseSize={18} weight={'600'} containerStyle={{ maxWidth: '90%' }} minScale={0.75} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 16, marginHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, ...Platform.select({ web: { boxShadow: '0 12px 32px rgba(16,24,40,0.12)' } }) },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  headerIcon: { fontSize: 20 },
  headerText: { marginLeft: 8, color: '#667085', fontFamily: Platform.select({ ios: Fonts.rounded, web: 'SF Pro Rounded, PingFang SC, Microsoft YaHei, sans-serif', default: undefined }) as any },
  rows: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  label: { fontSize: 12, color: '#6A7282' },
  value: { fontSize: 18, fontWeight: '600', textAlign: 'center', maxWidth: '90%' },
  divider: { width: 2, height: 48, backgroundColor: '#E5E7EB', borderRadius: 1 },
});