import { Appearance } from 'react-native';
import { usePreferenceStore } from '@/store/usePreferenceStore';

function luminance(hex: string) {
  const h = hex.replace('#','');
  const r = parseInt(h.substring(0,2),16)/255;
  const g = parseInt(h.substring(2,4),16)/255;
  const b = parseInt(h.substring(4,6),16)/255;
  const sr = r <= 0.03928 ? r/12.92 : Math.pow((r+0.055)/1.055,2.4);
  const sg = g <= 0.03928 ? g/12.92 : Math.pow((g+0.055)/1.055,2.4);
  const sb = b <= 0.03928 ? b/12.92 : Math.pow((b+0.055)/1.055,2.4);
  return 0.2126*sr + 0.7152*sg + 0.0722*sb;
}

function contrast(a: string, b: string) {
  const la = luminance(a), lb = luminance(b);
  const L1 = Math.max(la, lb) + 0.05;
  const L2 = Math.min(la, lb) + 0.05;
  return L1 / L2;
}

export function useThemeTokens() {
  const { theme, themeBg } = usePreferenceStore();
  const sys = Appearance.getColorScheme() || 'light';
  const mode = theme === 'system' ? sys : theme;
  const defaultBg = mode === 'dark' ? '#151718' : '#ffffff';
  const bg = themeBg || defaultBg;
  const textCandidates = mode === 'dark' ? ['#ECEDEE','#F5F5F5','#FAFAFA'] : ['#11181C','#0B0B0F','#101828'];
  let text = textCandidates[0];
  for (const c of textCandidates) { if (contrast(bg,c) >= 4.5) { text = c; break; } }
  const mutedText = mode === 'dark' ? '#9BA1A6' : '#6A7282';
  const card = mode === 'dark' ? '#1A1F25' : '#ffffff';
  const divider = mode === 'dark' ? '#2A2F35' : '#F3F4F6';
  const shadow = mode === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.1)';
  return { bg, text, mutedText, card, divider, shadow, primary: '#007AFF', danger: '#FF3B30', success: '#34C759' };
}