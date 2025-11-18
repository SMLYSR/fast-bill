import { useColorScheme as useRNColorScheme } from 'react-native';
import { usePreferenceStore } from '@/store/usePreferenceStore';

export function useColorScheme() {
  const sys = useRNColorScheme();
  const { theme } = usePreferenceStore();
  if (theme === 'system') return sys;
  return theme;
}