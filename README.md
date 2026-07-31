# Amiguide 🧶

App de crochê/amigurumi com **guia inteligente** (contador ponto a ponto). Modelo atual (fase 0.5): você vende as próprias receitas premium via **Google Play Billing**; catálogo gratuito no app.

## GitHub
git status

git add -A

git commit -m "feat: descreva o que mudou"

git push origin main

## Stack

- **App:** React Native + Expo (SDK 57) + Expo Router (TypeScript)
- **Backend:** [Supabase](https://supabase.com) — Auth, Postgres (RLS), Edge Functions
- Offline seed: só receitas **grátis** em `src/data/recipes.json`
- Premium: `price_cents > 0` + `play_product_id` + compra validada no servidor

> Sem VPS. Proteção = RLS + Edge Function (service_role). A anon key é pública de propósito.

## Rodar (dev)

```bash
cp .env.example .env   # preencha URL + anon key
npx expo start
```

> Não use `npm start`.

**PC / Chrome (F12):** só UI. Não tem Google Billing — não tem como comprar sem querer.  
Premium no teste: admin + **Liberar (teste admin)** (`allow_admin_grant = true`).

**Quando for publicar de verdade:** veja [`PUBLICAR.md`](./PUBLICAR.md) (Play Console + EAS + Edge Function). Não precisa fazer isso agora.

---

## Configurar Supabase

### 1) Projeto + `.env`

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
EXPO_PUBLIC_ALLOW_ADMIN_GRANT=true   # false em produção / eas production já força
```

### 2) SQL (uma vez)

1. Crie a conta no app (e-mail ou Google).
2. Abra `supabase/SETUP.sql`, troque **`SEU_EMAIL@gmail.com`** pelo seu.
3. Cole tudo no **SQL Editor** → Run.

Isso cria schema + hardening + seed (4 receitas) e te deixa admin.
### 3) Auth

- Email ligado; Google OAuth opcional (ver redirect `amiguide://auth/callback`)

### 4) Edge Function `verify-play-purchase`

```bash
npx supabase login
npx supabase functions deploy verify-play-purchase --project-ref SEU_REF
```

Secrets (Dashboard → Edge Functions → Secrets):

| Secret | Valor |
|--------|--------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON da service account com Android Publisher API |
| `ANDROID_PACKAGE_NAME` | `com.amiguide.app` |
| `SKIP_PLAY_VERIFY` | `true` **só em dev** — NUNCA na store |

No Play Console: vincule a service account em **API access**.

---

## Google Play / EAS

`app.json` → `android.package`: **`com.amiguide.app`**

```bash
npx eas-cli login
npx eas build -p android --profile preview     # APK interno
npx eas build -p android --profile production  # AAB (admin grant off)
```

Play Console → produto in-app:

- Product ID: **`receita_ursinho_classico`** (igual ao `play_product_id` no banco)
- Tipo: managed / one-time

Fluxo: Play Billing → app envia token → Edge Function valida no Google → `record_play_purchase` → RLS libera `recipe_bodies`.

---

## Segurança (checklist)

| Camada | Status |
|--------|--------|
| Self-admin via `profiles` UPDATE | Travado (trigger) |
| Body premium no SELECT público | Travado (`recipe_bodies` RLS) |
| INSERT fake em `purchases` | Já bloqueado (RLS) |
| Admin grant em produção | `app_config` + `EXPO_PUBLIC_ALLOW_ADMIN_GRANT=false` |
| Ursinho no JSON local | Removido (só free no bundle) |
| Reviews premium sem compra | Travado (RLS + UI) |

---

## Arquitetura

```
App (Expo/EAS) ──anon──► Supabase Auth + Postgres (RLS)
                           ├── profiles (is_admin imutável no client)
                           ├── market_recipes (teaser público)
                           ├── recipe_bodies (rounds; RLS)
                           ├── purchases (só Edge / admin_grant)
                           └── recipe_reviews (premium exige paid)

Play Billing ──token──► Edge Function verify-play-purchase
                           └── Google Play API → record_play_purchase
```

**Fases:** 0 auth/admin ✅ · 0.5 IAP próprio (este README) · 3 marketplace multi-artesã (depois).

## Estrutura

```
src/iap/billing.ts              # Play + admin grant
src/api/recipes.ts              # join recipe_bodies
supabase/migrations/003_hardening.sql
supabase/functions/verify-play-purchase/
eas.json
```
