import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hasPaidPurchase } from '@/api/recipes';
import { useAuth } from '@/auth/AuthContext';
import { BaseSizePicker } from '@/components/BaseSizePicker';
import { GuidePanel } from '@/components/GuidePanel';
import { RecipeReviews } from '@/components/RecipeReviews';
import { recipeImage } from '@/data/recipe-images';
import { roundLabel, roundToText } from '@/engine/guide';
import { normalizeRecipeId } from '@/engine/resolve-recipe';
import { formatPrice, purchaseRecipe, allowAdminGrant } from '@/iap/billing';
import { useAppLocale } from '@/i18n/LocaleContext';
import { useCatalog } from '@/state/catalog';
import { getProject } from '@/state/projects';
import { useTheme } from '@/theme/ThemeContext';
import type { AppTheme } from '@/theme/theme';
import { font, radius, semantic, space, typeface } from '@/theme/tokens';

type ViewMode = 'receita' | 'guia';

export default function RecipeDetailScreen() {
  const { t } = useTranslation();
  const { locale, localeTag } = useAppLocale();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { getRecipeStub, getRecipe, refresh } = useCatalog();
  const { user, isAdmin } = useAuth();
  const stub = getRecipeStub(id);
  const [sizeCm, setSizeCm] = useState(stub?.base?.defaultSizeCm ?? stub?.finalSizeCm ?? 7);
  const [started, setStarted] = useState(false);
  const [owned, setOwned] = useState(false);
  const [buyMsg, setBuyMsg] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [mode, setMode] = useState<ViewMode>('receita');

  const recipe = useMemo(
    () => getRecipe(id, stub?.base ? sizeCm : undefined),
    [getRecipe, id, sizeCm, stub?.base],
  );

  const refreshAccess = useCallback(() => {
    const recipeId = normalizeRecipeId(id ?? '');
    getProject(recipeId).then((p) => {
      setStarted(!!p && !p.finished);
      if (p?.sizeCm && stub?.base) setSizeCm(p.sizeCm);
    });
    if (!recipe?.isPremium) {
      setOwned(true);
      return;
    }
    if (!user) {
      setOwned(false);
      return;
    }
    if (isAdmin) {
      setOwned(true);
      return;
    }
    if (recipe) hasPaidPurchase(recipe.id, user.id).then(setOwned);
  }, [id, recipe, user, isAdmin, stub?.base]);

  useFocusEffect(
    useCallback(() => {
      refreshAccess();
    }, [refreshAccess]),
  );

  if (!recipe) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.text }}>{t('common.notFound')}</Text>
      </View>
    );
  }

  const cover = recipeImage(recipe.cover);
  const locked = recipe.isPremium && !owned;
  const priceLabel = formatPrice(recipe.priceCents ?? 0, recipe.currency, localeTag);

  const onBuy = async (adminGrant = false) => {
    setBuyMsg(null);
    if (!user) {
      router.push('/account');
      return;
    }
    setBuying(true);
    const res = await purchaseRecipe(recipe, { isAdmin, forceAdminGrant: adminGrant });
    setBuying(false);
    if (!res.ok) {
      setBuyMsg(res.message);
      return;
    }
    setOwned(true);
    await refresh();
    setBuyMsg(adminGrant ? t('recipe.adminOk') : t('recipe.purchaseOk'));
    setMode('guia');
  };

  const openGuide = () => {
    if (locked) {
      setBuyMsg(t('recipe.guideLocked'));
      return;
    }
    setMode('guia');
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={styles.hero}>
        {cover ? (
          <Image source={cover} style={styles.heroImg} contentFit="cover" />
        ) : (
          <View style={[styles.heroImg, styles.center, { backgroundColor: theme.surfaceAlt }]}>
            <Text style={{ fontSize: 72 }}>{recipe.emoji}</Text>
          </View>
        )}
        <LinearGradient colors={['transparent', theme.bg]} style={styles.heroScrim} />
        <SafeAreaView edges={['top']} style={styles.heroTop}>
          <Pressable onPress={() => router.back()} style={styles.roundBtn} hitSlop={10}>
            <Text style={styles.roundBtnText}>‹</Text>
          </Pressable>
          {recipe.isPremium && (
            <View style={[styles.premiumTag, { backgroundColor: semantic.premium }]}>
              <Text style={[styles.premiumText, { color: semantic.premiumText }]}>
                {t('recipe.premiumTag', { price: priceLabel })}
              </Text>
            </View>
          )}
        </SafeAreaView>
      </View>

      <View style={[styles.head, { backgroundColor: theme.bg }]}>
        <Text style={[styles.category, { color: theme.primary }]}>
          {t(`category.${recipe.category}`).toUpperCase()}
        </Text>
        <Text style={[styles.title, { color: theme.text }]}>{recipe.title}</Text>

        <View style={[styles.modeRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Pressable
            onPress={() => setMode('receita')}
            style={[styles.modeBtn, mode === 'receita' && { backgroundColor: theme.primary }]}
          >
            <Text
              style={[
                styles.modeBtnText,
                { color: mode === 'receita' ? theme.primaryText : theme.text },
              ]}
            >
              {t('recipe.modeRecipe')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => (locked ? onBuy(false) : setMode('guia'))}
            style={[styles.modeBtn, mode === 'guia' && { backgroundColor: theme.primary }]}
          >
            <Text
              style={[
                styles.modeBtnText,
                { color: mode === 'guia' ? theme.primaryText : theme.text },
              ]}
            >
              {locked ? t('recipe.modeGuideLocked') : t('recipe.modeGuide')}
            </Text>
          </Pressable>
        </View>
      </View>

      {mode === 'guia' && !locked ? (
        <GuidePanel recipeId={recipe.id} sizeCm={stub?.base ? sizeCm : undefined} embedded />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={[styles.body, { backgroundColor: theme.bg }]}>
              {!!recipe.description && (
                <Text style={[styles.desc, { color: theme.text }]}>{recipe.description}</Text>
              )}

              <View style={styles.statsRow}>
                <Stat theme={theme} value={t(`difficulty.${recipe.difficulty}`)} label={t('recipe.level')} />
                {!!recipe.estimatedHours && (
                  <Stat theme={theme} value={`${recipe.estimatedHours}h`} label={t('recipe.time')} />
                )}
                {!!recipe.finalSizeCm && (
                  <Stat theme={theme} value={`${recipe.finalSizeCm}cm`} label={t('recipe.size')} />
                )}
                <Stat theme={theme} value={`${recipe.pieces.length}`} label={t('recipe.pieces')} />
              </View>

              {!!stub?.base && (
                <BaseSizePicker
                  sizesCm={stub.base.sizesCm}
                  value={sizeCm}
                  onChange={setSizeCm}
                  disabled={started}
                />
              )}

              {locked && (
                <View style={[styles.lockBox, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                  <Text style={[styles.lockTitle, { color: theme.text }]}>{t('recipe.premiumTitle')}</Text>
                  <Text style={[styles.lockText, { color: theme.text }]}>
                    {t('recipe.premiumBody', { price: priceLabel })}
                  </Text>
                  <Pressable
                    onPress={() => onBuy(false)}
                    disabled={buying}
                    style={[styles.buyBtn, { backgroundColor: theme.accent, opacity: buying ? 0.7 : 1 }]}
                  >
                    <Text style={styles.buyBtnText}>
                      {buying ? t('recipe.buyWait') : t('recipe.buy', { price: priceLabel })}
                    </Text>
                  </Pressable>
                  {isAdmin && allowAdminGrant() && (
                    <Pressable onPress={() => onBuy(true)} style={styles.adminLink}>
                      <Text style={[styles.adminLinkText, { color: theme.primary }]}>{t('recipe.adminGrant')}</Text>
                    </Pressable>
                  )}
                  {!!buyMsg && <Text style={[styles.buyMsg, { color: theme.text }]}>{buyMsg}</Text>}
                </View>
              )}

              {!!recipe.colors?.length && (
                <View style={styles.colorsRow}>
                  {recipe.colors.map((c) => (
                    <View key={c.id} style={styles.colorItem}>
                      <View style={[styles.swatch, { backgroundColor: c.hex, borderColor: theme.border }]} />
                      <Text style={[styles.colorLabel, { color: theme.text }]}>{c.label}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Section title={t('recipe.piecesSection')} theme={theme}>
                {recipe.pieces.map((p) => (
                  <View key={p.id} style={styles.pieceRow}>
                    <Text style={[styles.pieceName, { color: theme.text }]}>{p.name}</Text>
                    <Text style={[styles.pieceQty, { color: theme.text }]}>×{p.qty}</Text>
                  </View>
                ))}
              </Section>

              <Section title={t('recipe.materials')} theme={theme}>
                {recipe.materials.map((m, i) => (
                  <Text key={i} style={[styles.li, { color: theme.text }]}>
                    • {m.label}
                    {m.color ? ` — ${m.color}` : ''}
                    {m.amount ? ` (${m.amount})` : ''}
                  </Text>
                ))}
              </Section>

              {!!recipe.notes?.length && (
                <Section title={t('recipe.tips')} theme={theme}>
                  {recipe.notes.map((n, i) => (
                    <Text key={i} style={[styles.li, { color: theme.text }]}>
                      • {n}
                    </Text>
                  ))}
                </Section>
              )}

              {!locked &&
                recipe.pieces.map((p) => (
                  <Section
                    key={p.id}
                    title={
                      p.qty > 1
                        ? t('recipe.roundsPieceQty', { name: p.name, qty: p.qty })
                        : t('recipe.roundsPiece', { name: p.name })
                    }
                    theme={theme}
                  >
                    {(p.rounds ?? []).map((round, i) => (
                      <View key={i} style={styles.roundRow}>
                        <View style={[styles.roundLabel, { backgroundColor: theme.surfaceAlt }]}>
                          <Text style={[styles.roundLabelText, { color: theme.text }]}>
                            {roundLabel(round, locale)}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.roundText,
                            { color: theme.text },
                            round.kind === 'note' && styles.roundNote,
                          ]}
                        >
                          {roundToText(round, locale)}
                        </Text>
                      </View>
                    ))}
                  </Section>
                ))}

              {!!recipe.assembly?.length && !locked && (
                <Section title={t('recipe.assembly')} theme={theme}>
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

              {recipe.source === 'remote' && <RecipeReviews recipeId={recipe.id} />}
            </View>
          </ScrollView>

          {!locked && (
            <View style={[styles.footer, { borderColor: theme.border, backgroundColor: theme.bg }]}>
              <Pressable onPress={openGuide} style={[styles.cta, { backgroundColor: theme.primary }]}>
                <Text style={[styles.ctaText, { color: theme.primaryText }]}>
                  {started ? t('recipe.continueGuide') : t('recipe.startGuide')}
                </Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
}

function Stat({ theme, value, label }: { theme: AppTheme; value: string; label: string }) {
  return (
    <View style={[styles.stat, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

function Section({ title, theme, children }: { title: string; theme: AppTheme; children: React.ReactNode }) {
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
  hero: { height: 220, width: '100%' },
  heroImg: { width: '100%', height: '100%' },
  heroScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 100, pointerEvents: 'none' },
  heroTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnText: { fontSize: 26, fontWeight: '800', color: '#3A2A24', marginTop: -3 },
  premiumTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm },
  premiumText: { fontSize: font.tiny, fontFamily: typeface.bodyBold },

  head: { paddingHorizontal: space.lg, paddingTop: space.sm, gap: space.sm, marginTop: -20 },
  category: { fontSize: font.small, fontFamily: typeface.bodyBold, letterSpacing: 1.5 },
  title: { fontSize: font.title, fontFamily: typeface.display },
  modeRow: { flexDirection: 'row', borderRadius: radius.lg, borderWidth: 1, padding: 4, gap: 4 },
  modeBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.md, alignItems: 'center' },
  modeBtnText: { fontSize: font.body, fontFamily: typeface.bodyBold },

  body: { padding: space.lg, gap: space.lg },
  desc: { fontSize: font.body, lineHeight: 24 },

  statsRow: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
  stat: {
    flex: 1,
    minWidth: 74,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: space.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: font.h2, fontFamily: typeface.displaySemi },
  statLabel: { fontSize: font.small, fontFamily: typeface.bodySemi },
  colorsRow: { flexDirection: 'row', gap: space.lg, flexWrap: 'wrap' },
  colorItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 24, height: 24, borderRadius: 12, borderWidth: 2 },
  colorLabel: { fontSize: font.body, fontFamily: typeface.bodySemi },

  lockBox: { borderWidth: 1, borderRadius: radius.lg, padding: space.lg, gap: space.sm },
  lockTitle: { fontSize: font.h2, fontFamily: typeface.displaySemi },
  lockText: { fontSize: font.body, lineHeight: 22 },
  buyBtn: { marginTop: space.sm, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
  buyBtnText: { color: '#FFFFFF', fontSize: font.h2, fontFamily: typeface.bodyBold },
  adminLink: { alignItems: 'center', paddingVertical: 8 },
  adminLinkText: { fontSize: font.small, fontFamily: typeface.bodyBold },
  buyMsg: { fontSize: font.small, fontFamily: typeface.bodySemi, lineHeight: 20 },

  section: { gap: space.sm },
  sectionTitle: { fontSize: font.title, fontFamily: typeface.display },
  sectionBody: { borderRadius: radius.lg, borderWidth: 1, padding: space.lg, gap: space.md },

  pieceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pieceName: { fontSize: font.body, fontFamily: typeface.bodySemi },
  pieceQty: { fontSize: font.body, fontFamily: typeface.bodyBold },

  li: { fontSize: font.body, lineHeight: 24 },

  roundRow: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  roundLabel: {
    minWidth: 58,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  roundLabelText: { fontSize: font.small, fontFamily: typeface.bodyBold },
  roundText: { flex: 1, fontSize: font.body, lineHeight: 23 },
  roundNote: { fontStyle: 'italic' },

  assemblyRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  stepBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepBadgeText: { fontSize: font.body, fontFamily: typeface.bodyBold },

  footer: { padding: space.lg, borderTopWidth: 1 },
  cta: { paddingVertical: 18, borderRadius: radius.lg, alignItems: 'center' },
  ctaText: { fontSize: font.title, fontFamily: typeface.bodyBold },
});
