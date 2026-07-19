import type { StitchType } from '@/types/recipe';

export interface StitchInfo {
  abbr: string;
  label: string;
  /** texto grande exibido no guia */
  instruction: string;
  /** pontos gerados na volta nova */
  produces: number;
  /** buracos gastos na base */
  consumes: number;
  color: string;
}

export const STITCHES: Record<StitchType, StitchInfo> = {
  mr: {
    abbr: 'AM',
    label: 'Anel mágico',
    instruction: 'ANEL MÁGICO',
    produces: 0,
    consumes: 0,
    color: '#E8734A',
  },
  pb: {
    abbr: 'pb',
    label: 'Ponto baixo',
    instruction: 'PONTO BAIXO',
    produces: 1,
    consumes: 1,
    color: '#64748B',
  },
  aum: {
    abbr: 'aum',
    label: 'Aumento',
    instruction: 'AUMENTO',
    produces: 2,
    consumes: 1,
    color: '#16A34A',
  },
  dim: {
    abbr: 'dim',
    label: 'Diminuição',
    instruction: 'DIMINUIÇÃO',
    produces: 1,
    consumes: 2,
    color: '#DC2626',
  },
  pa: {
    abbr: 'pa',
    label: 'Ponto alto',
    instruction: 'PONTO ALTO',
    produces: 1,
    consumes: 1,
    color: '#0EA5E9',
  },
  mpa: {
    abbr: 'mpa',
    label: 'Meio ponto alto',
    instruction: 'MEIO PONTO ALTO',
    produces: 1,
    consumes: 1,
    color: '#0EA5E9',
  },
  pbx: {
    abbr: 'pbx',
    label: 'Ponto baixíssimo',
    instruction: 'PONTO BAIXÍSSIMO',
    produces: 1,
    consumes: 1,
    color: '#7C3AED',
  },
  corr: {
    abbr: 'corr',
    label: 'Correntinha',
    instruction: 'CORRENTINHA',
    produces: 1,
    consumes: 0,
    color: '#EAB308',
  },
  blo: {
    abbr: 'blo',
    label: 'PB alça de trás',
    instruction: 'PB · só alça de trás',
    produces: 1,
    consumes: 1,
    color: '#0891B2',
  },
  flo: {
    abbr: 'flo',
    label: 'PB alça da frente',
    instruction: 'PB · só alça da frente',
    produces: 1,
    consumes: 1,
    color: '#0891B2',
  },
};

/** dica que aparece embaixo do ponto no guia */
export const STITCH_HINT: Partial<Record<StitchType, string>> = {
  aum: '2 pontos no mesmo lugar',
  dim: '2 pontos juntos em 1',
  blo: 'pegue só a alça de trás',
  flo: 'pegue só a alça da frente',
};
