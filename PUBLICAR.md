# Quando for publicar (não fazer agora)

Checklist pra ativar cobrança de verdade. **Hoje, no PC/Expo Go, ignore este arquivo.**

Pré-requisito mental: nada aqui cobra cartão enquanto você só abre o app no navegador.

---

## Antes de ligar a loja

1. App testado (receitas free, premium trava, admin, reviews).
2. Conta Google Play Console paga (~US$25, uma vez).
3. Conta [expo.dev](https://expo.dev).

---

## Ativar (nessa ordem)

### A) Produto na Play Console

1. Criar app com package **`com.amiguide.app`** (já está no `app.json`).
2. Monetização → produto in-app → ID **`receita_ursinho_classico`** (igual ao `play_product_id` no banco).
3. Preço (ex.: R$ 19,90) → ativar.

### B) Build Android (EAS)

```bash
npx eas-cli login
npx eas build -p android --profile preview    # APK pra você testar
# depois:
npx eas build -p android --profile production # AAB pra loja (admin grant já vem off)
```

Subir o AAB em **teste interno** na Play antes de produção.

### C) Edge Function (o “porteiro” do comprovante)

```bash
npx supabase functions deploy verify-play-purchase --project-ref SEU_REF
```

Secrets no Supabase (Edge Functions → Secrets):

- `ANDROID_PACKAGE_NAME` = `com.amiguide.app`
- `GOOGLE_SERVICE_ACCOUNT_JSON` = JSON da service account (Play Console → API access)
- **Não** use `SKIP_PLAY_VERIFY=true` em produção

Código já está em `supabase/functions/verify-play-purchase/`.

### D) Desligar atalhos de teste

```sql
update public.app_config set value = 'false' where key = 'allow_admin_grant';
```

No `.env` de produção / profile `eas.json` → `production` já tem `EXPO_PUBLIC_ALLOW_ADMIN_GRANT=false`.

---

## Enquanto desenvolve (agora)

```sql
update public.app_config set value = 'true' where key = 'allow_admin_grant';
```

`.env`:

```
EXPO_PUBLIC_ALLOW_ADMIN_GRANT=true
```

No PC: use **Liberar (teste admin)** na receita premium. Botão Comprar vai dizer que IAP só existe no build Android — isso é esperado.
