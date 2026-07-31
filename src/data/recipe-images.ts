/**
 * Mapa de imagens empacotadas. O `require` precisa ser estático no RN,
 * então referenciamos por chave. URLs http(s) passam direto pro expo-image.
 */
const IMAGES: Record<string, number> = {
  'ursinho/cover': require('@/assets/recipes/cover-ursinho.png'),
  'polvo/cover': require('@/assets/recipes/cover-polvo.png'),
  'morango/cover': require('@/assets/recipes/cover-morango.png'),
  'cogumelo-chaveiro/cover': require('@/assets/recipes/cover-cogumelo.png'),
  'dinossauro-braquiossauro/cover': require('@/assets/recipes/cover-braquiossauro.png'),
  'base-disco/cover': require('@/assets/recipes/cover-base-disco.png'),
  'base-esfera/cover': require('@/assets/recipes/cover-base-esfera.png'),
  'base-hemisferio/cover': require('@/assets/recipes/cover-base-hemisferio.png'),
  'base-ovo/cover': require('@/assets/recipes/cover-base-ovo.png'),
  'base-cilindro/cover': require('@/assets/recipes/cover-base-cilindro.png'),
  'base-vaso/cover': require('@/assets/recipes/cover-base-vaso.png'),
  'base-cone/cover': require('@/assets/recipes/cover-base-cone.png'),
  'base-bastao/cover': require('@/assets/recipes/cover-base-bastao.png'),
};

export type RecipeImageSource = number | { uri: string };

export function recipeImage(key?: string): RecipeImageSource | undefined {
  if (!key) return undefined;
  if (key.startsWith('http://') || key.startsWith('https://')) return { uri: key };
  return IMAGES[key];
}
