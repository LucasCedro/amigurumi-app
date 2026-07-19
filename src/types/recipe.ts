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
 * Um bloco de repetição dentro de uma carreira.
 * Ex.: pattern [2pb, 1aum] com times 6 => "2 pb, 1 aum (24)".
 * Carreiras com deslocamento usam vários grupos, ex.:
 * [{2pb},{1aum},times1] + [{4pb,1aum} times5] + [{2pb} times1].
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
  /** checksum: total de pontos ao fim da carreira (o nº entre parênteses) */
  totalStitches: number;
  note?: string;
}

/** Passo informativo, só texto + botão "Próximo" (montagem, enchimento, etc.) */
export interface NoteRound {
  kind: 'note';
  label?: string;
  text: string;
}

export type Round = StitchRound | NoteRound;

export type Difficulty = 'iniciante' | 'intermediario' | 'avancado';

export interface Recipe {
  id: string;
  title: string;
  world: World;
  difficulty: Difficulty;
  isPremium: boolean;
  emoji?: string;
  description?: string;
  materials: string[];
  notes?: string[];
  rounds: Round[];
}
