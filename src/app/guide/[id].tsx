import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpiralProgress } from '@/components/SpiralProgress';
import { getRecipe } from '@/data/recipes';
import { recipeImage } from '@/data/recipe-images';
import { STITCH_HINT, STITCHES } from '@/data/stitches';
import { countCarreiras, type GuideRound } from '@/engine/guide';
import {
  buildInstances,
  pieceInstanceLabel,
  pieceProgress,
  progressFraction,
  type PieceInstance,
} from '@/engine/project';
import { getProject, saveProject } from '@/state/projects';
import { useWorld } from '@/theme/world-context';
import { font, radius, space } from '@/theme/tokens';
import type { RecipeColor } from '@/types/recipe';

interface Palette {
  bg: string;
  surface: string;
  fg: string;
  muted: string;
  primary: string;
  primaryText: string;
  accent: string;
}

export default function GuideScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useWorld();
  const recipe = getRecipe(id);

  const instances = useMemo(() => (recipe ? buildInstances(recipe) : []), [recipe]);
  const colorMap = useMemo(() => {
    const m: Record<string, RecipeColor> = {};
    recipe?.colors?.forEach((c) => (m[c.id] = c));
    return m;
  }, [recipe]);

  const [pieceIdx, setPieceIdx] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const [dark, setDark] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    getProject(id!)
      .then((p) => {
        if (p && p.pieceIdx < instances.length) {
          setPieceIdx(p.pieceIdx);
          setRoundIdx(p.roundIdx);
          setStepIdx(p.stepIdx);
          setFinished(p.finished);
        }
      })
      .finally(() => {
        loaded.current = true;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, instances.length]);

  useEffect(() => {
    if (!loaded.current || !recipe) return;
    void saveProject({ recipeId: recipe.id, pieceIdx, roundIdx, stepIdx, finished });
  }, [recipe, pieceIdx, roundIdx, stepIdx, finished]);

  const pal: Palette = dark
    ? { bg: '#141210', surface: '#242019', fg: '#F5F1EC', muted: '#9A938E', primary: theme.primary, primaryText: theme.primaryText, accent: theme.accent }
    : { bg: theme.bg, surface: theme.surface, fg: theme.text, muted: theme.textMuted, primary: theme.primary, primaryText: theme.primaryText, accent: theme.accent };

  if (!recipe || instances.length === 0) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: pal.bg }]}>
        <Text style={{ color: pal.fg }}>Receita não encontrada.</Text>
      </View>
    );
  }

  const instance = instances[pieceIdx];
  const guide = instance.guide;
  const round = guide[roundIdx];
  const totalCarreiras = countCarreiras(guide);
  const pct = Math.round(progressFraction(recipe, { pieceIdx, roundIdx, stepIdx }, finished) * 100);

  const goNextRound = () => {
    if (roundIdx + 1 < guide.length) {
      setRoundIdx(roundIdx + 1);
      setStepIdx(0);
    } else if (pieceIdx + 1 < instances.length) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPieceIdx(pieceIdx + 1);
      setRoundIdx(0);
      setStepIdx(0);
    } else {
      setFinished(true);
    }
  };

  const advance = () => {
    if (finished) return;
    if (round.kind === 'note') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      goNextRound();
      return;
    }
    const steps = round.steps!;
    if (stepIdx < steps.length - 1) {
      setStepIdx(stepIdx + 1);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      goNextRound();
    }
  };

  const back = () => {
    if (finished) {
      setFinished(false);
      return;
    }
    if (round.kind === 'stitches' && stepIdx > 0) {
      setStepIdx(stepIdx - 1);
      return;
    }
    if (roundIdx > 0) {
      const prev = guide[roundIdx - 1];
      setRoundIdx(roundIdx - 1);
      setStepIdx(prev.kind === 'stitches' ? prev.steps!.length - 1 : 0);
    } else if (pieceIdx > 0) {
      const prevInst = instances[pieceIdx - 1];
      const lastRound = prevInst.guide[prevInst.guide.length - 1];
      setPieceIdx(pieceIdx - 1);
      setRoundIdx(prevInst.guide.length - 1);
      setStepIdx(lastRound.kind === 'stitches' ? lastRound.steps!.length - 1 : 0);
    }
  };

  const selectPiece = (idx: number) => {
    setPieceIdx(idx);
    setRoundIdx(0);
    setStepIdx(0);
    setFinished(false);
  };

  const reset = () => {
    setPieceIdx(0);
    setRoundIdx(0);
    setStepIdx(0);
    setFinished(false);
  };

  const confirmReset = () => {
    Alert.alert(
      'Reiniciar projeto?',
      'Você volta pra primeira carreira da primeira peça e perde o progresso salvo. Não dá pra desfazer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: reset },
      ],
    );
  };

  const cover = recipeImage(recipe.cover);

  if (finished) {
    return (
      <View style={[styles.root, { backgroundColor: pal.bg }]}>
        <SafeAreaView style={[styles.safe, styles.center]}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={[styles.doneTitle, { color: pal.fg }]}>Peça concluída!</Text>
          <Text style={[styles.doneText, { color: pal.muted }]}>{recipe.title}</Text>
          <Pressable style={[styles.btn, { backgroundColor: pal.primary }]} onPress={reset}>
            <Text style={[styles.btnText, { color: pal.primaryText }]}>Recomeçar</Text>
          </Pressable>
          <Pressable style={styles.linkBtn} onPress={() => router.back()}>
            <Text style={[styles.linkText, { color: pal.primary }]}>Voltar à receita</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: pal.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={[styles.icon, { color: pal.muted }]}>✕</Text>
          </Pressable>
          {cover && (
            <Image source={cover} style={[styles.headerThumb, { backgroundColor: pal.surface }]} contentFit="cover" />
          )}
          <View style={styles.headerCenter}>
            <Text style={[styles.recipeName, { color: pal.fg }]} numberOfLines={1}>
              {recipe.title} · {pct}%
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: pal.surface }]}>
              <View style={[styles.progressFill, { backgroundColor: pal.primary, width: `${pct}%` }]} />
            </View>
          </View>
          <Pressable onPress={() => setDark((d) => !d)} hitSlop={10}>
            <Text style={[styles.icon, { color: pal.muted }]}>{dark ? '☀' : '☾'}</Text>
          </Pressable>
          <Pressable onPress={confirmReset} hitSlop={10}>
            <Text style={[styles.icon, { color: pal.muted }]}>↺</Text>
          </Pressable>
        </View>

        {instances.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pieces}
          >
            {instances.map((inst, i) => {
              const active = i === pieceIdx;
              return (
                <Pressable
                  key={inst.key}
                  onPress={() => selectPiece(i)}
                  style={[
                    styles.pieceChip,
                    { backgroundColor: active ? pal.primary : pal.surface },
                  ]}
                >
                  <Text style={[styles.pieceChipText, { color: active ? pal.primaryText : pal.muted }]}>
                    {pieceInstanceLabel(inst)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <Pressable style={styles.tapArea} onPress={advance}>
          {round.kind === 'note' ? (
            <NoteView pal={pal} label={round.label} text={round.text!} />
          ) : (
            <StitchView
              pal={pal}
              round={round}
              stepIdx={stepIdx}
              totalCarreiras={totalCarreiras}
              pieceLabel={pieceInstanceLabel(instance)}
              pieceFrac={pieceProgress(instance, roundIdx, stepIdx)}
              colorMap={colorMap}
            />
          )}
          <Text style={[styles.tapHint, { color: pal.muted }]}>toque para avançar</Text>
        </Pressable>

        <View style={styles.footer}>
          <Pressable style={[styles.backBtn, { backgroundColor: pal.surface }]} onPress={back}>
            <Text style={[styles.backText, { color: pal.fg }]}>‹ Voltar 1 ponto</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function StitchView({
  pal,
  round,
  stepIdx,
  totalCarreiras,
  pieceLabel,
  pieceFrac,
  colorMap,
}: {
  pal: Palette;
  round: GuideRound;
  stepIdx: number;
  totalCarreiras: number;
  pieceLabel: string;
  pieceFrac: number;
  colorMap: Record<string, RecipeColor>;
}) {
  const steps = round.steps!;
  const step = steps[stepIdx];
  const info = STITCHES[step.stitch];
  const hint = STITCH_HINT[step.stitch];
  const next = stepIdx + 1 < steps.length ? STITCHES[steps[stepIdx + 1].stitch] : null;
  const isFirst = stepIdx === 0;
  const color = round.color ? colorMap[round.color] : undefined;

  return (
    <>
      <Text style={[styles.pieceLabel, { color: pal.primary }]}>{pieceLabel}</Text>
      <Text style={[styles.carreira, { color: pal.muted }]}>
        Carreira {round.number} de {totalCarreiras}
      </Text>

      {isFirst && round.colorChanged && color && (
        <View style={[styles.bigBanner, { backgroundColor: color.hex }]}>
          <Text style={styles.bannerIcon}>🎨</Text>
          <Text style={[styles.bannerText, { color: '#FFFFFF' }]}>Troque para {color.label}</Text>
        </View>
      )}
      {isFirst && round.isMagicRing && (
        <View style={[styles.bigBanner, { backgroundColor: pal.primary }]}>
          <Text style={styles.bannerIcon}>🪄</Text>
          <Text style={[styles.bannerText, { color: pal.primaryText }]}>Comece com o anel mágico</Text>
        </View>
      )}
      {isFirst && !round.isMagicRing && !round.colorChanged && (
        <View style={[styles.bigBanner, { backgroundColor: pal.accent }]}>
          <Text style={styles.bannerIcon}>📍</Text>
          <Text style={[styles.bannerText, { color: '#FFFFFF' }]}>Ponha o marcador AQUI</Text>
        </View>
      )}

      <SpiralProgress
        size={196}
        progress={pieceFrac}
        color={info.color}
        trackColor={pal.surface}
        strokeWidth={9}
      >
        <Text style={[styles.spiralBig, { color: pal.fg }]}>{step.producedAfter}</Text>
        <Text style={[styles.spiralTotal, { color: pal.muted }]}>de {round.totalStitches} pontos</Text>
      </SpiralProgress>

      <View style={[styles.stitchBadge, { borderColor: info.color }]}>
        <Text style={[styles.stitchInstruction, { color: info.color }]}>{info.instruction}</Text>
      </View>
      {!!hint && <Text style={[styles.stitchHint, { color: pal.muted }]}>{hint}</Text>}
      {!!step.groupNote && <Text style={[styles.stitchHint, { color: pal.muted }]}>({step.groupNote})</Text>}

      <Text style={[styles.next, { color: pal.muted }]}>
        ponto {stepIdx + 1}/{steps.length} · {next ? `próximo: ${next.label}` : '✓ fim da carreira'}
      </Text>
    </>
  );
}

function NoteView({ pal, label, text }: { pal: Palette; label?: string; text: string }) {
  return (
    <>
      <Text style={[styles.carreira, { color: pal.muted }]}>{label ?? 'Instrução'}</Text>
      <Text style={styles.noteEmoji}>📝</Text>
      <Text style={[styles.noteText, { color: pal.fg }]}>{text}</Text>
      <Text style={[styles.next, { color: pal.muted }]}>toque para continuar ›</Text>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 10 },

  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.sm },
  icon: { fontSize: 22, fontWeight: '700' },
  headerThumb: { width: 34, height: 34, borderRadius: 10 },
  headerCenter: { flex: 1, gap: 6 },
  recipeName: { fontSize: font.small, fontWeight: '700', textAlign: 'center' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  pieces: { gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.sm },
  pieceChip: { paddingHorizontal: space.md, paddingVertical: 8, borderRadius: radius.pill },
  pieceChipText: { fontSize: font.small, fontWeight: '700' },

  tapArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: space.xl },
  tapHint: { position: 'absolute', bottom: 10, fontSize: font.tiny },
  pieceLabel: { fontSize: font.body, fontWeight: '800' },
  carreira: { fontSize: font.body, fontWeight: '700' },

  bigBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: radius.pill,
  },
  bannerIcon: { fontSize: 22 },
  bannerText: { fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },

  stitchBadge: { borderWidth: 3, borderRadius: radius.xl, paddingHorizontal: 30, paddingVertical: 18, alignItems: 'center', minWidth: 250 },
  stitchInstruction: { fontSize: 34, fontWeight: '900', letterSpacing: 0.5, textAlign: 'center' },
  stitchHint: { fontSize: font.body },

  spiralBig: { fontSize: 54, fontWeight: '900' },
  spiralTotal: { fontSize: font.body, fontWeight: '800', marginTop: -2 },
  next: { fontSize: font.body, fontWeight: '600', marginTop: 6 },

  noteEmoji: { fontSize: 42 },
  noteText: { fontSize: 20, fontWeight: '600', textAlign: 'center', lineHeight: 28 },

  footer: { paddingHorizontal: space.lg, paddingBottom: space.sm, paddingTop: space.xs },
  backBtn: { paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
  backText: { fontSize: font.h2, fontWeight: '700' },

  doneEmoji: { fontSize: 64 },
  doneTitle: { fontSize: font.hero, fontWeight: '900' },
  doneText: { fontSize: font.body },
  btn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: radius.md, marginTop: space.lg },
  btnText: { fontSize: font.h2, fontWeight: '800' },
  linkBtn: { padding: 10 },
  linkText: { fontSize: font.body, fontWeight: '600' },
});
