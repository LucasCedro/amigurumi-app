// Valida a matemática das receitas (produzido x totalStitches), cores e capas.
// Uso: node scripts/validate-recipes.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { BASE_MANIFEST, BASE_SHARED } from './bases-manifest.mjs';
import { materializeBase } from './materialize-base.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const PRODUCES = { mr: 0, pb: 1, aum: 2, dim: 1, pa: 1, mpa: 1, pbx: 1, corr: 1, blo: 1, flo: 1 };

const craft = JSON.parse(readFileSync(join(root, 'src/data/recipes.json'), 'utf8'));
const bases = BASE_MANIFEST.map((b) =>
  materializeBase(
    b.base,
    {
      ...BASE_SHARED,
      id: b.id,
      title: b.title,
      emoji: b.emoji,
      cover: b.cover,
      description: b.description,
      tags: b.tags,
      category: 'base',
      difficulty: 'iniciante',
      isPremium: false,
    },
    b.base.defaultSizeCm,
  ),
);
const recipes = [...bases, ...craft];

const imageKeys = new Set(
  Object.keys(
    Object.fromEntries(
      [...readFileSync(join(root, 'src/data/recipe-images.ts'), 'utf8').matchAll(/'([^']+\/cover)'/g)].map(
        (m) => [m[1], true],
      ),
    ),
  ),
);

const errors = [];
const info = [];

for (const recipe of recipes) {
  const colorIds = new Set((recipe.colors ?? []).map((c) => c.id));

  if (recipe.cover && !imageKeys.has(recipe.cover)) {
    errors.push(`${recipe.id}: capa "${recipe.cover}" não está mapeada em recipe-images.ts`);
  }

  if (!Array.isArray(recipe.pieces) || recipe.pieces.length === 0) {
    errors.push(`${recipe.id}: sem peças`);
    continue;
  }

  for (const piece of recipe.pieces) {
    if (piece.startColor && !colorIds.has(piece.startColor)) {
      errors.push(`${recipe.id}/${piece.id}: startColor "${piece.startColor}" inexistente`);
    }
    let carreiras = 0;
    for (const round of piece.rounds) {
      if (round.kind === 'note') continue;
      if (round.color && !colorIds.has(round.color)) {
        errors.push(`${recipe.id}/${piece.id} carr ${round.label}: cor "${round.color}" inexistente`);
      }
      let produced = 0;
      for (const g of round.groups) {
        for (let t = 0; t < g.times; t++) {
          for (const seg of g.pattern) produced += (PRODUCES[seg.stitch] ?? 0) * seg.count;
        }
      }
      const copies = round.repeatRows ?? 1;
      carreiras += copies;
      if (produced !== round.totalStitches) {
        errors.push(
          `${recipe.id}/${piece.id} carr ${round.label}: produzido ${produced} ≠ total ${round.totalStitches}`,
        );
      }
    }
    info.push(`  ${recipe.id}/${piece.id} x${piece.qty} → ${carreiras} carreiras OK`);
  }
}

console.log(`Formas: ${bases.length} · Projetos: ${craft.length}`);
console.log(info.join('\n'));

if (errors.length) {
  console.error(`\n❌ ${errors.length} erro(s):`);
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log('\n✅ Tudo válido: matemática, cores e capas.');
