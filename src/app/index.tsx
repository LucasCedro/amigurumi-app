import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listMyPurchases, type PurchaseWithRecipe } from '@/api/purchases';
import { useAuth } from '@/auth/AuthContext';
import { OnboardingModal } from '@/components/OnboardingModal';
import { countUnlocked, evaluateAchievements, type AchievementResult } from '@/data/achievements';
import { recipeImage } from '@/data/recipe-images';
import { describePosition, normalizePosition, progressFraction } from '@/engine/project';
import { useFontScale } from '@/hooks/useFontScale';
import { useAppLocale } from '@/i18n/LocaleContext';
import { listFinished, type FinishedProject } from '@/state/collection';
import { useCatalog } from '@/state/catalog';
import { deleteProject, listProjects, type ProjectState } from '@/state/projects';
import { useTheme } from '@/theme/ThemeContext';
import type { AppTheme } from '@/theme/theme';
import { font, radius, semantic, shadow, space, typeface } from '@/theme/tokens';
import type { Category, Recipe } from '@/types/recipe';

const GRID_COLS = 2;
const GRID_GAP = 14;

type HomeTab = 'projetos' | 'andamento' | 'salvos' | 'compras' | 'meus';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { locale } = useAppLocale();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { theme, toggle } = useTheme();
  const { s } = useFontScale();
  const { user } = useAuth();
  const { recipes, loading, configured, refresh, getRecipe } = useCatalog();
  const [gridW, setGridW] = useState(0);
  const tileW =
    gridW > 0 ? Math.floor((gridW - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS) : 0;

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'todos'>('todos');
  const [projects, setProjects] = useState<ProjectState[]>([]);
  const [finishedList, setFinishedList] = useState<FinishedProject[]>([]);
  const [tab, setTab] = useState<HomeTab>('projetos');
  const [discardId, setDiscardId] = useState<string | null>(null);
  const [purchaseCount, setPurchaseCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setPurchaseCount(0);
      return;
    }
    listMyPurchases().then((items) => setPurchaseCount(items.length));
  }, [user]);

  const visibleTabs = useMemo(() => {
    const tabs: { id: HomeTab; label: string; icon: string }[] = [
      { id: 'projetos', label: t('home.tabs.projects'), icon: '🧶' },
      { id: 'andamento', label: t('home.tabs.inProgress'), icon: '⏳' },
      { id: 'salvos', label: t('home.tabs.saved'), icon: '🔖' },
      { id: 'compras', label: t('home.tabs.purchases'), icon: '🛍️' },
      { id: 'meus', label: t('home.tabs.mine'), icon: '🏆' },
    ];
    return tabs.filter((tab) => {
      if (tab.id === 'salvos') return false;
      if (tab.id === 'compras') return purchaseCount > 0;
      return true;
    });
  }, [purchaseCount, t]);

  useEffect(() => {
    if (
      params.tab === 'meus' ||
      params.tab === 'salvos' ||
      params.tab === 'projetos' ||
      params.tab === 'andamento' ||
      params.tab === 'compras'
    ) {
      setTab(params.tab);
    }
  }, [params.tab]);

  const reload = useCallback(() => {
    listProjects().then(setProjects);
    listFinished().then(setFinishedList);
  }, []);

  useFocusEffect(reload);

  const discardProject = useCallback(
    async (recipeId: string) => {
      await deleteProject(recipeId);
      reload();
    },
    [reload],
  );

  const categories = useMemo(() => {
    const set = new Set(recipes.filter((r) => r.category !== 'base').map((r) => r.category));
    return ['todos', ...Array.from(set)] as (Category | 'todos')[];
  }, [recipes]);

  const craftRecipes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes
      .filter((r) => {
        if (r.category === 'base') return false;
        const okCat = category === 'todos' || r.category === category;
        const okQ =
          !q || r.title.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q));
        return okCat && okQ;
      })
      .sort((a, b) => {
        if (a.isPremium !== b.isPremium) return a.isPremium ? 1 : -1;
        return a.title.localeCompare(b.title, locale === 'pt' ? 'pt-BR' : 'en');
      });
  }, [recipes, query, category, locale]);

  const baseRecipes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => {
      if (r.category !== 'base') return false;
      const okQ =
        !q || r.title.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q));
      return okQ;
    });
  }, [recipes, query]);

  const activeProjects = useMemo(
    () => projects.filter((p) => !p.finished && getRecipe(p.recipeId, p.sizeCm)),
    [projects, getRecipe],
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <OnboardingModal />
      <LinearGradient colors={theme.gradient} style={styles.headerGradient} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.hello, { color: theme.text, fontSize: s(font.body) }]}>{t('home.hello')}</Text>
            <Text style={[styles.hero, { color: theme.text, fontSize: s(font.hero) }]}>{t('home.title')}</Text>
          </View>
          <View style={styles.topActions}>
            <Pressable
              onPress={toggle}
              style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              hitSlop={8}
            >
              <Text style={styles.iconBtnText}>{theme.isDark ? '☀️' : '🌙'}</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/account')}
              style={[styles.avatar, { backgroundColor: theme.surface, borderColor: theme.border }, shadow(2)]}
            >
              <Text style={styles.avatarText}>🧵</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subTabsScroll}
          contentContainerStyle={styles.subTabs}
        >
          {visibleTabs.map((t) => {
            const active = t.id === tab;
            const count =
              t.id === 'meus'
                ? finishedList.length
                : t.id === 'andamento'
                  ? activeProjects.length
                  : 0;
            return (
              <Pressable key={t.id} onPress={() => setTab(t.id)} style={styles.subTab}>
                <Text style={[styles.subTabText, { color: active ? theme.primary : theme.text }]}>
                  {t.icon} {t.label}
                  {count > 0 ? ` (${count})` : ''}
                </Text>
                <View
                  style={[
                    styles.subTabBar,
                    { backgroundColor: active ? theme.primary : 'transparent' },
                  ]}
                />
              </Pressable>
            );
          })}
        </ScrollView>

        {tab === 'projetos' && (
          <ScrollView style={styles.tabPane} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {activeProjects.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('home.continueSection')}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipsScroll}
                  contentContainerStyle={styles.projectsRow}
                >
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

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontSize: s(font.title) }]}>
                {t('home.projectsSection')}
              </Text>
              <Text style={[styles.sectionHint, { color: theme.textMuted, fontSize: s(font.small) }]}>
                {t('home.projectsHint')}
              </Text>

              <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={t('common.searchPlaceholder')}
                  placeholderTextColor={theme.text}
                  style={[styles.searchInput, { color: theme.text }]}
                />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
                contentContainerStyle={styles.chipsRow}
              >
                {categories.map((c) => {
                  const active = c === category;
                  const label = c === 'todos' ? t('common.all') : t(`category.${c}`);
                  return (
                    <Pressable
                      key={c}
                      onPress={() => setCategory(c)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? theme.primary : theme.surface,
                          borderColor: active ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.chipText, { color: active ? theme.primaryText : theme.text }]}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {loading && (
                <Text style={[styles.empty, { color: theme.text }]}>{t('home.loadingCatalog')}</Text>
              )}

              {!loading && !configured && (
                <View style={[styles.catalogHint, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.catalogHintTitle, { color: theme.text }]}>{t('home.backendMissing')}</Text>
                  <Text style={[styles.catalogHintText, { color: theme.text }]}>{t('home.backendMissingHint')}</Text>
                </View>
              )}

              {!loading && configured && recipes.length === 0 && (
                <View style={[styles.catalogHint, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.catalogHintTitle, { color: theme.text }]}>{t('home.emptyCatalog')}</Text>
                  <Text style={[styles.catalogHintText, { color: theme.text }]}>{t('home.emptyCatalogHint')}</Text>
                  <Pressable onPress={() => void refresh()} style={[styles.emptyBtn, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.emptyBtnText, { color: theme.primaryText }]}>{t('common.refresh')}</Text>
                  </Pressable>
                </View>
              )}

              {!loading && recipes.length > 0 && craftRecipes.length > 0 && (
              <View
                style={[styles.cardsGrid, { gap: GRID_GAP }]}
                onLayout={(e) => setGridW(e.nativeEvent.layout.width)}
              >
                {tileW > 0 &&
                  craftRecipes.map((r) => (
                    <RecipeCard key={r.id} recipe={r} theme={theme} width={tileW} fontScale={s} />
                  ))}
              </View>
              )}

              {!loading && recipes.length > 0 && craftRecipes.length === 0 && baseRecipes.length === 0 && (
                <Text style={[styles.empty, { color: theme.text }]}>{t('home.noResults')}</Text>
              )}

              {!loading && baseRecipes.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.text, fontSize: s(font.title), marginTop: space.lg }]}>
                    {t('home.shapesSection')}
                  </Text>
                  <Text style={[styles.sectionHint, { color: theme.textMuted, fontSize: s(font.small) }]}>
                    {t('home.shapesHint')}
                  </Text>
                  <View
                    style={[styles.cardsGrid, { gap: GRID_GAP }]}
                    onLayout={(e) => {
                      if (gridW === 0) setGridW(e.nativeEvent.layout.width);
                    }}
                  >
                    {tileW > 0 &&
                      baseRecipes.map((r) => (
                        <RecipeCard key={r.id} recipe={r} theme={theme} width={tileW} fontScale={s} compact />
                      ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {tab === 'andamento' && (
          <InProgressView
            theme={theme}
            projects={activeProjects}
            onExplore={() => setTab('projetos')}
            onOpen={(recipeId) => router.push({ pathname: '/guide/[id]', params: { id: recipeId } })}
            onDiscard={setDiscardId}
          />
        )}

        {tab === 'salvos' && null}

        {tab === 'compras' && purchaseCount > 0 && (
          <PurchasesView theme={theme} onLogin={() => router.push('/account')} />
        )}

        {tab === 'meus' && (
          <MyAmigurumisView
            theme={theme}
            finished={finishedList}
            onExplore={() => setTab('projetos')}
            onOpen={(recipeId) => router.push({ pathname: '/recipe/[id]', params: { id: recipeId } })}
          />
        )}
      </SafeAreaView>

      <Modal
        visible={discardId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDiscardId(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setDiscardId(null)}>
          <Pressable style={[styles.modalCard, { backgroundColor: theme.surface }]} onPress={() => { }}>
            <Text style={styles.modalEmoji}>🧶</Text>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('home.discardTitle')}</Text>
            <Text style={[styles.modalText, { color: theme.text }]}>
              {discardId ? t('home.discardBody', { title: getRecipe(discardId)?.title ?? '' }) : ''}
            </Text>
            <View style={styles.modalBtns}>
              <Pressable
                style={[styles.modalBtn, styles.modalGhost, { borderColor: theme.textMuted }]}
                onPress={() => setDiscardId(null)}
              >
                <Text style={[styles.modalBtnText, { color: theme.text }]}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalDanger]}
                onPress={() => {
                  if (discardId) void discardProject(discardId);
                  setDiscardId(null);
                }}
              >
                <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>{t('home.discardConfirm')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function InProgressView({
  theme,
  projects,
  onExplore,
  onOpen,
  onDiscard,
}: {
  theme: AppTheme;
  projects: ProjectState[];
  onExplore: () => void;
  onOpen: (recipeId: string) => void;
  onDiscard: (recipeId: string) => void;
}) {
  const { t } = useTranslation();

  if (projects.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>⏳</Text>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('home.inProgressEmptyTitle')}</Text>
        <Text style={[styles.emptyText, { color: theme.text }]}>{t('home.inProgressEmpty')}</Text>
        <Pressable onPress={onExplore} style={[styles.emptyBtn, { backgroundColor: theme.primary }]}>
          <Text style={[styles.emptyBtnText, { color: theme.primaryText }]}>{t('home.inProgressCta')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.tabPane} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.cardsList}>
        {projects.map((p) => (
          <InProgressCard
            key={p.recipeId}
            project={p}
            theme={theme}
            onPress={() => onOpen(p.recipeId)}
            onDiscard={() => onDiscard(p.recipeId)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function InProgressCard({
  project,
  theme,
  onPress,
  onDiscard,
}: {
  project: ProjectState;
  theme: AppTheme;
  onPress: () => void;
  onDiscard: () => void;
}) {
  const { t } = useTranslation();
  const { locale } = useAppLocale();
  const { getRecipe } = useCatalog();
  const recipe = getRecipe(project.recipeId, project.sizeCm);
  if (!recipe) return null;
  const pos = normalizePosition(project);
  const pct = Math.round(progressFraction(recipe, pos, project.finished, locale) * 100);
  const desc = describePosition(recipe, pos, project.finished, locale);
  const img = recipeImage(recipe.cover);

  return (
    <View style={[styles.wideCard, { backgroundColor: theme.surface }, shadow(2)]}>
      <Pressable onPress={onPress} style={styles.wideCardMain}>
        <View style={[styles.wideThumb, { backgroundColor: theme.surfaceAlt }]}>
          {img ? <Image source={img} style={styles.fill} contentFit="cover" /> : <Text style={styles.projectEmoji}>{recipe.emoji}</Text>}
        </View>
        <View style={styles.wideBody}>
          <Text style={[styles.wideTitle, { color: theme.text }]} numberOfLines={1}>
            {recipe.title}
          </Text>
          <Text style={[styles.wideDesc, { color: theme.text }]} numberOfLines={1}>
            {desc}
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: theme.surfaceAlt }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${pct}%` }]} />
          </View>
          <Text style={[styles.widePct, { color: theme.primary }]}>{t('home.pctDone', { pct })}</Text>
        </View>
      </Pressable>
      <View style={styles.wideActions}>
        <Pressable onPress={onPress} style={[styles.wideContinue, { backgroundColor: theme.accent }]}>
          <Text style={styles.wideContinueText}>{t('home.continue')}</Text>
        </Pressable>
        <Pressable onPress={onDiscard} hitSlop={8} style={[styles.wideDiscard, { borderColor: theme.border }]}>
          <Text style={[styles.wideDiscardText, { color: theme.text }]}>{t('home.discard')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SavedView({ theme, onLogin }: { theme: AppTheme; onLogin: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🔖</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>Seus favoritos ficam aqui</Text>
      <Text style={[styles.emptyText, { color: theme.text }]}>
        Em breve você poderá salvar as receitas que amar pra achar rapidinho depois. É só criar sua
        conta.
      </Text>
      <Pressable onPress={onLogin} style={[styles.emptyBtn, { backgroundColor: theme.primary }]}>
        <Text style={[styles.emptyBtnText, { color: theme.primaryText }]}>Criar conta / Entrar</Text>
      </Pressable>
    </View>
  );
}

function PurchasesView({ theme, onLogin }: { theme: AppTheme; onLogin: () => void }) {
  const { t } = useTranslation();
  const { localeTag } = useAppLocale();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<PurchaseWithRecipe[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setItems([]);
        return;
      }
      setLoading(true);
      listMyPurchases()
        .then(setItems)
        .finally(() => setLoading(false));
    }, [user]),
  );

  if (authLoading || loading) {
    return (
      <View style={styles.emptyState}>
        <Text style={[styles.emptyText, { color: theme.text }]}>{t('home.loadingPurchases')}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🛍️</Text>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('home.purchasesLoginTitle')}</Text>
        <Text style={[styles.emptyText, { color: theme.text }]}>{t('home.purchasesLoginHint')}</Text>
        <Pressable onPress={onLogin} style={[styles.emptyBtn, { backgroundColor: theme.primary }]}>
          <Text style={[styles.emptyBtnText, { color: theme.primaryText }]}>{t('home.loginCta')}</Text>
        </Pressable>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🛍️</Text>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('home.purchasesEmpty')}</Text>
        <Text style={[styles.emptyText, { color: theme.text }]}>{t('home.purchasesEmptyHint')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.tabPane} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('home.purchasesTitle')}</Text>
      <View style={styles.cardsList}>
        {items.map((p) => (
          <View
            key={p.id}
            style={[styles.purchaseCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Text style={[styles.purchaseTitle, { color: theme.text }]}>
              {p.market_recipes?.title ?? t('home.recipeFallback')}
            </Text>
            <Text style={[styles.purchaseMeta, { color: theme.text }]}>
              {(p.amount_cents / 100).toLocaleString(localeTag, {
                style: 'currency',
                currency: p.market_recipes?.currency ?? 'USD',
              })}
              {' · '}
              {new Date(p.created_at).toLocaleDateString(localeTag)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function MyAmigurumisView({
  theme,
  finished,
  onExplore,
  onOpen,
}: {
  theme: AppTheme;
  finished: FinishedProject[];
  onExplore: () => void;
  onOpen: (recipeId: string) => void;
}) {
  const { t } = useTranslation();
  const achievements = useMemo(() => evaluateAchievements(finished), [finished]);
  const unlocked = countUnlocked(achievements);

  return (
    <ScrollView style={styles.tabPane} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={[styles.trophyCard, { backgroundColor: theme.primary }]}>
        <Text style={styles.trophyEmoji}>🏆</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.trophyNum, { color: theme.primaryText }]}>{finished.length}</Text>
          <Text style={[styles.trophyLabel, { color: theme.primaryText }]}>
            {t('home.finishedCount', { count: finished.length })}
          </Text>
        </View>
        <Text style={[styles.trophyHint, { color: theme.primaryText }]}>
          {t('home.achievementsCount', { unlocked, total: achievements.length })}
        </Text>
      </View>

      {finished.length === 0 ? (
        <View style={[styles.startCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={styles.startEmoji}>🌱</Text>
          <Text style={[styles.startTitle, { color: theme.text }]}>{t('home.portfolioStart')}</Text>
          <Text style={[styles.startText, { color: theme.text }]}>{t('home.portfolioStartHint')}</Text>
          <Pressable onPress={onExplore} style={[styles.emptyBtn, { backgroundColor: theme.primary }]}>
            <Text style={[styles.emptyBtnText, { color: theme.primaryText }]}>{t('home.portfolioCta')}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('home.collection')}</Text>
          <View style={styles.finishedGrid}>
            {finished.map((f) => (
              <FinishedCard key={f.id} item={f} theme={theme} onPress={() => onOpen(f.recipeId)} />
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('home.achievements')}</Text>
        <View style={styles.finishedGrid}>
          {achievements.map((a) => (
            <MedalCard key={a.id} achievement={a} theme={theme} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function MedalCard({ achievement, theme }: { achievement: AchievementResult; theme: AppTheme }) {
  const { t } = useTranslation();
  const { unlocked, progress } = achievement;
  const pct = progress ? Math.round((progress.current / progress.target) * 100) : unlocked ? 100 : 0;
  return (
    <View
      style={[
        styles.medalCard,
        {
          backgroundColor: unlocked ? theme.surface : theme.surfaceAlt,
          borderColor: unlocked ? theme.accent : theme.border,
        },
      ]}
    >
      <Text style={[styles.medalEmoji, !unlocked && styles.medalLocked]}>
        {unlocked ? achievement.emoji : '🔒'}
      </Text>
      <Text style={[styles.medalTitle, { color: theme.text }]} numberOfLines={1}>
        {t(`achievements.${achievement.id}.title`)}
      </Text>
      <Text style={[styles.medalDesc, { color: theme.text }]} numberOfLines={2}>
        {t(`achievements.${achievement.id}.description`)}
      </Text>
      {!unlocked && progress && (
        <>
          <View style={[styles.progressTrack, { backgroundColor: theme.border, alignSelf: 'stretch' }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${pct}%` }]} />
          </View>
          <Text style={[styles.medalProgress, { color: theme.primary }]}>
            {progress.current}/{progress.target}
          </Text>
        </>
      )}
      {unlocked && <Text style={[styles.medalDone, { color: theme.accent }]}>{t('home.achievementUnlocked')}</Text>}
    </View>
  );
}

function FinishedCard({ item, theme, onPress }: { item: FinishedProject; theme: AppTheme; onPress: () => void }) {
  const { t } = useTranslation();
  const { localeTag } = useAppLocale();
  const { getRecipe } = useCatalog();
  const recipe = getRecipe(item.recipeId);
  if (!recipe) return null;
  const img = recipeImage(recipe.cover);
  const date = new Date(item.finishedAt).toLocaleDateString(localeTag, { day: '2-digit', month: 'short' });
  return (
    <Pressable onPress={onPress} style={[styles.finishedCard, { backgroundColor: theme.surface }, shadow(2)]}>
      <View style={[styles.finishedThumb, { backgroundColor: theme.surfaceAlt }]}>
        {img ? <Image source={img} style={styles.fill} contentFit="cover" /> : <Text style={styles.projectEmoji}>{recipe.emoji}</Text>}
        <View style={[styles.finishedBadge, { backgroundColor: theme.primary }]}>
          <Text style={styles.finishedBadgeText}>✓</Text>
        </View>
      </View>
      <Text style={[styles.finishedTitle, { color: theme.text }]} numberOfLines={1}>
        {recipe.title}
      </Text>
      <Text style={[styles.finishedDate, { color: theme.text }]}>{t('home.madeOn', { date })}</Text>
    </Pressable>
  );
}

function ProjectCard({ project, theme, onPress }: { project: ProjectState; theme: AppTheme; onPress: () => void }) {
  const { t } = useTranslation();
  const { locale } = useAppLocale();
  const { getRecipe } = useCatalog();
  const recipe = getRecipe(project.recipeId, project.sizeCm);
  if (!recipe) return null;
  const pos = normalizePosition(project);
  const pct = Math.round(progressFraction(recipe, pos, project.finished, locale) * 100);
  const desc = describePosition(recipe, pos, project.finished, locale);
  const img = recipeImage(recipe.cover);

  return (
    <Pressable onPress={onPress} style={[styles.projectCard, { backgroundColor: theme.surface }, shadow(2)]}>
      <View style={[styles.projectThumb, { backgroundColor: theme.surfaceAlt }]}>
        {img ? <Image source={img} style={styles.fill} contentFit="cover" /> : <Text style={styles.projectEmoji}>{recipe.emoji}</Text>}
      </View>
      <Text style={[styles.projectTitle, { color: theme.text }]} numberOfLines={1}>
        {recipe.title}
      </Text>
      <Text style={[styles.projectDesc, { color: theme.text }]} numberOfLines={1}>
        {desc}
      </Text>
      <View style={[styles.progressTrack, { backgroundColor: theme.surfaceAlt }]}>
        <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${pct}%` }]} />
      </View>
      <View style={styles.projectFooter}>
        <Text style={[styles.projectPct, { color: theme.text }]}>{pct}%</Text>
        <View style={[styles.continueTag, { backgroundColor: theme.accent }]}>
          <Text style={styles.continueText}>{t('home.continue')}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function RecipeCard({
  recipe,
  theme,
  width,
  fontScale,
  compact,
}: {
  recipe: Recipe;
  theme: AppTheme;
  width: number;
  fontScale: (n: number) => number;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const img = recipeImage(recipe.cover);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}
      style={({ pressed }) => [{ width, opacity: pressed ? 0.88 : 1 }, styles.tile]}
    >
      <View style={[styles.tileImg, { backgroundColor: theme.surfaceAlt }, compact && styles.tileImgCompact]}>
        {img ? (
          <Image source={img} style={styles.fill} contentFit="cover" />
        ) : (
          <Text style={styles.tileEmoji}>{recipe.emoji ?? '🧶'}</Text>
        )}
        {recipe.isPremium && (
          <View style={[styles.tilePremium, { backgroundColor: semantic.premium }]}>
            <Text style={[styles.tilePremiumText, { color: semantic.premiumText }]}>★</Text>
          </View>
        )}
      </View>
      <View style={styles.tileCopy}>
        <Text
          style={[styles.tileTitle, { color: theme.text, fontSize: fontScale(font.h2) }]}
          numberOfLines={2}
        >
          {recipe.title}
        </Text>
      <Text style={[styles.tileMeta, { color: theme.textMuted, fontSize: fontScale(font.small) }]} numberOfLines={1}>
          {recipe.isPremium ? `★ ${t('common.premium')}` : t(`difficulty.${recipe.difficulty}`)}
          {recipe.estimatedHours ? ` · ${recipe.estimatedHours}h` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  fill: { width: '100%', height: '100%' },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, pointerEvents: 'none' },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.xs,
  },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 20 },
  hello: { fontSize: font.body, fontFamily: typeface.bodySemi },
  hero: { fontSize: font.hero, fontFamily: typeface.display, letterSpacing: 0.2, marginTop: 2 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22 },

  subTabsScroll: { flexGrow: 0, flexShrink: 0 },
  subTabs: {
    flexDirection: 'row',
    paddingHorizontal: space.lg,
    gap: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
    alignItems: 'flex-end',
  },
  subTab: { alignItems: 'center', gap: 6, paddingTop: 2 },
  subTabText: { fontSize: font.small, fontFamily: typeface.bodyBold },
  subTabBar: { height: 3, borderRadius: 2, alignSelf: 'stretch' },

  tabPane: { flex: 1 },
  scroll: { paddingHorizontal: space.lg, paddingBottom: 56, gap: space.xl },

  section: { gap: space.md },
  sectionTitle: { fontFamily: typeface.display, marginBottom: 2 },
  sectionHint: { fontFamily: typeface.bodySemi, lineHeight: 20, marginBottom: space.xs },

  projectsRow: { gap: space.md, paddingVertical: space.xs, paddingRight: space.lg },
  projectCard: { width: 210, borderRadius: radius.lg, padding: space.md, gap: 6 },
  projectThumb: {
    height: 110,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  projectEmoji: { fontSize: 44 },
  projectTitle: { fontSize: font.h2, fontFamily: typeface.displaySemi, marginTop: 4 },
  projectDesc: { fontSize: font.small, fontFamily: typeface.bodySemi },
  projectFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  projectPct: { fontSize: font.small, fontFamily: typeface.bodyBold },
  continueTag: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill },
  continueText: { fontSize: font.small, fontFamily: typeface.bodyBold, color: '#FFFFFF' },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, fontSize: font.body, fontFamily: typeface.bodySemi, paddingVertical: 0 },

  chipsScroll: { flexGrow: 0, flexShrink: 0 },
  chipsRow: { gap: space.sm, paddingVertical: 2, paddingRight: space.lg, alignItems: 'center' },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1 },
  chipText: { fontSize: font.small, fontFamily: typeface.bodyBold },

  cardsList: { gap: space.lg },
  purchaseCard: { borderRadius: radius.lg, borderWidth: 1, padding: space.lg, gap: 4 },
  purchaseTitle: { fontSize: font.h2, fontFamily: typeface.displaySemi },
  purchaseMeta: { fontSize: font.small, fontFamily: typeface.bodySemi },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: space.sm },
  tile: { gap: 8 },
  tileImg: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileImgCompact: { aspectRatio: 1.1 },
  tileEmoji: { fontSize: 40 },
  tilePremium: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tilePremiumText: { fontSize: 13, fontFamily: typeface.bodyBold },
  tileCopy: { gap: 2, paddingHorizontal: 2 },
  tileTitle: { fontSize: font.h2, fontFamily: typeface.displaySemi, lineHeight: 24 },
  tileMeta: { fontSize: font.small, fontFamily: typeface.bodySemi, lineHeight: 20 },

  progressTrack: { height: 9, borderRadius: 5, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%', borderRadius: 5 },

  empty: { textAlign: 'center', marginTop: space.xl, fontSize: font.h2, fontFamily: typeface.bodySemi },
  catalogHint: {
    marginTop: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: space.sm,
  },
  catalogHintTitle: { fontSize: font.h2, fontFamily: typeface.displaySemi },
  catalogHintText: { fontSize: font.body, lineHeight: 22 },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: space.xxl,
    paddingTop: space.xxl,
    gap: space.md,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: font.title, fontFamily: typeface.display, textAlign: 'center' },
  emptyText: { fontSize: font.body, textAlign: 'center', lineHeight: 24, maxWidth: 320 },
  emptyBtn: { paddingHorizontal: space.xl, paddingVertical: 16, borderRadius: radius.lg, marginTop: space.sm },
  emptyBtnText: { fontSize: font.h2, fontFamily: typeface.bodyBold },

  trophyCard: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.xl },
  trophyEmoji: { fontSize: 46 },
  trophyNum: { fontSize: font.hero, fontFamily: typeface.display, lineHeight: 38 },
  trophyLabel: { fontSize: font.body, fontFamily: typeface.bodySemi },
  trophyHint: { fontSize: font.small, fontFamily: typeface.bodySemi, textAlign: 'right', opacity: 0.9 },

  finishedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  finishedCard: { width: '47%', flexGrow: 1, borderRadius: radius.lg, padding: space.sm, gap: 6 },
  finishedThumb: { height: 130, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  finishedBadge: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  finishedBadgeText: { color: '#FFFFFF', fontSize: 17, fontFamily: typeface.bodyBold },
  finishedTitle: { fontSize: font.body, fontFamily: typeface.displaySemi, marginTop: 2 },
  finishedDate: { fontSize: font.small, fontFamily: typeface.bodySemi },

  wideCard: { borderRadius: radius.xl, padding: space.md, gap: space.md },
  wideCardMain: { flexDirection: 'row', gap: space.md },
  wideThumb: { width: 92, height: 92, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  wideBody: { flex: 1, justifyContent: 'center', gap: 5 },
  wideTitle: { fontSize: font.h2, fontFamily: typeface.display },
  wideDesc: { fontSize: font.small, fontFamily: typeface.bodySemi },
  widePct: { fontSize: font.small, fontFamily: typeface.bodyBold },
  wideActions: { flexDirection: 'row', gap: space.sm },
  wideContinue: { flex: 1, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
  wideContinueText: { fontSize: font.h2, fontFamily: typeface.bodyBold, color: '#FFFFFF' },
  wideDiscard: { paddingHorizontal: space.lg, paddingVertical: 14, borderRadius: radius.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  wideDiscardText: { fontSize: font.body, fontFamily: typeface.bodySemi },

  startCard: { padding: space.xl, borderRadius: radius.xl, borderWidth: 1, alignItems: 'center', gap: space.sm },
  startEmoji: { fontSize: 52 },
  startTitle: { fontSize: font.h2, fontFamily: typeface.display, textAlign: 'center' },
  startText: { fontSize: font.body, textAlign: 'center', lineHeight: 23 },

  medalCard: { width: '47%', flexGrow: 1, borderRadius: radius.lg, borderWidth: 2, padding: space.md, gap: 5, alignItems: 'center' },
  medalEmoji: { fontSize: 40 },
  medalLocked: { opacity: 0.6 },
  medalTitle: { fontSize: font.body, fontFamily: typeface.displaySemi, textAlign: 'center' },
  medalDesc: { fontSize: font.small, fontFamily: typeface.bodySemi, textAlign: 'center', lineHeight: 19 },
  medalProgress: { fontSize: font.small, fontFamily: typeface.bodyBold },
  medalDone: { fontSize: font.small, fontFamily: typeface.bodyBold },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(30,20,26,0.55)', alignItems: 'center', justifyContent: 'center', padding: space.xl },
  modalCard: { width: '100%', maxWidth: 360, borderRadius: radius.xl, padding: space.xl, alignItems: 'center', gap: space.sm },
  modalEmoji: { fontSize: 40 },
  modalTitle: { fontSize: font.title, fontFamily: typeface.display, textAlign: 'center' },
  modalText: { fontSize: font.body, textAlign: 'center', lineHeight: 23 },
  modalBtns: { flexDirection: 'row', gap: space.sm, marginTop: space.md, alignSelf: 'stretch' },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
  modalGhost: { borderWidth: 1.5 },
  modalDanger: { backgroundColor: '#DC2626' },
  modalBtnText: { fontSize: font.body, fontFamily: typeface.bodyBold },
});
