import { getSupabase } from '@/lib/supabase';
import { normalizeRecipeId } from '@/engine/resolve-recipe';
import type { MarketRecipeRow, RecipeStatus } from '@/types/database';
import type { Recipe } from '@/types/recipe';

import { recipeToFullBody, rowToRecipe, type MarketRecipeWithSecret } from './recipe-map';

const SELECT_WITH_BODY = '*, recipe_bodies ( body )';

function catalogKey(recipe: Recipe): string {
  const slug = recipe.localSlug?.trim();
  if (slug) return normalizeRecipeId(slug);
  return recipe.id;
}

/** Evita duplicata visual (ex.: ovo legado + base-ovo no mesmo catálogo). */
function dedupePublishedRecipes(recipes: Recipe[]): Recipe[] {
  const best = new Map<string, Recipe>();

  const score = (r: Recipe) =>
    (r.base ? 4 : 0) +
    (r.localSlug && normalizeRecipeId(r.localSlug) === catalogKey(r) ? 2 : 0) +
    (r.pieces?.some((p) => (p.rounds?.length ?? 0) > 0) ? 1 : 0);

  for (const recipe of recipes) {
    const key = catalogKey(recipe);
    const prev = best.get(key);
    if (!prev || score(recipe) > score(prev)) best.set(key, recipe);
  }

  return Array.from(best.values());
}

export async function fetchPublishedRecipes(): Promise<Recipe[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('market_recipes')
    .select(SELECT_WITH_BODY)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[recipes]', error.message);
    return [];
  }
  return dedupePublishedRecipes(((data ?? []) as MarketRecipeWithSecret[]).map(rowToRecipe));
}

export async function fetchRecipeById(id: string): Promise<Recipe | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('market_recipes')
    .select(SELECT_WITH_BODY)
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return rowToRecipe(data as MarketRecipeWithSecret);
}

export async function fetchAdminRecipes(): Promise<MarketRecipeRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  // Admin vê body secreto via RLS
  const { data, error } = await supabase
    .from('market_recipes')
    .select(SELECT_WITH_BODY)
    .order('updated_at', { ascending: false });

  if (error) {
    console.warn('[admin recipes]', error.message);
    return [];
  }

  return ((data ?? []) as MarketRecipeWithSecret[]).map((row) => {
    const secret = Array.isArray(row.recipe_bodies)
      ? row.recipe_bodies[0]?.body
      : row.recipe_bodies?.body;
    return {
      ...row,
      body: (secret as Record<string, unknown>) ?? row.body,
    } as MarketRecipeRow;
  });
}

export interface UpsertRecipeInput {
  id?: string;
  title: string;
  subtitle?: string;
  category: string;
  difficulty: string;
  priceCents: number;
  playProductId?: string;
  emoji?: string;
  tags?: string[];
  description?: string;
  coverUrl?: string;
  status: RecipeStatus;
  body: Record<string, unknown>;
  sellerId: string;
  contentLocale?: 'pt' | 'en';
  isHouseCatalog?: boolean;
}

export async function upsertAdminRecipe(input: UpsertRecipeInput): Promise<{ id?: string; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase não configurado' };

  const meta = {
    ...(input.id ? { id: input.id } : {}),
    seller_id: input.sellerId,
    title: input.title,
    subtitle: input.subtitle ?? null,
    category: input.category,
    difficulty: input.difficulty,
    price_cents: input.priceCents,
    currency: 'BRL',
    play_product_id: input.playProductId || null,
    emoji: input.emoji ?? null,
    tags: input.tags ?? [],
    description: input.description ?? null,
    cover_url: input.coverUrl ?? null,
    // teaser placeholder; upsert_recipe_content preenche de verdade
    body: { localSlug: (input.body.localSlug as string) || input.id || 'new' },
    status: input.status,
    content_locale: input.contentLocale ?? 'pt',
    is_house_catalog: input.isHouseCatalog ?? true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('market_recipes').upsert(meta).select('id').single();
  if (error) return { error: error.message };

  const recipeId = data?.id as string;
  const { error: bodyErr } = await supabase.rpc('upsert_recipe_content', {
    p_recipe_id: recipeId,
    p_full_body: input.body,
  });
  if (bodyErr) return { error: bodyErr.message };

  return { id: recipeId };
}

/** Importa Recipe do JSON local (idempotente por localSlug). */
export async function importRecipeAsAdmin(
  recipe: Recipe,
  sellerId: string,
  status: RecipeStatus = 'published',
): Promise<{ id?: string; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase não configurado' };

  const priceCents = recipe.priceCents ?? (recipe.isPremium ? 1990 : 0);

  const { data: existing } = await supabase
    .from('market_recipes')
    .select('id')
    .filter('body->>localSlug', 'eq', recipe.id)
    .maybeSingle();

  return upsertAdminRecipe({
    id: existing?.id as string | undefined,
    title: recipe.title,
    subtitle: recipe.subtitle,
    category: recipe.category,
    difficulty: recipe.difficulty,
    priceCents,
    playProductId: recipe.playProductId,
    emoji: recipe.emoji,
    tags: recipe.tags,
    description: recipe.description,
    coverUrl: recipe.cover?.startsWith('http') ? recipe.cover : undefined,
    status,
    sellerId,
    contentLocale: 'pt',
    isHouseCatalog: true,
    body: recipeToFullBody(recipe, recipe.id),
  });
}

export async function adminGrantPurchase(recipeId: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return 'Supabase não configurado';
  const { error } = await supabase.rpc('admin_grant_purchase', { p_recipe_id: recipeId });
  return error?.message ?? null;
}

export async function hasPaidPurchase(recipeId: string, userId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { data } = await supabase
    .from('purchases')
    .select('id')
    .eq('recipe_id', recipeId)
    .eq('buyer_id', userId)
    .eq('status', 'paid')
    .maybeSingle();
  return !!data;
}

/** Após compra, recarrega a receita pra liberar recipe_bodies no join */
export async function refreshRecipeAccess(recipeId: string): Promise<Recipe | null> {
  return fetchRecipeById(recipeId);
}
