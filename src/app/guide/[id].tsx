import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GuidePanel } from '@/components/GuidePanel';
import { recipeImage } from '@/data/recipe-images';
import { useCatalog } from '@/state/catalog';
import { useTheme } from '@/theme/ThemeContext';
import { font, space, typeface } from '@/theme/tokens';

export default function GuideScreen() {
  const { t } = useTranslation();
  const { id, sizeCm: sizeParam } = useLocalSearchParams<{ id: string; sizeCm?: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { getRecipeStub } = useCatalog();
  const stub = getRecipeStub(id);
  const parsed = sizeParam ? Number(sizeParam) : undefined;
  const sizeCm = parsed && !Number.isNaN(parsed) ? parsed : stub?.base?.defaultSizeCm;
  const cover = recipeImage(stub?.cover);

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={[styles.close, { color: theme.textMuted }]}>✕</Text>
          </Pressable>
          {cover && (
            <Image source={cover} style={[styles.thumb, { backgroundColor: theme.surface }]} contentFit="cover" />
          )}
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {stub?.title ?? t('guideScreen.title')}
          </Text>
        </View>
        <GuidePanel recipeId={id!} sizeCm={sizeCm} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  close: { fontSize: 22, fontWeight: '700' },
  thumb: { width: 36, height: 36, borderRadius: 10 },
  title: { flex: 1, fontSize: font.body, fontFamily: typeface.bodyBold },
});
