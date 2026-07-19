import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRecipe } from '@/data/recipes';
import { roundLabel, roundToText } from '@/engine/guide';
import { useWorld } from '@/theme/world-context';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useWorld();
  const recipe = getRecipe(id);

  if (!recipe) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.text }}>Receita não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ title: recipe.title }} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={[styles.back, { color: theme.primary }]}>‹ Voltar</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={[styles.emojiBox, { backgroundColor: theme.surfaceAlt }]}>
              <Text style={styles.emoji}>{recipe.emoji ?? '🧶'}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: theme.text }]}>{recipe.title}</Text>
              {!!recipe.description && (
                <Text style={[styles.desc, { color: theme.textMuted }]}>{recipe.description}</Text>
              )}
            </View>
          </View>

          <Section title="Materiais" theme={theme}>
            {recipe.materials.map((m, i) => (
              <Text key={i} style={[styles.li, { color: theme.text }]}>
                •  {m}
              </Text>
            ))}
          </Section>

          {!!recipe.notes?.length && (
            <Section title="Dicas" theme={theme}>
              {recipe.notes.map((n, i) => (
                <Text key={i} style={[styles.li, { color: theme.text }]}>
                  •  {n}
                </Text>
              ))}
            </Section>
          )}

          <Section title="Carreiras" theme={theme}>
            {recipe.rounds.map((round, i) => (
              <View key={i} style={[styles.roundRow, { borderColor: theme.border }]}>
                <View style={[styles.roundLabel, { backgroundColor: theme.surfaceAlt }]}>
                  <Text style={[styles.roundLabelText, { color: theme.textMuted }]}>
                    {roundLabel(round)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.roundText,
                    { color: theme.text },
                    round.kind === 'note' && styles.roundNote,
                  ]}
                >
                  {roundToText(round)}
                </Text>
              </View>
            ))}
          </Section>
        </ScrollView>

        <View style={[styles.footer, { borderColor: theme.border, backgroundColor: theme.bg }]}>
          <Link href={{ pathname: '/guide/[id]', params: { id: recipe.id } }} asChild>
            <Pressable style={[styles.cta, { backgroundColor: theme.primary }]}>
              <Text style={[styles.ctaText, { color: theme.primaryText }]}>▶  Iniciar guia</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Section({
  title,
  theme,
  children,
}: {
  title: string;
  theme: ReturnType<typeof useWorld>['theme'];
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      <View style={[styles.sectionBody, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  topBar: { paddingHorizontal: 16, paddingVertical: 8 },
  back: { fontSize: 16, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 24, gap: 20 },
  header: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  emojiBox: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 38 },
  headerText: { flex: 1, gap: 4 },
  title: { fontSize: 24, fontWeight: '800' },
  desc: { fontSize: 14, lineHeight: 19 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  sectionBody: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 8 },
  li: { fontSize: 14, lineHeight: 20 },
  roundRow: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 2 },
  roundLabel: {
    minWidth: 54,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  roundLabelText: { fontSize: 12, fontWeight: '700' },
  roundText: { flex: 1, fontSize: 14, lineHeight: 20 },
  roundNote: { fontStyle: 'italic' },
  footer: { padding: 16, borderTopWidth: 1 },
  cta: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  ctaText: { fontSize: 17, fontWeight: '800' },
});
