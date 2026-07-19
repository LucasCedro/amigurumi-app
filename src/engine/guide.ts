import { STITCHES } from '@/data/stitches';
import type { Piece, Round, StitchRound, StitchType } from '@/types/recipe';

export interface GuideStitch {
  stitch: StitchType;
  /** total de pontos produzidos na volta até (e incluindo) este ponto */
  producedAfter: number;
  groupNote?: string;
}

export interface GuideRound {
  key: string;
  kind: 'stitches' | 'note';
  number?: number;
  isMagicRing?: boolean;
  totalStitches?: number;
  steps?: GuideStitch[];
  note?: string;
  text?: string;
  label?: string;
  /** id da cor ativa nesta carreira */
  color?: string;
  /** true quando muda de cor em relação à carreira anterior */
  colorChanged?: boolean;
}

/**
 * Expande as carreiras de uma peça numa lista linear de carreiras-guia,
 * achatando repetições ponto a ponto e rastreando troca de cor.
 */
export function buildGuide(rounds: Round[], startColor?: string): GuideRound[] {
  const out: GuideRound[] = [];
  let carreira = 0;
  let activeColor = startColor;

  rounds.forEach((round, ri) => {
    if (round.kind === 'note') {
      out.push({ key: `n-${ri}`, kind: 'note', text: round.text, label: round.label });
      return;
    }

    const roundColor = round.color ?? activeColor;
    const changed = roundColor !== activeColor;
    activeColor = roundColor;

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
        color: roundColor,
        colorChanged: changed && c === 0,
        steps,
      });
    }
  });

  return out;
}

export function buildPieceGuide(piece: Piece): GuideRound[] {
  return buildGuide(piece.rounds, piece.startColor);
}

export function countCarreiras(guide: GuideRound[]): number {
  return guide.reduce((acc, r) => acc + (r.kind === 'stitches' ? 1 : 0), 0);
}

/** nº de passos "atômicos" (cada ponto + cada nota = 1) numa peça */
export function countSteps(guide: GuideRound[]): number {
  return guide.reduce((acc, r) => acc + (r.kind === 'note' ? 1 : r.steps!.length), 0);
}

const SEGMENTS = (round: StitchRound) =>
  round.groups.map((g) => {
    const segs = g.pattern.map((s) => `${s.count} ${STITCHES[s.stitch].abbr}`).join(', ');
    return g.times > 1 && round.groups.length > 1 ? `[${segs}] x${g.times}` : segs;
  });

/** texto da carreira como numa receita escrita */
export function roundToText(round: Round): string {
  if (round.kind === 'note') return round.text;
  let body = SEGMENTS(round).join(', ');
  if (round.isMagicRing) body = `Anel mágico com ${body}`;
  return `${body} (${round.totalStitches})`;
}

export function roundLabel(round: Round): string {
  return round.label ?? '•';
}
