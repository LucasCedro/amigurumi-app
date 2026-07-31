import type { Recipe } from '@/types/recipe';
import { BASE_TEMPLATES } from '@/data/bases';
import { normalizeRecipeId, resolveRecipe } from '@/engine/resolve-recipe';
import raw from './recipes.json';

/** Projetos completos — fonte do seed Supabase, não do catálogo em runtime. */
const CRAFT_RECIPES = raw as Recipe[];

/**
 * Usado por scripts de seed/validação e painel admin.
 * O app carrega o catálogo exclusivamente do Supabase (`CatalogProvider`).
 */
export function getRecipeStubsForSeed(): Recipe[] {
  return [...BASE_TEMPLATES, ...CRAFT_RECIPES];
}

/** Resolve forma paramétrica (usado quando `recipe.base` veio do banco). */
export function resolveRecipeFromStub(stub: Recipe, sizeCm?: number): Recipe {
  if (stub.base) return resolveRecipe(stub, sizeCm ?? stub.base.defaultSizeCm);
  return stub;
}

/** @deprecated seed/admin only */
export function getRecipe(id: string | undefined, sizeCm?: number): Recipe | undefined {
  if (!id) return undefined;
  const norm = normalizeRecipeId(id);
  const stub = getRecipeStubsForSeed().find((r) => r.id === norm);
  if (!stub) return undefined;
  return resolveRecipeFromStub(stub, sizeCm);
}
