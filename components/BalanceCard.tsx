import { View, Text, StyleSheet } from 'react-native';

export default function BalanceCard({ total, income, expense }: { total: number; income: number; expense: number }) {
  return (
    <View style={styles.card}>
      <View style={styles.col}>
        <Text style={[styles.label, { color: '#FFB800' }]}>总收支</Text>
        <Text style={styles.value}>{`${total.toFixed(2)} ¥`}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.col}>
        <Text style={[styles.label, { color: '#FF3B30' }]}>总支出</Text>
        <Text style={styles.value}>{`${(-expense).toFixed(2)} ¥`}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.col}>
        <Text style={[styles.label, { color: '#34C759' }]}>总收入</Text>
        <Text style={styles.value}>{`+${income.toFixed(2)} ¥`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  col: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: '#eee', height: '100%' },
  label: { fontSize: 12, marginBottom: 6 },
  value: { fontSize: 18, fontWeight: '500', color: '#111' },
});