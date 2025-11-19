import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, FlatList, Animated, Easing } from 'react-native';
import { Transaction } from '@/db/sqlite/schema';
import { useTransactionStore } from '@/store/useTransactionStore';
import SummaryCard from '@/components/SummaryCard';
import HistoryItem from '@/components/HistoryItem';
import CrossPressable from '@/components/CrossPressable';
import { sumBy, formatCNDateWithWeek } from '@/utils/format';

export default function HistoryScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { transactions, loadByDate } = useTransactionStore();
  useEffect(() => { if (date) loadByDate(String(date)); }, [date]);
  const listRef = useRef<FlatList<Transaction>>(null);
  const [showTop, setShowTop] = useState(false);
  const source = transactions;
  const income = sumBy(source.filter(t => t.type === 'income'), t => t.amount);
  const expense = sumBy(source.filter(t => t.type === 'expense'), t => t.amount);
  const fade = useRef(new Animated.Value(0)).current; // header
  const slide = useRef(new Animated.Value(8)).current; // header
  const topFade = useRef(new Animated.Value(0)).current; // to-top button
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
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
              <SummaryCard income={income} expense={expense} titleLabel={"当日总收/支"} />
            </View>
            <View style={styles.headingRow}>
              <Text style={styles.headingDate}>{formatCNDateWithWeek(String(date))}</Text>
            </View>
          </Animated.View>
        )}
        renderItem={({ item }) => <HistoryItem item={item} />}
        contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }}
        style={{ flex: 1 }}
        nativeID={Platform.OS === 'web' ? 'historyList' : undefined}
        onScroll={e => { const v = e.nativeEvent.contentOffset.y > 160; setShowTop(v); Animated.timing(topFade, { toValue: v ? 1 : 0, duration: 300, useNativeDriver: true }).start(); }}
        scrollEventThrottle={16}
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerPad: { paddingTop: 12 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  headingDate: { fontSize: 20, color: '#101828' },
  list: { marginTop: 8, paddingHorizontal: 16 },
  empty: { color: '#6A7282', textAlign: 'center', marginTop: 24 },
  toTop: { position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center' },
  toTopBtn: { backgroundColor: '#f3f3f3', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  toTopText: { color: '#333' },
});