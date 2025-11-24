import { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

export default function GridBackground({ density = 30, lineWidth = 1, color = '#A8D8EA' }: { density?: number; lineWidth?: number; color?: string }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: Math.floor(width), h: Math.floor(height) });
  }, []);

  const verticals: number[] = [];
  const horizontals: number[] = [];
  for (let x = 0; x <= size.w; x += density) verticals.push(x + density - lineWidth);
  for (let y = 0; y <= size.h; y += density) horizontals.push(y + density - lineWidth);

  return (
    <View pointerEvents="none" style={styles.wrap} onLayout={onLayout}>
      {size.w > 0 && size.h > 0 && (
        <Svg width={size.w} height={size.h}>
          <Rect x={0} y={0} width={size.w} height={size.h} fill="transparent" />
          {verticals.map((x) => (
            <Line key={`v-${x}`} x1={x} y1={0} x2={x} y2={size.h} stroke={color} strokeWidth={lineWidth} />
          ))}
          {horizontals.map((y) => (
            <Line key={`h-${y}`} x1={0} y1={y} x2={size.w} y2={y} stroke={color} strokeWidth={lineWidth} />
          ))}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#fff' },
});
