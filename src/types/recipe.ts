export type StitchType =
  | 'mr' // anel mágico
  | 'pb' // ponto baixo
  | 'aum' // aumento
  | 'dim' // diminuição
  | 'pa' // ponto alto
  | 'mpa' // meio ponto alto
  | 'pbx' // ponto baixíssimo
  | 'corr' // correntinha
  | 'blo' // pb pegando só a alça de trás
  | 'flo'; // pb pegando só a alça da frente

export interface Segment {
  stitch: StitchType;
  count: number;
}

/**
 * Bloco de repetição dentro de uma carreira.
 * Carreiras com deslocamento usam vários grupos.
 */
export interface Group {
  pattern: Segment[];
  times: number;
  note?: string;
}

export interface StitchRound {
  kind: 'stitches';
  label: string;
  /** nº de carreiras idênticas (ex.: "9 a 20" => 12) */
  repeatRows?: number;
  isMagicRing?: boolean;
  groups: Group[];
  /** total de pontos ao fim da carreira (o nº entre parênteses) */
  totalStitches: number;
  /** id da cor ativa a partir desta carreira (dispara aviso de troca) */
  color?: string;
  note?: string;
}

/** Passo só de texto (montagem, enchimento, arremate) */
export interface NoteRound {
  kind: 'note';
  label?: string;
  text: string;
}

export type Round = StitchRound | NoteRound;

export type Difficulty = 'iniciante' | 'intermediario' | 'avancado';

/** espessura da linha — muda o tamanho final e a agulha, não a técnica */
export type YarnWeight = 'lace' | 'fine' | 'medium' | 'bulky';

/** Formas geométricas paramétricas (geradas pela engine em runtime). */
export type BaseShape =
  | 'disc'
  | 'sphere'
  | 'hemisphere'
  | 'egg'
  | 'cylinder'
  | 'vase'
  | 'cone'
  | 'rod';

export interface BaseConfig {
  shape: BaseShape;
  sizesCm: number[];
  defaultSizeCm: number;
  /** carreiras de altura no tamanho padrão (cilindro, vaso, bastão) */
  heightRoundsAtDefault?: number;
  /** multiplicador das carreiras retas da esfera (padrão 1) */
  bodyRoundsRatio?: number;
  /** pontos fixos do bastão (padrão 12) */
  rodStitchCount?: number;
}

export type Category =
  | 'bichos'
  | 'bonecas'
  | 'comidinhas'
  | 'florais'
  | 'chaveiros'
  | 'decoracao'
  | 'base'
  | 'tapetes'
  | 'roupas'
  | 'casa'
  | 'bolsas'
  | 'acessorios';

export interface RecipeColor {
  id: string;
  label: string;
  hex: string;
}

export type MaterialType = 'fio' | 'agulha' | 'olhos' | 'enchimento' | 'extra';

export interface Material {
  type: MaterialType;
  label: string;
  color?: string;
  amount?: string;
}

/** Uma peça do amigurumi (cabeça, braço, etc.). `qty` = quantas fazer. */
export interface Piece {
  id: string;
  name: string;
  qty: number;
  startColor?: string;
  note?: string;
  rounds: Round[];
}

export interface AssemblyStep {
  step: number;
  text: string;
  image?: string;
}

export interface RecipeAuthor {
  name: string;
  credit?: string;
  url?: string;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle?: string;
  category: Category;
  tags: string[];
  difficulty: Difficulty;
  yarnWeight?: YarnWeight;
  estimatedHours?: number;
  finalSizeCm?: number;
  /** true se priceCents > 0 */
  isPremium: boolean;
  /** preço em centavos (0 = grátis). Fonte da verdade do premium. */
  priceCents?: number;
  currency?: string;
  /** SKU do Google Play Billing (ex: receita_ursinho_premium) */
  playProductId?: string;
  emoji?: string;
  /** chave local (recipe-images) OU url http */
  cover?: string;
  gallery?: string[];
  author?: RecipeAuthor;
  colors?: RecipeColor[];
  description?: string;
  materials: Material[];
  notes?: string[];
  pieces: Piece[];
  assembly?: AssemblyStep[];
  video?: string;
  /** slug estável (ex: base-esfera) — UUID no Supabase, id local no bundle */
  localSlug?: string;
  /** Se presente, `pieces` é gerado pela engine conforme o tamanho escolhido. */
  base?: BaseConfig;
  /** origem: seed local ou supabase */
  source?: 'local' | 'remote';
  /** Idioma em que o conteúdo foi escrito (metadado). */
  contentLocale?: 'pt' | 'en';
  /** Catálogo oficial Amiguide — app pode aplicar overlay EN no cliente. */
  isHouseCatalog?: boolean;
}
