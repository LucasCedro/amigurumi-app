/** Espelho JS de src/engine/shapes.ts — usado pelos scripts Node */

export const GAUGE_PRESETS = { lace: 6, fine: 4.5, medium: 3.5, bulky: 2.5 };
export const AMIGURUMI_STITCHES_PER_CM = GAUGE_PRESETS.fine;

function assertMultipleOf6(maxStitches, shape) {
  if (maxStitches < 6 || maxStitches % 6 !== 0) {
    throw new Error(`${shape}: maxStitches deve ser múltiplo de 6 (≥ 6), recebeu ${maxStitches}`);
  }
}

function nFromMax(maxStitches) {
  return maxStitches / 6;
}

export function buildIncreaseRounds(maxStitches, color) {
  assertMultipleOf6(maxStitches, 'increase');
  const n = nFromMax(maxStitches);
  const rounds = [];

  for (let k = 1; k <= n; k++) {
    if (k === 1) {
      rounds.push({
        kind: 'stitches',
        label: String(k),
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
        label: String(k),
        groups: [{ pattern: [{ stitch: 'aum', count: 6 }], times: 1 }],
        totalStitches: 12,
      });
      continue;
    }
    rounds.push({
      kind: 'stitches',
      label: String(k),
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

export function buildEvenRounds(stitchCount, count, label, color) {
  return {
    kind: 'stitches',
    label,
    repeatRows: count,
    ...(color ? { color } : {}),
    groups: [{ pattern: [{ stitch: 'pb', count: stitchCount }], times: 1 }],
    totalStitches: stitchCount,
  };
}

export function buildDecreaseRounds(maxStitches) {
  assertMultipleOf6(maxStitches, 'decrease');
  const n = nFromMax(maxStitches);
  const rounds = [];

  for (let k = n; k >= 2; k--) {
    if (k === 2) {
      rounds.push({
        kind: 'stitches',
        label: 'x',
        groups: [{ pattern: [{ stitch: 'dim', count: 6 }], times: 1 }],
        totalStitches: 6,
      });
      continue;
    }
    rounds.push({
      kind: 'stitches',
      label: 'x',
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

export function buildFlatDisc({ maxStitches }, color) {
  return buildIncreaseRounds(maxStitches, color);
}

export function buildHemisphere({ maxStitches }, color) {
  return buildIncreaseRounds(maxStitches, color);
}

export function buildSphere({ maxStitches, bodyRounds }, color) {
  const n = nFromMax(maxStitches);
  const body = bodyRounds ?? n;
  const inc = buildIncreaseRounds(maxStitches, color);
  const mid = buildEvenRounds(maxStitches, body, `${n + 1}–${n + body}`);
  let start = n + body + 1;
  const decLabeled = buildDecreaseRounds(maxStitches).map((r) => ({
    ...r,
    label: String(start++),
  }));
  return [...inc, mid, ...decLabeled];
}

export function buildEgg({ maxStitches }, color) {
  const n = nFromMax(maxStitches);
  const inc = buildIncreaseRounds(maxStitches, color);
  const bodyCount = Math.max(n + 2, 4);
  const mid = buildEvenRounds(maxStitches, bodyCount, `${n + 1}–${n + bodyCount}`);
  const dec = buildDecreaseRounds(maxStitches).slice(0, Math.max(n - 1, 2));
  let start = n + bodyCount + 1;
  const decLabeled = dec.map((r) => ({ ...r, label: String(start++) }));
  return [...inc, mid, ...decLabeled];
}

export function buildCylinder({ maxStitches, heightRounds, closedBottom = true, closedTop = true }, color) {
  const n = nFromMax(maxStitches);
  if (closedBottom) {
    const rounds = [...buildIncreaseRounds(maxStitches, color)];
    rounds.push(buildEvenRounds(maxStitches, heightRounds, `${n + 1}–${n + heightRounds}`));
    if (closedTop) {
      let start = n + heightRounds + 1;
      rounds.push(
        ...buildDecreaseRounds(maxStitches).map((r) => ({ ...r, label: String(start++) })),
      );
    }
    return rounds;
  }
  const rounds = [
    {
      kind: 'stitches',
      label: '1',
      isMagicRing: true,
      ...(color ? { color } : {}),
      groups: [{ pattern: [{ stitch: 'pb', count: 6 }], times: 1 }],
      totalStitches: 6,
    },
    ...buildIncreaseRounds(maxStitches).slice(1),
    buildEvenRounds(maxStitches, heightRounds, `${n + 1}–${n + heightRounds}`),
  ];
  return rounds;
}

export function buildPlanterVase({ maxStitches, heightRounds, bottomRatio = 2 / 3 }, color) {
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

export function buildCone({ maxStitches, rimRounds = 0 }, color) {
  const rounds = buildIncreaseRounds(maxStitches, color);
  if (rimRounds > 0) {
    const n = nFromMax(maxStitches);
    rounds.push(buildEvenRounds(maxStitches, rimRounds, `${n + 1}–${n + rimRounds}`));
  }
  return rounds;
}

export function buildRod(stitchCount = 12, heightRounds = 8, color) {
  return buildCylinder(
    { maxStitches: stitchCount, heightRounds, closedBottom: true, closedTop: true },
    color,
  );
}

export function estimateDiameterCm(maxStitches, stitchesPerCm) {
  return Math.round((maxStitches / stitchesPerCm / Math.PI) * 10) / 10;
}

export function stitchesForDiameterCm(targetDiameterCm, stitchesPerCm) {
  const raw = Math.PI * targetDiameterCm * stitchesPerCm;
  return Math.max(6, Math.round(raw / 6) * 6);
}
