import { useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import CrossPressable from './CrossPressable';

export default function FloatingActionButton({ onAI, onManual }: { onAI: () => void; onManual: () => void }) {
  const [open, setOpen] = useState(false);
  const rotate = new Animated.Value(0);
  function toggle() {
    const to = open ? 0 : 1;
    Animated.timing(rotate, { toValue: to, duration: 300, useNativeDriver: true }).start(() => setOpen(!open));
  }
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });
  return (
    <View style={styles.wrap}>
      {open && (
        <View style={styles.actions}>
          <CrossPressable style={[styles.child, { right: 0 }]} onPress={onAI} />
          <CrossPressable style={[styles.child, { right: 56 }]} onPress={onManual} />
        </View>
      )}
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <CrossPressable style={styles.main} onPress={toggle} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 24, bottom: 24 },
  main: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#007AFF' },
  actions: { position: 'absolute', bottom: 72, right: 0, flexDirection: 'row' },
  child: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
});