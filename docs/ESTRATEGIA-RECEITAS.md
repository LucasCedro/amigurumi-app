# Estratégia de catálogo — Amiguide

Resumo do plano validado (fase 0). **Não** usar padrões free de sites (amigurumi.com etc.) sem permissão escrita — grátis no site ≠ grátis no app.

## Ordem de prioridade

1. **Templates geométricos** (R$0) — ovo, bola, cogumelo, coração… matemática pura, zero IP
2. **Contratar artesã** (R$40–120/receita) — testa fisicamente, você formata JSON
3. **Licenciar Etsy** — só com "commercial" + permissão explícita de redistribuição digital/app
4. **IA** — só conversão de texto licenciado ou rascunho geométrico + validação matemática

## Meta 90 dias

10–12 receitas verificadas. Premium = 100% suas (ou licenciadas pra venda).

| Semanas | Ação |
|---------|------|
| 1–2 | Templates: bola, cogumelo (✅ no JSON local) |
| 3–4 | Brief artesã (3 receitas) + coração chaveiro |
| 5–8 | Artesã entrega 3 bichos genéricos; QA físico |
| 9–12 | 1 teste Etsy com licença clara; 2–3 premium |

## Brief freelancer

Ver prompt completo no histórico / Claude. Pontos-chave:

- Autoria original + declaração por escrito
- Foto da peça testada
- Carreira a carreira com **total de pontos** ao final
- R$40–70 (simples) / R$70–120 (mais peças)

## Checklist licença

- ❌ "Free download" no site
- ❌ Personagem licenciado
- ❌ PDF convertido sem permissão
- ✅ Contrato cede uso comercial + redistribuição no app
- ✅ Etsy: perguntar por escrito se pode reescrever no app

## Publicar no Supabase

1. Adicionar em `src/data/recipes.json` (free local) ou admin (remoto)
2. `node supabase/generate-seed.mjs` → atualiza seed no `SETUP.sql`
3. Ou: admin → Importar / Nova receita

## Validação matemática (carreiras)

- Aumento uniforme: `total_novo = total_anterior + nº_aum`
- Padrão `X pb + 1 aum` × Y: consumo `(X+1)×Y`; novo `X×Y + 2×Y`
- Só `pb`: `total_novo = total_anterior`
