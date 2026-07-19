# Amiguide 🧶

App de crochê/amigurumi (e futuramente tricô) que é mais que um contador de pontos: um **guia inteligente** que lê a receita e conduz ponto a ponto, com contador dinâmico, dois mundos (Amigurumi / Tricô), tela sempre acesa e progresso salvo.

## Stack

- React Native + Expo (SDK 57) + Expo Router (TypeScript)
- Offline-first: receitas em `src/data/recipes.json`
- Foco em Android (publicação via EAS Build)

## Rodar

```bash
npx expo start        # abre o Metro; leia o QR no app Expo Go (Android)
npx expo start --android
```

> Não use `npm start`.

## Estrutura

```
src/
  app/                  # rotas (Expo Router)
    index.tsx           # Home: toggle de mundo + lista de receitas
    recipe/[id].tsx     # Detalhe da receita (materiais, dicas, carreiras)
    guide/[id].tsx      # Guia dinâmico (contador inteligente)
  data/
    recipes.json        # "banco" inicial de receitas
    recipes.ts          # loader/queries
    stitches.ts         # dicionário de pontos (produz/gasta, cores)
  engine/guide.ts       # achata carreiras em passos + progresso + validação
  theme/                # dois mundos (cores) + contexto persistido
  types/recipe.ts       # modelo de dados
```

## Modelo de dados (resumo)

Cada carreira (`round`) de pontos tem `groups[]`; cada grupo é um `pattern` (segmentos `{stitch, count}`) repetido `times` vezes. `totalStitches` é o número entre parênteses (checksum). Suporta:

- **Carreiras repetidas** (`repeatRows`, ex.: "9 a 20" = 12 carreiras iguais)
- **Deslocamento** (vários grupos numa carreira, ex.: `2pb, 1aum, [4pb,1aum]x5, 2pb`)
- **Passos informativos** (`kind: "note"`: enchimento, montagem, arremate)

## Roadmap

- [ ] Botões de volume pra avançar/voltar ponto (dev build + `react-native-volume-manager`)
- [ ] Mundo Tricô funcional
- [ ] Upload de receitas pelo usuário
- [ ] Compras no app (receitas premium)
