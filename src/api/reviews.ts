import { getSupabase } from '@/lib/supabase';
import type { RecipeReviewRow } from '@/types/database';

export type ReviewWithAuthor = RecipeReviewRow & {
  profiles: { display_name: string | null; avatar_url: string | null } | null;
};

export async function listReviews(recipeId: string): Promise<ReviewWithAuthor[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('recipe_reviews')
    .select('*, profiles ( display_name, avatar_url )')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[reviews]', error.message);
    return [];
  }
  return (data ?? []) as ReviewWithAuthor[];
}

export async function upsertReview(
  recipeId: string,
  userId: string,
  rating: number,
  comment: string,
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return 'Supabase não configurado';

  const { error } = await supabase.from('recipe_reviews').upsert(
    {
      recipe_id: recipeId,
      user_id: userId,
      rating,
      comment: comment.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'recipe_id,user_id' },
  );
  return error?.message ?? null;
}

export function averageRating(reviews: { rating: number }[]): number | null {
  if (!reviews.length) return null;
  const sum = reviews.reduce((a, r) => a + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
