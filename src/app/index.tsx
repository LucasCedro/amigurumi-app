import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRecipesByWorld } from '@/data/recipes';
import { useWorld } from '@/theme/world-context';
import { WORLD_ORDER, WORLDS } from '@/theme/worlds';
import type { Difficulty, Recipe } from '@/types/recipe';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

export default function HomeScreen() {
  const { world, theme, setWorld } = useWorld();
  const recipes = getRecipesByWorld(world);

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.worldSwitch}>
          {WORLD_ORDER.map((w) => {
            const wt = WORLDS[w];
            const active = w === world;
            return (
              <Pressable
                key={w}
                onPress={() => setWorld(w)}
                style={[
                  styles.worldTab,
                  {
                    backgroundColor: active ? theme.primary : theme.surface,
                    borderColor: active ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text style={styles.worldEmoji}>{wt.emoji}</Text>
                <Text
                  style={[styles.worldTabText, { color: active ? theme.primaryText : theme.textMuted }]}
                >
                  {wt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.hero, { color: theme.text }]}>
            {theme.emoji} Mundo {theme.label}
          </Text>
          <Text style={[styles.tagline, { color: theme.textMuted }]}>{theme.tagline}</Text>

          {world === 'trico' ? (
            <View style={[styles.empty, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.emptyEmoji}>🧷</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Tricô vem aí</Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                Esse mundo ainda está em construção. Volte pro Amigurumi pra testar o guia.
              </Text>
            </View>
          ) : (
            recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const { theme } = useWorld();
  return (
    <Link href={{ pathname: '/recipe/[id]', params: { id: recipe.id } }} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <View style={[styles.cardEmojiBox, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={styles.cardEmoji}>{recipe.emoji ?? '🧶'}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{recipe.title}</Text>
          <Text style={[styles.cardMeta, { color: theme.textMuted }]} numberOfLines={2}>
            {recipe.description}
          </Text>
          <View style={styles.badgeRow}>
            <Badge label={DIFFICULTY_LABEL[recipe.difficulty]} bg={theme.surfaceAlt} color={theme.textMuted} />
            {recipe.isPremium ? (
              <Badge label="★ Premium" bg={theme.accent} color="#3A2A24" />
            ) : (
              <Badge label="Grátis" bg="#16A34A" color="#FFFFFF" />
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  worldSwitch: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  worldTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  worldEmoji: { fontSize: 16 },
  worldTabText: { fontSize: 15, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40, gap: 12 },
  hero: { fontSize: 26, fontWeight: '800', marginTop: 8 },
  tagline: { fontSize: 14, marginBottom: 8 },
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
  cardEmojiBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 30 },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardMeta: { fontSize: 13, lineHeight: 18 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  empty: {
    marginTop: 24,
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
