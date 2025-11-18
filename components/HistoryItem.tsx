import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '@/db/sqlite/schema';
import { formatCurrency } from '@/utils/format';

function categoryEmoji(c: string) {
  const map: Record<string, string> = {
    '餐饮': '🍽️',
    '交通': '🚌',
    '购物': '🛍️',
    '娱乐': '🎮',
    '住房': '🏠',
    '医疗': '🩺',
    '教育': '🎓',
    '数码': '💻',
    '旅行': '✈️',
    '早餐': '🥐',
    '午餐': '🍱',
    '晚餐': '🍲',
    '咖啡': '☕️',
    '工资': '💰',
  };
  return map[c] ?? '💳';
}

function timeFromISO(iso: string) {
  try {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '';
  }
}

export default function HistoryItem({ item }: { item: Transaction }) {
  const color = item.type === 'income' ? '#34C759' : '#FF3B30';
  const circle = item.type === 'income' ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.15)';
  const time = timeFromISO(item.created_at);
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && Platform.select({ default: { opacity: 0.9 }, web: { transform: 'scale(0.99)' } })]}>
      <View style={[styles.leftCircle, { backgroundColor: circle }]}>
        <Text style={styles.emoji}>{categoryEmoji(item.category)}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {time ? <Text style={styles.time}>{time}</Text> : null}
            <Text style={styles.category}>{item.category}</Text>
          </View>
          <Text style={[styles.amount, { color }]}>{formatCurrency(item.amount, item.type)}</Text>
        </View>
        {(item.location || item.description) && (
          <View style={styles.subRow}>
            {item.location ? (
              <View style={styles.lineRow}>
                <Ionicons name="location-outline" size={14} color="#6A7282" />
                <Text style={styles.subText}>{item.location}</Text>
              </View>
            ) : null}
            {item.description ? (
              <View style={styles.lineRow}>
                <Ionicons name="document-text-outline" size={14} color="#6A7282" />
                <Text style={styles.subText}>{item.description}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  leftCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 24 },
  content: { flex: 1, marginLeft: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'column', alignItems: 'flex-start', gap: 2 },
  time: { fontSize: 12, color: '#6A7282', fontStyle: 'italic' },
  category: { fontSize: 16, color: '#101828' },
  amount: { fontSize: 20 },
  subRow: { flexDirection: 'column', gap: 4, marginTop: 4 },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subText: { fontSize: 12, color: '#6A7282' },
});