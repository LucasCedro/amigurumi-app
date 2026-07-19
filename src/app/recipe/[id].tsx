import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRecipe } from '@/data/recipes';
import { recipeImage } from '@/data/recipe-images';
import { roundLabel, roundToText } from '@/engine/guide';
import { getProject } from '@/state/projects';
import { useWorld } from '@/theme/world-context';
import type { WorldTheme } from '@/theme/worlds';
import { CATEGORY_LABEL, DIFFICULTY_LABEL, font, radius, semantic, shadow, space } from '@/theme/tokens';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useWorld();
  const recipe = getRecipe(id);
  const [started, setStarted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getProject(id).then((p) => setStarted(!!p && !p.finished));
    }, [id]),
  );

  if (!recipe) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.text }}>Receita não encontrada.</Text>
      </View>
    );
  }

  const cover = recipeImage(recipe.cover);

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {cover ? (
            <Image source={cover} style={styles.heroImg} contentFit="cover" />
          ) : (
            <View style={[styles.heroImg, styles.center, { backgroundColor: theme.surfaceAlt }]}>
              <Text style={{ fontSize: 72 }}>{recipe.emoji}</Text>
            </View>
          )}
          <SafeAreaView edges={['top']} style={styles.heroTop}>
            <Pressable onPress={() => router.back()} style={styles.roundBtn} hitSlop={10}>
              <Text style={styles.roundBtnText}>‹</Text>
            </Pressable>
            {recipe.isPremium && (
              <View style={[styles.premiumTag, { backgroundColor: semantic.premium }]}>
                <Text style={[styles.premiumText, { color: semantic.premiumText }]}>★ Premium</Text>
              </View>
            )}
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <Text style={[styles.category, { color: theme.primary }]}>
            {CATEGORY_LABEL[recipe.category].toUpperCase()}
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>{recipe.title}</Text>
          {!!recipe.description && (
            <Text style={[styles.desc, { color: theme.textMuted }]}>{recipe.description}</Text>
          )}

          <View style={styles.statsRow}>
            <Stat theme={theme} value={DIFFICULTY_LABEL[recipe.difficulty]} label="nível" />
            {!!recipe.estimatedHours && <Stat theme={theme} value={`${recipe.estimatedHours}h`} label="tempo" />}
            {!!recipe.finalSizeCm && <Stat theme={theme} value={`${recipe.finalSizeCm}cm`} label="tamanho" />}
            <Stat theme={theme} value={`${recipe.pieces.length}`} label="peças" />
          </View>

          {!!recipe.colors?.length && (
            <View style={styles.colorsRow}>
              {recipe.colors.map((c) => (
                <View key={c.id} style={styles.colorItem}>
                  <View style={[styles.swatch, { backgroundColor: c.hex, borderColor: theme.border }]} />
                  <Text style={[styles.colorLabel, { color: theme.textMuted }]}>{c.label}</Text>
                </View>
              ))}
            </View>
          )}

          <Section title="Peças" theme={theme}>
            {recipe.pieces.map((p) => (
              <View key={p.id} style={styles.pieceRow}>
                <Text style={[styles.pieceName, { color: theme.text }]}>{p.name}</Text>
                <Text style={[styles.pieceQty, { color: theme.textMuted }]}>×{p.qty}</Text>
              </View>
            ))}
          </Section>

          <Section title="Materiais" theme={theme}>
            {recipe.materials.map((m, i) => (
              <Text key={i} style={[styles.li, { color: theme.text }]}>
                •  {m.label}
                {m.color ? ` — ${m.color}` : ''}
                {m.amount ? ` (${m.amount})` : ''}
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

          {recipe.pieces.map((p) => (
            <Section key={p.id} title={`Carreiras · ${p.name}${p.qty > 1 ? ` (×${p.qty})` : ''}`} theme={theme}>
              {p.rounds.map((round, i) => (
                <View key={i} style={styles.roundRow}>
                  <View style={[styles.roundLabel, { backgroundColor: theme.surfaceAlt }]}>
                    <Text style={[styles.roundLabelText, { color: theme.textMuted }]}>{roundLabel(round)}</Text>
                  </View>
                  <Text
                    style={[styles.roundText, { color: theme.text }, round.kind === 'note' && styles.roundNote]}
                  >
                    {roundToText(round)}
                  </Text>
                </View>
              ))}
            </Section>
          ))}

          {!!recipe.assembly?.length && (
            <Section title="Montagem" theme={theme}>
              {recipe.assembly.map((a) => (
                <View key={a.step} style={styles.assemblyRow}>
                  <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.stepBadgeText, { color: theme.primaryText }]}>{a.step}</Text>
                  </View>
                  <Text style={[styles.li, { color: theme.text, flex: 1 }]}>{a.text}</Text>
                </View>
              ))}
            </Section>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderColor: theme.border, backgroundColor: theme.bg }]}>
        <Pressable
          onPress={() => router.push({ pathname: '/guide/[id]', params: { id: recipe.id } })}
          style={[styles.cta, { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.ctaText, { color: theme.primaryText }]}>
            {started ? '▶  Continuar' : '▶  Iniciar guia'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Stat({ theme, value, label }: { theme: WorldTheme; value: string; label: string }) {
  return (
    <View style={[styles.stat, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

function Section({ title, theme, children }: { title: string; theme: WorldTheme; children: React.ReactNode }) {
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
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 24 },
  hero: { height: 300, width: '100%' },
  heroImg: { width: '100%', height: '100%' },
  heroTop: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingTop: space.sm },
  roundBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  roundBtnText: { fontSize: 26, fontWeight: '800', color: '#3A2A24', marginTop: -3 },
  premiumTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm },
  premiumText: { fontSize: font.tiny, fontWeight: '800' },

  body: { padding: space.lg, gap: space.md, marginTop: -20, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  category: { fontSize: font.tiny, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: font.hero, fontWeight: '900' },
  desc: { fontSize: font.body, lineHeight: 21 },

  statsRow: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
  stat: { flex: 1, minWidth: 70, borderRadius: radius.md, borderWidth: 1, paddingVertical: space.sm, alignItems: 'center' },
  statValue: { fontSize: font.body, fontWeight: '800' },
  statLabel: { fontSize: font.tiny },

  colorsRow: { flexDirection: 'row', gap: space.lg, flexWrap: 'wrap' },
  colorItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 20, height: 20, borderRadius: 10, borderWidth: 1 },
  colorLabel: { fontSize: font.small, fontWeight: '600' },

  section: { gap: space.sm },
  sectionTitle: { fontSize: font.h2, fontWeight: '800' },
  sectionBody: { borderRadius: radius.md, borderWidth: 1, padding: space.md, gap: space.sm },

  pieceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pieceName: { fontSize: font.body, fontWeight: '600' },
  pieceQty: { fontSize: font.body, fontWeight: '800' },

  li: { fontSize: font.body, lineHeight: 21 },

  roundRow: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  roundLabel: { minWidth: 54, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, alignItems: 'center' },
  roundLabelText: { fontSize: font.tiny, fontWeight: '700' },
  roundText: { flex: 1, fontSize: font.body, lineHeight: 20 },
  roundNote: { fontStyle: 'italic' },

  assemblyRow: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  stepBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepBadgeText: { fontSize: font.small, fontWeight: '800' },

  footer: { padding: space.lg, borderTopWidth: 1 },
  cta: { paddingVertical: space.lg, borderRadius: radius.md, alignItems: 'center' },
  ctaText: { fontSize: font.h2, fontWeight: '800' },
});
