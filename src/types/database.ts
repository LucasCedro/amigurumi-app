/**
 * Tipos gerados à mão (espelham supabase/migrations).
 */

export type RecipeStatus = 'draft' | 'published' | 'removed';
export type PurchaseStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_seller: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface MarketRecipeRow {
  id: string;
  seller_id: string;
  title: string;
  subtitle: string | null;
  category: string;
  difficulty: string;
  price_cents: number;
  currency: string;
  cover_url: string | null;
  play_product_id: string | null;
  emoji: string | null;
  tags: string[] | null;
  description: string | null;
  body: Record<string, unknown>;
  content_locale: 'pt' | 'en';
  is_house_catalog: boolean;
  status: RecipeStatus;
  created_at: string;
  updated_at: string;
}

export interface PurchaseRow {
  id: string;
  buyer_id: string;
  recipe_id: string;
  amount_cents: number;
  platform_fee_cents: number;
  seller_earnings_cents: number;
  provider: string | null;
  provider_payment_id: string | null;
  status: PurchaseStatus;
  created_at: string;
}

export interface RecipeReviewRow {
  id: string;
  recipe_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}
