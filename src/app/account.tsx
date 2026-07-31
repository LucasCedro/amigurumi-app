import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthContext';
import { useAppLocale } from '@/i18n/LocaleContext';
import type { LocalePreference } from '@/i18n';
import { useTheme } from '@/theme/ThemeContext';
import type { ThemeMode } from '@/theme/ThemeContext';
import { font, radius, shadow, space, typeface } from '@/theme/tokens';

type Mode = 'login' | 'signup';

export default function AccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, mode: themeMode, setMode: setThemeMode } = useTheme();
  const { preference, setPreference } = useAppLocale();
  const {
    user,
    loading,
    isConfigured,
    isAdmin,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  } = useAuth();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const el = document.activeElement as HTMLElement | null;
      el?.blur?.();
    }
  }, []);

  const [authMode, setAuthMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim() || password.length < 6) {
      setError(t('account.validationEmail'));
      return;
    }
    setBusy(true);
    const err =
      authMode === 'login'
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password, name);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    if (authMode === 'signup') {
      setInfo(t('account.signupOk'));
    }
  };

  const google = async () => {
    setError(null);
    setBusy(true);
    const err = await signInWithGoogle();
    setBusy(false);
    if (err) setError(err);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            hitSlop={12}
          >
            <Text style={[styles.close, { color: theme.text }]}>✕</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
        ) : user ? (
          <View style={styles.content}>
            <View style={[styles.avatar, { backgroundColor: theme.surfaceAlt }]}>
              {user.picture ? (
                <Image source={{ uri: user.picture }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <Text style={styles.avatarEmoji}>🧶</Text>
              )}
            </View>
            <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
            <Text style={[styles.email, { color: theme.textMuted }]}>{user.email}</Text>

            <Text style={[styles.pickerLabel, { color: theme.textMuted }]}>{t('account.language')}</Text>
            <LanguagePicker preference={preference} onChange={setPreference} theme={theme} />

            <Text style={[styles.pickerLabel, { color: theme.textMuted }]}>{t('account.theme')}</Text>
            <ThemePicker mode={themeMode} onChange={setThemeMode} theme={theme} />

            <View style={styles.soonGroup}>
              {isAdmin && (
                <Pressable
                  onPress={() => router.push('/admin' as never)}
                  style={[styles.adminBtn, { backgroundColor: theme.primary }]}
                >
                  <Text style={[styles.adminBtnText, { color: theme.primaryText }]}>{t('account.adminPanel')}</Text>
                </Pressable>
              )}
              <SoonRow icon="🛍️" text={t('account.soonPurchases')} />
              <SoonRow icon="📤" text={t('account.soonPublish')} />
              <SoonRow icon="☁️" text={t('account.soonCloud')} />
            </View>

            <Pressable onPress={signOut} style={[styles.btnOutline, { borderColor: theme.border }]}>
              <Text style={[styles.btnOutlineText, { color: theme.text }]}>{t('account.signOut')}</Text>
            </Pressable>
          </View>
        ) : (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.bigEmoji}>🧶</Text>
              <Text style={[styles.title, { color: theme.text }]}>
                {authMode === 'login' ? t('account.loginTitle') : t('account.signupTitle')}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t('account.subtitle')}</Text>

              <Text style={[styles.pickerLabel, { color: theme.textMuted }]}>{t('account.language')}</Text>
              <LanguagePicker preference={preference} onChange={setPreference} theme={theme} />

              <Text style={[styles.pickerLabel, { color: theme.textMuted }]}>{t('account.theme')}</Text>
              <ThemePicker mode={themeMode} onChange={setThemeMode} theme={theme} />

              {!isConfigured && (
                <View style={[styles.warn, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                  <Text style={[styles.warnText, { color: theme.text }]}>{t('account.backendWarn')}</Text>
                </View>
              )}

              {authMode === 'signup' && (
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={t('account.name')}
                  placeholderTextColor={theme.text}
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                  autoCapitalize="words"
                />
              )}
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('account.email')}
                placeholderTextColor={theme.text}
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t('account.password')}
                placeholderTextColor={theme.text}
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                secureTextEntry
              />

              {!!error && <Text style={styles.error}>{error}</Text>}
              {!!info && <Text style={[styles.info, { color: theme.primary }]}>{info}</Text>}

              <Pressable
                onPress={submit}
                disabled={busy}
                style={[styles.btnPrimary, { backgroundColor: theme.primary, opacity: busy ? 0.7 : 1 }]}
              >
                <Text style={[styles.btnPrimaryText, { color: theme.primaryText }]}>
                  {busy ? t('account.wait') : authMode === 'login' ? t('account.signIn') : t('account.signUp')}
                </Text>
              </Pressable>

              <Pressable
                onPress={google}
                disabled={busy || !isConfigured}
                style={[styles.btnGoogle, { backgroundColor: theme.surface, opacity: !isConfigured ? 0.5 : 1 }, shadow(2)]}
              >
                <Text style={styles.googleG}>G</Text>
                <Text style={[styles.btnGoogleText, { color: theme.text }]}>{t('account.signInGoogle')}</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setError(null);
                  setInfo(null);
                }}
                hitSlop={8}
              >
                <Text style={[styles.switch, { color: theme.text }]}>
                  {authMode === 'login' ? t('account.noAccount') : t('account.hasAccount')}
                </Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </View>
  );
}

function LanguagePicker({
  preference,
  onChange,
  theme,
}: {
  preference: LocalePreference;
  onChange: (p: LocalePreference) => void;
  theme: { surface: string; border: string; primary: string; primaryText: string; text: string };
}) {
  const { t } = useTranslation();
  const opts: { id: LocalePreference; label: string }[] = [
    { id: 'auto', label: t('account.langAuto') },
    { id: 'en', label: t('account.langEn') },
    { id: 'pt', label: t('account.langPt') },
  ];
  return (
    <View style={[pickerStyles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {opts.map((o) => {
        const active = preference === o.id;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            style={[pickerStyles.btn, active && { backgroundColor: theme.primary }]}
          >
            <Text style={{ color: active ? theme.primaryText : theme.text, fontFamily: typeface.bodyBold, fontSize: font.small }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ThemePicker({
  mode,
  onChange,
  theme,
}: {
  mode: ThemeMode;
  onChange: (m: ThemeMode) => void;
  theme: { surface: string; border: string; primary: string; primaryText: string; text: string };
}) {
  const { t } = useTranslation();
  const opts: { id: ThemeMode; label: string }[] = [
    { id: 'light', label: t('account.themeLight') },
    { id: 'dark', label: t('account.themeDark') },
    { id: 'system', label: t('account.themeSystem') },
  ];
  return (
    <View style={[pickerStyles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {opts.map((o) => {
        const active = mode === o.id;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            style={[pickerStyles.btn, active && { backgroundColor: theme.primary }]}
          >
            <Text style={{ color: active ? theme.primaryText : theme.text, fontFamily: typeface.bodyBold, fontSize: font.small }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  row: { flexDirection: 'row', borderRadius: radius.lg, borderWidth: 1, padding: 4, gap: 4, alignSelf: 'stretch' },
  btn: { flex: 1, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center' },
});

function SoonRow({ icon, text }: { icon: string; text: string }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <View style={[styles.soonRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={styles.soonIcon}>{icon}</Text>
      <Text style={[styles.soonText, { color: theme.text }]}>{text}</Text>
      <Text style={[styles.soonTag, { color: theme.primary }]}>{t('account.soon')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { paddingHorizontal: space.lg, paddingVertical: space.sm },
  close: { fontSize: 22, fontFamily: typeface.bodyBold },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.xxl,
    gap: space.sm,
  },

  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarEmoji: { fontSize: 44 },
  name: { fontSize: font.title, fontFamily: typeface.display, marginTop: space.sm },
  email: { fontSize: font.body, fontFamily: typeface.bodySemi },
  pickerLabel: { alignSelf: 'stretch', fontSize: font.tiny, fontFamily: typeface.bodyBold, textTransform: 'uppercase', marginTop: space.sm },

  soonGroup: { alignSelf: 'stretch', gap: space.sm, marginTop: space.xl },
  adminBtn: { paddingVertical: 16, borderRadius: radius.md, alignItems: 'center', marginBottom: space.sm },
  adminBtnText: { fontSize: font.h2, fontFamily: typeface.bodyBold },
  soonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  soonIcon: { fontSize: 20 },
  soonText: { flex: 1, fontSize: font.body, fontFamily: typeface.bodySemi },
  soonTag: { fontSize: font.tiny, fontFamily: typeface.bodyBold, textTransform: 'uppercase' },

  btnOutline: {
    marginTop: 'auto',
    alignSelf: 'stretch',
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnOutlineText: { fontSize: font.body, fontFamily: typeface.bodyBold },

  bigEmoji: { fontSize: 56, marginTop: space.md },
  title: { fontSize: font.hero, fontFamily: typeface.display, textAlign: 'center' },
  subtitle: { fontSize: font.body, textAlign: 'center', lineHeight: 24, marginBottom: space.sm },

  warn: { alignSelf: 'stretch', padding: space.md, borderRadius: radius.md, borderWidth: 1, marginBottom: space.sm },
  warnText: { fontSize: font.small, lineHeight: 20, fontFamily: typeface.bodySemi },

  input: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    fontSize: font.body,
    fontFamily: typeface.bodySemi,
  },
  error: { alignSelf: 'stretch', color: '#B91C1C', fontSize: font.small, fontFamily: typeface.bodySemi },
  info: { alignSelf: 'stretch', fontSize: font.small, fontFamily: typeface.bodySemi, lineHeight: 20 },

  btnPrimary: {
    alignSelf: 'stretch',
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: space.sm,
  },
  btnPrimaryText: { fontSize: font.h2, fontFamily: typeface.bodyBold },
  btnGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    alignSelf: 'stretch',
    paddingVertical: space.md,
    borderRadius: radius.md,
    marginTop: space.sm,
  },
  googleG: { fontSize: 20, fontWeight: '900', color: '#4285F4' },
  btnGoogleText: { fontSize: font.h2, fontFamily: typeface.bodyBold },
  switch: { fontSize: font.body, fontFamily: typeface.bodyBold, marginTop: space.lg, textAlign: 'center' },
});
