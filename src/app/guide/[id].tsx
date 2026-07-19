import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRecipe } from '@/data/recipes';
import { STITCH_HINT, STITCHES } from '@/data/stitches';
import { buildGuide, countCarreiras } from '@/engine/guide';
import { useWorld } from '@/theme/world-context';

interface Progress {
  roundIdx: number;
  stepIdx: number;
  finished: boolean;
}

export default function GuideScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useWorld();
  const recipe = getRecipe(id);

  const guide = useMemo(() => (recipe ? buildGuide(recipe) : []), [recipe]);
  const totalCarreiras = useMemo(() => countCarreiras(guide), [guide]);

  const [roundIdx, setRoundIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const loaded = useRef(false);

  const storageKey = `amg:progress:${id}`;

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (raw) {
          const p = JSON.parse(raw) as Progress;
          if (p.roundIdx < guide.length) {
            setRoundIdx(p.roundIdx);
            setStepIdx(p.stepIdx);
            setFinished(p.finished);
          }
        }
      })
      .finally(() => {
        loaded.current = true;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, guide.length]);

  useEffect(() => {
    if (!loaded.current) return;
    void AsyncStorage.setItem(storageKey, JSON.stringify({ roundIdx, stepIdx, finished }));
  }, [roundIdx, stepIdx, finished, storageKey]);

  if (!recipe || guide.length === 0) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.text }}>Receita não encontrada.</Text>
      </View>
    );
  }

  const round = guide[roundIdx];

  const advance = () => {
    if (finished) return;
    if (round.kind === 'note') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      goNext();
      return;
    }
    const steps = round.steps!;
    if (stepIdx < steps.length - 1) {
      setStepIdx(stepIdx + 1);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (roundIdx + 1 >= guide.length) setFinished(true);
      else goNext();
    }
  };

  const goNext = () => {
    setRoundIdx(roundIdx + 1);
    setStepIdx(0);
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
    }
  };

  const reset = () => {
    setRoundIdx(0);
    setStepIdx(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        <SafeAreaView style={[styles.safe, styles.center]}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={[styles.doneTitle, { color: theme.text }]}>Peça concluída!</Text>
          <Text style={[styles.doneText, { color: theme.textMuted }]}>{recipe.title}</Text>
          <Pressable style={[styles.btn, { backgroundColor: theme.primary }]} onPress={reset}>
            <Text style={[styles.btnText, { color: theme.primaryText }]}>Recomeçar</Text>
          </Pressable>
          <Pressable style={styles.linkBtn} onPress={() => router.back()}>
            <Text style={[styles.linkText, { color: theme.primary }]}>Voltar à receita</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        {/* topo: sair + progresso de carreiras */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={[styles.exit, { color: theme.textMuted }]}>✕</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.recipeName, { color: theme.textMuted }]} numberOfLines={1}>
              {recipe.title}
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: theme.surfaceAlt }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.primary,
                    width: `${((round.number ?? 0) / totalCarreiras) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
          <Pressable onPress={reset} hitSlop={12}>
            <Text style={[styles.exit, { color: theme.textMuted }]}>↺</Text>
          </Pressable>
        </View>

        {/* área de toque gigante */}
        <Pressable style={styles.tapArea} onPress={advance}>
          {round.kind === 'note' ? (
            <NoteView theme={theme} label={round.label} text={round.text!} />
          ) : (
            <StitchView
              theme={theme}
              round={round}
              stepIdx={stepIdx}
              totalCarreiras={totalCarreiras}
            />
          )}
          <Text style={[styles.tapHint, { color: theme.textMuted }]}>
            toque em qualquer lugar para avançar
          </Text>
        </Pressable>

        {/* voltar */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.backBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
            onPress={back}
          >
            <Text style={[styles.backText, { color: theme.text }]}>‹ Voltar 1 ponto</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function StitchView({
  theme,
  round,
  stepIdx,
  totalCarreiras,
}: {
  theme: ReturnType<typeof useWorld>['theme'];
  round: ReturnType<typeof buildGuide>[number];
  stepIdx: number;
  totalCarreiras: number;
}) {
  const steps = round.steps!;
  const step = steps[stepIdx];
  const info = STITCHES[step.stitch];
  const hint = STITCH_HINT[step.stitch];
  const next = stepIdx + 1 < steps.length ? STITCHES[steps[stepIdx + 1].stitch] : null;
  const isFirst = stepIdx === 0;

  return (
    <>
      <Text style={[styles.carreira, { color: theme.textMuted }]}>
        Carreira {round.number} de {totalCarreiras}
      </Text>

      {round.isMagicRing && isFirst && (
        <View style={[styles.banner, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={[styles.bannerText, { color: theme.text }]}>🪄 Comece com o anel mágico</Text>
        </View>
      )}
      {isFirst && !round.isMagicRing && (
        <View style={[styles.banner, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={[styles.bannerText, { color: theme.text }]}>📍 Ponha o marcador aqui</Text>
        </View>
      )}

      <View style={[styles.stitchBadge, { borderColor: info.color }]}>
        <Text style={[styles.stitchInstruction, { color: info.color }]}>{info.instruction}</Text>
      </View>
      {!!hint && <Text style={[styles.stitchHint, { color: theme.textMuted }]}>{hint}</Text>}
      {!!step.groupNote && (
        <Text style={[styles.stitchHint, { color: theme.textMuted }]}>({step.groupNote})</Text>
      )}

      <View style={styles.counters}>
        <Counter theme={theme} big value={`${step.producedAfter}`} label={`de ${round.totalStitches} pontos`} />
        <Counter theme={theme} value={`${stepIdx + 1}/${steps.length}`} label="pontos da carreira" />
      </View>

      <Text style={[styles.next, { color: theme.textMuted }]}>
        {next ? `Próximo: ${next.label}` : '✓ Fim da carreira'}
      </Text>
    </>
  );
}

function NoteView({
  theme,
  label,
  text,
}: {
  theme: ReturnType<typeof useWorld>['theme'];
  label?: string;
  text: string;
}) {
  return (
    <>
      <Text style={[styles.carreira, { color: theme.textMuted }]}>{label ?? 'Instrução'}</Text>
      <Text style={styles.noteEmoji}>📝</Text>
      <Text style={[styles.noteText, { color: theme.text }]}>{text}</Text>
      <Text style={[styles.next, { color: theme.textMuted }]}>toque para continuar ›</Text>
    </>
  );
}

function Counter({
  theme,
  value,
  label,
  big,
}: {
  theme: ReturnType<typeof useWorld>['theme'];
  value: string;
  label: string;
  big?: boolean;
}) {
  return (
    <View style={styles.counter}>
      <Text style={[big ? styles.counterBig : styles.counterVal, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.counterLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  exit: { fontSize: 22, fontWeight: '700' },
  headerCenter: { flex: 1, gap: 6 },
  recipeName: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  tapArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 24 },
  tapHint: { position: 'absolute', bottom: 12, fontSize: 12 },
  carreira: { fontSize: 16, fontWeight: '700' },
  banner: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  bannerText: { fontSize: 14, fontWeight: '600' },

  stitchBadge: {
    borderWidth: 3,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 22,
    alignItems: 'center',
    minWidth: 240,
  },
  stitchInstruction: { fontSize: 34, fontWeight: '900', letterSpacing: 0.5, textAlign: 'center' },
  stitchHint: { fontSize: 15 },

  counters: { flexDirection: 'row', gap: 28, marginTop: 8 },
  counter: { alignItems: 'center' },
  counterBig: { fontSize: 44, fontWeight: '900' },
  counterVal: { fontSize: 30, fontWeight: '800' },
  counterLabel: { fontSize: 12, marginTop: 2 },
  next: { fontSize: 15, fontWeight: '600', marginTop: 6 },

  noteEmoji: { fontSize: 40 },
  noteText: { fontSize: 20, fontWeight: '600', textAlign: 'center', lineHeight: 28 },

  footer: { paddingHorizontal: 16, paddingBottom: 8, paddingTop: 4 },
  backBtn: { paddingVertical: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  backText: { fontSize: 16, fontWeight: '700' },

  doneEmoji: { fontSize: 64 },
  doneTitle: { fontSize: 26, fontWeight: '900' },
  doneText: { fontSize: 16 },
  btn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, marginTop: 16 },
  btnText: { fontSize: 17, fontWeight: '800' },
  linkBtn: { padding: 10 },
  linkText: { fontSize: 15, fontWeight: '600' },
});
