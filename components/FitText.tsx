import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform, LayoutChangeEvent, TextStyle, ViewStyle } from 'react-native';

type Props = {
  text: string;
  color?: string;
  baseSize?: number;
  weight?: TextStyle['fontWeight'];
  style?: TextStyle;
  containerStyle?: ViewStyle;
  minScale?: number;
};

export default function FitText({ text, color = '#101828', baseSize = 18, weight = '600', style, containerStyle, minScale = 0.8 }: Props) {
  const [cw, setCw] = useState(0);
  const [tw, setTw] = useState(0);

  const scale = useMemo(() => {
    if (!cw || !tw) return 1;
    const s = (cw * 0.95) / tw;
    return Math.max(Math.min(1, s), minScale);
  }, [cw, tw, minScale]);

  function onContainer(e: LayoutChangeEvent) {
    setCw(e.nativeEvent.layout.width);
  }
  function onText(e: LayoutChangeEvent) {
    setTw(e.nativeEvent.layout.width);
  }

  return (
    <View style={[styles.wrap, containerStyle]} onLayout={onContainer}>
      <Text
        onLayout={onText}
        style={[styles.text, { color, fontSize: baseSize, fontWeight: weight, transform: [{ scale }] }, style]}
        {...(Platform.OS !== 'web' ? { adjustsFontSizeToFit: true, minimumFontScale: minScale, includeFontPadding: false } : {})}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: '100%', alignItems: 'center', justifyContent: 'center' },
  text: { textAlign: 'center' },
});