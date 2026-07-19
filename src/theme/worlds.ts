import type { World } from '@/types/recipe';

export interface WorldTheme {
  id: World;
  label: string;
  tagline: string;
  emoji: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;
  border: string;
}

export const WORLDS: Record<World, WorldTheme> = {
  amigurumi: {
    id: 'amigurumi',
    label: 'Amigurumi',
    tagline: 'Crochê em espiral, bichinhos fofos',
    emoji: '🧶',
    bg: '#FBF6F2',
    surface: '#FFFFFF',
    surfaceAlt: '#F1E7DF',
    text: '#463B39',
    textMuted: '#9C8B84',
    primary: '#A65A86',
    primaryText: '#FFFFFF',
    accent: '#7FA88B',
    border: '#EDE1D9',
  },
  trico: {
    id: 'trico',
    label: 'Tricô',
    tagline: 'Duas agulhas, carreiras planas',
    emoji: '🧷',
    bg: '#EEF2F7',
    surface: '#FFFFFF',
    surfaceAlt: '#E1E8F0',
    text: '#1E293B',
    textMuted: '#64748B',
    primary: '#4F6D8C',
    primaryText: '#FFFFFF',
    accent: '#7C9CBF',
    border: '#D5DEE9',
  },
};

export const WORLD_ORDER: World[] = ['amigurumi', 'trico'];
