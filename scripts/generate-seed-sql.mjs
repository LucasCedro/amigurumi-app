import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { SEED_OWNER_EMAIL } from './seed-config.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const recipes = JSON.parse(readFileSync(join(root, 'src/data/recipes.json'), 'utf8'));

function esc(s) {
  return String(s).replace(/'/g, "''");
}

function bodyOf(r) {
  return {
    localSlug: r.id,
    subtitle: r.subtitle,
    tags: r.tags,
    yarnWeight: r.yarnWeight,
    estimatedHours: r.estimatedHours,
    finalSizeCm: r.finalSizeCm,
    emoji: r.emoji,
    cover: r.cover,
    gallery: r.gallery,
    author: r.author,
    colors: r.colors,
    description: r.description,
    materials: r.materials,
    notes: r.notes,
    pieces: r.pieces,
    assembly: r.assembly,
    video: r.video,
  };
}

const lines = [];
lines.push('-- Seed das 4 receitas (3 grátis + Ursinho premium R$19,90)');
lines.push('-- SQL Editor → cole tudo → Run');
lines.push(`-- E-mail do admin: scripts/seed-config.mjs (${SEED_OWNER_EMAIL})`);
lines.push('');
lines.push('do $$');
lines.push('declare');
lines.push('  seller uuid;');
lines.push('begin');
lines.push(`  select id into seller from auth.users where email = '${SEED_OWNER_EMAIL}' limit 1;`);
lines.push('  if seller is null then');
lines.push("    raise exception 'Usuário não encontrado — troque o e-mail no seed';");
lines.push('  end if;');
lines.push('');
lines.push('  insert into public.profiles (id, display_name, is_admin)');
lines.push("  values (seller, 'Amiguide', true)");
lines.push('  on conflict (id) do update set is_admin = true;');
lines.push('');

for (const r of recipes) {
  const price = r.priceCents ?? (r.isPremium ? 1990 : 0);
  const play = r.playProductId ? `'${esc(r.playProductId)}'` : 'null';
  const body = JSON.stringify(bodyOf(r)).replace(/'/g, "''");
  const tags = (r.tags || []).map((t) => `'${esc(t)}'`).join(',');
  const subtitle = r.subtitle ? `'${esc(r.subtitle)}'` : 'null';
  const emoji = r.emoji ? `'${esc(r.emoji)}'` : 'null';
  const description = r.description ? `'${esc(r.description)}'` : 'null';

  lines.push(`  -- ${r.id}${price > 0 ? ' (PREMIUM)' : ' (grátis)'}`);
  lines.push(`  if exists (select 1 from public.market_recipes where body->>'localSlug' = '${esc(r.id)}') then`);
  lines.push('    update public.market_recipes set');
  lines.push(`      title = '${esc(r.title)}',`);
  lines.push(`      subtitle = ${subtitle},`);
  lines.push(`      category = '${esc(r.category)}',`);
  lines.push(`      difficulty = '${esc(r.difficulty)}',`);
  lines.push(`      price_cents = ${price},`);
  lines.push(`      play_product_id = ${play},`);
  lines.push(`      emoji = ${emoji},`);
  lines.push(`      tags = array[${tags}]::text[],`);
  lines.push(`      description = ${description},`);
  lines.push(`      body = '${body}'::jsonb,`);
  lines.push(`      status = 'published',`);
  lines.push('      seller_id = seller,');
  lines.push('      updated_at = now()');
  lines.push(`    where body->>'localSlug' = '${esc(r.id)}';`);
  lines.push('  else');
  lines.push('    insert into public.market_recipes (');
  lines.push('      seller_id, title, subtitle, category, difficulty, price_cents, currency,');
  lines.push('      play_product_id, emoji, tags, description, body, status');
  lines.push('    ) values (');
  lines.push('      seller,');
  lines.push(`      '${esc(r.title)}',`);
  lines.push(`      ${subtitle},`);
  lines.push(`      '${esc(r.category)}',`);
  lines.push(`      '${esc(r.difficulty)}',`);
  lines.push(`      ${price},`);
  lines.push(`      'BRL',`);
  lines.push(`      ${play},`);
  lines.push(`      ${emoji},`);
  lines.push(`      array[${tags}]::text[],`);
  lines.push(`      ${description},`);
  lines.push(`      '${body}'::jsonb,`);
  lines.push(`      'published'`);
  lines.push('    );');
  lines.push('  end if;');
  lines.push('');
}

lines.push("  raise notice 'Seed OK: 4 receitas (3 grátis + ursinho premium)';");
lines.push('end $$;');
lines.push('');

writeFileSync(join(root, 'supabase/seed_recipes.sql'), lines.join('\n'));
console.log(
  'OK supabase/seed_recipes.sql →',
  recipes.map((r) => `${r.id}:${r.priceCents ?? (r.isPremium ? 1990 : 0)}`).join(', '),
);
