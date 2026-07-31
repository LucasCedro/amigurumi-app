import type { BaseConfig, Recipe, Round } from '@/types/recipe';

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
} from './shapes';

const COLOR_ID = 'neutro';

export function isBaseRecipe(recipe: Pick<Recipe, 'base'>): boolean {
  return !!recipe.base;
}

export function normalizeRecipeId(id: string): string {
  if (id === 'ovo') return 'base-ovo';
  return id;
}

export function pickBaseSize(base: BaseConfig, sizeCm?: number): number {
  if (sizeCm && base.sizesCm.includes(sizeCm)) return sizeCm;
  if (sizeCm) {
    return base.sizesCm.reduce((best, s) =>
      Math.abs(s - sizeCm) < Math.abs(best - sizeCm) ? s : best,
    );
  }
  return base.defaultSizeCm;
}

function finishRounds(shapeRounds: Round[], notes: Round[]): Round[] {
  return [...shapeRounds, ...notes];
}

function buildShapeRounds(base: BaseConfig, sizeCm: number, color?: string): Round[] {
  const scale = sizeCm / base.defaultSizeCm;
  const maxStitches = stitchesForDiameterCm(sizeCm, AMIGURUMI_STITCHES_PER_CM);
  const n = maxStitches / 6;

  switch (base.shape) {
    case 'disc':
      return finishRounds(buildFlatDisc({ maxStitches }, color), [
        { kind: 'note', label: 'Acabamento', text: 'Não encha. Use como base plana ou tampa.' },
      ]);
    case 'sphere': {
      const bodyRounds = Math.max(2, Math.round(n * (base.bodyRoundsRatio ?? 1)));
      return finishRounds(buildSphere({ maxStitches, bodyRounds }, color), [
        { kind: 'note', label: 'Enchimento', text: 'Encha firme antes de fechar.' },
      ]);
    }
    case 'hemisphere':
      return finishRounds(buildHemisphere({ maxStitches }, color), [
        {
          kind: 'note',
          label: 'Acabamento',
          text: 'Base aberta. Encha se for domo ou chapéu arredondado.',
        },
      ]);
    case 'egg':
      return finishRounds(buildEgg({ maxStitches }, color), [
        { kind: 'note', label: 'Enchimento', text: 'Encha firme e feche a ponta.' },
      ]);
    case 'cylinder': {
      const heightRounds = Math.max(3, Math.round((base.heightRoundsAtDefault ?? 8) * scale));
      return finishRounds(
        buildCylinder({ maxStitches, heightRounds, closedBottom: true, closedTop: true }, color),
        [{ kind: 'note', label: 'Enchimento', text: 'Encha para pilar sólido.' }],
      );
    }
    case 'vase': {
      const heightRounds = Math.max(4, Math.round((base.heightRoundsAtDefault ?? 10) * scale));
      return finishRounds(
        buildPlanterVase({ maxStitches, heightRounds }, color),
        [
          {
            kind: 'note',
            label: 'Acabamento',
            text: 'Topo aberto — borda mais larga que a base, como cachepô de planta.',
          },
        ],
      );
    }
    case 'cone':
      return finishRounds(buildCone({ maxStitches }, color), [
        {
          kind: 'note',
          label: 'Acabamento',
          text: 'Ponta estreita no início. Vire se quiser a ponta para cima.',
        },
      ]);
    case 'rod': {
      const heightRounds = Math.max(4, Math.round((base.heightRoundsAtDefault ?? 10) * scale));
      const stitchCount = base.rodStitchCount ?? 12;
      return finishRounds(buildRod(stitchCount, heightRounds, color), [
        { kind: 'note', label: 'Acabamento', text: 'Cilindro fino — varinha, caule ou chaveiro.' },
      ]);
    }
    default:
      return [];
  }
}

/** Expande uma forma paramétrica no tamanho pedido (ou padrão). */
export function resolveRecipe(recipe: Recipe, sizeCm?: number): Recipe {
  if (!recipe.base) return recipe;

  const size = pickBaseSize(recipe.base, sizeCm);
  const color = recipe.colors?.[0]?.id ?? COLOR_ID;
  const rounds = buildShapeRounds(recipe.base, size, color);

  return {
    ...recipe,
    finalSizeCm: size,
    subtitle: `Forma · ~${size} cm`,
    pieces: [
      {
        id: 'peca',
        name: recipe.title,
        qty: 1,
        startColor: color,
        rounds,
      },
    ],
    assembly: recipe.assembly ?? [
      {
        step: 1,
        text: 'Arremate e esconda as pontas. Combine com outras formas na montagem.',
      },
    ],
  };
}
