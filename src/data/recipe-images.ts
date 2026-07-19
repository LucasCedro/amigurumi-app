/**
 * Mapa de imagens empacotadas. O `require` precisa ser estático no RN,
 * então referenciamos por chave. Quando migrarmos pra CDN/Supabase,
 * troca-se isto por URLs (expo-image cacheia offline).
 */
const IMAGES: Record<string, number> = {
  'ursinho/cover': require('@/assets/recipes/cover-ursinho.png'),
  'polvo/cover': require('@/assets/recipes/cover-polvo.png'),
  'morango/cover': require('@/assets/recipes/cover-morango.png'),
  'ovo/cover': require('@/assets/recipes/cover-ovo.png'),
};

export function recipeImage(key?: string): number | undefined {
  return key ? IMAGES[key] : undefined;
}
