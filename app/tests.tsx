import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency, sumBy } from '@/utils/format';
import { useTransactionStore } from '@/store/useTransactionStore';

export default function Tests() {
  const { add, loadByDate } = useTransactionStore();
  const [result, setResult] = useState<string>('');
  useEffect(() => {
    async function run() {
      const a = formatCurrency(12.3, 'income');
      const b = formatCurrency(5, 'expense');
      const s = sumBy([1, 2, 3], x => x);
      await add({ type: 'income', amount: 10, category: '测试', account_id: 'default', date: '2025-01-01' });
      await loadByDate('2025-01-01');
      setResult([a === '+12.30 ¥', b === '-5.00 ¥', s === 6].every(Boolean) ? 'ok' : 'fail');
    }
    run();
  }, []);
  return (
    <View style={styles.wrap}><Text style={styles.text}>{result}</Text></View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20 },
});