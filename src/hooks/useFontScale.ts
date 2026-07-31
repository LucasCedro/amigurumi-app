import { PixelRatio } from 'react-native';

/** Respeita o tamanho de fonte do sistema (acessibilidade), com teto em 1.35× */
export function useFontScale() {
  const raw = PixelRatio.getFontScale();
  const scale = Math.min(Math.max(raw, 1), 1.35);
  const s = (size: number) => Math.round(size * scale);
  return { scale, s };
}
