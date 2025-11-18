import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CrossPressable from './CrossPressable';
import { defaultCategories } from '@/utils/categories';

export default function CategoryPicker({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const cats = useMemo(() => defaultCategories, []);
  return (
    <View style={styles.wrap}>
      {cats.map(c => (
        <CrossPressable key={c} style={[styles.item, value === c && styles.active]} onPress={() => onChange(c)}>
          <Text style={[styles.text, value === c && styles.textActive]}>{c}</Text>
        </CrossPressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#f3f3f3', borderRadius: 12 },
  active: { backgroundColor: '#007AFF' },
  text: { color: '#333' },
  textActive: { color: '#fff' },
});