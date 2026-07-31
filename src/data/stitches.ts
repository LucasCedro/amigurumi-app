import type { AppLocale } from '@/i18n';
import i18n from '@/i18n';
import type { StitchType } from '@/types/recipe';

export interface StitchInfo {
  abbr: string;
  label: string;
  instruction: string;
  produces: number;
  consumes: number;
  color: string;
}

const STITCH_META: Record<StitchType, Pick<StitchInfo, 'produces' | 'consumes' | 'color'>> = {
  mr: { produces: 0, consumes: 0, color: '#E8734A' },
  pb: { produces: 1, consumes: 1, color: '#64748B' },
  aum: { produces: 2, consumes: 1, color: '#16A34A' },
  dim: { produces: 1, consumes: 2, color: '#DC2626' },
  pa: { produces: 1, consumes: 1, color: '#0EA5E9' },
  mpa: { produces: 1, consumes: 1, color: '#0EA5E9' },
  pbx: { produces: 1, consumes: 1, color: '#7C3AED' },
  corr: { produces: 1, consumes: 0, color: '#EAB308' },
  blo: { produces: 1, consumes: 1, color: '#0891B2' },
  flo: { produces: 1, consumes: 1, color: '#0891B2' },
};

export function getStitch(stitch: StitchType, locale: AppLocale): StitchInfo {
  const meta = STITCH_META[stitch];
  return {
    ...meta,
    abbr: i18n.t(`stitch.${stitch}.abbr`, { lng: locale }),
    label: i18n.t(`stitch.${stitch}.label`, { lng: locale }),
    instruction: i18n.t(`stitch.${stitch}.instruction`, { lng: locale }),
  };
}

export function getStitchHint(stitch: StitchType, locale: AppLocale): string | undefined {
  const key = `stitch.hint.${stitch}`;
  const val = i18n.t(key, { lng: locale, defaultValue: '' });
  return val || undefined;
}

export function magicRingPatternText(patternBody: string, locale: AppLocale): string {
  return i18n.t('stitch.magicRingWith', { lng: locale, pattern: patternBody });
}
