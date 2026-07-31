/**
 * Edge Function: verifica compra Google Play e grava em `purchases`.
 *
 * Deploy:
 *   npx supabase functions deploy verify-play-purchase --project-ref SEU_REF
 *
 * Secrets (Dashboard → Edge Functions → Secrets):
 *   GOOGLE_SERVICE_ACCOUNT_JSON  → JSON da service account com acesso à Android Publisher API
 *   (opcional em DEV) SKIP_PLAY_VERIFY=true → aceita token sem chamar Google (NUNCA em prod)
 *
 * No Play Console: vincule a service account em API access.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Sem Authorization' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Cliente do usuário (valida JWT)
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: 'Sessão inválida' }, 401);
    }
    const buyerId = userData.user.id;

    const body = await req.json();
    const recipeId = body.recipeId as string | undefined;
    const productId = body.productId as string | undefined;
    const purchaseToken = body.purchaseToken as string | undefined;
    const orderId = (body.orderId as string | null) ?? null;

    if (!recipeId || !productId || !purchaseToken) {
      return json({ error: 'recipeId, productId e purchaseToken são obrigatórios' }, 400);
    }

    const skip = Deno.env.get('SKIP_PLAY_VERIFY') === 'true';
    const packageName = Deno.env.get('ANDROID_PACKAGE_NAME') || 'com.amiguide.app';

    if (!skip) {
      const ok = await verifyGooglePlay(packageName, productId, purchaseToken);
      if (!ok.valid) {
        return json({ error: ok.error || 'Recibo inválido no Google Play' }, 400);
      }
    }

    // Grava compra com service role
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: recipe, error: recipeErr } = await admin
      .from('market_recipes')
      .select('price_cents, play_product_id')
      .eq('id', recipeId)
      .maybeSingle();

    if (recipeErr || !recipe) {
      return json({ error: 'Receita não encontrada' }, 404);
    }
    if (recipe.play_product_id !== productId) {
      return json({ error: 'SKU não confere com a receita' }, 400);
    }

    const { data: purchaseId, error: rpcErr } = await admin.rpc('record_play_purchase', {
      p_buyer_id: buyerId,
      p_recipe_id: recipeId,
      p_product_id: productId,
      p_purchase_token: purchaseToken,
      p_order_id: orderId,
      p_amount_cents: recipe.price_cents,
    });

    if (rpcErr) {
      return json({ error: rpcErr.message }, 500);
    }

    return json({ ok: true, purchaseId });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro interno';
    return json({ error: message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

async function verifyGooglePlay(
  packageName: string,
  productId: string,
  purchaseToken: string,
): Promise<{ valid: boolean; error?: string }> {
  const raw = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
  if (!raw) {
    return {
      valid: false,
      error:
        'GOOGLE_SERVICE_ACCOUNT_JSON não configurado. Defina o secret ou SKIP_PLAY_VERIFY=true só em dev.',
    };
  }

  let sa: {
    client_email: string;
    private_key: string;
    token_uri?: string;
  };
  try {
    sa = JSON.parse(raw);
  } catch {
    return { valid: false, error: 'GOOGLE_SERVICE_ACCOUNT_JSON inválido' };
  }

  const accessToken = await googleAccessToken(sa);
  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/` +
    `${encodeURIComponent(packageName)}/purchases/products/` +
    `${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    return { valid: false, error: `Google Play API ${res.status}: ${text.slice(0, 200)}` };
  }

  const data = (await res.json()) as { purchaseState?: number };
  // 0 = purchased
  if (data.purchaseState !== 0) {
    return { valid: false, error: `purchaseState=${data.purchaseState}` };
  }
  return { valid: true };
}

async function googleAccessToken(sa: {
  client_email: string;
  private_key: string;
  token_uri?: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = btoaUrl(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = btoaUrl(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: sa.token_uri || 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned),
  );
  const jwt = `${unsigned}.${btoaUrl(sig)}`;

  const tokenRes = await fetch(sa.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`OAuth Google falhou: ${await tokenRes.text()}`);
  }
  const tok = (await tokenRes.json()) as { access_token: string };
  return tok.access_token;
}

function btoaUrl(input: string | ArrayBuffer): string {
  const bytes =
    typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const raw = atob(b64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}
