import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useFontScale } from '@/hooks/useFontScale';
import { hasSeenOnboarding, markOnboardingSeen } from '@/lib/onboarding';
import { useTheme } from '@/theme/ThemeContext';
import { font, radius, space, typeface } from '@/theme/tokens';

export function OnboardingModal() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { s } = useFontScale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    hasSeenOnboarding().then((seen) => {
      if (!seen) setVisible(true);
    });
  }, []);

  const dismiss = async () => {
    await markOnboardingSeen();
    setVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={styles.emoji}>🧶</Text>
          <Text style={[styles.title, { color: theme.text, fontSize: s(font.title) }]}>{t('onboarding.title')}</Text>
          <Text style={[styles.body, { color: theme.text, fontSize: s(font.body) }]}>
            {t('onboarding.bodyPrefix')}
            <Text style={{ fontFamily: typeface.bodyBold }}>{t('onboarding.bodyBold')}</Text>
            {t('onboarding.bodySuffix')}
          </Text>
          <Text style={[styles.hint, { color: theme.textMuted, fontSize: s(font.small) }]}>{t('onboarding.hint')}</Text>
          <Pressable onPress={dismiss} style={[styles.btn, { backgroundColor: theme.primary }]}>
            <Text style={[styles.btnText, { color: theme.primaryText, fontSize: s(font.h2) }]}>{t('onboarding.cta')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,20,26,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: space.xl,
    alignItems: 'center',
    gap: space.md,
  },
  emoji: { fontSize: 56 },
  title: { fontFamily: typeface.display, textAlign: 'center' },
  body: { fontFamily: typeface.body, textAlign: 'center', lineHeight: 26 },
  hint: { fontFamily: typeface.bodySemi, textAlign: 'center', lineHeight: 22 },
  btn: {
    marginTop: space.sm,
    alignSelf: 'stretch',
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  btnText: { fontFamily: typeface.bodyBold },
});
