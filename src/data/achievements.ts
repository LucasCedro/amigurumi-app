import { getRecipe } from '@/data/recipes';
import type { FinishedProject } from '@/state/collection';

export interface AchievementCtx {
  /** total de amigurumis finalizados */
  count: number;
  /** modelos diferentes finalizados */
  distinct: number;
  /** categorias já finalizadas */
  categories: Set<string>;
  /** dificuldades já finalizadas */
  difficulties: Set<string>;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  /** meta usada pra barra de progresso (quando faz sentido) */
  goal?: (ctx: AchievementCtx) => { current: number; target: number };
  check: (ctx: AchievementCtx) => boolean;
}

export interface AchievementResult extends AchievementDef {
  unlocked: boolean;
  progress?: { current: number; target: number };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'primeiro',
    title: 'Primeiro passo',
    description: 'Finalize seu 1º amigurumi',
    emoji: '🥇',
    goal: (c) => ({ current: Math.min(c.count, 1), target: 1 }),
    check: (c) => c.count >= 1,
  },
  {
    id: 'trio',
    title: 'Pegando o jeito',
    description: 'Finalize 3 amigurumis',
    emoji: '✨',
    goal: (c) => ({ current: Math.min(c.count, 3), target: 3 }),
    check: (c) => c.count >= 3,
  },
  {
    id: 'dedicada',
    title: 'Mãos de fada',
    description: 'Finalize 5 amigurumis',
    emoji: '💪',
    goal: (c) => ({ current: Math.min(c.count, 5), target: 5 }),
    check: (c) => c.count >= 5,
  },
  {
    id: 'mestre',
    title: 'Mestre do crochê',
    description: 'Finalize 10 amigurumis',
    emoji: '👑',
    goal: (c) => ({ current: Math.min(c.count, 10), target: 10 }),
    check: (c) => c.count >= 10,
  },
  {
    id: 'variedade',
    title: 'Sem monotonia',
    description: 'Finalize 3 modelos diferentes',
    emoji: '🌈',
    goal: (c) => ({ current: Math.min(c.distinct, 3), target: 3 }),
    check: (c) => c.distinct >= 3,
  },
  {
    id: 'comidinha',
    title: 'Chef de crochê',
    description: 'Finalize uma comidinha',
    emoji: '🍓',
    check: (c) => c.categories.has('comidinhas'),
  },
  {
    id: 'bichinho',
    title: 'Fazendinha fofa',
    description: 'Finalize um bichinho',
    emoji: '🐻',
    check: (c) => c.categories.has('bichos'),
  },
  {
    id: 'corajosa',
    title: 'Sem medo',
    description: 'Finalize um projeto avançado',
    emoji: '🔥',
    check: (c) => c.difficulties.has('avancado'),
  },
];

export function evaluateAchievements(finished: FinishedProject[]): AchievementResult[] {
  const categories = new Set<string>();
  const difficulties = new Set<string>();
  for (const f of finished) {
    const r = getRecipe(f.recipeId);
    if (r) {
      categories.add(r.category);
      difficulties.add(r.difficulty);
    }
  }
  const ctx: AchievementCtx = {
    count: finished.length,
    distinct: new Set(finished.map((f) => f.recipeId)).size,
    categories,
    difficulties,
  };

  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: a.check(ctx),
    progress: a.goal ? a.goal(ctx) : undefined,
  }));
}

export function countUnlocked(results: AchievementResult[]): number {
  return results.filter((r) => r.unlocked).length;
}
