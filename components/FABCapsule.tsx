import { Fonts } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import CrossPressable from './CrossPressable';

export default function FABCapsule({ onAI, onManual }: { onAI: () => void; onManual: () => void }) {
  const [open, setOpen] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const tx1 = useRef(new Animated.Value(12)).current;
  const tx2 = useRef(new Animated.Value(12)).current;
  function toggle() {
    if (open) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(tx1, { toValue: 12, duration: 300, useNativeDriver: true }),
        Animated.timing(tx2, { toValue: 12, duration: 300, useNativeDriver: true }),
      ]).start(() => setOpen(false));
    } else {
      setOpen(true);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(tx1, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(tx2, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }
  function handleAI() {
    onAI();
    toggle();
  }
  function handleManual() {
    onManual();
    toggle();
  }
  return (
    <View style={styles.wrap}>
      {open && (
        <Animated.View style={[styles.overlay, { opacity: fade }]}>
          <CrossPressable style={styles.overlayPress} onPress={toggle} />
        </Animated.View>
      )}
      <View style={styles.buttons}>
        {open && (
          <Animated.View style={[styles.secondary, { transform: [{ translateY: tx1 }] }]}>
            <CrossPressable style={styles.secondaryPress} onPress={handleAI}>
              <Ionicons name="camera-outline" size={18} color="#667085" />
              <Text style={styles.secondaryText}>AI记录</Text>
              <Text style={[styles.secBadge, { color: '#FF3B30' }]}>¥</Text>
            </CrossPressable>
          </Animated.View>
        )}
        {open && (
          <Animated.View style={[styles.secondary, { transform: [{ translateY: tx2 }] }]}>
            <CrossPressable style={styles.secondaryPress} onPress={handleManual}>
              <Ionicons name="pencil-outline" size={18} color="#667085" />
              <Text style={styles.secondaryText}>手动记账</Text>
              <Text style={[styles.secBadge, { color: '#34C759' }]}>¥</Text>
            </CrossPressable>
          </Animated.View>
        )}
        <View>
          <CrossPressable style={styles.main} onPress={toggle}>
            {open ? <Ionicons name="close" size={24} color="#fff" /> : <Ionicons name="add" size={24} color="#fff" />}
          </CrossPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 16, bottom: 16 },
  overlay: { position: 'absolute', left: -1000, right: -1000, top: -1000, bottom: -1000, backgroundColor: 'rgba(0,0,0,0.35)' },
  overlayPress: { flex: 1 },
  buttons: { flexDirection: 'column', alignItems: 'flex-end', gap: 12 },
  main: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#007AFF', shadowOpacity: 0.4, shadowRadius: 8, ...Platform.select({ web: { boxShadow: '0 6px 16px rgba(0,122,255,0.4)' } }) },
  secondary: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, ...Platform.select({ web: { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }) },
  secondaryPress: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { position: 'absolute', bottom: 8, fontSize: 11, color: '#0B0B0F', fontFamily: Platform.select({ ios: Fonts.rounded, web: 'SF Pro Rounded, PingFang SC, Microsoft YaHei, sans-serif', default: undefined }) as any },
  secBadge: { position: 'absolute', right: 6, top: 6, fontSize: 14 },
});