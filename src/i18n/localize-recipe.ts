import type { AppLocale } from './index';
import {
  COLOR_LABEL_EN,
  MATERIAL_AMOUNT_EN,
  MATERIAL_COLOR_EN,
  MATERIAL_LABEL_EN,
  NOTE_LABEL_EN,
  PHRASE_EN,
  PIECE_NAME_EN,
  RECIPE_OVERLAY_EN,
} from './recipe-content-en';
import type { Material, Piece, Recipe, Round } from '@/types/recipe';

function recipeKey(recipe: Recipe): string {
  return recipe.localSlug ?? recipe.id;
}

export function translatePhrase(text: string, locale: AppLocale): string {
  if (locale === 'pt' || !text) return text;
  if (PHRASE_EN[text]) return PHRASE_EN[text];
  return text
    .replace(/\bpbx\b/gi, 'sl st')
    .replace(/\bpb\b/gi, 'sc')
    .replace(/\baum\b/gi, 'inc')
    .replace(/\bdim\b/gi, 'dec')
    .replace(/\bpa\b/gi, 'dc')
    .replace(/\bmpa\b/gi, 'hdc')
    .replace(/\bcorr\b/gi, 'ch')
    .replace(/\banel mágico\b/gi, 'magic ring')
    .replace(/\bcarreira\b/gi, 'round')
    .replace(/\bcarreiras\b/gi, 'rounds')
    .replace(/\bponto\b/gi, 'stitch')
    .replace(/\bpontos\b/gi, 'stitches');
}

export function translateNoteLabel(label: string | undefined, locale: AppLocale): string | undefined {
  if (!label || locale === 'pt') return label;
  return NOTE_LABEL_EN[label] ?? label;
}

function translateSubtitle(subtitle: string | undefined, locale: AppLocale): string | undefined {
  if (!subtitle || locale === 'pt') return subtitle;
  return subtitle
    .replace(/^Comidinha\b/, 'Food')
    .replace(/^Bichinho\b/, 'Animal')
    .replace(/^Chaveiro\b/, 'Keychain')
    .replace(/^Forma\b/, 'Shape');
}

function localizeRound(round: Round, locale: AppLocale): Round {
  if (locale === 'pt' || round.kind !== 'note') return round;
  return {
    ...round,
    label: translateNoteLabel(round.label, locale),
    text: translatePhrase(round.text, locale),
  };
}

function localizePiece(piece: Piece, locale: AppLocale): Piece {
  if (locale === 'pt') return piece;
  return {
    ...piece,
    name: PIECE_NAME_EN[piece.name] ?? piece.name,
    note: piece.note ? translatePhrase(piece.note, locale) : piece.note,
    rounds: piece.rounds.map((r) => localizeRound(r, locale)),
  };
}

export function localizeRecipe(recipe: Recipe, locale: AppLocale): Recipe {
  if (locale === 'pt') return recipe;
  // UGC / receitas de terceiros: exibir no idioma em que foram cadastradas.
  if (!recipe.isHouseCatalog) return recipe;

  const key = recipeKey(recipe);
  const overlay = RECIPE_OVERLAY_EN[key];

  return {
    ...recipe,
    title: overlay?.title ?? recipe.title,
    subtitle: translateSubtitle(overlay?.subtitle ?? recipe.subtitle, locale),
    description: overlay?.description ?? (recipe.description ? translatePhrase(recipe.description, locale) : recipe.description),
    notes: overlay?.notes ?? recipe.notes?.map((n) => translatePhrase(n, locale)),
    colors: recipe.colors?.map((c) => ({
      ...c,
      label: COLOR_LABEL_EN[c.label] ?? c.label,
    })),
    materials: recipe.materials.map((m) => localizeMaterial(m, locale)),
    pieces: recipe.pieces.map((p) => localizePiece(p, locale)),
    assembly: recipe.assembly?.map((a) => ({
      ...a,
      text: translatePhrase(a.text, locale),
    })),
    author: recipe.author
      ? {
          ...recipe.author,
          credit: recipe.author.credit
            ? translatePhrase(recipe.author.credit, locale)
            : recipe.author.credit,
        }
      : recipe.author,
  };
}

function localizeMaterial(m: Material, locale: AppLocale): Material {
  if (locale === 'pt') return m;
  return {
    ...m,
    label: MATERIAL_LABEL_EN[m.label] ?? m.label,
    color: m.color ? (MATERIAL_COLOR_EN[m.color] ?? COLOR_LABEL_EN[m.color] ?? m.color) : m.color,
    amount: m.amount ? (MATERIAL_AMOUNT_EN[m.amount] ?? m.amount) : m.amount,
  };
}
