import type { AppLocale } from '@/i18n';
import i18n from '@/i18n';
import type { Recipe } from '@/types/recipe';
import {
  buildPieceGuide,
  countSteps,
  repeatTotalOf,
  stepsPerRepeat,
  totalWeightOf,
  type GuideRound,
} from './guide';

/** Uma peça a ser feita concretamente (respeita `qty`: Braço 1 de 2, etc.) */
export interface PieceInstance {
  key: string;
  pieceId: string;
  name: string;
  instanceNo: number;
  qty: number;
  startColor?: string;
  guide: GuideRound[];
  steps: number;
}

export function buildInstances(recipe: Recipe, locale: AppLocale): PieceInstance[] {
  const list: PieceInstance[] = [];
  recipe.pieces.forEach((piece) => {
    const guide = buildPieceGuide(piece, locale);
    const steps = countSteps(guide);
    for (let i = 1; i <= piece.qty; i++) {
      list.push({
        key: `${piece.id}-${i}`,
        pieceId: piece.id,
        name: piece.name,
        instanceNo: i,
        qty: piece.qty,
        startColor: piece.startColor,
        guide,
        steps,
      });
    }
  });
  return list;
}

export function totalSteps(instances: PieceInstance[]): number {
  return instances.reduce((acc, inst) => acc + inst.steps, 0);
}

export interface Position {
  pieceIdx: number;
  roundIdx: number;
  stepIdx: number;
  /** repetição atual dentro da carreira agrupada (1-based) */
  repeatNo: number;
}

export const DEFAULT_POSITION: Position = {
  pieceIdx: 0,
  roundIdx: 0,
  stepIdx: 0,
  repeatNo: 1,
};

function weightBeforeRound(inst: PieceInstance, roundIdx: number): number {
  let done = 0;
  for (let r = 0; r < roundIdx && r < inst.guide.length; r++) {
    done += totalWeightOf(inst.guide[r]);
  }
  return done;
}

function weightInRound(round: GuideRound, pos: Pick<Position, 'stepIdx' | 'repeatNo'>): number {
  if (round.kind === 'note') return pos.stepIdx > 0 ? 1 : 0;
  const per = stepsPerRepeat(round);
  const completedRepeats = Math.max(0, pos.repeatNo - 1);
  return completedRepeats * per + pos.stepIdx;
}

/** nº de passos concluídos até a posição atual (para % de progresso) */
export function stepsCompleted(instances: PieceInstance[], pos: Position): number {
  let done = 0;
  for (let p = 0; p < pos.pieceIdx && p < instances.length; p++) done += instances[p].steps;
  const inst = instances[pos.pieceIdx];
  if (!inst) return done;
  done += weightBeforeRound(inst, pos.roundIdx);
  const round = inst.guide[pos.roundIdx];
  if (round) done += weightInRound(round, pos);
  return done;
}

export function progressFraction(recipe: Recipe, pos: Position, finished: boolean, locale: AppLocale): number {
  if (finished) return 1;
  const instances = buildInstances(recipe, locale);
  const total = totalSteps(instances);
  if (total === 0) return 0;
  return Math.min(1, stepsCompleted(instances, pos) / total);
}

/** fração 0..1 de conclusão da peça atual (para a espiral) */
export function pieceProgress(inst: PieceInstance, roundIdx: number, stepIdx: number, repeatNo = 1): number {
  if (inst.steps === 0) return 0;
  let done = weightBeforeRound(inst, roundIdx);
  const round = inst.guide[roundIdx];
  if (round) done += weightInRound(round, { stepIdx, repeatNo });
  return Math.min(1, done / inst.steps);
}

export function pieceInstanceLabel(inst: PieceInstance): string {
  return inst.qty > 1 ? `${inst.name} ${inst.instanceNo}/${inst.qty}` : inst.name;
}

export function describePosition(recipe: Recipe, pos: Position, finished: boolean, locale: AppLocale): string {
  if (finished) return i18n.t('common.done', { lng: locale });
  const instances = buildInstances(recipe, locale);
  const inst = instances[pos.pieceIdx];
  if (!inst) return '';
  const round = inst.guide[pos.roundIdx];
  const label = pieceInstanceLabel(inst);
  if (!round || round.kind === 'note') return label;
  const total = repeatTotalOf(round);
  if (total > 1) {
    return `${label} · ${i18n.t('guide.roundRepeat', { lng: locale, n: round.number, current: pos.repeatNo, total })}`;
  }
  return `${label} · ${i18n.t('guide.roundLabel', { lng: locale, n: round.number })}`;
}

/** normaliza posição salva de versões antigas */
export function normalizePosition(p: Partial<Position>): Position {
  return {
    pieceIdx: p.pieceIdx ?? 0,
    roundIdx: p.roundIdx ?? 0,
    stepIdx: p.stepIdx ?? 0,
    repeatNo: p.repeatNo ?? 1,
  };
}
