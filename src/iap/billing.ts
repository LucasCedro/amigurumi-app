/**
 * Google Play Billing — Fase 0.5
 *
 * - Web / Expo Go: IAP nativo indisponível → mensagem clara
 * - Dev build / Play Store (Android): react-native-iap + Edge Function
 * - Admin grant: só se EXPO_PUBLIC_ALLOW_ADMIN_GRANT=true (dev)
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { adminGrantPurchase } from '@/api/recipes';
import { getSupabase } from '@/lib/supabase';
import type { Recipe } from '@/types/recipe';

export type PurchaseResult =
  | { ok: true; provider: 'admin_grant' | 'play_billing' | 'already_owned' }
  | { ok: false; message: string };

export function formatPrice(cents: number, currency = 'USD', localeTag = 'en-US'): string {
  return (cents / 100).toLocaleString(localeTag, { style: 'currency', currency });
}

/** Admin grant só em builds de desenvolvimento (nunca na store). */
export function allowAdminGrant(): boolean {
  if (Constants.appOwnership === 'expo') return true; // Expo Go
  const flag = process.env.EXPO_PUBLIC_ALLOW_ADMIN_GRANT;
  if (flag === 'false') return false;
  if (flag === 'true') return true;
  return __DEV__;
}

export function canUseNativeIap(): boolean {
  return Platform.OS === 'android' && Constants.appOwnership !== 'expo';
}

type IapModule = typeof import('react-native-iap');

async function loadIap(): Promise<IapModule | null> {
  if (!canUseNativeIap()) return null;
  try {
    return await import('react-native-iap');
  } catch {
    return null;
  }
}

async function verifyWithEdge(
  recipeId: string,
  productId: string,
  purchaseToken: string,
  orderId?: string,
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return 'Supabase não configurado';

  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;
  if (!token) return 'Faça login pra comprar.';

  const base = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!base) return 'URL do Supabase ausente';

  const res = await fetch(`${base}/functions/v1/verify-play-purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    },
    body: JSON.stringify({
      recipeId,
      productId,
      purchaseToken,
      orderId: orderId ?? null,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as { error?: string; ok?: boolean };
  if (!res.ok) return json.error || `Falha na verificação (${res.status})`;
  return null;
}

/**
 * Compra receita premium.
 * Fluxo store: Play Billing → Edge Function → purchases.
 * Fluxo dev admin: admin_grant (se flag ligada).
 */
export async function purchaseRecipe(
  recipe: Recipe,
  opts: { isAdmin?: boolean; forceAdminGrant?: boolean } = {},
): Promise<PurchaseResult> {
  if (!recipe.isPremium || !recipe.priceCents) {
    return { ok: false, message: 'Esta receita é gratuita.' };
  }

  if (opts.forceAdminGrant) {
    if (!opts.isAdmin || !allowAdminGrant()) {
      return { ok: false, message: 'Liberação admin indisponível neste build.' };
    }
    const err = await adminGrantPurchase(recipe.id);
    if (err) return { ok: false, message: err };
    return { ok: true, provider: 'admin_grant' };
  }

  const sku = recipe.playProductId;
  if (!sku) {
    return { ok: false, message: 'Receita sem SKU do Play Console (play_product_id).' };
  }

  if (!canUseNativeIap()) {
    if (opts.isAdmin && allowAdminGrant()) {
      return {
        ok: false,
        message:
          'IAP nativo só roda em build Android (EAS), não no Expo Go/web. Como admin, use “Liberar (teste)”.',
      };
    }
    return {
      ok: false,
      message:
        'Compras premium abrem no app da Play Store (build Android). No navegador/Expo Go o Google Billing não está disponível.',
    };
  }

  const iap = await loadIap();
  if (!iap) {
    return {
      ok: false,
      message: 'Módulo de compra não encontrado neste build. Gere um EAS Build com react-native-iap.',
    };
  }

  try {
    await iap.initConnection();
    const products = await iap.fetchProducts({ skus: [sku], type: 'in-app' });
    if (!products?.length) {
      return {
        ok: false,
        message: `Produto ${sku} não encontrado no Play Console. Confira o SKU e o package name (com.amiguide.app).`,
      };
    }

    const purchase = await new Promise<{
      purchaseToken?: string;
      transactionReceipt?: string;
      id?: string;
      transactionId?: string;
    }>((resolve, reject) => {
      const done = { finished: false };
      const finish = () => {
        if (done.finished) return;
        done.finished = true;
        sub.remove();
        errSub.remove();
      };

      const sub = iap.purchaseUpdatedListener((p) => {
        finish();
        resolve(p as never);
      });
      const errSub = iap.purchaseErrorListener((e) => {
        finish();
        reject(e);
      });

      void iap
        .requestPurchase({
          type: 'in-app',
          request: {
            google: { skus: [sku] },
            apple: { sku },
          },
        })
        .catch((e: unknown) => {
          finish();
          reject(e);
        });
    });

    const purchaseToken = purchase.purchaseToken || purchase.transactionReceipt;
    if (!purchaseToken) {
      return { ok: false, message: 'Compra cancelada ou sem token do Google.' };
    }

    const orderId = purchase.id || purchase.transactionId;
    const verifyErr = await verifyWithEdge(recipe.id, sku, purchaseToken, orderId);
    if (verifyErr) return { ok: false, message: verifyErr };

    try {
      await iap.finishTransaction({
        purchase: purchase as never,
        isConsumable: false,
      });
    } catch {
      // best-effort
    }

    return { ok: true, provider: 'play_billing' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Falha na compra';
    if (/cancel/i.test(msg)) return { ok: false, message: 'Compra cancelada.' };
    return { ok: false, message: msg };
  } finally {
    try {
      const iap2 = await loadIap();
      await iap2?.endConnection();
    } catch {
      /* ignore */
    }
  }
}
