import type { Recipe, World } from '@/types/recipe';
import raw from './recipes.json';

export const RECIPES = raw as Recipe[];

export function getRecipesByWorld(world: World): Recipe[] {
  return RECIPES.filter((r) => r.world === world);
}

export function getRecipe(id: string | undefined): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}
