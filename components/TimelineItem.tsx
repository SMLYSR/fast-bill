import CrossPressable from '@/components/CrossPressable';
import { TodayItem } from '@/constants/mock/today';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function TimelineItem({ item, onPress }: { item: TodayItem; onPress?: () => void }) {
  const color = item.type === 'income' ? '#34C759' : '#FF3B30';
  const circle = item.type === 'income' ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.15)';
  return (
    <CrossPressable style={styles.container} onPress={onPress}>
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    ...Platform.select({ web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' } }),
  },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  icon: { fontSize: 20 },
  content: { flex: 1, marginRight: 8 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  category: { fontSize: 16, color: '#101828', fontWeight: '500' },
  amount: { fontSize: 16, fontWeight: '600' },
  rowBottom: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  time: { fontSize: 12, color: '#98A2B3' },
  location: { fontSize: 12, color: '#98A2B3' },
  note: { fontSize: 12, color: '#98A2B3', flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  leftCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'column', alignItems: 'flex-start', gap: 2 },
  subRow: { flexDirection: 'column', gap: 4, marginTop: 4 },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subText: { fontSize: 12, color: '#6A7282' },
});