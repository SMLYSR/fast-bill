import CategoryPicker from '@/components/CategoryPicker';
import CrossPressable from '@/components/CrossPressable';
import { Transaction } from '@/db/sqlite/schema';
import { useAccountStore } from '@/store/useAccountStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { formatDateTimeISO } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  onClose?: () => void;
  initialValues?: Transaction;
};

export default function AddTransactionForm({ onClose, initialValues }: Props) {
  const router = useRouter();
  const { accounts, load, add: addAccount } = useAccountStore();
  const { add, update, remove } = useTransactionStore();
  const [type, setType] = useState<'income' | 'expense' | undefined>(initialValues?.type);
  const [amount, setAmount] = useState(initialValues?.amount ? String(initialValues.amount) : '');
  const [category, setCategory] = useState<string | undefined>(initialValues?.category);
  const [date, setDate] = useState(initialValues?.date || formatDateTimeISO(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState(initialValues?.location || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [errors, setErrors] = useState<{ amount?: boolean; type?: boolean; category?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSave() {
    if (isSubmitting) return;
    const newErrors: { amount?: boolean; type?: boolean; category?: boolean } = {};
    if (!amount || Number(amount) <= 0) newErrors.amount = true;
    if (!type) newErrors.type = true;
    if (!category) newErrors.category = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialValues) {
        await update(initialValues.id, { type: type!, amount: Number(amount), category: category!, date, location, description });
      } else {
        let account_id = accounts[0]?.id;
        if (!accounts.length) { await load(); account_id = accounts[0]?.id; }
        if (!account_id) { account_id = await addAccount('默认账户', 0); await load(); }
        await add({ type: type!, amount: Number(amount), category: category!, account_id: String(account_id), date, location, description });
      }
      if (onClose) onClose(); else router.back();
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  }

  async function onDelete() {
    if (initialValues) {
      await remove(initialValues.id);
      if (onClose) onClose(); else router.back();
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{initialValues ? '编辑账单' : '手动记账'}</Text>
      <View style={styles.row}>
        {(['expense', 'income'] as const).map(t => {
          const isActive = type === t;
          const isIncome = t === 'income';
          const hasError = errors.type;
          return (
            <CrossPressable
              key={t}
              style={[
                styles.tag,
                isIncome ? styles.tagIncome : styles.tagExpense,
                isActive && (isIncome ? styles.tagIncomeActive : styles.tagExpenseActive),
                hasError && { borderColor: '#FF3B30', borderWidth: 1 }
              ]}
              onPress={() => { setType(t); setErrors(prev => ({ ...prev, type: false })); }}
            >
              <Text style={[
                styles.tagText,
                isIncome ? styles.textIncome : styles.textExpense,
                isActive && styles.tagTextActive
              ]}>
                {isIncome ? '收入' : '支出'}
              </Text>
            </CrossPressable>
          );
        })}
      </View>
      <TextInput
        style={[styles.input, errors.amount && { borderColor: '#FF3B30', borderWidth: 1 }]}
        value={amount}
        onChangeText={t => { setAmount(t); setErrors(prev => ({ ...prev, amount: false })); }}
        placeholder={errors.amount ? "请输入金额" : "金额"}
        placeholderTextColor={errors.amount ? "#FF3B30" : "#C7C7CC"}
        keyboardType="numeric"
      />

      {Platform.OS === 'web' ? (
        <View style={styles.dateRow}>
          {/* @ts-ignore: React Native Web supports createElement for HTML tags */}
          <View style={styles.dateBtn}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            {/* @ts-ignore */}
            <input
              type="datetime-local"
              value={date}
              onChange={(e: any) => setDate(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 16,
                color: '#333',
                fontFamily: 'System',
                backgroundColor: 'transparent',
                flex: 1,
              }}
            />
          </View>
        </View>
      ) : (
        <>
          <View style={styles.dateRow}>
            <CrossPressable style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.dateText}>{date.replace('T', ' ')}</Text>
            </CrossPressable>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(date)}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(formatDateTimeISO(selectedDate));
                }
              }}
            />
          )}
        </>
      )}

      <View style={errors.category ? { borderColor: '#FF3B30', borderWidth: 1, borderRadius: 12, padding: 4, marginTop: 10 } : { marginTop: 10 }}>
        <CategoryPicker value={category} onChange={c => { setCategory(c); setErrors(prev => ({ ...prev, category: false })); }} />
      </View>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="地点" />
      <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="备注" />
      <View style={styles.actions}>
        <CrossPressable style={[styles.btnPrimary, isSubmitting && { opacity: 0.6 }]} onPress={onSave} disabled={isSubmitting}>
          <Text style={styles.btnText}>{isSubmitting ? '保存中...' : '保存'}</Text>
        </CrossPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 360, maxWidth: '90%', backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 18,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, ...Platform.select({ web: { boxShadow: '0 12px 32px rgba(16,24,40,0.18)' } })
  },
  title: { fontSize: 20, color: '#101828', textAlign: 'center', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 16 },
  tag: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, borderWidth: 0, minWidth: 80, alignItems: 'center' },
  tagIncome: { backgroundColor: 'rgba(52,199,89,0.1)' },
  tagExpense: { backgroundColor: 'rgba(255,59,48,0.1)' },
  tagIncomeActive: { backgroundColor: '#34C759' },
  tagExpenseActive: { backgroundColor: '#FF3B30' },
  tagText: { fontSize: 16, fontWeight: '500' },
  textIncome: { color: '#34C759' },
  textExpense: { color: '#FF3B30' },
  tagTextActive: { color: '#fff', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 10 },
  actions: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 18 },
  btnPrimary: { backgroundColor: '#007AFF', borderRadius: 22, paddingHorizontal: 18, paddingVertical: 10, flex: 1, alignItems: 'center' },
  btnDelete: { backgroundColor: '#FF3B30' },
  btnText: { color: '#fff', fontWeight: '500' },
  dateRow: { marginTop: 10 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 12 },
  dateText: { fontSize: 16, color: '#333' },
});