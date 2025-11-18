import { View, StyleSheet } from 'react-native';
import AddTransactionForm from '@/components/AddTransactionForm';
import { useRouter } from 'expo-router';

export default function AddTransactionModal() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <AddTransactionForm onClose={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
});