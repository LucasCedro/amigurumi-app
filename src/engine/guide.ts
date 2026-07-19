import { STITCHES } from '@/data/stitches';
import type { Recipe, Round, StitchRound, StitchType } from '@/types/recipe';

export interface GuideStitch {
  stitch: StitchType;
  /** total de pontos produzidos na volta atual até (e incluindo) este ponto */
  producedAfter: number;
  groupNote?: string;
}

export interface GuideRound {
  key: string;
  kind: 'stitches' | 'note';
  /** número da carreira (conta só rounds de pontos) */
  number?: number;
  isMagicRing?: boolean;
  totalStitches?: number;
  steps?: GuideStitch[];
  note?: string;
  text?: string;
  label?: string;
}

/**
 * Expande a receita numa lista linear de carreiras-guia. `repeatRows` vira N
 * carreiras individuais e cada grupo é achatado ponto a ponto para o contador.
 */
export function buildGuide(recipe: Recipe): GuideRound[] {
  const out: GuideRound[] = [];
  let carreira = 0;

  recipe.rounds.forEach((round, ri) => {
    if (round.kind === 'note') {
      out.push({ key: `n-${ri}`, kind: 'note', text: round.text, label: round.label });
      return;
    }

    const copies = round.repeatRows ?? 1;
    for (let c = 0; c < copies; c++) {
      carreira += 1;
      const steps: GuideStitch[] = [];
      let produced = 0;

      for (const group of round.groups) {
        for (let t = 0; t < group.times; t++) {
          for (const seg of group.pattern) {
            for (let n = 0; n < seg.count; n++) {
              produced += STITCHES[seg.stitch].produces;
              steps.push({ stitch: seg.stitch, producedAfter: produced, groupNote: group.note });
            }
          }
        }
      }

      out.push({
        key: `s-${ri}-${c}`,
        kind: 'stitches',
        number: carreira,
        isMagicRing: round.isMagicRing,
        totalStitches: round.totalStitches,
        note: round.note,
        steps,
      });
    }
  });

  return out;
}

export function countCarreiras(guide: GuideRound[]): number {
  return guide.reduce((acc, r) => acc + (r.kind === 'stitches' ? 1 : 0), 0);
}

/** valida se o produzido final bate com o totalStitches declarado (dev) */
export function validateRecipe(recipe: Recipe): string[] {
  const errors: string[] = [];
  buildGuide(recipe).forEach((r) => {
    if (r.kind !== 'stitches' || !r.steps?.length) return;
    const produced = r.steps[r.steps.length - 1].producedAfter;
    if (produced !== r.totalStitches) {
      errors.push(
        `${recipe.id} carreira ${r.number}: produzido ${produced} ≠ total ${r.totalStitches}`,
      );
    }
  });
  return errors;
}

const SEGMENTS = (round: StitchRound) =>
  round.groups.map((g) => {
    const segs = g.pattern.map((s) => `${s.count} ${STITCHES[s.stitch].abbr}`).join(', ');
    return g.times > 1 && round.groups.length > 1 ? `[${segs}] x${g.times}` : segs;
  });

/** texto da carreira como aparece numa receita escrita (tela de detalhe) */
export function roundToText(round: Round): string {
  if (round.kind === 'note') return round.text;
  let body = SEGMENTS(round).join(', ');
  if (round.isMagicRing) body = `Anel mágico com ${body}`;
  return `${body} (${round.totalStitches})`;
}

export function roundLabel(round: Round): string {
  return round.label ?? '•';
}
