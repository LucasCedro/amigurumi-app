/**
 * Gera o bloco seed UTF-8 limpo a partir de recipes.json + ursinho embutido.
 * Uso: node supabase/generate-seed.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_MANIFEST, BASE_SHARED } from "../scripts/bases-manifest.mjs";
import { materializeBase } from "../scripts/materialize-base.mjs";
import { SEED_OWNER_EMAIL } from "../scripts/seed-config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const recipes = JSON.parse(fs.readFileSync(path.join(root, "src/data/recipes.json"), "utf8"));

const bases = BASE_MANIFEST.map((b) =>
  materializeBase(
    b.base,
    {
      ...BASE_SHARED,
      id: b.id,
      title: b.title,
      cover: b.cover ?? `${b.id}/cover`,
      description: b.description,
      tags: b.tags,
      category: 'base',
      difficulty: 'iniciante',
      isPremium: false,
    },
    b.base.defaultSizeCm,
  ),
);

/** Ursinho premium (saiu do JSON local de propósito — só no banco). */
const ursinho = {
  id: "ursinho",
  title: "Ursinho Clássico",
  subtitle: "Bichinho · ~22 cm",
  category: "bichos",
  tags: ["urso", "presente", "clássico"],
  difficulty: "intermediario",
  yarnWeight: "medium",
  estimatedHours: 8,
  finalSizeCm: 22,
  isPremium: true,
  priceCents: 1990,
  playProductId: "receita_ursinho_classico",
  emoji: "🧸",
  cover: "ursinho/cover",
  author: { name: "Amiguide", credit: "Modelo clássico de ursinho sentado" },
  description:
    "O ursinho de sempre: cabeça, corpo, focinho, orelhas, braços e pernas. Projeto completo pra treinar montagem.",
  colors: [
    { id: "marrom", label: "Marrom", hex: "#8B5A2B" },
    { id: "creme", label: "Creme", hex: "#F0E3D0" },
  ],
  materials: [
    { type: "fio", label: "Amigurumi Círculo", color: "Marrom", amount: "1 novelo" },
    { type: "fio", label: "Amigurumi Círculo", color: "Creme", amount: "sobra" },
    { type: "agulha", label: "Agulha 2,5 mm" },
    { type: "olhos", label: "Olhos de segurança 9 mm", amount: "2" },
    { type: "enchimento", label: "Fibra siliconada" },
  ],
  notes: ["Trabalhe em espiral.", "Encha firme a cabeça antes de fechar."],
  pieces: [
    {
      id: "cabeca",
      name: "Cabeça",
      qty: 1,
      startColor: "marrom",
      rounds: [
        { kind: "stitches", label: "1", isMagicRing: true, groups: [{ pattern: [{ stitch: "pb", count: 6 }], times: 1 }], totalStitches: 6 },
        { kind: "stitches", label: "2", groups: [{ pattern: [{ stitch: "aum", count: 6 }], times: 1 }], totalStitches: 12 },
        { kind: "stitches", label: "3", groups: [{ pattern: [{ stitch: "pb", count: 1 }, { stitch: "aum", count: 1 }], times: 6 }], totalStitches: 18 },
        { kind: "stitches", label: "4", groups: [{ pattern: [{ stitch: "pb", count: 2 }, { stitch: "aum", count: 1 }], times: 6 }], totalStitches: 24 },
        { kind: "stitches", label: "5", groups: [{ pattern: [{ stitch: "pb", count: 3 }, { stitch: "aum", count: 1 }], times: 6 }], totalStitches: 30 },
        { kind: "stitches", label: "6", groups: [{ pattern: [{ stitch: "pb", count: 4 }, { stitch: "aum", count: 1 }], times: 6 }], totalStitches: 36 },
        { kind: "stitches", label: "7 a 12", repeatRows: 6, groups: [{ pattern: [{ stitch: "pb", count: 36 }], times: 1 }], totalStitches: 36 },
        { kind: "note", label: "Rosto", text: "Prenda os olhos entre as carreiras 8 e 9 e costure o focinho." },
        { kind: "stitches", label: "13", groups: [{ pattern: [{ stitch: "pb", count: 4 }, { stitch: "dim", count: 1 }], times: 6 }], totalStitches: 30 },
        { kind: "stitches", label: "14", groups: [{ pattern: [{ stitch: "pb", count: 3 }, { stitch: "dim", count: 1 }], times: 6 }], totalStitches: 24 },
        { kind: "note", label: "Enchimento", text: "Encha bem firme a cabeça." },
        { kind: "stitches", label: "15", groups: [{ pattern: [{ stitch: "pb", count: 2 }, { stitch: "dim", count: 1 }], times: 6 }], totalStitches: 18 },
        { kind: "stitches", label: "16", groups: [{ pattern: [{ stitch: "pb", count: 1 }, { stitch: "dim", count: 1 }], times: 6 }], totalStitches: 12 },
        { kind: "stitches", label: "17", groups: [{ pattern: [{ stitch: "dim", count: 6 }], times: 1 }], totalStitches: 6 },
        { kind: "note", label: "Acabamento", text: "Feche e reserve pra costurar no corpo." },
      ],
    },
    {
      id: "focinho",
      name: "Focinho",
      qty: 1,
      startColor: "creme",
      rounds: [
        { kind: "stitches", label: "1", isMagicRing: true, color: "creme", groups: [{ pattern: [{ stitch: "pb", count: 6 }], times: 1 }], totalStitches: 6 },
        { kind: "stitches", label: "2", groups: [{ pattern: [{ stitch: "aum", count: 6 }], times: 1 }], totalStitches: 12 },
        { kind: "stitches", label: "3", groups: [{ pattern: [{ stitch: "pb", count: 1 }, { stitch: "aum", count: 1 }], times: 6 }], totalStitches: 18 },
        { kind: "note", label: "Nariz", text: "Borde o nariz em marrom escuro e costure na cabeça." },
      ],
    },
    {
      id: "orelha",
      name: "Orelha",
      qty: 2,
      startColor: "marrom",
      note: "Faça 2.",
      rounds: [
        { kind: "stitches", label: "1", isMagicRing: true, groups: [{ pattern: [{ stitch: "pb", count: 6 }], times: 1 }], totalStitches: 6 },
        { kind: "stitches", label: "2", groups: [{ pattern: [{ stitch: "aum", count: 6 }], times: 1 }], totalStitches: 12 },
        { kind: "stitches", label: "3", groups: [{ pattern: [{ stitch: "pb", count: 12 }], times: 1 }], totalStitches: 12 },
        { kind: "note", label: "Montagem", text: "Não encha. Achate e costure no topo da cabeça." },
      ],
    },
    {
      id: "braco",
      name: "Braço",
      qty: 2,
      startColor: "marrom",
      note: "Faça 2.",
      rounds: [
        { kind: "stitches", label: "1", isMagicRing: true, groups: [{ pattern: [{ stitch: "pb", count: 6 }], times: 1 }], totalStitches: 6 },
        { kind: "stitches", label: "2", groups: [{ pattern: [{ stitch: "aum", count: 6 }], times: 1 }], totalStitches: 12 },
        { kind: "stitches", label: "3 a 4", repeatRows: 2, groups: [{ pattern: [{ stitch: "pb", count: 12 }], times: 1 }], totalStitches: 12 },
        { kind: "stitches", label: "5", groups: [{ pattern: [{ stitch: "pb", count: 2 }, { stitch: "dim", count: 1 }], times: 3 }], totalStitches: 9 },
        { kind: "stitches", label: "6 a 10", repeatRows: 5, groups: [{ pattern: [{ stitch: "pb", count: 9 }], times: 1 }], totalStitches: 9 },
        { kind: "note", label: "Montagem", text: "Encha levemente só a mão e costure na lateral do corpo." },
      ],
    },
    {
      id: "perna",
      name: "Perna",
      qty: 2,
      startColor: "marrom",
      note: "Faça 2.",
      rounds: [
        { kind: "stitches", label: "1", isMagicRing: true, groups: [{ pattern: [{ stitch: "pb", count: 6 }], times: 1 }], totalStitches: 6 },
        { kind: "stitches", label: "2", groups: [{ pattern: [{ stitch: "aum", count: 6 }], times: 1 }], totalStitches: 12 },
        { kind: "stitches", label: "3", groups: [{ pattern: [{ stitch: "pb", count: 1 }, { stitch: "aum", count: 1 }], times: 6 }], totalStitches: 18 },
        { kind: "stitches", label: "4 a 5", repeatRows: 2, groups: [{ pattern: [{ stitch: "pb", count: 18 }], times: 1 }], totalStitches: 18 },
        { kind: "stitches", label: "6", groups: [{ pattern: [{ stitch: "pb", count: 1 }, { stitch: "dim", count: 1 }], times: 6 }], totalStitches: 12 },
        { kind: "stitches", label: "7 a 11", repeatRows: 5, groups: [{ pattern: [{ stitch: "pb", count: 12 }], times: 1 }], totalStitches: 12 },
        { kind: "note", label: "Montagem", text: "Encha e costure na base do corpo." },
      ],
    },
    {
      id: "corpo",
      name: "Corpo",
      qty: 1,
      startColor: "marrom",
      rounds: [
        { kind: "stitches", label: "1", isMagicRing: true, groups: [{ pattern: [{ stitch: "pb", count: 6 }], times: 1 }], totalStitches: 6 },
        { kind: "stitches", label: "2", groups: [{ pattern: [{ stitch: "aum", count: 6 }], times: 1 }], totalStitches: 12 },
        { kind: "stitches", label: "3", groups: [{ pattern: [{ stitch: "pb", count: 1 }, { stitch: "aum", count: 1 }], times: 6 }], totalStitches: 18 },
        { kind: "stitches", label: "4", groups: [{ pattern: [{ stitch: "pb", count: 2 }, { stitch: "aum", count: 1 }], times: 6 }], totalStitches: 24 },
        { kind: "stitches", label: "5", groups: [{ pattern: [{ stitch: "pb", count: 3 }, { stitch: "aum", count: 1 }], times: 6 }], totalStitches: 30 },
        { kind: "stitches", label: "6 a 10", repeatRows: 5, groups: [{ pattern: [{ stitch: "pb", count: 30 }], times: 1 }], totalStitches: 30 },
        { kind: "stitches", label: "11", groups: [{ pattern: [{ stitch: "pb", count: 3 }, { stitch: "dim", count: 1 }], times: 6 }], totalStitches: 24 },
        { kind: "stitches", label: "12 a 13", repeatRows: 2, groups: [{ pattern: [{ stitch: "pb", count: 24 }], times: 1 }], totalStitches: 24 },
        { kind: "note", label: "Enchimento", text: "Encha o corpo firme." },
        { kind: "stitches", label: "14", groups: [{ pattern: [{ stitch: "pb", count: 2 }, { stitch: "dim", count: 1 }], times: 6 }], totalStitches: 18 },
        { kind: "stitches", label: "15", groups: [{ pattern: [{ stitch: "pb", count: 1 }, { stitch: "dim", count: 1 }], times: 6 }], totalStitches: 12 },
        { kind: "note", label: "Acabamento", text: "Feche parcialmente pra costurar a cabeça por cima." },
      ],
    },
  ],
  assembly: [
    { step: 1, text: "Prenda os olhos na cabeça entre as carreiras 8 e 9, com cerca de 7 pontos de distância." },
    { step: 2, text: "Costure o focinho no centro da cabeça e borde o nariz." },
    { step: 3, text: "Costure as duas orelhas no topo da cabeça." },
    { step: 4, text: "Costure a cabeça firmemente sobre o corpo." },
    { step: 5, text: "Costure os braços nas laterais, logo abaixo da cabeça." },
    { step: 6, text: "Costure as pernas na base do corpo pra ele sentar." },
  ],
};

function sqlStr(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function bodyJson(recipe) {
  const body = {
    localSlug: recipe.id,
    subtitle: recipe.subtitle,
    tags: recipe.tags,
    yarnWeight: recipe.yarnWeight,
    estimatedHours: recipe.estimatedHours,
    finalSizeCm: recipe.finalSizeCm,
    emoji: recipe.emoji,
    cover: recipe.cover,
    author: recipe.author,
    colors: recipe.colors,
    description: recipe.description,
    materials: recipe.materials,
    notes: recipe.notes,
    pieces: recipe.pieces,
    assembly: recipe.assembly,
    base: recipe.base,
  };
  return sqlStr(JSON.stringify(body));
}

function upsertBlock(recipe) {
  const price = recipe.priceCents ?? (recipe.isPremium ? 1990 : 0);
  const sku = recipe.playProductId ? sqlStr(recipe.playProductId) : "null";
  const tags = `array[${(recipe.tags || []).map((t) => sqlStr(t)).join(",")}]::text[]`;
  const body = bodyJson(recipe);
  const slug = sqlStr(recipe.id);
  const slugMatch = `coalesce(rb.body->>'localSlug', m.body->>'localSlug') = ${slug}`;
  return `
  -- ${recipe.id}
  if exists (
    select 1 from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where ${slugMatch}
  ) then
    update public.market_recipes set
      title = ${sqlStr(recipe.title)},
      subtitle = ${sqlStr(recipe.subtitle || "")},
      category = ${sqlStr(recipe.category)},
      difficulty = ${sqlStr(recipe.difficulty)},
      price_cents = ${price},
      play_product_id = ${sku},
      emoji = ${sqlStr(recipe.emoji || "")},
      tags = ${tags},
      description = ${sqlStr(recipe.description || "")},
      body = ${body}::jsonb,
      status = 'published',
      seller_id = seller,
      content_locale = 'pt',
      is_house_catalog = true,
      updated_at = now()
    where id = (
      select m.id from public.market_recipes m
      left join public.recipe_bodies rb on rb.recipe_id = m.id
      where ${slugMatch}
      order by m.created_at desc
      limit 1
    );
  else
    insert into public.market_recipes (
      seller_id, title, subtitle, category, difficulty, price_cents, currency,
      play_product_id, emoji, tags, description, body, status,
      content_locale, is_house_catalog
    ) values (
      seller,
      ${sqlStr(recipe.title)},
      ${sqlStr(recipe.subtitle || "")},
      ${sqlStr(recipe.category)},
      ${sqlStr(recipe.difficulty)},
      ${price},
      'BRL',
      ${sku},
      ${sqlStr(recipe.emoji || "")},
      ${tags},
      ${sqlStr(recipe.description || "")},
      ${body}::jsonb,
      'published',
      'pt',
      true
    );
  end if;
`;
}

const all = [...bases, ...recipes.filter((r) => !r.isPremium), ursinho];

const seed = `-- =============================================================================
-- B) SEED — formas + projetos grátis + ursinho premium
-- E-mail do admin: scripts/seed-config.mjs (SEED_OWNER_EMAIL)
-- =============================================================================
do $$
declare
  seller uuid;
begin
  select id into seller from auth.users where email = '${SEED_OWNER_EMAIL}' limit 1;
  if seller is null then
    raise exception 'Usuario nao encontrado — confira SEED_OWNER_EMAIL em scripts/seed-config.mjs';
  end if;

  insert into public.profiles (id, display_name, is_admin)
  values (seller, 'Amiguide', true)
  on conflict (id) do update set is_admin = true, display_name = excluded.display_name;

  -- receita legada "ovo" + duplicatas (slug pode estar só em recipe_bodies após o split)
  delete from public.purchases
  where recipe_id in (
    select m.id
    from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'ovo'
       or (
         m.title = 'Ovo'
         and coalesce(rb.body->>'localSlug', m.body->>'localSlug', '') <> 'base-ovo'
       )
       or m.id in (
         select id from (
           select m2.id,
                  row_number() over (order by m2.created_at desc) as rn
           from public.market_recipes m2
           left join public.recipe_bodies rb2 on rb2.recipe_id = m2.id
           where coalesce(rb2.body->>'localSlug', m2.body->>'localSlug') = 'base-ovo'
         ) d where d.rn > 1
       )
  );

  delete from public.market_recipes
  where id in (
    select m.id
    from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'ovo'
       or (
         m.title = 'Ovo'
         and coalesce(rb.body->>'localSlug', m.body->>'localSlug', '') <> 'base-ovo'
       )
       or m.id in (
         select id from (
           select m2.id,
                  row_number() over (order by m2.created_at desc) as rn
           from public.market_recipes m2
           left join public.recipe_bodies rb2 on rb2.recipe_id = m2.id
           where coalesce(rb2.body->>'localSlug', m2.body->>'localSlug') = 'base-ovo'
         ) d where d.rn > 1
       )
  );
${all.map(upsertBlock).join("\n")}
  raise notice 'Seed OK: formas + receitas gratis + ursinho premium';
end $$;
`;

const setupPath = path.join(__dirname, "SETUP.sql");
const setup = fs.readFileSync(setupPath, "utf8");
const cut = setup.indexOf("-- B) SEED");
if (cut < 0) throw new Error("marker B) SEED not found");
const schema = setup.slice(0, cut);
fs.writeFileSync(setupPath, schema + seed, "utf8");
fs.writeFileSync(path.join(__dirname, "seed_recipes.sql"), seed, "utf8");
console.log("OK wrote SETUP.sql + seed_recipes.sql, recipes:", all.map((r) => r.id).join(", "));
