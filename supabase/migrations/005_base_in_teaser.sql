-- Inclui config paramétrica (formas) no teaser público — necessário pro seletor de tamanho no app.
create or replace function public.build_recipe_teaser(p_full_body jsonb)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'localSlug', coalesce(p_full_body->>'localSlug', ''),
    'materials', p_full_body->'materials',
    'notes', p_full_body->'notes',
    'colors', p_full_body->'colors',
    'author', p_full_body->'author',
    'estimatedHours', p_full_body->'estimatedHours',
    'finalSizeCm', p_full_body->'finalSizeCm',
    'yarnWeight', p_full_body->'yarnWeight',
    'cover', p_full_body->'cover',
    'base', p_full_body->'base',
    'gallery', p_full_body->'gallery',
    'video', p_full_body->'video',
    'pieces', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', p->>'id',
          'name', p->>'name',
          'qty', p->'qty'
        )
      )
      from jsonb_array_elements(coalesce(p_full_body->'pieces', '[]'::jsonb)) p
    ), '[]'::jsonb)
  );
$$;
