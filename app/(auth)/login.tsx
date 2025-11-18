import GridBackground from '@/components/GridBackground';
import { Fonts } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, useWindowDimensions, View, Easing } from 'react-native';
import CrossPressable from '@/components/CrossPressable';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const fade = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(1)).current; // 1 -> 0
  const title = useMemo(() => ['每', '日', '一', '记'], []);
  const letters = useRef(title.map(() => new Animated.Value(0))).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(20)).current;
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    Animated.timing(taglineOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    if (!reduceMotion) {
      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.timing(iconScale, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(iconRotate, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ]).start();
      const perChar = letters.map(val =>
        Animated.sequence([
          Animated.timing(val, { toValue: -10, duration: 250, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 250, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      );
      const group = Animated.stagger(100, perChar);
      Animated.loop(Animated.sequence([group, Animated.delay(2000)])).start();
    }
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      Animated.timing(formOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    } else {
      Animated.sequence([
        Animated.delay(1200),
        Animated.parallel([
          Animated.timing(formOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(formTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [reduceMotion]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);

  const canLogin = username.length > 0 && password.length > 0 && agree;

  return (
    <KeyboardAvoidingView style={styles.wrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <GridBackground />
      <View style={styles.content}>
      <Animated.View style={[styles.brand, { opacity: fade, marginBottom: 64 }]}> 
        <View style={styles.titleRow}>
          {title.map((ch, i) => (
            <Animated.Text key={i} style={[styles.brandText(isTablet), styles.brandSpacer, i === title.length - 1 && styles.brandSpacerNone, { transform: [{ translateY: reduceMotion ? 0 : letters[i] }] }]}>{ch}</Animated.Text>
          ))}
          <Animated.View style={{ transform: [{ scale: reduceMotion ? 1 : iconScale }, { rotate: reduceMotion ? '0deg' : iconRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-180deg'] }) }] }}>
            <Ionicons name="pencil" size={40} color="#007AFF" style={styles.brandIcon} />
          </Animated.View>
        </View>
      </Animated.View>
      <Animated.View style={[styles.tagline, { opacity: taglineOpacity }]}> 
        <Text style={styles.taglineText(isTablet)}>简洁记录，智慧理财</Text>
      </Animated.View>
      <Animated.View style={[styles.form, { opacity: formOpacity, transform: [{ translateY: reduceMotion ? 0 : formTranslate }] }]}> 
        <View style={[styles.formCard, { width: Math.min(isTablet ? 448 : 384, width - 48) }]}> 
        <View style={[styles.inputGroup, { width: '100%' }]}> 
          <View style={styles.groupRow}> 
            <Ionicons name="person-outline" size={20} color="#9CA3AF" />
            <TextInput style={styles.input} placeholder="用户名" placeholderTextColor="#9CA3AF" value={username} onChangeText={setUsername} autoComplete="off" autoCapitalize="none" autoCorrect={false} />
          </View>
          <View style={styles.divider} />
          <View style={styles.groupRow}> 
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput style={styles.input} placeholder="密码" placeholderTextColor="#9CA3AF" secureTextEntry value={password} onChangeText={setPassword} autoComplete="off" autoCapitalize="none" autoCorrect={false} />
          </View>
        </View>
        <CrossPressable style={[styles.loginBtn, { width: '100%' }, !canLogin && styles.loginDisabled]} disabled={!canLogin} onPress={async () => { await login(username); router.replace('/'); }}>
          <Text style={styles.loginText}>登录</Text>
        </CrossPressable>
        <View style={styles.orRow}> 
          <View style={styles.line} />
          <Text style={styles.orText}>或</Text>
          <View style={styles.line} />
        </View>
        <CrossPressable style={[agree ? styles.appleBtnActive : styles.appleBtn, { width: '100%' }]} disabled={!agree} onPress={async () => { await login('apple_user'); router.replace('/'); }}>
          <Ionicons name="logo-apple" size={16} color="#fff" />
          <Text style={styles.appleText}>使用 Apple ID 授权登录</Text>
        </CrossPressable>
        <View style={styles.agreeRow}>
          <CrossPressable style={styles.checkbox} onPress={() => setAgree(v => !v)}>
            {agree ? <View style={styles.checkboxDot} /> : null}
          </CrossPressable>
          <View style={styles.agreeTextWrap}>
            <Text style={styles.agreeText}>我已阅读并同意 </Text>
            <CrossPressable><Text style={styles.link}>用户协议</Text></CrossPressable>
            <Text style={styles.agreeText}> 和 </Text>
            <CrossPressable><Text style={styles.link}>隐私政策</Text></CrossPressable>
          </View>
        </View>
        </View>
        <View style={[styles.footerNote, { width: Math.min(isTablet ? 448 : 384, width - 48) }]}><Text style={styles.footerText}>登录即表示您同意我们的服务条款</Text></View>
      </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: 24 },
  brand: { flexDirection: 'row', alignItems: 'center', width: 393, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', columnGap: 8 },
  brandText: (isTablet: boolean) => ({ fontSize: isTablet ? 56 : 48, color: '#030213', lineHeight: isTablet ? 64 : 56, fontWeight: '500', letterSpacing: 1, fontFamily: Platform.select({ ios: Fonts.rounded, web: 'cursive', default: undefined }) }),
  brandSpacer: { marginRight: 16 },
  brandSpacerNone: { marginRight: 0 },
  brandIcon: { marginLeft: 10 },
  tagline: { width: 393, alignItems: 'center' },
  taglineText: (isTablet: boolean) => ({ fontSize: isTablet ? 18 : 16, color: '#717182', lineHeight: isTablet ? 26 : 24, fontWeight: '400' }),
  form: { marginTop: 32, width: 345, alignItems: 'center' },
  content: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  formCard: { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 4, height: 4 }, alignItems: 'center' },
  formCard: { backgroundColor: 'transparent', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, shadowColor: '#000', shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, alignItems: 'center' },
  inputGroup: { borderRadius: 16, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 4, height: 4 }, ...Platform.select({ web: { boxShadow: '4px 4px 12px rgba(0,0,0,0.08)' } }) },
  groupRow: { flexDirection: 'row', alignItems: 'center', columnGap: 12, width: '100%', height: 56, paddingHorizontal: 16 },
  divider: { height: 1, backgroundColor: '#E5E7EB' },
  input: { flex: 1, color: '#0B0B0F', fontSize: 16, outlineColor: 'transparent', outlineWidth: 0, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  loginBtn: { marginTop: 16, borderRadius: 16, width: 345, height: 56, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', opacity: 1 },
  loginDisabled: { backgroundColor: '#999999', opacity: 0.4 },
  loginText: { color: '#fff', fontSize: 18, fontWeight: '500' },
  orRow: { flexDirection: 'row', alignItems: 'center', columnGap: 12, marginTop: 28, width: 345 },
  line: { flex: 1, height: 1, backgroundColor: '#D1D5DC' },
  orText: { color: '#99A1AF', fontSize: 12 },
  appleBtn: { marginTop: 16, borderRadius: 16, width: 345, height: 56, backgroundColor: '#999999', opacity: 0.4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 8 },
  appleBtnActive: { marginTop: 16, borderRadius: 16, width: 345, height: 56, backgroundColor: '#000000', opacity: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, ...Platform.select({ web: { boxShadow: '0 4px 8px rgba(0,0,0,0.2)' } }) },
  appleText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  agreeRow: { marginTop: 24, width: '100%', borderRadius: 16, backgroundColor: '#ffffffcc', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', columnGap: 12, height: 56, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, ...Platform.select({ web: { boxShadow: '0 2px 6px rgba(0,0,0,0.08)' } }) },
  checkbox: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, borderColor: '#0000001a', backgroundColor: '#f3f3f5', alignItems: 'center', justifyContent: 'center' },
  checkboxDot: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#007AFF' },
  agreeTextWrap: { flexDirection: 'row', flexShrink: 0, width: 235, height: 23 },
  agreeText: { color: '#364153', fontSize: 14 },
  link: { color: '#007AFF', fontSize: 14 },
  footerNote: { marginTop: 24, width: 345, alignItems: 'center' },
  footerText: { color: '#6A7282', fontSize: 12 },
});