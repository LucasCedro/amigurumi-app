import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { hasPaidPurchase } from '@/api/recipes';
import { useAuth } from '@/auth/AuthContext';
import { Celebration } from '@/components/Celebration';
import { SpiralProgress } from '@/components/SpiralProgress';
import { getStitch, getStitchHint } from '@/data/stitches';
import {
  countCarreiras,
  guideRoundLabel,
  repeatTotalOf,
  stepsPerRepeat,
  type GuideRound,
} from '@/engine/guide';
import {
  buildInstances,
  normalizePosition,
  pieceInstanceLabel,
  pieceProgress,
  progressFraction,
} from '@/engine/project';
import { useAppLocale } from '@/i18n/LocaleContext';
import { useFontScale } from '@/hooks/useFontScale';
import { addFinished } from '@/state/collection';
import { useCatalog } from '@/state/catalog';
import { deleteProject, getProject, saveProject } from '@/state/projects';
import { useTheme } from '@/theme/ThemeContext';
import { font, radius, space, typeface } from '@/theme/tokens';
import { useTranslation } from 'react-i18next';
import type { Recipe, RecipeColor } from '@/types/recipe';

export interface GuidePanelProps {
  recipeId: string;
  sizeCm?: number;
  /** dentro da tela de receita (sem header completo) */
  embedded?: boolean;
}

export function GuidePanel({ recipeId, sizeCm: sizeProp, embedded }: GuidePanelProps) {
  const { t } = useTranslation();
  const { locale } = useAppLocale();
  const router = useRouter();
  const { theme } = useTheme();
  const { s } = useFontScale();
  const { getRecipeStub, getRecipe } = useCatalog();
  const { user, isAdmin } = useAuth();
  const stub = getRecipeStub(recipeId);

  const [sizeCm, setSizeCm] = useState(sizeProp ?? stub?.base?.defaultSizeCm);
  const [accessOk, setAccessOk] = useState(!stub?.isPremium);
  const [accessChecked, setAccessChecked] = useState(!stub?.isPremium);
  const [hydrated, setHydrated] = useState(!stub?.base);

  const recipe = useMemo(() => {
    if (!hydrated) return undefined;
    return getRecipe(recipeId, stub?.base ? sizeCm : undefined);
  }, [getRecipe, hydrated, recipeId, sizeCm, stub?.base]);

  const instances = useMemo(
    () => (recipe ? buildInstances(recipe, locale) : []),
    [recipe, locale],
  );
  const colorMap = useMemo(() => {
    const m: Record<string, RecipeColor> = {};
    recipe?.colors?.forEach((c) => (m[c.id] = c));
    return m;
  }, [recipe]);

  const [pieceIdx, setPieceIdx] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [repeatNo, setRepeatNo] = useState(1);
  const [finished, setFinished] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [giveUpOpen, setGiveUpOpen] = useState(false);
  const [savedToCollection, setSavedToCollection] = useState(false);
  const [collectionCount, setCollectionCount] = useState(0);
  const loaded = useRef(false);
  const pendingProject = useRef<Awaited<ReturnType<typeof getProject>>>(undefined);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    (async () => {
      if (!recipe?.isPremium || isAdmin) {
        if (!cancelled) {
          setAccessOk(true);
          setAccessChecked(true);
        }
        return;
      }
      if (!user) {
        if (!cancelled) {
          setAccessOk(false);
          setAccessChecked(true);
        }
        return;
      }
      const ok = await hasPaidPurchase(recipe.id, user.id);
      if (!cancelled) {
        setAccessOk(ok);
        setAccessChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [recipe, user, isAdmin, hydrated]);

  useEffect(() => {
    getProject(recipeId)
      .then((p) => {
        pendingProject.current = p;
        if (p?.sizeCm) setSizeCm(p.sizeCm);
      })
      .finally(() => {
        loaded.current = true;
        setHydrated(true);
      });
  }, [recipeId]);

  useEffect(() => {
    const p = pendingProject.current;
    if (!p || instances.length === 0) return;
    const pos = normalizePosition(p);
    if (pos.pieceIdx < instances.length) {
      setPieceIdx(pos.pieceIdx);
      setRoundIdx(pos.roundIdx);
      setStepIdx(pos.stepIdx);
      setRepeatNo(pos.repeatNo);
      setFinished(p.finished);
    }
  }, [instances.length]);

  useEffect(() => {
    if (!loaded.current || !recipe) return;
    void saveProject({
      recipeId: recipe.id,
      pieceIdx,
      roundIdx,
      stepIdx,
      repeatNo,
      finished,
      ...(stub?.base && sizeCm ? { sizeCm } : {}),
    });
  }, [recipe, pieceIdx, roundIdx, stepIdx, repeatNo, finished, stub?.base, sizeCm]);

  const pos = useMemo(
    () => ({ pieceIdx, roundIdx, stepIdx, repeatNo }),
    [pieceIdx, roundIdx, stepIdx, repeatNo],
  );

  const goNextRound = useCallback(() => {
    if (!recipe) return;
    const inst = instances[pieceIdx];
    const guide = inst.guide;
    if (roundIdx + 1 < guide.length) {
      setRoundIdx(roundIdx + 1);
      setStepIdx(0);
      setRepeatNo(1);
    } else if (pieceIdx + 1 < instances.length) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPieceIdx(pieceIdx + 1);
      setRoundIdx(0);
      setStepIdx(0);
      setRepeatNo(1);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFinished(true);
    }
  }, [instances, pieceIdx, recipe, roundIdx]);

  const advance = useCallback(() => {
    if (finished || !recipe) return;
    const inst = instances[pieceIdx];
    const round = inst.guide[roundIdx];

    if (round.kind === 'note') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      goNextRound();
      return;
    }

    const per = stepsPerRepeat(round);
    const total = repeatTotalOf(round);

    if (stepIdx < per - 1) {
      setStepIdx(stepIdx + 1);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    if (repeatNo < total) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRepeatNo(repeatNo + 1);
      setStepIdx(0);
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    goNextRound();
  }, [finished, goNextRound, instances, pieceIdx, recipe, repeatNo, roundIdx, stepIdx]);

  const back = useCallback(() => {
    if (finished) {
      setFinished(false);
      return;
    }

    const inst = instances[pieceIdx];
    const round = inst.guide[roundIdx];

    if (round.kind === 'stitches') {
      if (stepIdx > 0) {
        setStepIdx(stepIdx - 1);
        return;
      }
      if (repeatNo > 1) {
        setRepeatNo(repeatNo - 1);
        setStepIdx(stepsPerRepeat(round) - 1);
        return;
      }
    }

    if (roundIdx > 0) {
      const prev = inst.guide[roundIdx - 1];
      setRoundIdx(roundIdx - 1);
      if (prev.kind === 'stitches') {
        setRepeatNo(repeatTotalOf(prev));
        setStepIdx(stepsPerRepeat(prev) - 1);
      } else {
        setRepeatNo(1);
        setStepIdx(0);
      }
      return;
    }

    if (pieceIdx > 0) {
      const prevInst = instances[pieceIdx - 1];
      const lastRound = prevInst.guide[prevInst.guide.length - 1];
      setPieceIdx(pieceIdx - 1);
      setRoundIdx(prevInst.guide.length - 1);
      if (lastRound.kind === 'stitches') {
        setRepeatNo(repeatTotalOf(lastRound));
        setStepIdx(stepsPerRepeat(lastRound) - 1);
      } else {
        setRepeatNo(1);
        setStepIdx(0);
      }
    }
  }, [finished, instances, pieceIdx, repeatNo, roundIdx, stepIdx]);

  const reset = () => {
    setPieceIdx(0);
    setRoundIdx(0);
    setStepIdx(0);
    setRepeatNo(1);
    setFinished(false);
    setSavedToCollection(false);
  };

  const addToCollection = async () => {
    if (!recipe) return;
    const list = await addFinished(recipe.id);
    setCollectionCount(list.length);
    setSavedToCollection(true);
    await deleteProject(recipe.id);
  };

  const giveUp = async () => {
    if (recipe) await deleteProject(recipe.id);
    setGiveUpOpen(false);
    if (embedded) reset();
    else router.replace('/');
  };

  if (!accessChecked) {
    return <View style={[styles.fill, { backgroundColor: theme.bg }]} />;
  }

  if (recipe?.isPremium && !accessOk) {
    return (
      <View style={[styles.locked, { backgroundColor: theme.bg }]}>
        <Text style={[styles.lockedTitle, { color: theme.text }]}>{t('guide.premiumTitle')}</Text>
        <Text style={[styles.lockedText, { color: theme.textMuted }]}>{t('guide.premiumBody')}</Text>
      </View>
    );
  }

  if (!recipe || instances.length === 0) {
    return (
      <View style={[styles.locked, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.text }}>{t('common.notFound')}</Text>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={[styles.doneWrap, { backgroundColor: theme.bg }]}>
        <Celebration primary={theme.primary} accent={theme.accent} />
        <Text style={[styles.doneTitle, { color: theme.text, fontSize: s(font.hero) }]}>{t('guide.congrats')}</Text>
        {savedToCollection ? (
          <>
            <Text style={[styles.doneBig, { color: theme.primary, fontSize: s(font.title) }]}>
              {t('guide.savedPortfolio')}
            </Text>
            <Text style={[styles.doneText, { color: theme.text }]}>{t('guide.finishedCount', { n: collectionCount })}</Text>
            <Pressable
              style={[styles.btn, { backgroundColor: theme.primary }]}
              onPress={() => router.replace({ pathname: '/', params: { tab: 'meus' } })}
            >
              <Text style={[styles.btnText, { color: theme.primaryText }]}>{t('guide.viewPortfolio')}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={[styles.doneBig, { color: theme.primary, fontSize: s(font.title) }]}>
              {t('guide.finishedTitle', { title: recipe.title })}
            </Text>
            <Text style={[styles.doneText, { color: theme.text }]}>{t('guide.finishedAsk')}</Text>
            <Pressable style={[styles.btn, { backgroundColor: theme.primary }]} onPress={addToCollection}>
              <Text style={[styles.btnText, { color: theme.primaryText }]}>{t('guide.addPortfolio')}</Text>
            </Pressable>
            <Pressable onPress={reset}>
              <Text style={[styles.linkText, { color: theme.primary }]}>{t('guide.redo')}</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  const instance = instances[pieceIdx];
  const guide = instance.guide;
  const round = guide[roundIdx];
  const totalCarreiras = countCarreiras(guide);
  const pct = Math.round(progressFraction(recipe, pos, false, locale) * 100);
  const repeatsLeft = round.kind === 'stitches' ? repeatTotalOf(round) - repeatNo : 0;

  return (
    <View style={[styles.fill, { backgroundColor: theme.bg }]}>
      {!embedded && (
        <View style={styles.toolbar}>
          <Pressable onPress={() => setConfirmOpen(true)} hitSlop={10}>
            <Text style={[styles.toolIcon, { color: theme.textMuted }]}>↺</Text>
          </Pressable>
          <Text style={[styles.toolPct, { color: theme.text }]}>{pct}%</Text>
          <Pressable onPress={() => setGiveUpOpen(true)} hitSlop={10}>
            <Text style={[styles.toolIcon, { color: theme.textMuted }]}>🗑</Text>
          </Pressable>
        </View>
      )}

      {instances.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pieces}>
          {instances.map((inst, i) => (
            <Pressable
              key={inst.key}
              onPress={() => {
                setPieceIdx(i);
                setRoundIdx(0);
                setStepIdx(0);
                setRepeatNo(1);
              }}
              style={[
                styles.pieceChip,
                { backgroundColor: i === pieceIdx ? theme.primary : theme.surface },
              ]}
            >
              <Text
                style={[
                  styles.pieceChipText,
                  { color: i === pieceIdx ? theme.primaryText : theme.textMuted },
                ]}
              >
                {pieceInstanceLabel(inst)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={styles.tapArea}>
        {round.kind === 'note' ? (
          <NoteBlock theme={theme} label={round.label} text={round.text!} onTap={advance} s={s} />
        ) : (
          <StitchBlock
            theme={theme}
            locale={locale}
            round={round}
            stepIdx={stepIdx}
            repeatNo={repeatNo}
            totalCarreiras={totalCarreiras}
            repeatsLeft={repeatsLeft}
            pieceLabel={pieceInstanceLabel(instance)}
            pieceFrac={pieceProgress(instance, roundIdx, stepIdx, repeatNo)}
            colorMap={colorMap}
            onTap={advance}
            s={s}
          />
        )}
      </View>

      <View style={styles.footer}>
        <Pressable style={[styles.backBtn, { backgroundColor: theme.surface }]} onPress={back}>
          <Text style={[styles.backText, { color: theme.text }]}>{t('common.backOneStitch')}</Text>
        </Pressable>
      </View>

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setConfirmOpen(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: theme.surface }]} onPress={() => {}}>
            <Text style={styles.modalEmoji}>🧶</Text>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('guide.resetTitle')}</Text>
            <Text style={[styles.modalText, { color: theme.textMuted }]}>{t('guide.resetBody')}</Text>
            <View style={styles.modalBtns}>
              <Pressable
                style={[styles.modalBtn, styles.modalGhost, { borderColor: theme.border }]}
                onPress={() => setConfirmOpen(false)}
              >
                <Text style={{ color: theme.text }}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalDanger]}
                onPress={() => {
                  setConfirmOpen(false);
                  reset();
                }}
              >
                <Text style={{ color: '#FFF' }}>{t('guide.resetConfirm')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={giveUpOpen} transparent animationType="fade" onRequestClose={() => setGiveUpOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setGiveUpOpen(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: theme.surface }]} onPress={() => {}}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('guide.giveUpTitle')}</Text>
            <View style={styles.modalBtns}>
              <Pressable
                style={[styles.modalBtn, styles.modalGhost, { borderColor: theme.border }]}
                onPress={() => setGiveUpOpen(false)}
              >
                <Text style={{ color: theme.text }}>{t('guide.giveUpContinue')}</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.modalDanger]} onPress={giveUp}>
                <Text style={{ color: '#FFF' }}>{t('guide.giveUpConfirm')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function StitchBlock({
  theme,
  locale,
  round,
  stepIdx,
  repeatNo,
  totalCarreiras,
  repeatsLeft,
  pieceLabel,
  pieceFrac,
  colorMap,
  onTap,
  s,
}: {
  theme: ReturnType<typeof useTheme>['theme'];
  locale: ReturnType<typeof useAppLocale>['locale'];
  round: GuideRound;
  stepIdx: number;
  repeatNo: number;
  totalCarreiras: number;
  repeatsLeft: number;
  pieceLabel: string;
  pieceFrac: number;
  colorMap: Record<string, RecipeColor>;
  onTap: () => void;
  s: (n: number) => number;
}) {
  const { t } = useTranslation();
  const steps = round.steps!;
  const step = steps[stepIdx];
  const info = getStitch(step.stitch, locale);
  const hint = getStitchHint(step.stitch, locale);
  const isFirst = stepIdx === 0 && repeatNo === 1;
  const color = round.color ? colorMap[round.color] : undefined;
  const per = stepsPerRepeat(round);
  const roundLabel = guideRoundLabel(round, repeatNo, locale);

  return (
    <>
      <Text style={[styles.pieceLabel, { color: theme.primary, fontSize: s(font.h2) }]}>{pieceLabel}</Text>
      <Text style={[styles.carreira, { color: theme.textMuted, fontSize: s(font.body) }]}>
        {t('guide.roundOf', { label: roundLabel, total: totalCarreiras })}
        {per > 1 ? t('guide.stitchesInRound', { current: stepIdx + 1, total: per }) : ''}
      </Text>

      {repeatsLeft > 0 && stepIdx === per - 1 && (
        <View style={[styles.repeatBanner, { backgroundColor: theme.accent }]}>
          <Text style={styles.repeatBannerText}>{t('guide.repeatMore', { count: repeatsLeft })}</Text>
        </View>
      )}

      {round.isUniform && (
        <View style={[styles.repeatBanner, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={[styles.repeatBannerText, { color: theme.text }]}>{t('guide.uniformRound')}</Text>
        </View>
      )}

      {!!round.patternText && (
        <View style={[styles.recipeLine, { backgroundColor: theme.surface }]}>
          <Text style={[styles.recipeLineText, { color: theme.text, fontSize: s(font.h2) }]}>
            {round.patternText}{' '}
            <Text style={{ color: theme.textMuted }}>({round.totalStitches})</Text>
          </Text>
        </View>
      )}

      {isFirst && round.colorChanged && color && (
        <View style={[styles.bigBanner, { backgroundColor: color.hex }]}>
          <Text style={styles.bannerText}>{t('guide.switchColor', { color: color.label })}</Text>
        </View>
      )}
      {isFirst && round.isMagicRing && (
        <View style={[styles.bigBanner, { backgroundColor: theme.primary }]}>
          <Text style={[styles.bannerText, { color: theme.primaryText }]}>{t('guide.magicRing')}</Text>
        </View>
      )}

      <Pressable onPress={onTap} style={({ pressed }) => [styles.tapButton, pressed && { opacity: 0.65 }]}>
        <SpiralProgress size={220} progress={pieceFrac} color={info.color} trackColor={theme.surface} strokeWidth={12}>
          <Text style={[styles.spiralInstruction, { color: info.color, fontSize: s(22) }]} numberOfLines={2}>
            {round.isUniform ? round.patternText : info.instruction}
          </Text>
          {!round.isUniform && (
            <>
              <Text style={[styles.spiralBig, { color: theme.text, fontSize: s(52) }]}>{step.producedAfter}</Text>
              <Text style={[styles.spiralTotal, { color: theme.textMuted }]}>
                {t('guide.stitchesCount', { current: step.producedAfter, total: round.totalStitches })}
              </Text>
            </>
          )}
        </SpiralProgress>
      </Pressable>

      {!!hint && <Text style={[styles.hint, { color: theme.textMuted }]}>{hint}</Text>}
      <Text style={[styles.tapHint, { color: theme.textMuted }]}>{t('common.tapToAdvance')}</Text>
    </>
  );
}

function NoteBlock({
  theme,
  label,
  text,
  onTap,
  s,
}: {
  theme: ReturnType<typeof useTheme>['theme'];
  label?: string;
  text: string;
  onTap: () => void;
  s: (n: number) => number;
}) {
  const { t } = useTranslation();
  return (
    <>
      <Text style={[styles.carreira, { color: theme.textMuted }]}>{label ?? t('common.instruction')}</Text>
      <Text style={styles.noteEmoji}>📝</Text>
      <Text style={[styles.noteText, { color: theme.text, fontSize: s(20) }]}>{text}</Text>
      <Pressable onPress={onTap} style={[styles.noteBtn, { backgroundColor: theme.primary }]}>
        <Text style={[styles.noteBtnText, { color: theme.primaryText }]}>{t('common.next')}</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md },
  lockedTitle: { fontSize: font.title, fontFamily: typeface.display },
  lockedText: { fontSize: font.body, textAlign: 'center', lineHeight: 22 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  toolIcon: { fontSize: 22 },
  toolPct: { fontFamily: typeface.bodyBold, fontSize: font.body },
  pieces: { gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.sm },
  pieceChip: { paddingHorizontal: space.md, paddingVertical: 10, borderRadius: radius.pill },
  pieceChipText: { fontSize: font.small, fontFamily: typeface.bodyBold },
  tapArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: space.lg },
  footer: { paddingHorizontal: space.lg, paddingBottom: space.md },
  backBtn: { paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
  backText: { fontSize: font.h2, fontFamily: typeface.bodyBold },
  pieceLabel: { fontFamily: typeface.display },
  carreira: { fontFamily: typeface.bodyBold },
  repeatBanner: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill },
  repeatBannerText: { color: '#FFF', fontFamily: typeface.bodyBold, fontSize: font.body, textAlign: 'center' },
  recipeLine: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill },
  recipeLineText: { fontFamily: typeface.bodyBold, textAlign: 'center' },
  bigBanner: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: radius.pill },
  bannerText: { color: '#FFF', fontFamily: typeface.bodyBold, fontSize: font.body },
  tapButton: { borderRadius: radius.pill },
  spiralInstruction: { fontFamily: typeface.display, textAlign: 'center', paddingHorizontal: 8 },
  spiralBig: { fontFamily: typeface.display },
  spiralTotal: { fontSize: font.small, fontFamily: typeface.bodyBold },
  hint: { fontSize: font.body },
  tapHint: { fontSize: font.small, fontFamily: typeface.bodySemi },
  noteEmoji: { fontSize: 42 },
  noteText: { fontFamily: typeface.bodySemi, textAlign: 'center', lineHeight: 28 },
  noteBtn: { paddingHorizontal: 36, paddingVertical: 14, borderRadius: radius.pill },
  noteBtnText: { fontSize: font.h2, fontFamily: typeface.bodyBold },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.sm },
  doneTitle: { fontFamily: typeface.display, textAlign: 'center' },
  doneBig: { fontFamily: typeface.display, textAlign: 'center' },
  doneText: { fontSize: font.body, textAlign: 'center', lineHeight: 24, marginBottom: space.sm },
  btn: { alignSelf: 'stretch', paddingVertical: 16, borderRadius: radius.lg, alignItems: 'center', marginTop: space.sm },
  btnText: { fontSize: font.h2, fontFamily: typeface.bodyBold },
  linkText: { fontSize: font.body, fontFamily: typeface.bodySemi, paddingVertical: 10 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,20,26,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  modalCard: { width: '100%', maxWidth: 360, borderRadius: radius.xl, padding: space.xl, alignItems: 'center', gap: space.sm },
  modalEmoji: { fontSize: 40 },
  modalTitle: { fontSize: font.title, fontFamily: typeface.display, textAlign: 'center' },
  modalText: { fontSize: font.body, textAlign: 'center', lineHeight: 22 },
  modalBtns: { flexDirection: 'row', gap: space.sm, marginTop: space.md, alignSelf: 'stretch' },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
  modalGhost: { borderWidth: 1.5 },
  modalDanger: { backgroundColor: '#DC2626' },
});
