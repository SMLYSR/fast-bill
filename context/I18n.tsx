import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePreferenceStore } from '@/store/usePreferenceStore';

type Dict = Record<string, Record<'zh'|'en'|'ja', string>>;

const dict: Dict = {
  today: { zh: '今日', en: 'Today', ja: '今日' },
  statistics: { zh: '统计', en: 'Statistics', ja: '統計' },
  profile: { zh: '我的', en: 'Profile', ja: '私の' },
  settings: { zh: '设置', en: 'Settings', ja: '設定' },
  editProfile: { zh: '编辑资料', en: 'Edit Profile', ja: 'プロフィール編集' },
  systemLanguage: { zh: '系统语言', en: 'Language', ja: '言語' },
  themeMode: { zh: '主题模式', en: 'Theme', ja: 'テーマ' },
  privacy: { zh: '隐私政策', en: 'Privacy', ja: 'プライバシー' },
  save: { zh: '保存', en: 'Save', ja: '保存' },
  cancel: { zh: '取消', en: 'Cancel', ja: '取消' },
};

const I18nContext = createContext<{ t: (k: keyof typeof dict) => string }>({ t: (k) => dict[k].zh });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { language, load } = usePreferenceStore();
  const [ready, setReady] = useState(false);
  useEffect(() => { load().then(() => setReady(true)); }, []);
  const t = useMemo(() => (key: keyof typeof dict) => dict[key][language], [language]);
  if (!ready) return children as any;
  return <I18nContext.Provider value={{ t }}>{children}</I18nContext.Provider>;
}

export function useI18n() { return useContext(I18nContext); }