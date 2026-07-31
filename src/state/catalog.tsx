import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { fetchPublishedRecipes, fetchRecipeById } from '@/api/recipes';
import { isSupabaseConfigured } from '@/lib/supabase';
import { normalizeRecipeId, resolveRecipe } from '@/engine/resolve-recipe';
import { useAppLocale } from '@/i18n/LocaleContext';
import { localizeRecipe } from '@/i18n/localize-recipe';
import type { Recipe } from '@/types/recipe';

interface CatalogContextValue {
  recipes: Recipe[];
  loading: boolean;
  configured: boolean;
  refresh: () => Promise<void>;
  getRecipeStub: (id: string | undefined) => Recipe | undefined;
  getRecipe: (id: string | undefined, sizeCm?: number) => Recipe | undefined;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

function findRecipe(recipes: Recipe[], id: string | undefined): Recipe | undefined {
  if (!id) return undefined;
  const norm = normalizeRecipeId(id);
  return recipes.find(
    (r) => r.id === id || r.id === norm || r.localSlug === id || r.localSlug === norm,
  );
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const { locale } = useAppLocale();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (!configured) {
        setRecipes([]);
        return;
      }
      const list = await fetchPublishedRecipes();
      setRecipes(list);
    } catch {
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getRecipeStub = useCallback(
    (id: string | undefined) => {
      const stub = findRecipe(recipes, id);
      return stub ? localizeRecipe(stub, locale) : undefined;
    },
    [recipes, locale],
  );

  const getRecipe = useCallback(
    (id: string | undefined, sizeCm?: number) => {
      const stub = findRecipe(recipes, id);
      if (!stub) return undefined;
      const resolved = stub.base ? resolveRecipe(stub, sizeCm ?? stub.base.defaultSizeCm) : stub;
      return localizeRecipe(resolved, locale);
    },
    [recipes, locale],
  );

  const localizedRecipes = useMemo(
    () => recipes.map((r) => localizeRecipe(r, locale)),
    [recipes, locale],
  );

  const value = useMemo(
    () => ({ recipes: localizedRecipes, loading, configured, refresh, getRecipeStub, getRecipe }),
    [localizedRecipes, loading, configured, refresh, getRecipeStub, getRecipe],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog precisa estar dentro de <CatalogProvider>');
  return ctx;
}

/** Carrega receita por UUID quando ainda não está no cache do catálogo. */
export async function fetchRecipeIntoCatalog(
  id: string,
  current: Recipe[],
): Promise<Recipe | undefined> {
  const hit = findRecipe(current, id);
  if (hit) return hit;
  return (await fetchRecipeById(id)) ?? undefined;
}
