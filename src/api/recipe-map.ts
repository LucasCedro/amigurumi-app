import type { MarketRecipeRow } from '@/types/database';
import type { Category, Difficulty, Piece, Recipe } from '@/types/recipe';

type BodyBag = Partial<Recipe> & { localSlug?: string };

export type MarketRecipeWithSecret = MarketRecipeRow & {
  recipe_bodies?: { body: BodyBag } | { body: BodyBag }[] | null;
};

function pickBody(row: MarketRecipeWithSecret): BodyBag {
  const raw = row.recipe_bodies;
  if (!raw) return {};
  if (Array.isArray(raw)) return (raw[0]?.body as BodyBag) ?? {};
  return (raw.body as BodyBag) ?? {};
}

/** Teaser público (sem rounds) + body secreto se o RLS liberou o join */
export function rowToRecipe(row: MarketRecipeWithSecret): Recipe {
  const teaser = (row.body ?? {}) as BodyBag;
  const secret = pickBody(row);
  const hasSecret = Object.keys(secret).length > 0;
  const merged = hasSecret ? { ...teaser, ...secret } : teaser;
  const priceCents = row.price_cents ?? 0;

  const pieces = ((merged.pieces as Piece[] | undefined) ?? []).map((p) => ({
    ...p,
    rounds: p.rounds ?? [],
  }));

  return {
    id: row.id,
    localSlug: merged.localSlug ?? teaser.localSlug,
    title: row.title,
    subtitle: row.subtitle ?? merged.subtitle,
    category: (row.category as Category) || merged.category || 'bichos',
    tags: row.tags?.length ? row.tags : merged.tags ?? [],
    difficulty: (row.difficulty as Difficulty) || merged.difficulty || 'iniciante',
    yarnWeight: merged.yarnWeight,
    estimatedHours: merged.estimatedHours,
    finalSizeCm: merged.finalSizeCm,
    isPremium: priceCents > 0,
    priceCents,
    currency: row.currency || 'BRL',
    playProductId: row.play_product_id ?? undefined,
    emoji: row.emoji ?? merged.emoji,
    cover: row.cover_url ?? merged.cover,
    gallery: merged.gallery,
    author: merged.author,
    colors: merged.colors,
    description: row.description ?? merged.description,
    materials: merged.materials ?? [],
    notes: merged.notes,
    pieces,
    assembly: hasSecret ? merged.assembly : undefined,
    video: merged.video,
    base: merged.base,
    source: 'remote',
    contentLocale: row.content_locale ?? 'pt',
    isHouseCatalog: row.is_house_catalog ?? false,
  };
}

/** Body completo (vai pra recipe_bodies). Inclui localSlug. */
export function recipeToFullBody(recipe: Recipe, localSlug?: string): Record<string, unknown> {
  return {
    localSlug: localSlug ?? recipe.id,
    subtitle: recipe.subtitle,
    tags: recipe.tags,
    yarnWeight: recipe.yarnWeight,
    estimatedHours: recipe.estimatedHours,
    finalSizeCm: recipe.finalSizeCm,
    emoji: recipe.emoji,
    cover: recipe.cover,
    gallery: recipe.gallery,
    author: recipe.author,
    colors: recipe.colors,
    description: recipe.description,
    materials: recipe.materials,
    notes: recipe.notes,
    pieces: recipe.pieces,
    assembly: recipe.assembly,
    video: recipe.video,
    base: recipe.base,
  };
}

/** @deprecated use recipeToFullBody — mantido pra imports antigos */
export function recipeToBody(recipe: Recipe): Record<string, unknown> {
  return recipeToFullBody(recipe);
}
