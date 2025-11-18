import { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Animated, ActivityIndicator, Modal, Platform } from 'react-native';
import CrossPressable from '@/components/CrossPressable';
import SummaryCard from '@/components/SummaryCard';
import TimelineItem from '@/components/TimelineItem';
import FABCapsule from '@/components/FABCapsule';
import { todayItems, todaySummary } from '@/constants/mock/today';
import { Ionicons } from '@expo/vector-icons';
import AddTransactionForm from '@/components/AddTransactionForm';

export default function HomeScreen() {
  const [data, setData] = useState(todayItems.sort((a, b) => (a.time < b.time ? 1 : -1)));
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<any>>(null);
  const income = todaySummary.income;
  const expense = todaySummary.expense;
  const [aiVisible, setAiVisible] = useState(false);
  const [manualVisible, setManualVisible] = useState(false);

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={i => i.id}
        renderItem={({ item }) => <TimelineItem item={item} />}
        ListHeaderComponent={
          <View>
            <SummaryCard income={income} expense={expense} />
            <View style={styles.headingRow}> 
              <Text style={styles.heading}>今日</Text>
              <Text style={styles.headingDate}>11月15日(周六)</Text>
            </View>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 300); }} />}
        onEndReachedThreshold={0.2}
        onEndReached={() => { if (!loadingMore) { setLoadingMore(true); setTimeout(() => setLoadingMore(false), 300); } }}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        onScroll={e => { const v = e.nativeEvent.contentOffset.y > 160; setShowTop(v); Animated.timing(fade, { toValue: v ? 1 : 0, duration: 300, useNativeDriver: true }).start(); }}
        scrollEventThrottle={16}
      />
      <FABCapsule onAI={() => setAiVisible(true)} onManual={() => setManualVisible(true)} />
      <Animated.View style={[styles.toTop, { opacity: fade }]}> 
        <CrossPressable style={styles.toTopBtn} onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}>
          <Text style={styles.toTopText}>返回顶部</Text>
        </CrossPressable>
      </Animated.View>
      <Modal visible={aiVisible} transparent animationType="fade" onRequestClose={() => setAiVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <CrossPressable style={styles.modalClose} onPress={() => setAiVisible(false)}>
              <Ionicons name="close" size={20} color="#667085" />
            </CrossPressable>
            <View style={styles.modalIconWrap}>
              <Ionicons name="camera-outline" size={42} color="#007AFF" />
            </View>
            <Text style={styles.modalTitle}>上传收支截图</Text>
            <Text style={styles.modalSub}>AI 一键记录</Text>
            <CrossPressable style={styles.modalPrimary} onPress={() => {}}>
              <Text style={styles.modalPrimaryText}>选择图片</Text>
            </CrossPressable>
          </View>
        </View>
      </Modal>
      <Modal visible={manualVisible} transparent animationType="fade" onRequestClose={() => setManualVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <CrossPressable style={styles.modalClose} onPress={() => setManualVisible(false)}>
              <Ionicons name="close" size={20} color="#667085" />
            </CrossPressable>
            <AddTransactionForm onClose={() => setManualVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  heading: { fontSize: 24, color: '#101828' },
  headingDate: { fontSize: 18, color: '#6A7282' },
  toTop: { position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center' },
  toTopBtn: { backgroundColor: '#f3f3f3', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  toTopText: { color: '#333' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: 340, maxWidth: '90%', backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 22,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, ...Platform.select({ web: { boxShadow: '0 12px 32px rgba(16,24,40,0.18)' } }), alignItems: 'center' },
  modalClose: { position: 'absolute', right: 12, top: 12, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F4F7' },
  modalIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E7F0FE', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, color: '#101828', marginTop: 6 },
  modalSub: { fontSize: 14, color: '#667085', marginTop: 4, marginBottom: 12 },
  modalPrimary: { width: '100%', backgroundColor: '#007AFF', borderRadius: 28, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  modalPrimaryText: { color: '#fff', fontWeight: '600' },
});
