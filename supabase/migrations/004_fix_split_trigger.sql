-- Fix: trigger BEFORE INSERT tentava gravar recipe_bodies antes da FK existir.
-- Rode isto no SQL Editor, depois rode de novo o seed_recipes.sql

create or replace function public.split_recipe_body_teaser()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_secret boolean;
  teaser jsonb;
begin
  if new.body is null then
    return null;
  end if;

  has_secret :=
    (new.body ? 'assembly')
    or exists (
      select 1
      from jsonb_array_elements(coalesce(new.body->'pieces', '[]'::jsonb)) p
      where p ? 'rounds'
    );

  if not has_secret then
    return null;
  end if;

  insert into public.recipe_bodies (recipe_id, body, updated_at)
  values (new.id, new.body, now())
  on conflict (recipe_id) do update
    set body = excluded.body,
        updated_at = now();

  teaser := public.build_recipe_teaser(new.body);
  if coalesce(teaser->>'localSlug', '') = '' then
    teaser := teaser || jsonb_build_object('localSlug', new.id::text);
  end if;

  update public.market_recipes
  set body = teaser
  where id = new.id
    and body is not distinct from new.body;

  return null;
end;
$$;

drop trigger if exists trg_split_recipe_body on public.market_recipes;
create trigger trg_split_recipe_body
  after insert or update of body on public.market_recipes
  for each row execute function public.split_recipe_body_teaser();
