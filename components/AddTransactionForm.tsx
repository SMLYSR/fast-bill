import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import CrossPressable from '@/components/CrossPressable';
import { useRouter } from 'expo-router';
import CategoryPicker from '@/components/CategoryPicker';
import { useAccountStore } from '@/store/useAccountStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { formatDateISO } from '@/utils/format';

export default function AddTransactionForm({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const { accounts, load } = useAccountStore();
  const { add } = useTransactionStore();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('餐饮');
  const [date, setDate] = useState(formatDateISO(new Date()));
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  async function onSave() {
    const account_id = accounts[0]?.id ?? 'default';
    if (!accounts.length) await load();
    await add({ type, amount: Number(amount), category, account_id, date, location, description });
    if (onClose) onClose(); else router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>手动记账</Text>
      <View style={styles.row}>
        {(['expense', 'income'] as const).map(t => (
          <CrossPressable key={t} style={[styles.tag, t === 'income' ? styles.tagIncome : styles.tagExpense, type === t && styles.tagActive]} onPress={() => setType(t)}>
            <Text style={[styles.tagText, type === t && styles.tagTextActive]}>{t === 'income' ? '收入' : '支出'}</Text>
          </CrossPressable>
        ))}
      </View>
      <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="金额" keyboardType="numeric" />
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="时间" />
      <CategoryPicker value={category} onChange={setCategory} />
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="地点" />
      <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="备注" />
      <View style={styles.actions}>
        <CrossPressable style={styles.btnPrimary} onPress={onSave}><Text style={styles.btnText}>保存</Text></CrossPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 360, maxWidth: '90%', backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 18,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, ...Platform.select({ web: { boxShadow: '0 12px 32px rgba(16,24,40,0.18)' } }) },
  title: { fontSize: 20, color: '#101828', textAlign: 'center', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 16 },
  tag: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, borderWidth: 1 },
  tagIncome: { borderColor: '#34C759' },
  tagExpense: { borderColor: '#FF3B30' },
  tagActive: { backgroundColor: '#fff' },
  tagText: { color: '#101828' },
  tagTextActive: { color: '#101828', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 10 },
  actions: { alignItems: 'center', marginTop: 18 },
  btnPrimary: { backgroundColor: '#007AFF', borderRadius: 22, paddingHorizontal: 18, paddingVertical: 10 },
  btnText: { color: '#fff', fontWeight: '500' },
});