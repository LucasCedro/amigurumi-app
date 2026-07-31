-- Idioma do conteúdo da receita + flag catálogo Amiguide (overlay EN no app).
-- UGC futuro: content_locale = idioma da autora, is_house_catalog = false.

alter table public.market_recipes
  add column if not exists content_locale text not null default 'pt'
    check (content_locale in ('pt', 'en')),
  add column if not exists is_house_catalog boolean not null default false;

comment on column public.market_recipes.content_locale is
  'Idioma em que título/descrição/body foram escritos (pt | en).';
comment on column public.market_recipes.is_house_catalog is
  'true = receita oficial Amiguide; app pode aplicar overlay i18n cliente (EN).';

-- Seed existente: tudo que já está publicado pelo admin é catálogo casa em PT.
update public.market_recipes
set
  content_locale = 'pt',
  is_house_catalog = true
where is_house_catalog = false;
