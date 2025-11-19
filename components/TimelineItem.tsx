import CrossPressable from '@/components/CrossPressable';
import { TodayItem } from '@/constants/mock/today';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function TimelineItem({ item, onPress }: { item: TodayItem; onPress?: () => void }) {
  const color = item.type === 'income' ? '#34C759' : '#FF3B30';
  const circle = item.type === 'income' ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.15)';
  return (
    <CrossPressable style={styles.row} onPress={onPress}>
      <View style={[styles.leftCircle, { backgroundColor: circle }]}>
        <Text style={styles.emoji}>{item.icon || '📄'}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.time}>{item.time}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </View>
          <Text style={[styles.amount, { color }]}>{`${item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)} ¥`}</Text>
        </View>
        {(item.location || item.note) && (
          <View style={styles.subRow}>
            {item.location ? (
              <View style={styles.lineRow}>
                <Ionicons name="location-outline" size={14} color="#6A7282" />
                <Text style={styles.subText}>{item.location}</Text>
              </View>
            ) : null}
            {item.note ? (
              <View style={styles.lineRow}>
                <Ionicons name="document-text-outline" size={14} color="#6A7282" />
                <Text style={styles.subText}>{item.note}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </CrossPressable>
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