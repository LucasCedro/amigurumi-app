import type { AppLocale } from '@/i18n';
import i18n from '@/i18n';
import { translateNoteLabel, translatePhrase } from '@/i18n/localize-recipe';
import { getStitch, magicRingPatternText } from '@/data/stitches';
import type { Piece, Round, StitchRound, StitchType } from '@/types/recipe';

export interface GuideStitch {
  stitch: StitchType;
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
  patternText?: string;
  color?: string;
  colorChanged?: boolean;
  repeatTotal?: number;
  isUniform?: boolean;
}

function segments(round: StitchRound, locale: AppLocale) {
  return round.groups.map((g) => {
    const segs = g.pattern.map((s) => `${s.count} ${getStitch(s.stitch, locale).abbr}`).join(', ');
    return g.times > 1 && round.groups.length > 1 ? `[${segs}] x${g.times}` : segs;
  });
}

function stitchRoundText(round: StitchRound, locale: AppLocale): string {
  const body = segments(round, locale).join(', ');
  return round.isMagicRing ? magicRingPatternText(body, locale) : body;
}

export function isUniformRound(round: StitchRound): boolean {
  if (round.isMagicRing) return false;
  if (round.groups.length !== 1) return false;
  const g = round.groups[0];
  if (g.times !== 1 || g.pattern.length !== 1) return false;
  return g.pattern[0].count >= 4;
}

function buildStepsFromRound(round: StitchRound): { steps: GuideStitch[]; isUniform: boolean } {
  if (isUniformRound(round)) {
    const seg = round.groups[0].pattern[0];
    return {
      isUniform: true,
      steps: [{ stitch: seg.stitch, producedAfter: round.totalStitches }],
    };
  }

  const steps: GuideStitch[] = [];
  let produced = 0;
  for (const group of round.groups) {
    for (let t = 0; t < group.times; t++) {
      for (const seg of group.pattern) {
        const meta = getStitch(seg.stitch, 'en');
        for (let n = 0; n < seg.count; n++) {
          produced += meta.produces;
          steps.push({ stitch: seg.stitch, producedAfter: produced, groupNote: group.note });
        }
      }
    }
  }
  return { steps, isUniform: false };
}

export function stepsPerRepeat(round: GuideRound): number {
  if (round.kind === 'note') return 1;
  return round.isUniform ? 1 : round.steps!.length;
}

export function repeatTotalOf(round: GuideRound): number {
  if (round.kind === 'note') return 1;
  return round.repeatTotal ?? 1;
}

export function totalWeightOf(round: GuideRound): number {
  return stepsPerRepeat(round) * repeatTotalOf(round);
}

export function buildGuide(rounds: Round[], locale: AppLocale, startColor?: string): GuideRound[] {
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
    carreira += 1;

    const { steps, isUniform } = buildStepsFromRound(round);
    const repeatTotal = round.repeatRows ?? 1;

    out.push({
      key: `s-${ri}`,
      kind: 'stitches',
      number: carreira,
      isMagicRing: round.isMagicRing,
      totalStitches: round.totalStitches,
      note: round.note,
      color: roundColor,
      colorChanged: changed,
      patternText: stitchRoundText(round, locale),
      steps,
      isUniform,
      repeatTotal: repeatTotal > 1 ? repeatTotal : undefined,
    });
  });

  return out;
}

export function buildPieceGuide(piece: Piece, locale: AppLocale): GuideRound[] {
  return buildGuide(piece.rounds, locale, piece.startColor);
}

export function countCarreiras(guide: GuideRound[]): number {
  return guide.reduce((acc, r) => acc + (r.kind === 'stitches' ? 1 : 0), 0);
}

export function countSteps(guide: GuideRound[]): number {
  return guide.reduce((acc, r) => acc + totalWeightOf(r), 0);
}

export function roundToText(round: Round, locale: AppLocale): string {
  if (round.kind === 'note') return translatePhrase(round.text, locale);
  const rep = round.repeatRows && round.repeatRows > 1 ? ` (×${round.repeatRows})` : '';
  return `${stitchRoundText(round, locale)} (${round.totalStitches})${rep}`;
}

export function roundLabel(round: Round, locale: AppLocale): string {
  if (round.kind === 'note' && round.label) {
    return translateNoteLabel(round.label, locale) ?? '•';
  }
  return round.label ?? '•';
}

export function guideRoundLabel(round: GuideRound, repeatNo: number, locale: AppLocale): string {
  if (round.kind === 'note') return round.label ?? i18n.t('common.instruction', { lng: locale });
  const total = repeatTotalOf(round);
  if (total > 1) {
    return i18n.t('guide.roundRepeat', {
      lng: locale,
      n: round.number,
      current: repeatNo,
      total,
    });
  }
  return i18n.t('guide.roundLabel', { lng: locale, n: round.number });
}
