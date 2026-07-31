# Checklist QA — Amiguide v1

Use antes de build de loja. Marque **OK** / **FALHA** / **N/A** e anote o device.

**Ambientes:** `[ ]` Expo Go / Web · `[ ]` APK EAS preview · `[ ]` Teste interno Play

**Conta de teste:** _______________ · **Data:** _______________

---

## 0. Pré-requisitos

| # | Item | OK | Notas |
|---|------|----|-------|
| 0.1 | `.env` com `EXPO_PUBLIC_SUPABASE_URL` e `ANON_KEY` | | |
| 0.2 | `SETUP.sql` ou migrations + seed rodados com seu e-mail admin | | |
| 0.3 | `app_config.allow_admin_grant = true` (dev) | | |
| 0.4 | Catálogo carrega (não fica “vazio” na home) | | |

---

## 1. Primeira abertura & conta

| # | Item | OK | Notas |
|---|------|----|-------|
| 1.1 | Onboarding aparece só na 1ª vez | | |
| 1.2 | Criar conta (e-mail) | | |
| 1.3 | Login / logout | | |
| 1.4 | Google OAuth (se configurado) | | |
| 1.5 | Tela conta: idioma **Auto / EN / PT** muda labels da UI | | |
| 1.6 | Tema claro / escuro / sistema | | |

---

## 2. Home & catálogo

| # | Item | OK | Notas |
|---|------|----|-------|
| 2.1 | Abas: Projetos, Em andamento, Meus (+ Compras se tiver compra) | | |
| 2.2 | Grade 2 colunas; scroll suave | | |
| 2.3 | Busca por título/tag | | |
| 2.4 | Filtro por categoria | | |
| 2.5 | Seção “formas” (base) separada de projetos | | |
| 2.6 | Card abre tela de receita | | |
| 2.7 | Pull / botão atualizar catálogo (se vazio) | | |
| 2.8 | Sem backend: mensagem clara, sem crash | | |

---

## 3. Receita (aba Pattern)

| # | Item | OK | Notas |
|---|------|----|-------|
| 3.1 | Capa, título, descrição, materiais, peças | | |
| 3.2 | Carreiras visíveis em receita **free** | | |
| 3.3 | Premium: rounds **ocultos** antes da compra | | |
| 3.4 | Premium: CTA comprar / admin grant (dev) | | |
| 3.5 | Forma paramétrica: picker de tamanho **antes** de iniciar guia | | |
| 3.6 | Tamanho **travado** depois de começar o guia | | |
| 3.7 | Avaliações: login, estrelas, comentário | | |
| 3.8 | Reviews premium bloqueadas sem compra | | |

---

## 4. Guia passo a passo (core)

| # | Item | OK | Notas |
|---|------|----|-------|
| 4.1 | Iniciar guia em receita free | | |
| 4.2 | Toque avança ponto; % sobe | | |
| 4.3 | Voltar 1 ponto | | |
| 4.4 | Carreira com repetição agrupada (×N) | | |
| 4.5 | Carreira uniforme = 1 toque | | |
| 4.6 | Troca de cor / anel mágico (se aplicável) | | |
| 4.7 | Notas (Enchimento, Acabamento) legíveis | | |
| 4.8 | Múltiplas peças: chips de peça | | |
| 4.9 | Reiniciar / desistir (modais) | | |
| 4.10 | Terminar → parabéns → salvar portfólio | | |
| 4.11 | Premium: guia **bloqueado** sem compra | | |
| 4.12 | Premium: guia **liberado** após compra/grant | | |

---

## 5. Progresso & portfólio

| # | Item | OK | Notas |
|---|------|----|-------|
| 5.1 | Projeto aparece em **Em andamento** ao sair no meio | | |
| 5.2 | Continuar retoma posição correta | | |
| 5.3 | Descartar remove da lista | | |
| 5.4 | **Meus**: contagem e medalhas | | |
| 5.5 | Receita finalizada aparece na coleção | | |
| 5.6 | Fechar app e reabrir: progresso **local** persiste (mesmo aparelho) | | |

---

## 6. i18n

| # | Item | OK | Notas |
|---|------|----|-------|
| 6.1 | App em **PT**: UI toda em português | | |
| 6.2 | App em **EN**: UI em inglês | | |
| 6.3 | Catálogo **casa** (`is_house_catalog`): conteúdo traduzido em EN | | |
| 6.4 | Guia em EN: abreviações **sc/inc** (não pb/aum) | | |
| 6.5 | Receita futura UGC (`is_house_catalog = false`): em EN **não** traduz overlay — fica no idioma da autora | | |

---

## 7. Premium / IAP (APK obrigatório)

| # | Item | OK | Notas |
|---|------|----|-------|
| 7.1 | Expo Go: compra mostra msg esperada (sem billing) | | |
| 7.2 | APK preview: produto Play encontrado | | |
| 7.3 | Compra sandbox conclui | | |
| 7.4 | Edge `verify-play-purchase` grava `purchases` | | |
| 7.5 | Guia desbloqueia sem reiniciar app | | |
| 7.6 | Aba Compras lista a receita | | |
| 7.7 | Admin grant **desligado** em build production | | |

---

## 8. Admin (só você)

| # | Item | OK | Notas |
|---|------|----|-------|
| 8.1 | Painel admin visível só para `is_admin` | | |
| 8.2 | Listar / editar receita | | |
| 8.3 | Import seed do JSON | | |
| 8.4 | Publicar / rascunho | | |

---

## 9. Regressão rápida (smoke)

Rodar em **5 min** antes de cada release:

1. Abrir app → home carrega  
2. Abrir cogumelo → guia → 5 toques → voltar  
3. Trocar idioma EN → título casa em inglês  
4. Logout → login  
5. (APK) compra ou grant premium → guia abre  

---

## Bugs encontrados

| ID | Tela | Passos | Esperado | Obtido | Severidade |
|----|------|--------|----------|--------|------------|
| | | | | | |

---

## Sign-off v1

- [ ] Todos os itens **críticos** (seções 4, 7.2–7.5, 6.3) OK no APK  
- [ ] Nenhum crash em 15 min de uso normal  
- [ ] Pronto para teste interno Play: _______________
