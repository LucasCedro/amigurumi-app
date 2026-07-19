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
    tagline: 'Crochê em espiral, bichinhos 3D',
    emoji: '🧶',
    bg: '#FFF7F2',
    surface: '#FFFFFF',
    surfaceAlt: '#FCEADF',
    text: '#3A2A24',
    textMuted: '#977c70',
    primary: '#E8734A',
    primaryText: '#FFFFFF',
    accent: '#F2B705',
    border: '#F0DAD0',
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
