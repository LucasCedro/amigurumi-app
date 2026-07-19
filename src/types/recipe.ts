export type World = 'amigurumi' | 'trico';

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

export type Category =
  | 'bichos'
  | 'bonecas'
  | 'comidinhas'
  | 'florais'
  | 'chaveiros'
  | 'decoracao'
  | 'base';

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
  world: World;
  category: Category;
  tags: string[];
  difficulty: Difficulty;
  estimatedHours?: number;
  finalSizeCm?: number;
  isPremium: boolean;
  emoji?: string;
  /** chave da imagem de capa (ver recipe-images.ts) */
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
}
