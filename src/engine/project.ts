import type { Recipe } from '@/types/recipe';
import { buildPieceGuide, countSteps, type GuideRound } from './guide';

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

export function buildInstances(recipe: Recipe): PieceInstance[] {
  const list: PieceInstance[] = [];
  recipe.pieces.forEach((piece) => {
    const guide = buildPieceGuide(piece);
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
}

/** nº de passos concluídos até a posição atual (para % de progresso) */
export function stepsCompleted(instances: PieceInstance[], pos: Position): number {
  let done = 0;
  for (let p = 0; p < pos.pieceIdx && p < instances.length; p++) done += instances[p].steps;
  const inst = instances[pos.pieceIdx];
  if (!inst) return done;
  for (let r = 0; r < pos.roundIdx && r < inst.guide.length; r++) {
    const round = inst.guide[r];
    done += round.kind === 'note' ? 1 : round.steps!.length;
  }
  done += pos.stepIdx;
  return done;
}

export function progressFraction(recipe: Recipe, pos: Position, finished: boolean): number {
  if (finished) return 1;
  const instances = buildInstances(recipe);
  const total = totalSteps(instances);
  if (total === 0) return 0;
  return Math.min(1, stepsCompleted(instances, pos) / total);
}

/** fração 0..1 de conclusão da peça atual (para a espiral) */
export function pieceProgress(inst: PieceInstance, roundIdx: number, stepIdx: number): number {
  if (inst.steps === 0) return 0;
  let done = 0;
  for (let r = 0; r < roundIdx && r < inst.guide.length; r++) {
    const round = inst.guide[r];
    done += round.kind === 'note' ? 1 : round.steps!.length;
  }
  done += stepIdx;
  return Math.min(1, done / inst.steps);
}

export function pieceInstanceLabel(inst: PieceInstance): string {
  return inst.qty > 1 ? `${inst.name} ${inst.instanceNo}/${inst.qty}` : inst.name;
}

/** resumo curto da posição atual, ex.: "Cabeça · carreira 7" */
export function describePosition(recipe: Recipe, pos: Position, finished: boolean): string {
  if (finished) return 'Concluído';
  const instances = buildInstances(recipe);
  const inst = instances[pos.pieceIdx];
  if (!inst) return '';
  const round = inst.guide[pos.roundIdx];
  const carreira = round?.number;
  const label = pieceInstanceLabel(inst);
  return carreira ? `${label} · carreira ${carreira}` : label;
}
