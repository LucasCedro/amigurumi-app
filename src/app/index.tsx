import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRecipe, getRecipesByWorld } from '@/data/recipes';
import { recipeImage } from '@/data/recipe-images';
import { describePosition, progressFraction } from '@/engine/project';
import { listProjects, type ProjectState } from '@/state/projects';
import { useWorld } from '@/theme/world-context';
import { WORLD_ORDER, WORLDS, type WorldTheme } from '@/theme/worlds';
import { CATEGORY_LABEL, DIFFICULTY_LABEL, font, radius, semantic, shadow, space } from '@/theme/tokens';
import type { Category, Recipe } from '@/types/recipe';

export default function HomeScreen() {
  const { world, theme, setWorld } = useWorld();
  const router = useRouter();
  const recipes = getRecipesByWorld(world);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'todos'>('todos');
  const [projects, setProjects] = useState<ProjectState[]>([]);

  useFocusEffect(
    useCallback(() => {
      listProjects().then(setProjects);
    }, []),
  );

  const categories = useMemo(() => {
    const set = new Set(recipes.map((r) => r.category));
    return ['todos', ...Array.from(set)] as (Category | 'todos')[];
  }, [recipes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => {
      const okCat = category === 'todos' || r.category === category;
      const okQ =
        !q || r.title.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q));
      return okCat && okQ;
    });
  }, [recipes, query, category]);

  const activeProjects = useMemo(
    () => projects.filter((p) => !p.finished && getRecipe(p.recipeId)?.world === world),
    [projects, world],
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.hello, { color: theme.textMuted }]}>Olá, artesã 👋</Text>
            <Text style={[styles.hero, { color: theme.text }]}>Seu ateliê</Text>
          </View>
          <Pressable
            onPress={() => router.push('/account')}
            style={[styles.avatar, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Text style={styles.avatarText}>🧵</Text>
          </Pressable>
        </View>

        <View style={[styles.worldSwitch, { backgroundColor: theme.surfaceAlt }]}>
          {WORLD_ORDER.map((w) => {
            const wt = WORLDS[w];
            const active = w === world;
            return (
              <Pressable
                key={w}
                onPress={() => setWorld(w)}
                style={[styles.worldTab, active && { backgroundColor: theme.surface }, active && shadow(1)]}
              >
                <Text style={styles.worldEmoji}>{wt.emoji}</Text>
                <Text style={[styles.worldTabText, { color: active ? theme.text : theme.textMuted }]}>
                  {wt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {world === 'trico' ? (
          <TricoPlaceholder theme={theme} />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {activeProjects.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Continue de onde parou</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectsRow}>
                  {activeProjects.map((p) => (
                    <ProjectCard
                      key={p.recipeId}
                      project={p}
                      theme={theme}
                      onPress={() => router.push({ pathname: '/guide/[id]', params: { id: p.recipeId } })}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={[styles.searchBox, { backgroundColor: theme.surfaceAlt }]}>
              <Text style={{ color: theme.textMuted, fontSize: 16 }}>🔍</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar receita ou tag"
                placeholderTextColor={theme.textMuted}
                style={[styles.searchInput, { color: theme.text }]}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {categories.map((c) => {
                const active = c === category;
                const label = c === 'todos' ? 'Todos' : CATEGORY_LABEL[c];
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[styles.chip, { backgroundColor: active ? theme.primary : theme.surfaceAlt }]}
                  >
                    <Text style={[styles.chipText, { color: active ? theme.primaryText : theme.textMuted }]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {filtered.map((r) => (
              <RecipeCard key={r.id} recipe={r} theme={theme} />
            ))}
            {filtered.length === 0 && (
              <Text style={[styles.empty, { color: theme.textMuted }]}>Nada encontrado.</Text>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

function ProjectCard({ project, theme, onPress }: { project: ProjectState; theme: WorldTheme; onPress: () => void }) {
  const recipe = getRecipe(project.recipeId);
  if (!recipe) return null;
  const pos = { pieceIdx: project.pieceIdx, roundIdx: project.roundIdx, stepIdx: project.stepIdx };
  const pct = Math.round(progressFraction(recipe, pos, project.finished) * 100);
  const desc = describePosition(recipe, pos, project.finished);
  const img = recipeImage(recipe.cover);

  return (
    <Pressable onPress={onPress} style={[styles.projectCard, { backgroundColor: theme.surface }, shadow(2)]}>
      <View style={[styles.projectThumb, { backgroundColor: theme.surfaceAlt }]}>
        {img ? <Image source={img} style={styles.fill} contentFit="cover" /> : <Text style={styles.projectEmoji}>{recipe.emoji}</Text>}
      </View>
      <Text style={[styles.projectTitle, { color: theme.text }]} numberOfLines={1}>
        {recipe.title}
      </Text>
      <Text style={[styles.projectDesc, { color: theme.textMuted }]} numberOfLines={1}>
        {desc}
      </Text>
      <View style={[styles.progressTrack, { backgroundColor: theme.surfaceAlt }]}>
        <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${pct}%` }]} />
      </View>
      <Text style={[styles.projectPct, { color: theme.primary }]}>{pct}%</Text>
    </Pressable>
  );
}

function RecipeCard({ recipe, theme }: { recipe: Recipe; theme: WorldTheme }) {
  const router = useRouter();
  const img = recipeImage(recipe.cover);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.surface, opacity: pressed ? 0.92 : 1 }, shadow(2)]}
    >
      <View style={[styles.cardImgBox, { backgroundColor: theme.surfaceAlt }]}>
        {img ? <Image source={img} style={styles.fill} contentFit="cover" /> : <Text style={styles.cardEmoji}>{recipe.emoji ?? '🧶'}</Text>}
        {recipe.isPremium && (
          <View style={[styles.premiumTag, { backgroundColor: semantic.premium }]}>
            <Text style={[styles.premiumText, { color: semantic.premiumText }]}>★ Premium</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{recipe.title}</Text>
        <Text style={[styles.cardSub, { color: theme.textMuted }]} numberOfLines={1}>
          {recipe.subtitle ?? recipe.description}
        </Text>
        <View style={styles.metaRow}>
          <Meta text={DIFFICULTY_LABEL[recipe.difficulty]} theme={theme} />
          {!!recipe.estimatedHours && <Meta text={`⏱ ${recipe.estimatedHours}h`} theme={theme} />}
          <Meta text={`${recipe.pieces.length} peça${recipe.pieces.length > 1 ? 's' : ''}`} theme={theme} />
        </View>
      </View>
    </Pressable>
  );
}

function Meta({ text, theme }: { text: string; theme: WorldTheme }) {
  return (
    <View style={[styles.meta, { backgroundColor: theme.surfaceAlt }]}>
      <Text style={[styles.metaText, { color: theme.textMuted }]}>{text}</Text>
    </View>
  );
}

function TricoPlaceholder({ theme }: { theme: WorldTheme }) {
  return (
    <View style={styles.tricoWrap}>
      <View style={[styles.tricoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={styles.tricoEmoji}>🧷</Text>
        <Text style={[styles.tricoTitle, { color: theme.text }]}>Tricô vem aí</Text>
        <Text style={[styles.tricoText, { color: theme.textMuted }]}>
          Esse mundo está em construção. Volte pro Amigurumi pra testar o guia.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  fill: { width: '100%', height: '100%' },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.lg, paddingTop: space.sm },
  hello: { fontSize: font.small, fontWeight: '600' },
  hero: { fontSize: font.hero, fontWeight: '800' },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22 },

  worldSwitch: { flexDirection: 'row', margin: space.lg, marginBottom: space.sm, padding: 4, borderRadius: radius.pill, gap: 4 },
  worldTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: radius.pill },
  worldEmoji: { fontSize: 16 },
  worldTabText: { fontSize: font.body, fontWeight: '700' },

  scroll: { paddingHorizontal: space.lg, paddingBottom: 48, gap: space.lg },

  section: { gap: space.sm },
  sectionTitle: { fontSize: font.h2, fontWeight: '800' },

  projectsRow: { gap: space.md, paddingVertical: space.xs, paddingRight: space.lg },
  projectCard: { width: 190, borderRadius: radius.lg, padding: space.md, gap: 6 },
  projectThumb: { height: 96, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  projectEmoji: { fontSize: 40 },
  projectTitle: { fontSize: font.body, fontWeight: '800', marginTop: 4 },
  projectDesc: { fontSize: font.tiny },
  projectPct: { fontSize: font.tiny, fontWeight: '800', alignSelf: 'flex-end' },

  searchBox: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, height: 48, borderRadius: radius.pill },
  searchInput: { flex: 1, fontSize: font.body },

  chipsRow: { gap: space.sm, paddingVertical: 2, paddingRight: space.lg },
  chip: { paddingHorizontal: space.md, paddingVertical: 9, borderRadius: radius.pill },
  chipText: { fontSize: font.small, fontWeight: '700' },

  card: { borderRadius: radius.xl, overflow: 'hidden' },
  cardImgBox: { width: '100%', aspectRatio: 1.6, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 64 },
  premiumTag: { position: 'absolute', top: space.md, left: space.md, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm },
  premiumText: { fontSize: font.tiny, fontWeight: '800' },
  cardBody: { padding: space.lg, gap: 4 },
  cardTitle: { fontSize: font.title, fontWeight: '800' },
  cardSub: { fontSize: font.small },
  metaRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  meta: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm },
  metaText: { fontSize: font.tiny, fontWeight: '700' },

  progressTrack: { height: 7, borderRadius: 4, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%', borderRadius: 4 },

  empty: { textAlign: 'center', marginTop: space.xl, fontSize: font.body },

  tricoWrap: { flex: 1, padding: space.lg, justifyContent: 'center' },
  tricoCard: { padding: space.xxl, borderRadius: radius.xl, borderWidth: 1, alignItems: 'center', gap: space.sm },
  tricoEmoji: { fontSize: 52 },
  tricoTitle: { fontSize: font.title, fontWeight: '800' },
  tricoText: { fontSize: font.body, textAlign: 'center', lineHeight: 21 },
});
