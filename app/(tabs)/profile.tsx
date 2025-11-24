import CrossPressable from '@/components/CrossPressable';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useThemeTokens } from '@/context/Theme';
import { backupToJSON, restoreFromJSON } from '@/db/sqlite/database';
import { useAuthStore } from '@/store/useAuthStore';
import { usePreferenceStore } from '@/store/usePreferenceStore';
import { useSupabaseAuthStore } from '@/store/useSupabaseAuthStore';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useIsFocused } from '@react-navigation/native';

export default function ProfileScreen() {
  const isFocused = useIsFocused();
  const [showEdit, setShowEdit] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { logout } = useAuthStore();
  const { signOut } = useSupabaseAuthStore();
  const { profile, language, theme, saving, setProfile, setLanguage, setTheme, setThemeBg, load } = usePreferenceStore();
  const { width } = useWindowDimensions();
  const contentW = Math.min(361, width - 32);
  const themeTokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  useEffect(() => { load(); }, []);
  useEffect(() => { Animated.timing(fade, { toValue: showEdit || showLang || showTheme ? 1 : 0, duration: 250, useNativeDriver: Platform.OS !== 'web' }).start(); }, [showEdit, showLang, showTheme]);
  let tempEmail: string | undefined;
  let tempName: string | undefined;
  let tempLang: 'zh' | 'en' | 'ja' | undefined;
  const presetAvatars = ['🍩', '☕️', '🍔', '🍣', '📚', '🏖️', '🌈', '💼'];
  const avatarScale = useRef(new Animated.Value(1)).current;
  function randomAvatar() {
    const pick = presetAvatars[Math.floor(Math.random() * presetAvatars.length)];
    Animated.sequence([
      Animated.timing(avatarScale, { toValue: 0.92, duration: 120, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(avatarScale, { toValue: 1, duration: 120, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
    setProfile({ ...profile, avatarUri: `emoji:${pick}` });
  }

  async function onBackup() {
    const data = await backupToJSON();
    const path = (FileSystem as any).cacheDirectory + 'fatsbill-backup.json';
    await FileSystem.writeAsStringAsync(path, JSON.stringify(data));
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path);
  }

  async function onRestore() {
    const path = (FileSystem as any).cacheDirectory + 'fatsbill-backup.json';
    const content = await FileSystem.readAsStringAsync(path);
    const json = JSON.parse(content);
    await restoreFromJSON(json);
  }

  if (!isFocused) return <View style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>个人信息</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.content, { paddingTop: 24 }]}>
        <View style={[styles.profileCard, { width: contentW, backgroundColor: themeTokens.card }]}>
          {String(profile.avatarUri || '').startsWith('emoji:') ? (
            <View style={styles.avatarWrap}>
              <View style={styles.avatarCircle}><Text style={styles.avatarEmoji}>{String(profile.avatarUri).replace('emoji:', '')}</Text></View>
            </View>
          ) : (
            <View style={styles.avatarWrap}>
              <Svg width={64} height={64}>
                <Defs>
                  <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#007AFF" />
                    <Stop offset="1" stopColor="#34C759" />
                  </LinearGradient>
                </Defs>
                <Circle cx={32} cy={32} r={32} fill="url(#grad)" />
              </Svg>
              <Ionicons name="person-outline" size={32} color="#fff" style={styles.avatarIcon} />
            </View>
          )}
          <Text style={[styles.profileName, { color: themeTokens.text }]}>每日记账用户</Text>
          <Text style={[styles.profileEmail, { color: themeTokens.mutedText }]}>user@dailyflow.com</Text>
        </View>
        <View style={[styles.listCard, { width: contentW, backgroundColor: themeTokens.card }]}>
          <CrossPressable style={styles.listRow} onPress={() => setShowEdit(true)}>
            <View style={[styles.leftIcon, { backgroundColor: '#007AFF1A' }]}>
              <Ionicons name="create-outline" size={20} color="#007AFF" />
            </View>
            <View style={styles.listTextBox}>
              <Text style={styles.listTitle}>编辑资料</Text>
              <Text style={styles.listSub}>修改个人信息</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#B6BDC7" />
          </CrossPressable>
          <View style={[styles.divider, { backgroundColor: themeTokens.divider }]} />
          <CrossPressable style={styles.listRow} onPress={() => setShowLang(true)}>
            <View style={[styles.leftIcon, { backgroundColor: '#6A72821A' }]}>
              <Ionicons name="settings-outline" size={20} color="#6A7282" />
            </View>
            <View style={styles.listTextBox}>
              <Text style={styles.listTitle}>系统语言</Text>
              <Text style={styles.listSub}>中文/英文/日文</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#B6BDC7" />
          </CrossPressable>
          <View style={[styles.divider, { backgroundColor: themeTokens.divider }]} />
          <CrossPressable style={styles.listRow} onPress={() => setShowTheme(true)}>
            <View style={[styles.leftIcon, { backgroundColor: '#FFB8001A' }]}>
              <Ionicons name="color-palette-outline" size={20} color="#FFB800" />
            </View>
            <View style={styles.listTextBox}>
              <Text style={styles.listTitle}>主题设置</Text>
              <Text style={styles.listSub}>自定义外观</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#B6BDC7" />
          </CrossPressable>
          <View style={[styles.divider, { backgroundColor: themeTokens.divider }]} />
          <View style={styles.listRow}>
            <View style={[styles.leftIcon, { backgroundColor: '#FF3B301A' }]}>
              <Ionicons name="lock-closed-outline" size={20} color="#FF3B30" />
            </View>
            <View style={styles.listTextBox}>
              <Text style={styles.listTitle}>隐私设置</Text>
              <Text style={styles.listSub}>数据与安全</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#B6BDC7" />
          </View>
        </View>
        <CrossPressable style={[styles.logoutBtn, { width: contentW }]} onPress={async () => { await signOut(); await logout(); router.replace('/(auth)/login'); }}>
          <Text style={styles.logoutText}>↳ 退出登录</Text>
        </CrossPressable>

        <Modal visible={showEdit} transparent animationType="none" onRequestClose={() => setShowEdit(false)}>
          <Animated.View style={[styles.modalOverlay, { opacity: fade }]}>
            <View style={[styles.modalCard, { width: Math.min(361, width - 32), backgroundColor: themeTokens.card }]}>
              <Text style={styles.modalTitle}>编辑资料</Text>
              <View style={styles.avatarCropWrap}>
                <CrossPressable onPress={randomAvatar}>
                  {String(profile.avatarUri || '').startsWith('emoji:') ? (
                    <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
                      <View style={styles.cropBox}><View style={styles.avatarCircleLg}><Text style={styles.avatarEmojiLg}>{String(profile.avatarUri).replace('emoji:', '')}</Text></View></View>
                    </Animated.View>
                  ) : (
                    <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
                      <View style={styles.avatarPlaceholder}><Ionicons name="image-outline" size={24} color="#99A1AF" /></View>
                    </Animated.View>
                  )}
                </CrossPressable>
              </View>
              <TextInput style={styles.input} placeholder="邮箱" keyboardType="email-address" placeholderTextColor="#9CA3AF" defaultValue={profile.email} onChangeText={(v) => tempEmail = v} />
              <TextInput style={styles.input} placeholder="用户名" placeholderTextColor="#9CA3AF" defaultValue={profile.username} onChangeText={(v) => tempName = v} />
              <View style={styles.modalActions}>
                <CrossPressable style={[styles.btnOutline]} onPress={() => setShowEdit(false)}><Text style={styles.btnOutlineText}>取消</Text></CrossPressable>
                <CrossPressable style={[styles.btnPrimary]} onPress={async () => {
                  const email = tempEmail ?? profile.email ?? '';
                  const name = tempName ?? profile.username ?? '';
                  const okEmail = /^\S+@\S+\.\S+$/.test(email);
                  const okName = name.length >= 2 && name.length <= 20;
                  if (!okEmail) return Alert.alert('提示', '邮箱格式不正确');
                  if (!okName) return Alert.alert('提示', '用户名长度需为2-20');
                  await setProfile({ ...profile, email, username: name });
                  setShowEdit(false);
                  Alert.alert('成功', '资料已保存');
                }}>
                  <Text style={styles.btnPrimaryText}>{saving ? '保存中...' : '保存'}</Text>
                </CrossPressable>
              </View>
            </View>
          </Animated.View>
        </Modal>

        <Modal visible={showLang} transparent animationType="none" onRequestClose={() => setShowLang(false)}>
          <Animated.View style={[styles.modalOverlay, { opacity: fade }]}>
            <View style={[styles.modalCard, { width: Math.min(361, width - 32), backgroundColor: themeTokens.card }]}>
              <Text style={styles.modalTitle}>系统语言</Text>
              <View style={styles.pillRow}>
                {(['zh', 'en', 'ja'] as const).map(l => (
                  <CrossPressable key={l} style={[styles.pill, language === l && styles.pillActive]} onPress={() => tempLang = l}>
                    <Text style={[styles.pillText, language === l && styles.pillTextActive]}>{l === 'zh' ? '中文' : l === 'en' ? 'English' : '日本語'}</Text>
                  </CrossPressable>
                ))}
              </View>
              <View style={styles.modalActions}>
                <CrossPressable style={styles.btnOutline} onPress={() => setShowLang(false)}><Text style={styles.btnOutlineText}>取消</Text></CrossPressable>
                <CrossPressable style={styles.btnPrimary} onPress={async () => { const v = tempLang ?? language; await setLanguage(v); setShowLang(false); Alert.alert('成功', '语言已切换'); }}><Text style={styles.btnPrimaryText}>确认</Text></CrossPressable>
              </View>
            </View>
          </Animated.View>
        </Modal>

        <Modal visible={showTheme} transparent animationType="none" onRequestClose={() => setShowTheme(false)}>
          <Animated.View style={[styles.modalOverlay, { opacity: fade }]}>
            <View style={[styles.modalCard, { width: Math.min(361, width - 32), backgroundColor: themeTokens.card }]}>
              <Text style={styles.modalTitle}>主题模式</Text>
              <View style={styles.pillRow}>
                {(['light', 'dark', 'system'] as const).map(t => (
                  <CrossPressable key={t} style={[styles.pill, theme === t && styles.pillActive]} onPress={async () => { await setTheme(t); }}>
                    <Text style={[styles.pillText, theme === t && styles.pillTextActive]}>{t === 'light' ? '浅色' : t === 'dark' ? '深色' : '跟随系统'}</Text>
                  </CrossPressable>
                ))}
              </View>
              <View style={[styles.preview, { backgroundColor: themeTokens.bg }]}>
                <View style={[styles.previewCard, { backgroundColor: themeTokens.card }]} />
                <Text style={[styles.previewText, { color: themeTokens.text }]}>示例文本</Text>
              </View>
              <View style={styles.pillRow}>
                {['#FFFFFF', '#F5F5F5', '#FAFAFA', '#151718', '#1A1F25'].map(hex => (
                  <CrossPressable key={hex} style={[styles.colorChip, { backgroundColor: hex }]} onPress={async () => { await setThemeBg(hex); Alert.alert('成功', '背景颜色已应用'); }} />
                ))}
              </View>
              <TextInput style={styles.input} placeholder="自定义背景色 #RRGGBB" placeholderTextColor="#9CA3AF" onSubmitEditing={async (e) => {
                const v = e.nativeEvent.text.trim();
                const ok = /^#([0-9A-Fa-f]{6})$/.test(v);
                if (!ok) return Alert.alert('提示', '请输入合法的十六进制颜色，如 #1A1F25');
                await setThemeBg(v); Alert.alert('成功', '背景颜色已应用');
              }} />
              <View style={styles.modalActions}>
                <CrossPressable style={styles.btnOutline} onPress={() => setShowTheme(false)}><Text style={styles.btnOutlineText}>关闭</Text></CrossPressable>
              </View>
            </View>
          </Animated.View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: 'center', paddingVertical: 24 },
  headerContainer: {
    backgroundColor: '#fff',
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#101828',
    marginTop: 8,
    fontFamily: Fonts.rounded
  },
  profileCard: { marginTop: 16, backgroundColor: '#fff', borderRadius: 24, alignItems: 'center', paddingVertical: 20, rowGap: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, ...Platform.select({ web: { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)' } }) },
  avatarWrap: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  avatarIcon: { position: 'absolute' },
  avatarCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 28 },
  profileName: { fontSize: 20, color: '#101828' },
  profileEmail: { fontSize: 14, color: '#6A7282' },
  listCard: { marginTop: 24, backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, ...Platform.select({ web: { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)' } }) },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, height: 81, columnGap: 16 },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  leftIcon: { width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  listTextBox: { flex: 1 },
  listTitle: { fontSize: 16, color: '#101828' },
  listSub: { fontSize: 12, color: '#6A7282' },
  logoutBtn: { marginTop: 28, height: 56, borderRadius: 999, borderWidth: 2, borderColor: '#FF3B30', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF3B30', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 4, height: 4 }, ...Platform.select({ web: { boxShadow: '4px 4px 12px rgba(255,59,48,0.2), -4px -4px 12px rgba(255,255,255,0.8)' } }) },
  logoutText: { color: '#FF3B30', fontSize: 18, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: '#00000066', alignItems: 'center', justifyContent: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 16, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 10 }, ...Platform.select({ web: { boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)' } }) },
  modalTitle: { fontSize: 18, color: '#101828', marginBottom: 12, fontFamily: Platform.select({ ios: Fonts.rounded, web: 'SF Pro Rounded, PingFang SC, Microsoft YaHei, sans-serif', default: undefined }) as any },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  btnOutline: { borderWidth: 1, borderColor: '#007AFF', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff' },
  btnOutlineText: { color: '#007AFF' },
  btnPrimary: { backgroundColor: '#007AFF', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8 },
  btnPrimaryText: { color: '#fff' },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, backgroundColor: '#F3F4F6' },
  pillActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  pillText: { color: '#0A0A0A' },
  pillTextActive: { fontWeight: '500' },
  avatarCropWrap: { alignItems: 'center' },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  cropBox: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden' },
  cropImage: { width: 120, height: 120 },
  avatarCircleLg: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  avatarEmojiLg: { fontSize: 48 },
  preview: { marginTop: 8, borderRadius: 12, padding: 10 },
  previewCard: { width: 60, height: 40, borderRadius: 8, marginBottom: 6 },
  previewText: { fontSize: 12 },
  colorChip: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb' },
});