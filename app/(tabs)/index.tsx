import AddTransactionForm from '@/components/AddTransactionForm';
import CrossPressable from '@/components/CrossPressable';
import FABCapsule from '@/components/FABCapsule';
import SummaryCard from '@/components/SummaryCard';
import TimelineItem from '@/components/TimelineItem';
import { Transaction } from '@/db/sqlite/schema';
import { useTransactionStore } from '@/store/useTransactionStore';
import { formatCNDateWithWeek, formatDateISO, formatTime } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIsFocused } from '@react-navigation/native';

export default function HomeScreen() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { todayTransactions, loadToday, loadingToday, remove, loadMoreToday, hasMoreToday } = useTransactionStore();
  const todayISO = formatDateISO(new Date());
  const data = todayTransactions.map(t => ({ id: t.id, time: formatTime(t.created_at), category: t.category, type: t.type, amount: t.amount, icon: '📄', location: t.location, note: t.description, raw: t }));
  const [refreshing, setRefreshing] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<any>>(null);
  const [aiVisible, setAiVisible] = useState(false);
  const [manualVisible, setManualVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const router = useRouter();
  const todayLabel = formatCNDateWithWeek(formatDateISO(new Date()));

  useEffect(() => {
    if (isFocused) {
      loadToday(todayISO);
    }
  }, [todayISO, isFocused]);

  const handleDelete = async () => {
    if (deletingId) {
      await remove(deletingId);
      setDeleteVisible(false);
      setDeletingId(null);
    }
  };

  if (!isFocused) return <View style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={todayTransactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Swipeable
            overshootLeft={false}
            overshootRight={false}
            renderLeftActions={(progress, dragX) => {
              const trans = dragX.interpolate({
                inputRange: [0, 60],
                outputRange: [-60, 0],
              });
              return (
                <View style={{ width: 60, justifyContent: 'center', alignItems: 'center' }}>
                  <Animated.View style={{ transform: [{ translateX: trans }], width: 60, height: '100%', backgroundColor: '#007AFF' }}>
                    <RectButton
                      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                      onPress={() => {
                        setEditingTransaction(item.raw);
                        // Use setTimeout to prevent ghost touch on high-refresh rate screens
                        setTimeout(() => setManualVisible(true), 50);
                      }}
                    >
                      <Ionicons name="create-outline" size={24} color="#fff" />
                    </RectButton>
                  </Animated.View>
                </View>
              );
            }}
            renderRightActions={(progress, dragX) => {
              const trans = dragX.interpolate({
                inputRange: [-60, 0],
                outputRange: [0, 60],
              });
              return (
                <View style={{ width: 60, justifyContent: 'center', alignItems: 'center' }}>
                  <Animated.View style={{ transform: [{ translateX: trans }], width: 60, height: '100%', backgroundColor: '#FF3B30' }}>
                    <RectButton
                      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                      onPress={() => {
                        setDeletingId(item.id);
                        // Use setTimeout to prevent the touch event from propagating to the Modal overlay
                        // which could cause it to close immediately on some iOS devices.
                        setTimeout(() => setDeleteVisible(true), 50);
                      }}
                    >
                      <Ionicons name="trash-outline" size={24} color="#fff" />
                    </RectButton>
                  </Animated.View>
                </View>
              );
            }}
          >
            <TimelineItem
              item={item}
            />
          </Swipeable>
        )}
        ListHeaderComponent={
          <View>
            <View style={[styles.headerPad, { paddingTop: insets.top + 12 }]}>
              <SummaryCard transactions={todayTransactions} />
            </View>
            <View style={styles.headingRow}>
              <Text style={styles.heading}>今日</Text>
              <Text style={styles.headingDate}>{todayLabel}</Text>
              <CrossPressable style={styles.dateArrow} onPress={() => router.push('/(tabs)/statistics')}>
                <Ionicons name="chevron-forward" size={18} color="#101828" />
              </CrossPressable>
            </View>
          </View>
        }
        onEndReachedThreshold={0.2}
        onEndReached={() => { if (!loadingToday && hasMoreToday) { loadMoreToday(); } }}
        ListFooterComponent={loadingToday && todayTransactions.length > 0 ? <ActivityIndicator style={{ marginVertical: 12 }} /> : (!hasMoreToday && todayTransactions.length > 0 ? <Text style={{ textAlign: 'center', color: '#999', marginVertical: 12, fontSize: 12 }}>没有更多了</Text> : null)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        onScroll={e => { const v = e.nativeEvent.contentOffset.y > 160; setShowTop(v); Animated.timing(fade, { toValue: v ? 1 : 0, duration: 300, useNativeDriver: Platform.OS !== 'web' }).start(); }}
        scrollEventThrottle={16}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#6A7282', marginTop: 16 }}>暂无今日流水</Text>}
      />
      <FABCapsule onAI={() => setAiVisible(true)} onManual={() => { setEditingTransaction(undefined); setManualVisible(true); }} />
      <Animated.View style={[styles.toTop, { opacity: fade, top: insets.top + 8 }]}>
        <CrossPressable style={styles.toTopBtn} onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}>
          <Text style={styles.toTopText}>返回顶部</Text>
        </CrossPressable>
      </Animated.View>
      <Modal visible={aiVisible} transparent animationType="fade" onRequestClose={() => setAiVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAiVisible(false)}>
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
            <CrossPressable style={styles.modalClose} onPress={() => setAiVisible(false)}>
              <Ionicons name="close" size={20} color="#667085" />
            </CrossPressable>
            <View style={styles.modalIconWrap}>
              <Ionicons name="camera-outline" size={42} color="#007AFF" />
            </View>
            <Text style={styles.modalTitle}>上传收支截图</Text>
            <Text style={styles.modalSub}>AI 一键记录</Text>
            <CrossPressable style={styles.modalPrimary} onPress={() => { }}>
              <Text style={styles.modalPrimaryText}>选择图片</Text>
            </CrossPressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={manualVisible} transparent animationType="fade" onRequestClose={() => setManualVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setManualVisible(false)}>
          <Pressable style={{ alignItems: 'center', justifyContent: 'center' }} onPress={e => e.stopPropagation()}>
            <CrossPressable style={styles.modalClose} onPress={() => { setManualVisible(false); setEditingTransaction(undefined); }}>
              <Ionicons name="close" size={20} color="#667085" />
            </CrossPressable>
            <AddTransactionForm
              onClose={() => { setManualVisible(false); setEditingTransaction(undefined); }}
              initialValues={editingTransaction}
            />
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={deleteVisible} transparent animationType="fade" onRequestClose={() => setDeleteVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setDeleteVisible(false)}>
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
            <View style={[styles.modalIconWrap, { backgroundColor: '#FEE4E2' }]}>
              <Ionicons name="trash-outline" size={32} color="#D92D20" />
            </View>
            <Text style={styles.modalTitle}>确认删除</Text>
            <Text style={styles.modalSub}>确定要删除这条记录吗？此操作无法撤销。</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' }}>
              <CrossPressable style={[styles.modalBtn, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D0D5DD' }]} onPress={() => setDeleteVisible(false)}>
                <Text style={{ color: '#344054', fontWeight: '600' }}>取消</Text>
              </CrossPressable>
              <CrossPressable style={[styles.modalBtn, { backgroundColor: '#D92D20' }]} onPress={handleDelete}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>删除</Text>
              </CrossPressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  headerPad: { paddingTop: 12 },
  heading: { fontSize: 24, color: '#101828' },
  headingDate: { fontSize: 18, color: '#6A7282' },
  dateArrow: { marginLeft: 6 },
  toTop: { position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center' },
  toTopBtn: { backgroundColor: '#f3f3f3', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  toTopText: { color: '#333' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  modalCard: {
    width: 340, maxWidth: '90%', backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 22,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, ...Platform.select({ web: { boxShadow: '0 12px 32px rgba(16,24,40,0.18)' } }), alignItems: 'center'
  },
  modalClose: { position: 'absolute', right: 12, top: 12, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F4F7' },
  modalIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E7F0FE', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, color: '#101828', marginTop: 6 },
  modalSub: { fontSize: 14, color: '#667085', marginTop: 4, marginBottom: 12, textAlign: 'center' },
  modalPrimary: { width: '100%', backgroundColor: '#007AFF', borderRadius: 28, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  modalPrimaryText: { color: '#fff', fontWeight: '600' },
  modalBtn: { flex: 1, paddingVertical: 10, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
