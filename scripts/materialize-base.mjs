/**
 * Materializa formas paramétricas (espelho de resolve-recipe.ts para scripts Node).
 */
import {
  AMIGURUMI_STITCHES_PER_CM,
  buildCone,
  buildCylinder,
  buildPlanterVase,
  buildEgg,
  buildFlatDisc,
  buildHemisphere,
  buildRod,
  buildSphere,
  stitchesForDiameterCm,
} from './shape-patterns.mjs';

export { AMIGURUMI_STITCHES_PER_CM, stitchesForDiameterCm };

function finishRounds(shapeRounds, notes) {
  return [...shapeRounds, ...notes];
}

export function materializeBase(base, meta, sizeCm, color = 'neutro') {
  const scale = sizeCm / base.defaultSizeCm;
  const maxStitches = stitchesForDiameterCm(sizeCm, AMIGURUMI_STITCHES_PER_CM);
  const n = maxStitches / 6;
  let rounds = [];

  switch (base.shape) {
    case 'disc':
      rounds = finishRounds(buildFlatDisc({ maxStitches }, color), [
        { kind: 'note', label: 'Acabamento', text: 'Não encha. Use como base plana ou tampa.' },
      ]);
      break;
    case 'sphere': {
      const bodyRounds = Math.max(2, Math.round(n * (base.bodyRoundsRatio ?? 1)));
      rounds = finishRounds(buildSphere({ maxStitches, bodyRounds }, color), [
        { kind: 'note', label: 'Enchimento', text: 'Encha firme antes de fechar.' },
      ]);
      break;
    }
    case 'hemisphere':
      rounds = finishRounds(buildHemisphere({ maxStitches }, color), [
        { kind: 'note', label: 'Acabamento', text: 'Base aberta. Encha se for domo ou chapéu arredondado.' },
      ]);
      break;
    case 'egg':
      rounds = finishRounds(buildEgg({ maxStitches }, color), [
        { kind: 'note', label: 'Enchimento', text: 'Encha firme e feche a ponta.' },
      ]);
      break;
    case 'cylinder': {
      const heightRounds = Math.max(3, Math.round((base.heightRoundsAtDefault ?? 8) * scale));
      rounds = finishRounds(
        buildCylinder({ maxStitches, heightRounds, closedBottom: true, closedTop: true }, color),
        [{ kind: 'note', label: 'Enchimento', text: 'Encha para pilar sólido.' }],
      );
      break;
    }
    case 'vase': {
      const heightRounds = Math.max(4, Math.round((base.heightRoundsAtDefault ?? 10) * scale));
      rounds = finishRounds(
        buildPlanterVase({ maxStitches, heightRounds }, color),
        [
          {
            kind: 'note',
            label: 'Acabamento',
            text: 'Topo aberto — borda mais larga que a base, como cachepô de planta.',
          },
        ],
      );
      break;
    }
    case 'cone':
      rounds = finishRounds(buildCone({ maxStitches }, color), [
        { kind: 'note', label: 'Acabamento', text: 'Ponta estreita no início.' },
      ]);
      break;
    case 'rod': {
      const heightRounds = Math.max(4, Math.round((base.heightRoundsAtDefault ?? 10) * scale));
      rounds = finishRounds(buildRod(base.rodStitchCount ?? 12, heightRounds, color), [
        { kind: 'note', label: 'Acabamento', text: 'Cilindro fino — varinha, caule ou chaveiro.' },
      ]);
      break;
    }
    default:
      rounds = [];
  }

  return {
    ...meta,
    finalSizeCm: sizeCm,
    subtitle: `Forma · ~${sizeCm} cm`,
    base,
    pieces: [
      {
        id: 'peca',
        name: meta.title,
        qty: 1,
        startColor: color,
        rounds,
      },
    ],
    assembly: meta.assembly ?? [
      { step: 1, text: 'Arremate e esconda as pontas. Combine com outras formas na montagem.' },
    ],
  };
}
