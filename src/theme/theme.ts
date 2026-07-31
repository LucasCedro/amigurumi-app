/**
 * Temas claro e escuro do app.
 */
export interface AppTheme {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;
  border: string;
  gradient: [string, string];
  isDark: boolean;
}

export const lightTheme: AppTheme = {
  bg: '#FDF5F0',
  surface: '#FFFFFF',
  surfaceAlt: '#FBE6E1',
  text: '#3A2230',
  textMuted: '#7A4E68',
  primary: '#C0407E',
  primaryText: '#FFFFFF',
  accent: '#E87A3E',
  border: '#F0D3CD',
  gradient: ['#FBE0DA', '#FDF5F0'],
  isDark: false,
};

export const darkTheme: AppTheme = {
  bg: '#1A1218',
  surface: '#2A1F28',
  surfaceAlt: '#352830',
  text: '#FBF3F7',
  textMuted: '#C9A8B8',
  primary: '#F06AA6',
  primaryText: '#2A1622',
  accent: '#E87A3E',
  border: '#4A3545',
  gradient: ['#2A1F28', '#1A1218'],
  isDark: true,
};

/** @deprecated use useTheme() */
export const theme = lightTheme;
