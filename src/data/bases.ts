import type { Recipe } from '@/types/recipe';

const SHARED = {
  category: 'base' as const,
  tags: ['base', 'forma', 'modular'],
  difficulty: 'iniciante' as const,
  yarnWeight: 'fine' as const,
  estimatedHours: 1,
  isPremium: false,
  priceCents: 0,
  author: { name: 'Amiguide', credit: 'Forma geométrica paramétrica' },
  colors: [{ id: 'neutro', label: 'À escolha', hex: '#E8E0D5' }],
  materials: [
    { type: 'fio' as const, label: 'Fio de algodão nº 4', color: 'À escolha', amount: 'sobra' },
    { type: 'agulha' as const, label: 'Agulha de crochê 2,5 mm' },
    { type: 'enchimento' as const, label: 'Fibra siliconada' },
    { type: 'extra' as const, label: 'Marcador de ponto' },
  ],
  notes: [
    'Trabalhe em espiral contínua, sem fechar a carreira.',
    'Use marcador no 1º ponto de cada volta.',
    'Combine várias formas para montar personagens e objetos.',
  ],
  pieces: [],
};

const SIZES = [5, 7, 10, 12, 15];

/**
 * Templates usados só pelo seed (`generate-seed.mjs`).
 * O app em produção lê tudo do Supabase.
 */
export const BASE_TEMPLATES: Recipe[] = [
  {
    id: 'base-disco',
    title: 'Disco',
    cover: 'base-disco/cover',
    description: 'Base plana circular. Tampa, orelha, fundo de vaso.',
    base: { shape: 'disc', sizesCm: SIZES, defaultSizeCm: 7 },
    ...SHARED,
    tags: [...SHARED.tags, 'disco', 'plano'],
  },
  {
    id: 'base-esfera',
    title: 'Esfera',
    cover: 'base-esfera/cover',
    description: 'Bola sólida. Cabeças, frutas, bolas decorativas.',
    base: { shape: 'sphere', sizesCm: SIZES, defaultSizeCm: 7, bodyRoundsRatio: 1 },
    ...SHARED,
    tags: [...SHARED.tags, 'esfera', 'bola'],
  },
  {
    id: 'base-hemisferio',
    title: 'Hemisfério',
    cover: 'base-hemisferio/cover',
    description: 'Meia esfera com base aberta. Capuz, casco, cúpula.',
    base: { shape: 'hemisphere', sizesCm: SIZES, defaultSizeCm: 7 },
    ...SHARED,
    tags: [...SHARED.tags, 'hemisferio', 'domo'],
  },
  {
    id: 'base-ovo',
    title: 'Ovo',
    cover: 'base-ovo/cover',
    description: 'Forma oval assimétrica. Corpos orgânicos e ovos decorativos.',
    base: { shape: 'egg', sizesCm: SIZES, defaultSizeCm: 7 },
    ...SHARED,
    tags: [...SHARED.tags, 'ovo', 'organico'],
  },
  {
    id: 'base-cilindro',
    title: 'Cilindro',
    cover: 'base-cilindro/cover',
    description: 'Pilar fechado nas duas pontas. Corpo, braços, pernas.',
    base: { shape: 'cylinder', sizesCm: SIZES, defaultSizeCm: 7, heightRoundsAtDefault: 8 },
    ...SHARED,
    tags: [...SHARED.tags, 'cilindro', 'corpo'],
  },
  {
    id: 'base-vaso',
    title: 'Vaso',
    cover: 'base-vaso/cover',
    description: 'Cachepô de planta: base circular estreita, lados que alargam na borda aberta.',
    base: { shape: 'vase', sizesCm: SIZES, defaultSizeCm: 7, heightRoundsAtDefault: 10 },
    ...SHARED,
    tags: [...SHARED.tags, 'vaso', 'cachepo'],
  },
  {
    id: 'base-cone',
    title: 'Cone',
    cover: 'base-cone/cover',
    description: 'Ponta estreita e base larga. Chapéu, sorvete, árvore.',
    base: { shape: 'cone', sizesCm: SIZES, defaultSizeCm: 7 },
    ...SHARED,
    tags: [...SHARED.tags, 'cone', 'chapeu'],
  },
  {
    id: 'base-bastao',
    title: 'Bastão',
    cover: 'base-bastao/cover',
    description: 'Cilindro fino e longo. Caule, varinha, chaveiro.',
    base: {
      shape: 'rod',
      sizesCm: SIZES,
      defaultSizeCm: 7,
      heightRoundsAtDefault: 10,
      rodStitchCount: 12,
    },
    ...SHARED,
    tags: [...SHARED.tags, 'bastao', 'fino'],
  },
];
