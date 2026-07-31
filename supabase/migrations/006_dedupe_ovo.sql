-- Remove ovo legado e duplicatas de base-ovo (rode no SQL Editor se ainda aparecer 2 ovos)

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
