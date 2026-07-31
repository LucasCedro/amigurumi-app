import type { Group, Round, StitchRound } from '@/types/recipe';

/**
 * Padrão clássico em espiral (anel mágico com 6 pb):
 *   carreira k (k ≥ 1): 6k pontos após aumentos
 *   carreira k (k ≥ 3): (k-2) pb, 1 aum × 6
 *
 * Escala (mesmo fio + agulha + tensão):
 *   diâmetro_cm ≈ (6n / pontos_por_cm) / π
 *   n = carreiras de aumento = maxPontos / 6
 *
 * `pontos_por_cm` é o gauge — varia por artesã; calibrar com uma peça
 * de referência ou presets por yarnWeight no futuro.
 */

export interface ShapeSize {
  /** pontos na circunferência máxima (múltiplo de 6) */
  maxStitches: number;
}

export interface SphereOptions extends ShapeSize {
  /** carreiras retas no “equador” (padrão ≈ n) */
  bodyRounds?: number;
}

export interface CylinderOptions extends ShapeSize {
  /** carreiras retas na altura */
  heightRounds: number;
  /** fecha a base com diminuições (padrão true) */
  closedBottom?: boolean;
  /** fecha o topo (false = vaso / manga aberta) */
  closedTop?: boolean;
}

export interface ConeOptions extends ShapeSize {
  /** carreiras retas opcionais no topo largo antes de arrematar */
  rimRounds?: number;
}

export interface PlanterVaseOptions extends ShapeSize {
  heightRounds: number;
  /** circunferência da base em relação à borda (padrão ≈ 2/3) */
  bottomRatio?: number;
}

function assertMultipleOf6(maxStitches: number, shape: string) {
  if (maxStitches < 6 || maxStitches % 6 !== 0) {
    throw new Error(`${shape}: maxStitches deve ser múltiplo de 6 (≥ 6), recebeu ${maxStitches}`);
  }
}

function nFromMax(maxStitches: number) {
  return maxStitches / 6;
}

/** Carreiras 1..n: 6 → maxStitches */
export function buildIncreaseRounds(maxStitches: number, color?: string): StitchRound[] {
  assertMultipleOf6(maxStitches, 'increase');
  const n = nFromMax(maxStitches);
  const rounds: StitchRound[] = [];

  for (let k = 1; k <= n; k++) {
    const label = String(k);
    if (k === 1) {
      rounds.push({
        kind: 'stitches',
        label,
        isMagicRing: true,
        ...(color ? { color } : {}),
        groups: [{ pattern: [{ stitch: 'pb', count: 6 }], times: 1 }],
        totalStitches: 6,
      });
      continue;
    }
    if (k === 2) {
      rounds.push({
        kind: 'stitches',
        label,
        groups: [{ pattern: [{ stitch: 'aum', count: 6 }], times: 1 }],
        totalStitches: 12,
      });
      continue;
    }
    rounds.push({
      kind: 'stitches',
      label,
      groups: [
        {
          pattern: [
            { stitch: 'pb', count: k - 2 },
            { stitch: 'aum', count: 1 },
          ],
          times: 6,
        },
      ],
      totalStitches: 6 * k,
    });
  }
  return rounds;
}

/** Carreiras retas no mesmo número de pontos */
export function buildEvenRounds(
  stitchCount: number,
  count: number,
  label: string,
  color?: string,
): StitchRound {
  return {
    kind: 'stitches',
    label,
    repeatRows: count,
    ...(color ? { color } : {}),
    groups: [{ pattern: [{ stitch: 'pb', count: stitchCount }], times: 1 }],
    totalStitches: stitchCount,
  };
}

/** Espelho dos aumentos: maxStitches → 6 */
export function buildDecreaseRounds(maxStitches: number): StitchRound[] {
  assertMultipleOf6(maxStitches, 'decrease');
  const n = nFromMax(maxStitches);
  const rounds: StitchRound[] = [];

  for (let k = n; k >= 2; k--) {
    const total = 6 * k;
    const label = String(n - k + 1 + n); // numeração contínua fica a cargo do caller
    if (k === 2) {
      rounds.push({
        kind: 'stitches',
        label,
        groups: [{ pattern: [{ stitch: 'dim', count: 6 }], times: 1 }],
        totalStitches: 6,
      });
      continue;
    }
    rounds.push({
      kind: 'stitches',
      label,
      groups: [
        {
          pattern: [
            { stitch: 'pb', count: k - 2 },
            { stitch: 'dim', count: 1 },
          ],
          times: 6,
        },
      ],
      totalStitches: 6 * (k - 1),
    });
  }
  return rounds;
}

/** Disco / base plana — só aumentos até maxStitches */
export function buildFlatDisc({ maxStitches }: ShapeSize, color?: string): Round[] {
  return buildIncreaseRounds(maxStitches, color);
}

/** Hemisfério — aumentos até max; base aberta (não fecha) */
export function buildHemisphere({ maxStitches }: ShapeSize, color?: string): Round[] {
  return buildIncreaseRounds(maxStitches, color);
}

/**
 * Esfera sólida — aumentos + corpo + diminuições simétricas.
 * bodyRounds padrão = n (meio “gordo”; diminua para bola mais achatada).
 */
export function buildSphere(
  { maxStitches, bodyRounds }: SphereOptions,
  color?: string,
): Round[] {
  const n = nFromMax(maxStitches);
  const body = bodyRounds ?? n;
  const inc = buildIncreaseRounds(maxStitches, color);
  const mid = buildEvenRounds(maxStitches, body, `${n + 1}–${n + body}`);
  const dec = buildDecreaseRounds(maxStitches);
  // Renumera diminuições após corpo
  let start = n + body + 1;
  const decLabeled = dec.map((r) => ({
    ...r,
    label: String(start++),
  }));
  return [...inc, mid, ...decLabeled];
}

/**
 * Ovo — mais carreiras retas no meio + menos no topo (ponta mais fina que a base).
 */
export function buildEgg({ maxStitches }: ShapeSize, color?: string): Round[] {
  const n = nFromMax(maxStitches);
  const inc = buildIncreaseRounds(maxStitches, color);
  const bodyCount = Math.max(n + 2, 4);
  const mid = buildEvenRounds(maxStitches, bodyCount, `${n + 1}–${n + bodyCount}`);
  const dec = buildDecreaseRounds(maxStitches).slice(0, Math.max(n - 1, 2));
  let start = n + bodyCount + 1;
  const decLabeled = dec.map((r) => ({
    ...r,
    label: String(start++),
  }));
  return [...inc, mid, ...decLabeled];
}

/** Cilindro — disco + altura + (opcional) tampa */
export function buildCylinder(
  { maxStitches, heightRounds, closedBottom = true, closedTop = true }: CylinderOptions,
  color?: string,
): Round[] {
  const n = nFromMax(maxStitches);
  const rounds: Round[] = [];

  if (closedBottom) {
    rounds.push(...buildIncreaseRounds(maxStitches, color));
    rounds.push(buildEvenRounds(maxStitches, heightRounds, `${n + 1}–${n + heightRounds}`));
    if (closedTop) {
      const dec = buildDecreaseRounds(maxStitches);
      let start = n + heightRounds + 1;
      rounds.push(
        ...dec.map((r) => ({
          ...r,
          label: String(start++),
        })),
      );
    }
    return rounds;
  }

  // Tubo aberto embaixo: anel mágico pequeno + subida rápida (bastão) ou altura fixa
  rounds.push({
    kind: 'stitches',
    label: '1',
    isMagicRing: true,
    ...(color ? { color } : {}),
    groups: [{ pattern: [{ stitch: 'pb', count: 6 }], times: 1 }],
    totalStitches: 6,
  });
  rounds.push(...buildIncreaseRounds(maxStitches).slice(1));
  rounds.push(buildEvenRounds(maxStitches, heightRounds, `${n + 1}–${n + heightRounds}`));
  return rounds;
}

/**
 * Cachepô — base circular fechada, corpo reto e borda que alarga (tronco de cone invertido).
 * Topo aberto.
 */
export function buildPlanterVase(
  { maxStitches, heightRounds, bottomRatio = 2 / 3 }: PlanterVaseOptions,
  color?: string,
): Round[] {
  const bottom = Math.max(12, Math.round((maxStitches * bottomRatio) / 6) * 6);
  if (bottom >= maxStitches) {
    return buildCylinder(
      { maxStitches, heightRounds, closedBottom: true, closedTop: false },
      color,
    );
  }

  const nBottom = bottom / 6;
  const nRim = maxStitches / 6;
  const flareSteps = nRim - nBottom;
  const bodyRounds = Math.max(2, heightRounds - flareSteps);
  const bodyEnd = nBottom + bodyRounds;

  const base = buildIncreaseRounds(bottom, color);
  const body = buildEvenRounds(bottom, bodyRounds, `${nBottom + 1}–${bodyEnd}`, color);
  const flare = buildIncreaseRounds(maxStitches)
    .slice(nBottom)
    .map((r, idx) => ({ ...r, label: String(bodyEnd + 1 + idx) }));

  return [...base, body, ...flare];
}

/** Cone — só aumentos (+ opcional borda reta no topo largo) */
export function buildCone({ maxStitches, rimRounds = 0 }: ConeOptions, color?: string): Round[] {
  const rounds = buildIncreaseRounds(maxStitches, color);
  if (rimRounds > 0) {
    const n = nFromMax(maxStitches);
    rounds.push(buildEvenRounds(maxStitches, rimRounds, `${n + 1}–${n + rimRounds}`));
  }
  return rounds;
}

/** Bastão / cilindro curto e fino (12 pontos por padrão) */
export function buildRod(stitchCount = 12, heightRounds = 8, color?: string): Round[] {
  assertMultipleOf6(stitchCount, 'rod');
  return buildCylinder(
    { maxStitches: stitchCount, heightRounds, closedBottom: true, closedTop: true },
    color,
  );
}

/**
 * Estima diâmetro (cm) a partir do gauge.
 * @param maxStitches pontos na circunferência máxima
 * @param stitchesPerCm pontos por cm medidos na sua tensão
 */
export function estimateDiameterCm(maxStitches: number, stitchesPerCm: number): number {
  const circumference = maxStitches / stitchesPerCm;
  return Math.round((circumference / Math.PI) * 10) / 10;
}

/** Dado diâmetro alvo, sugere maxStitches (múltiplo de 6) */
export function stitchesForDiameterCm(targetDiameterCm: number, stitchesPerCm: number): number {
  const raw = Math.PI * targetDiameterCm * stitchesPerCm;
  const n = Math.max(1, Math.round(raw / 6));
  return n * 6;
}

/** Presets conservadores de gauge (pontos/cm) */
export const GAUGE_PRESETS: Record<string, number> = {
  lace: 6,
  fine: 4.5,
  medium: 3.5,
  bulky: 2.5,
};

/** Constante matemática do app (fio nº 4 + agulha 2,5 mm). Sem calibração por usuário. */
export const AMIGURUMI_STITCHES_PER_CM = GAUGE_PRESETS.fine;
