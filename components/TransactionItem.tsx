import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '@/db/sqlite/schema';

export default function TransactionItem({ item }: { item: Transaction }) {
  const color = item.type === 'income' ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 59, 48, 0.2)';
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.content}>
        <View style={styles.head}>
          <Text style={styles.time}>{item.date}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={[styles.amount, { color: item.type === 'income' ? '#34C759' : '#FF3B30' }]}>
            {item.type === 'income' ? `+${item.amount.toFixed(2)} ¥` : `-${item.amount.toFixed(2)} ¥`}
          </Text>
        </View>
        {(item.location || item.description) && (
          <View style={styles.sub}>
            <Text style={styles.subText}>{[item.location, item.description].filter(Boolean).join(' · ')}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  dot: { width: 28, height: 28, borderRadius: 14, marginRight: 12 },
  content: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { fontStyle: 'italic', color: '#666' },
  category: { color: '#333' },
  amount: { fontWeight: '500' },
  sub: { marginTop: 4 },
  subText: { color: '#888', fontSize: 12 },
});