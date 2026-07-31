import { getSupabase } from '@/lib/supabase';
import type { PurchaseRow } from '@/types/database';

export type PurchaseWithRecipe = PurchaseRow & {
  market_recipes: {
    id: string;
    title: string;
    cover_url: string | null;
    price_cents: number;
    currency: string;
  } | null;
};

/** Lista compras pagas da usuária logada. Vazio se offline / sem config. */
export async function listMyPurchases(): Promise<PurchaseWithRecipe[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('purchases')
    .select(
      `
      *,
      market_recipes ( id, title, cover_url, price_cents, currency )
    `,
    )
    .eq('status', 'paid')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[purchases]', error.message);
    return [];
  }
  return (data ?? []) as PurchaseWithRecipe[];
}
