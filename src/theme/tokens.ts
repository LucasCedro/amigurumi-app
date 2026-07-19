import { Platform, type ViewStyle } from 'react-native';

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const font = {
  hero: 30,
  title: 22,
  h2: 18,
  body: 15,
  small: 13,
  tiny: 11,
} as const;

export const semantic = {
  free: '#16A34A',
  premium: '#F2B705',
  premiumText: '#3A2A24',
  aum: '#16A34A',
  dim: '#DC2626',
} as const;

export function shadow(elevation = 3): ViewStyle {
  return Platform.select<ViewStyle>({
    android: { elevation },
    web: { boxShadow: `0px ${elevation}px ${elevation * 2}px rgba(58,42,36,0.12)` } as ViewStyle,
    default: {
      shadowColor: '#3A2A24',
      shadowOpacity: 0.12,
      shadowRadius: elevation * 2,
      shadowOffset: { width: 0, height: elevation },
    },
  })!;
}

export const DIFFICULTY_LABEL = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
} as const;

export const CATEGORY_LABEL = {
  bichos: 'Bichinhos',
  bonecas: 'Bonecas',
  comidinhas: 'Comidinhas',
  florais: 'Florais',
  chaveiros: 'Chaveiros',
  decoracao: 'Decoração',
  base: 'Bases',
} as const;
