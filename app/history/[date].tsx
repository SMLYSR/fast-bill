import CrossPressable from '@/components/CrossPressable';
import SummaryCard from '@/components/SummaryCard';
import TimelineItem from '@/components/TimelineItem';
import { Transaction } from '@/db/sqlite/schema';
import { useTransactionStore } from '@/store/useTransactionStore';
import { formatCNDateWithWeek } from '@/utils/format';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, FlatList, Platform, StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { historyTransactions, loadHistory, loadMoreHistory, hasMoreHistory, loadingHistory } = useTransactionStore();
  useEffect(() => { if (date) loadHistory(String(date)); }, [date]);
  const listRef = useRef<FlatList<Transaction>>(null);
  const [showTop, setShowTop] = useState(false);
  const source = historyTransactions;
  const fade = useRef(new Animated.Value(0)).current; // header
  const slide = useRef(new Animated.Value(8)).current; // header
  const topFade = useRef(new Animated.Value(0)).current; // to-top button
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(slide, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, [date]);
  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <style
          dangerouslySetInnerHTML={{
            __html: `#historyList::-webkit-scrollbar{width:8px;height:8px}#historyList::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:8px}#historyList::-webkit-scrollbar-track{background:#F1F5F9;border-radius:8px}#historyList{scrollbar-width:thin}`,
          }}
        />
      ) : null}
      <FlatList
        ref={listRef}
        data={source}
        keyExtractor={(t) => t.id}
        ListHeaderComponent={(
          <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
            <View style={styles.headerPad}>
              <SummaryCard transactions={source} titleLabel={"当日总收/支"} />
            </View>
            <View style={styles.headingRow}>
              <Text style={styles.headingDate}>{formatCNDateWithWeek(String(date))}</Text>
            </View>
          </Animated.View>
        )}
        renderItem={({ item }) => (
          <TimelineItem
            item={{
              id: item.id,
              time: new Date(item.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
              category: item.category,
              type: item.type,
              amount: item.amount,
              icon: '📄', // You might want to map category to icon here if available
              location: item.location,
              note: item.description,
              raw: item
            }}
          />
        )}
        onEndReachedThreshold={0.2}
        onEndReached={() => { if (!loadingHistory && hasMoreHistory) { loadMoreHistory(); } }}
        ListFooterComponent={loadingHistory && historyTransactions.length > 0 ? <ActivityIndicator style={{ marginVertical: 12 }} /> : (!hasMoreHistory && historyTransactions.length > 0 ? <Text style={{ textAlign: 'center', color: '#999', marginVertical: 12, fontSize: 12 }}>没有更多了</Text> : null)}
        contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }}
        style={{ flex: 1 }}
        nativeID={Platform.OS === 'web' ? 'historyList' : undefined}
        onScroll={e => { const v = e.nativeEvent.contentOffset.y > 160; setShowTop(v); Animated.timing(topFade, { toValue: v ? 1 : 0, duration: 300, useNativeDriver: Platform.OS !== 'web' }).start(); }}
        scrollEventThrottle={16}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={<Text style={styles.empty}>当日无流水</Text>}
      />
      <Animated.View style={[styles.toTop, { opacity: topFade }]}>
        <CrossPressable style={styles.toTopBtn} onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}>
          <Text style={styles.toTopText}>返回顶部</Text>
        </CrossPressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingTop: 12 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  headingDate: { fontSize: 20, color: '#101828' },
  list: { marginTop: 8, paddingHorizontal: 16 },
  empty: { color: '#6A7282', textAlign: 'center', marginTop: 24 },
  toTop: { position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center' },
  toTopBtn: { backgroundColor: '#f3f3f3', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  toTopText: { color: '#333' },
});