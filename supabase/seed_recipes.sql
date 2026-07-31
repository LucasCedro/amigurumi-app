-- =============================================================================
-- B) SEED — formas + projetos grátis + ursinho premium
-- E-mail do admin: scripts/seed-config.mjs (SEED_OWNER_EMAIL)
-- =============================================================================
do $$
declare
  seller uuid;
begin
  select id into seller from auth.users where email = 'lucasc.temponi@gmail.com' limit 1;
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

  -- base-disco
  if exists (
    select 1 from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-disco'
  ) then
    update public.market_recipes set
      title = 'Disco',
      subtitle = 'Forma · ~7 cm',
      category = 'base',
      difficulty = 'iniciante',
      price_cents = 0,
      play_product_id = null,
      emoji = '',
      tags = array['base','forma','modular','disco','plano']::text[],
      description = 'Base plana circular. Tampa, orelha, fundo de vaso.',
      body = '{"localSlug":"base-disco","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","disco","plano"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-disco/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Base plana circular. Tampa, orelha, fundo de vaso.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Disco","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"aum","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"aum","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"aum","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"aum","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"aum","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"12","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"aum","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"aum","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"aum","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"aum","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"aum","count":1}],"times":6}],"totalStitches":96},{"kind":"note","label":"Acabamento","text":"Não encha. Use como base plana ou tampa."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"disc","sizesCm":[5,7,10,12,15],"defaultSizeCm":7}}'::jsonb,
      status = 'published',
      seller_id = seller,
      updated_at = now()
    where id = (
      select m.id from public.market_recipes m
      left join public.recipe_bodies rb on rb.recipe_id = m.id
      where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-disco'
      order by m.created_at desc
      limit 1
    );
  else
    insert into public.market_recipes (
      seller_id, title, subtitle, category, difficulty, price_cents, currency,
      play_product_id, emoji, tags, description, body, status
    ) values (
      seller,
      'Disco',
      'Forma · ~7 cm',
      'base',
      'iniciante',
      0,
      'BRL',
      null,
      '',
      array['base','forma','modular','disco','plano']::text[],
      'Base plana circular. Tampa, orelha, fundo de vaso.',
      '{"localSlug":"base-disco","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","disco","plano"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-disco/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Base plana circular. Tampa, orelha, fundo de vaso.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Disco","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"aum","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"aum","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"aum","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"aum","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"aum","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"12","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"aum","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"aum","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"aum","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"aum","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"aum","count":1}],"times":6}],"totalStitches":96},{"kind":"note","label":"Acabamento","text":"Não encha. Use como base plana ou tampa."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"disc","sizesCm":[5,7,10,12,15],"defaultSizeCm":7}}'::jsonb,
      'published'
    );
  end if;


  -- base-esfera
  if exists (
    select 1 from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-esfera'
  ) then
    update public.market_recipes set
      title = 'Esfera',
      subtitle = 'Forma · ~7 cm',
      category = 'base',
      difficulty = 'iniciante',
      price_cents = 0,
      play_product_id = null,
      emoji = '',
      tags = array['base','forma','modular','esfera','bola']::text[],
      description = 'Bola sólida. Cabeças, frutas, bolas decorativas.',
      body = '{"localSlug":"base-esfera","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","esfera","bola"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-esfera/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Bola sólida. Cabeças, frutas, bolas decorativas.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Esfera","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"aum","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"aum","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"aum","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"aum","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"aum","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"12","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"aum","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"aum","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"aum","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"aum","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"aum","count":1}],"times":6}],"totalStitches":96},{"kind":"stitches","label":"17–32","repeatRows":16,"groups":[{"pattern":[{"stitch":"pb","count":96}],"times":1}],"totalStitches":96},{"kind":"stitches","label":"33","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"dim","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"34","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"dim","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"35","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"dim","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"36","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"dim","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"37","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"dim","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"38","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"dim","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"39","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"dim","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"40","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"dim","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"41","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"dim","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"42","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"dim","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"43","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"dim","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"44","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"45","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"46","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"47","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Enchimento","text":"Encha firme antes de fechar."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"sphere","sizesCm":[5,7,10,12,15],"defaultSizeCm":7,"bodyRoundsRatio":1}}'::jsonb,
      status = 'published',
      seller_id = seller,
      updated_at = now()
    where id = (
      select m.id from public.market_recipes m
      left join public.recipe_bodies rb on rb.recipe_id = m.id
      where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-esfera'
      order by m.created_at desc
      limit 1
    );
  else
    insert into public.market_recipes (
      seller_id, title, subtitle, category, difficulty, price_cents, currency,
      play_product_id, emoji, tags, description, body, status
    ) values (
      seller,
      'Esfera',
      'Forma · ~7 cm',
      'base',
      'iniciante',
      0,
      'BRL',
      null,
      '',
      array['base','forma','modular','esfera','bola']::text[],
      'Bola sólida. Cabeças, frutas, bolas decorativas.',
      '{"localSlug":"base-esfera","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","esfera","bola"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-esfera/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Bola sólida. Cabeças, frutas, bolas decorativas.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Esfera","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"aum","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"aum","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"aum","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"aum","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"aum","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"12","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"aum","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"aum","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"aum","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"aum","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"aum","count":1}],"times":6}],"totalStitches":96},{"kind":"stitches","label":"17–32","repeatRows":16,"groups":[{"pattern":[{"stitch":"pb","count":96}],"times":1}],"totalStitches":96},{"kind":"stitches","label":"33","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"dim","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"34","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"dim","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"35","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"dim","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"36","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"dim","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"37","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"dim","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"38","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"dim","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"39","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"dim","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"40","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"dim","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"41","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"dim","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"42","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"dim","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"43","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"dim","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"44","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"45","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"46","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"47","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Enchimento","text":"Encha firme antes de fechar."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"sphere","sizesCm":[5,7,10,12,15],"defaultSizeCm":7,"bodyRoundsRatio":1}}'::jsonb,
      'published'
    );
  end if;


  -- base-hemisferio
  if exists (
    select 1 from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-hemisferio'
  ) then
    update public.market_recipes set
      title = 'Hemisfério',
      subtitle = 'Forma · ~7 cm',
      category = 'base',
      difficulty = 'iniciante',
      price_cents = 0,
      play_product_id = null,
      emoji = '',
      tags = array['base','forma','modular','hemisferio','domo']::text[],
      description = 'Meia esfera com base aberta. Capuz, casco, cúpula.',
      body = '{"localSlug":"base-hemisferio","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","hemisferio","domo"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-hemisferio/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Meia esfera com base aberta. Capuz, casco, cúpula.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Hemisfério","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"aum","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"aum","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"aum","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"aum","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"aum","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"12","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"aum","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"aum","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"aum","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"aum","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"aum","count":1}],"times":6}],"totalStitches":96},{"kind":"note","label":"Acabamento","text":"Base aberta. Encha se for domo ou chapéu arredondado."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"hemisphere","sizesCm":[5,7,10,12,15],"defaultSizeCm":7}}'::jsonb,
      status = 'published',
      seller_id = seller,
      updated_at = now()
    where id = (
      select m.id from public.market_recipes m
      left join public.recipe_bodies rb on rb.recipe_id = m.id
      where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-hemisferio'
      order by m.created_at desc
      limit 1
    );
  else
    insert into public.market_recipes (
      seller_id, title, subtitle, category, difficulty, price_cents, currency,
      play_product_id, emoji, tags, description, body, status
    ) values (
      seller,
      'Hemisfério',
      'Forma · ~7 cm',
      'base',
      'iniciante',
      0,
      'BRL',
      null,
      '',
      array['base','forma','modular','hemisferio','domo']::text[],
      'Meia esfera com base aberta. Capuz, casco, cúpula.',
      '{"localSlug":"base-hemisferio","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","hemisferio","domo"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-hemisferio/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Meia esfera com base aberta. Capuz, casco, cúpula.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Hemisfério","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"aum","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"aum","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"aum","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"aum","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"aum","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"12","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"aum","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"aum","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"aum","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"aum","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"aum","count":1}],"times":6}],"totalStitches":96},{"kind":"note","label":"Acabamento","text":"Base aberta. Encha se for domo ou chapéu arredondado."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"hemisphere","sizesCm":[5,7,10,12,15],"defaultSizeCm":7}}'::jsonb,
      'published'
    );
  end if;


  -- base-ovo
  if exists (
    select 1 from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-ovo'
  ) then
    update public.market_recipes set
      title = 'Ovo',
      subtitle = 'Forma · ~7 cm',
      category = 'base',
      difficulty = 'iniciante',
      price_cents = 0,
      play_product_id = null,
      emoji = '',
      tags = array['base','forma','modular','ovo','organico']::text[],
      description = 'Forma oval assimétrica. Corpos orgânicos e ovos decorativos.',
      body = '{"localSlug":"base-ovo","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","ovo","organico"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-ovo/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Forma oval assimétrica. Corpos orgânicos e ovos decorativos.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Ovo","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"aum","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"aum","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"aum","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"aum","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"aum","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"12","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"aum","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"aum","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"aum","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"aum","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"aum","count":1}],"times":6}],"totalStitches":96},{"kind":"stitches","label":"17–34","repeatRows":18,"groups":[{"pattern":[{"stitch":"pb","count":96}],"times":1}],"totalStitches":96},{"kind":"stitches","label":"35","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"dim","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"36","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"dim","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"37","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"dim","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"38","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"dim","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"39","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"dim","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"40","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"dim","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"41","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"dim","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"42","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"dim","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"43","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"dim","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"44","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"dim","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"45","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"dim","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"46","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"47","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"48","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"49","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Enchimento","text":"Encha firme e feche a ponta."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"egg","sizesCm":[5,7,10,12,15],"defaultSizeCm":7}}'::jsonb,
      status = 'published',
      seller_id = seller,
      updated_at = now()
    where id = (
      select m.id from public.market_recipes m
      left join public.recipe_bodies rb on rb.recipe_id = m.id
      where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-ovo'
      order by m.created_at desc
      limit 1
    );
  else
    insert into public.market_recipes (
      seller_id, title, subtitle, category, difficulty, price_cents, currency,
      play_product_id, emoji, tags, description, body, status
    ) values (
      seller,
      'Ovo',
      'Forma · ~7 cm',
      'base',
      'iniciante',
      0,
      'BRL',
      null,
      '',
      array['base','forma','modular','ovo','organico']::text[],
      'Forma oval assimétrica. Corpos orgânicos e ovos decorativos.',
      '{"localSlug":"base-ovo","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","ovo","organico"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-ovo/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Forma oval assimétrica. Corpos orgânicos e ovos decorativos.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Ovo","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"aum","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"aum","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"aum","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"aum","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"aum","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"12","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"aum","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"aum","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"aum","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"aum","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"aum","count":1}],"times":6}],"totalStitches":96},{"kind":"stitches","label":"17–34","repeatRows":18,"groups":[{"pattern":[{"stitch":"pb","count":96}],"times":1}],"totalStitches":96},{"kind":"stitches","label":"35","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"dim","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"36","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"dim","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"37","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"dim","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"38","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"dim","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"39","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"dim","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"40","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"dim","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"41","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"dim","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"42","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"dim","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"43","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"dim","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"44","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"dim","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"45","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"dim","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"46","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"47","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"48","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"49","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Enchimento","text":"Encha firme e feche a ponta."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"egg","sizesCm":[5,7,10,12,15],"defaultSizeCm":7}}'::jsonb,
      'published'
    );
  end if;


  -- base-cilindro
  if exists (
    select 1 from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-cilindro'
  ) then
    update public.market_recipes set
      title = 'Cilindro',
      subtitle = 'Forma · ~7 cm',
      category = 'base',
      difficulty = 'iniciante',
      price_cents = 0,
      play_product_id = null,
      emoji = '',
      tags = array['base','forma','modular','cilindro','corpo']::text[],
      description = 'Pilar fechado nas duas pontas. Corpo, braços, pernas.',
      body = '{"localSlug":"base-cilindro","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","cilindro","corpo"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-cilindro/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Pilar fechado nas duas pontas. Corpo, braços, pernas.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Cilindro","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"aum","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"aum","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"aum","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"aum","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"aum","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"12","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"aum","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"aum","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"aum","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"aum","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"aum","count":1}],"times":6}],"totalStitches":96},{"kind":"stitches","label":"17–24","repeatRows":8,"groups":[{"pattern":[{"stitch":"pb","count":96}],"times":1}],"totalStitches":96},{"kind":"stitches","label":"25","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"dim","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"26","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"dim","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"27","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"dim","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"28","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"dim","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"29","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"dim","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"30","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"dim","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"31","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"dim","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"32","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"dim","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"33","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"dim","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"34","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"dim","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"35","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"dim","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"36","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"37","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"38","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"39","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Enchimento","text":"Encha para pilar sólido."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"cylinder","sizesCm":[5,7,10,12,15],"defaultSizeCm":7,"heightRoundsAtDefault":8}}'::jsonb,
      status = 'published',
      seller_id = seller,
      updated_at = now()
    where id = (
      select m.id from public.market_recipes m
      left join public.recipe_bodies rb on rb.recipe_id = m.id
      where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-cilindro'
      order by m.created_at desc
      limit 1
    );
  else
    insert into public.market_recipes (
      seller_id, title, subtitle, category, difficulty, price_cents, currency,
      play_product_id, emoji, tags, description, body, status
    ) values (
      seller,
      'Cilindro',
      'Forma · ~7 cm',
      'base',
      'iniciante',
      0,
      'BRL',
      null,
      '',
      array['base','forma','modular','cilindro','corpo']::text[],
      'Pilar fechado nas duas pontas. Corpo, braços, pernas.',
      '{"localSlug":"base-cilindro","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","cilindro","corpo"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-cilindro/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Pilar fechado nas duas pontas. Corpo, braços, pernas.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Cilindro","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"aum","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"aum","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"aum","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"aum","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"aum","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"12","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"aum","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"aum","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"aum","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"aum","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"aum","count":1}],"times":6}],"totalStitches":96},{"kind":"stitches","label":"17–24","repeatRows":8,"groups":[{"pattern":[{"stitch":"pb","count":96}],"times":1}],"totalStitches":96},{"kind":"stitches","label":"25","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"dim","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"26","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"dim","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"27","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"dim","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"28","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"dim","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"29","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"dim","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"30","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"dim","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"31","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"dim","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"32","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"dim","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"33","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"dim","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"34","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"dim","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"35","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"dim","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"36","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"37","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"38","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"39","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Enchimento","text":"Encha para pilar sólido."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"cylinder","sizesCm":[5,7,10,12,15],"defaultSizeCm":7,"heightRoundsAtDefault":8}}'::jsonb,
      'published'
    );
  end if;


  -- base-vaso
  if exists (
    select 1 from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-vaso'
  ) then
    update public.market_recipes set
      title = 'Vaso',
      subtitle = 'Forma · ~7 cm',
      category = 'base',
      difficulty = 'iniciante',
      price_cents = 0,
      play_product_id = null,
      emoji = '',
      tags = array['base','forma','modular','vaso','cachepo']::text[],
      description = 'Cachepô de planta: base circular estreita, lados que alargam na borda aberta.',
      body = '{"localSlug":"base-vaso","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","vaso","cachepo"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-vaso/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Cachepô de planta: base circular estreita, lados que alargam na borda aberta.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Vaso","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"aum","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"aum","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"aum","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"aum","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"aum","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"12–16","repeatRows":5,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":66}],"times":1}],"totalStitches":66},{"kind":"stitches","label":"17","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"aum","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"18","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"aum","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"19","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"aum","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"20","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"aum","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"21","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"aum","count":1}],"times":6}],"totalStitches":96},{"kind":"note","label":"Acabamento","text":"Topo aberto — borda mais larga que a base, como cachepô de planta."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"vase","sizesCm":[5,7,10,12,15],"defaultSizeCm":7,"heightRoundsAtDefault":10}}'::jsonb,
      status = 'published',
      seller_id = seller,
      updated_at = now()
    where id = (
      select m.id from public.market_recipes m
      left join public.recipe_bodies rb on rb.recipe_id = m.id
      where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-vaso'
      order by m.created_at desc
      limit 1
    );
  else
    insert into public.market_recipes (
      seller_id, title, subtitle, category, difficulty, price_cents, currency,
      play_product_id, emoji, tags, description, body, status
    ) values (
      seller,
      'Vaso',
      'Forma · ~7 cm',
      'base',
      'iniciante',
      0,
      'BRL',
      null,
      '',
      array['base','forma','modular','vaso','cachepo']::text[],
      'Cachepô de planta: base circular estreita, lados que alargam na borda aberta.',
      '{"localSlug":"base-vaso","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","vaso","cachepo"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-vaso/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Cachepô de planta: base circular estreita, lados que alargam na borda aberta.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Vaso","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"aum","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"aum","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"aum","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"aum","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"aum","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"12–16","repeatRows":5,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":66}],"times":1}],"totalStitches":66},{"kind":"stitches","label":"17","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"aum","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"18","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"aum","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"19","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"aum","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"20","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"aum","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"21","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"aum","count":1}],"times":6}],"totalStitches":96},{"kind":"note","label":"Acabamento","text":"Topo aberto — borda mais larga que a base, como cachepô de planta."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"vase","sizesCm":[5,7,10,12,15],"defaultSizeCm":7,"heightRoundsAtDefault":10}}'::jsonb,
      'published'
    );
  end if;


  -- base-cone
  if exists (
    select 1 from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-cone'
  ) then
    update public.market_recipes set
      title = 'Cone',
      subtitle = 'Forma · ~7 cm',
      category = 'base',
      difficulty = 'iniciante',
      price_cents = 0,
      play_product_id = null,
      emoji = '',
      tags = array['base','forma','modular','cone','chapeu']::text[],
      description = 'Ponta estreita e base larga. Chapéu, sorvete, árvore.',
      body = '{"localSlug":"base-cone","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","cone","chapeu"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-cone/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Ponta estreita e base larga. Chapéu, sorvete, árvore.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Cone","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"aum","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"aum","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"aum","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"aum","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"aum","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"12","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"aum","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"aum","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"aum","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"aum","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"aum","count":1}],"times":6}],"totalStitches":96},{"kind":"note","label":"Acabamento","text":"Ponta estreita no início."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"cone","sizesCm":[5,7,10,12,15],"defaultSizeCm":7}}'::jsonb,
      status = 'published',
      seller_id = seller,
      updated_at = now()
    where id = (
      select m.id from public.market_recipes m
      left join public.recipe_bodies rb on rb.recipe_id = m.id
      where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-cone'
      order by m.created_at desc
      limit 1
    );
  else
    insert into public.market_recipes (
      seller_id, title, subtitle, category, difficulty, price_cents, currency,
      play_product_id, emoji, tags, description, body, status
    ) values (
      seller,
      'Cone',
      'Forma · ~7 cm',
      'base',
      'iniciante',
      0,
      'BRL',
      null,
      '',
      array['base','forma','modular','cone','chapeu']::text[],
      'Ponta estreita e base larga. Chapéu, sorvete, árvore.',
      '{"localSlug":"base-cone","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","cone","chapeu"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-cone/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Ponta estreita e base larga. Chapéu, sorvete, árvore.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Cone","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"pb","count":5},{"stitch":"aum","count":1}],"times":6}],"totalStitches":42},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":6},{"stitch":"aum","count":1}],"times":6}],"totalStitches":48},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":7},{"stitch":"aum","count":1}],"times":6}],"totalStitches":54},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":8},{"stitch":"aum","count":1}],"times":6}],"totalStitches":60},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":9},{"stitch":"aum","count":1}],"times":6}],"totalStitches":66},{"kind":"stitches","label":"12","groups":[{"pattern":[{"stitch":"pb","count":10},{"stitch":"aum","count":1}],"times":6}],"totalStitches":72},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":11},{"stitch":"aum","count":1}],"times":6}],"totalStitches":78},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":12},{"stitch":"aum","count":1}],"times":6}],"totalStitches":84},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":13},{"stitch":"aum","count":1}],"times":6}],"totalStitches":90},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":14},{"stitch":"aum","count":1}],"times":6}],"totalStitches":96},{"kind":"note","label":"Acabamento","text":"Ponta estreita no início."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"cone","sizesCm":[5,7,10,12,15],"defaultSizeCm":7}}'::jsonb,
      'published'
    );
  end if;


  -- base-bastao
  if exists (
    select 1 from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-bastao'
  ) then
    update public.market_recipes set
      title = 'Bastão',
      subtitle = 'Forma · ~7 cm',
      category = 'base',
      difficulty = 'iniciante',
      price_cents = 0,
      play_product_id = null,
      emoji = '',
      tags = array['base','forma','modular','bastao','fino']::text[],
      description = 'Cilindro fino e longo. Caule, varinha, chaveiro.',
      body = '{"localSlug":"base-bastao","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","bastao","fino"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-bastao/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Cilindro fino e longo. Caule, varinha, chaveiro.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Bastão","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3–12","repeatRows":10,"groups":[{"pattern":[{"stitch":"pb","count":12}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Acabamento","text":"Cilindro fino — varinha, caule ou chaveiro."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"rod","sizesCm":[5,7,10,12,15],"defaultSizeCm":7,"heightRoundsAtDefault":10,"rodStitchCount":12}}'::jsonb,
      status = 'published',
      seller_id = seller,
      updated_at = now()
    where id = (
      select m.id from public.market_recipes m
      left join public.recipe_bodies rb on rb.recipe_id = m.id
      where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'base-bastao'
      order by m.created_at desc
      limit 1
    );
  else
    insert into public.market_recipes (
      seller_id, title, subtitle, category, difficulty, price_cents, currency,
      play_product_id, emoji, tags, description, body, status
    ) values (
      seller,
      'Bastão',
      'Forma · ~7 cm',
      'base',
      'iniciante',
      0,
      'BRL',
      null,
      '',
      array['base','forma','modular','bastao','fino']::text[],
      'Cilindro fino e longo. Caule, varinha, chaveiro.',
      '{"localSlug":"base-bastao","subtitle":"Forma · ~7 cm","tags":["base","forma","modular","bastao","fino"],"yarnWeight":"fine","estimatedHours":1,"finalSizeCm":7,"cover":"base-bastao/cover","author":{"name":"Amiguide","credit":"Forma geométrica paramétrica"},"colors":[{"id":"neutro","label":"À escolha","hex":"#E8E0D5"}],"description":"Cilindro fino e longo. Caule, varinha, chaveiro.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"À escolha","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Combine várias formas para montar personagens e objetos."],"pieces":[{"id":"peca","name":"Bastão","qty":1,"startColor":"neutro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"neutro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3–12","repeatRows":10,"groups":[{"pattern":[{"stitch":"pb","count":12}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Acabamento","text":"Cilindro fino — varinha, caule ou chaveiro."}]}],"assembly":[{"step":1,"text":"Arremate e esconda as pontas. Combine com outras formas na montagem."}],"base":{"shape":"rod","sizesCm":[5,7,10,12,15],"defaultSizeCm":7,"heightRoundsAtDefault":10,"rodStitchCount":12}}'::jsonb,
      'published'
    );
  end if;


  -- morango
  if exists (
    select 1 from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'morango'
  ) then
    update public.market_recipes set
      title = 'Morango',
      subtitle = 'Comidinha · ~8 cm',
      category = 'comidinhas',
      difficulty = 'iniciante',
      price_cents = 0,
      play_product_id = null,
      emoji = '🍓',
      tags = array['fruta','comidinha','iniciante']::text[],
      description = 'Morango fofo com folhinhas verdes. Ótimo pra chaveiro ou enfeite.',
      body = '{"localSlug":"morango","subtitle":"Comidinha · ~8 cm","tags":["fruta","comidinha","iniciante"],"yarnWeight":"fine","estimatedHours":3,"finalSizeCm":8,"emoji":"🍓","cover":"morango/cover","author":{"name":"Amiguide"},"colors":[{"id":"vermelho","label":"Vermelho","hex":"#D7263D"},{"id":"verde","label":"Verde","hex":"#4E9F3D"}],"description":"Morango fofo com folhinhas verdes. Ótimo pra chaveiro ou enfeite.","materials":[{"type":"fio","label":"Fio de algodão","color":"Vermelho","amount":"1 novelo"},{"type":"fio","label":"Fio de algodão","color":"Verde","amount":"sobra"},{"type":"agulha","label":"Agulha 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"}],"notes":["Borde as sementinhas com fio amarelo depois de pronto."],"pieces":[{"id":"corpo","name":"Corpo","qty":1,"startColor":"vermelho","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"vermelho","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6 a 9","repeatRows":4,"groups":[{"pattern":[{"stitch":"pb","count":30}],"times":1}],"totalStitches":30},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"note","label":"Enchimento","text":"Encha firme mantendo o formato de morango."},{"kind":"stitches","label":"12","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Acabamento","text":"Feche a ponta de baixo e arremate."}]},{"id":"folhas","name":"Folhas","qty":1,"startColor":"verde","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"verde","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"note","label":"Biquinhos","text":"Em cada ponto faça: 1 corrente, pule e volte, formando 6 biquinhos de folha."},{"kind":"note","label":"Montagem","text":"Costure as folhas no topo do morango."}]}],"assembly":[{"step":1,"text":"Borde as sementinhas amarelas espalhadas pelo corpo vermelho."},{"step":2,"text":"Costure as folhas verdes no topo, cobrindo o anel mágico."}]}'::jsonb,
      status = 'published',
      seller_id = seller,
      updated_at = now()
    where id = (
      select m.id from public.market_recipes m
      left join public.recipe_bodies rb on rb.recipe_id = m.id
      where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'morango'
      order by m.created_at desc
      limit 1
    );
  else
    insert into public.market_recipes (
      seller_id, title, subtitle, category, difficulty, price_cents, currency,
      play_product_id, emoji, tags, description, body, status
    ) values (
      seller,
      'Morango',
      'Comidinha · ~8 cm',
      'comidinhas',
      'iniciante',
      0,
      'BRL',
      null,
      '🍓',
      array['fruta','comidinha','iniciante']::text[],
      'Morango fofo com folhinhas verdes. Ótimo pra chaveiro ou enfeite.',
      '{"localSlug":"morango","subtitle":"Comidinha · ~8 cm","tags":["fruta","comidinha","iniciante"],"yarnWeight":"fine","estimatedHours":3,"finalSizeCm":8,"emoji":"🍓","cover":"morango/cover","author":{"name":"Amiguide"},"colors":[{"id":"vermelho","label":"Vermelho","hex":"#D7263D"},{"id":"verde","label":"Verde","hex":"#4E9F3D"}],"description":"Morango fofo com folhinhas verdes. Ótimo pra chaveiro ou enfeite.","materials":[{"type":"fio","label":"Fio de algodão","color":"Vermelho","amount":"1 novelo"},{"type":"fio","label":"Fio de algodão","color":"Verde","amount":"sobra"},{"type":"agulha","label":"Agulha 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"}],"notes":["Borde as sementinhas com fio amarelo depois de pronto."],"pieces":[{"id":"corpo","name":"Corpo","qty":1,"startColor":"vermelho","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"vermelho","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6 a 9","repeatRows":4,"groups":[{"pattern":[{"stitch":"pb","count":30}],"times":1}],"totalStitches":30},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"note","label":"Enchimento","text":"Encha firme mantendo o formato de morango."},{"kind":"stitches","label":"12","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Acabamento","text":"Feche a ponta de baixo e arremate."}]},{"id":"folhas","name":"Folhas","qty":1,"startColor":"verde","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"verde","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"note","label":"Biquinhos","text":"Em cada ponto faça: 1 corrente, pule e volte, formando 6 biquinhos de folha."},{"kind":"note","label":"Montagem","text":"Costure as folhas no topo do morango."}]}],"assembly":[{"step":1,"text":"Borde as sementinhas amarelas espalhadas pelo corpo vermelho."},{"step":2,"text":"Costure as folhas verdes no topo, cobrindo o anel mágico."}]}'::jsonb,
      'published'
    );
  end if;


  -- polvo
  if exists (
    select 1 from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'polvo'
  ) then
    update public.market_recipes set
      title = 'Polvo Fofinho',
      subtitle = 'Bichinho · ~12 cm',
      category = 'bichos',
      difficulty = 'iniciante',
      price_cents = 0,
      play_product_id = null,
      emoji = '🐙',
      tags = array['polvo','mar','bichinho']::text[],
      description = 'Polvo redondinho com 8 tentáculos. Corpo esférico e tubinhos simples.',
      body = '{"localSlug":"polvo","subtitle":"Bichinho · ~12 cm","tags":["polvo","mar","bichinho"],"yarnWeight":"fine","estimatedHours":5,"finalSizeCm":12,"emoji":"🐙","cover":"polvo/cover","author":{"name":"Amiguide"},"colors":[{"id":"azul","label":"Azul","hex":"#5B8DBE"}],"description":"Polvo redondinho com 8 tentáculos. Corpo esférico e tubinhos simples.","materials":[{"type":"fio","label":"Fio de algodão","color":"Azul","amount":"1 novelo"},{"type":"agulha","label":"Agulha 2,5 mm"},{"type":"olhos","label":"Olhos de segurança 8 mm","amount":"2"},{"type":"enchimento","label":"Fibra siliconada"}],"notes":["Os tentáculos são feitos separadamente e costurados ao redor da base."],"pieces":[{"id":"corpo","name":"Corpo","qty":1,"startColor":"azul","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7 a 12","repeatRows":6,"groups":[{"pattern":[{"stitch":"pb","count":36}],"times":1}],"totalStitches":36},{"kind":"note","label":"Olhos","text":"Prenda os olhos de segurança entre as carreiras 9 e 10, com 6 pontos de distância."},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"dim","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"note","label":"Enchimento","text":"Encha firme com fibra siliconada."},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"17","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Acabamento","text":"Feche a base e arremate."}]},{"id":"tentaculo","name":"Tentáculo","qty":8,"startColor":"azul","note":"Faça 8 iguais.","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2 a 9","repeatRows":8,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Montagem","text":"Achate a ponta e costure ao redor da base do corpo."}]}],"assembly":[{"step":1,"text":"Distribua os 8 tentáculos igualmente ao redor da base do corpo."},{"step":2,"text":"Costure cada um firmemente e esconda as pontas."}]}'::jsonb,
      status = 'published',
      seller_id = seller,
      updated_at = now()
    where id = (
      select m.id from public.market_recipes m
      left join public.recipe_bodies rb on rb.recipe_id = m.id
      where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'polvo'
      order by m.created_at desc
      limit 1
    );
  else
    insert into public.market_recipes (
      seller_id, title, subtitle, category, difficulty, price_cents, currency,
      play_product_id, emoji, tags, description, body, status
    ) values (
      seller,
      'Polvo Fofinho',
      'Bichinho · ~12 cm',
      'bichos',
      'iniciante',
      0,
      'BRL',
      null,
      '🐙',
      array['polvo','mar','bichinho']::text[],
      'Polvo redondinho com 8 tentáculos. Corpo esférico e tubinhos simples.',
      '{"localSlug":"polvo","subtitle":"Bichinho · ~12 cm","tags":["polvo","mar","bichinho"],"yarnWeight":"fine","estimatedHours":5,"finalSizeCm":12,"emoji":"🐙","cover":"polvo/cover","author":{"name":"Amiguide"},"colors":[{"id":"azul","label":"Azul","hex":"#5B8DBE"}],"description":"Polvo redondinho com 8 tentáculos. Corpo esférico e tubinhos simples.","materials":[{"type":"fio","label":"Fio de algodão","color":"Azul","amount":"1 novelo"},{"type":"agulha","label":"Agulha 2,5 mm"},{"type":"olhos","label":"Olhos de segurança 8 mm","amount":"2"},{"type":"enchimento","label":"Fibra siliconada"}],"notes":["Os tentáculos são feitos separadamente e costurados ao redor da base."],"pieces":[{"id":"corpo","name":"Corpo","qty":1,"startColor":"azul","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7 a 12","repeatRows":6,"groups":[{"pattern":[{"stitch":"pb","count":36}],"times":1}],"totalStitches":36},{"kind":"note","label":"Olhos","text":"Prenda os olhos de segurança entre as carreiras 9 e 10, com 6 pontos de distância."},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"dim","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"note","label":"Enchimento","text":"Encha firme com fibra siliconada."},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"17","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Acabamento","text":"Feche a base e arremate."}]},{"id":"tentaculo","name":"Tentáculo","qty":8,"startColor":"azul","note":"Faça 8 iguais.","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2 a 9","repeatRows":8,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Montagem","text":"Achate a ponta e costure ao redor da base do corpo."}]}],"assembly":[{"step":1,"text":"Distribua os 8 tentáculos igualmente ao redor da base do corpo."},{"step":2,"text":"Costure cada um firmemente e esconda as pontas."}]}'::jsonb,
      'published'
    );
  end if;


  -- cogumelo-chaveiro
  if exists (
    select 1 from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'cogumelo-chaveiro'
  ) then
    update public.market_recipes set
      title = 'Cogumelo Chaveiro',
      subtitle = 'Chaveiro · ~5 cm',
      category = 'chaveiros',
      difficulty = 'iniciante',
      price_cents = 0,
      play_product_id = null,
      emoji = '🍄',
      tags = array['iniciante','chaveiro','comidinhas']::text[],
      description = 'Cogumelo fofo pra chaveiro: chapéu com babado + caule estreito. Trabalhe em espiral.',
      body = '{"localSlug":"cogumelo-chaveiro","subtitle":"Chaveiro · ~5 cm","tags":["iniciante","chaveiro","comidinhas"],"yarnWeight":"fine","estimatedHours":2,"finalSizeCm":5,"emoji":"🍄","cover":"cogumelo-chaveiro/cover","author":{"name":"Amiguide","credit":"Padrão original (gerado e validado para o app)"},"colors":[{"id":"marrom-avermelhado","label":"Marrom avermelhado","hex":"#B84A3A"},{"id":"bege-claro","label":"Bege claro","hex":"#F5E6D3"}],"description":"Cogumelo fofo pra chaveiro: chapéu com babado + caule estreito. Trabalhe em espiral.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"Marrom avermelhado","amount":"sobra"},{"type":"fio","label":"Fio de algodão nº 4","color":"Bege claro","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Chaveiro de metal + agulha de tapeçaria"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","O babado é 3 pb em cada ponto da borda (36 → 108 pontos numa volta)."],"pieces":[{"id":"chapeu","name":"Chapéu","qty":1,"startColor":"marrom-avermelhado","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"marrom-avermelhado","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7–10","repeatRows":4,"groups":[{"pattern":[{"stitch":"pb","count":36}],"times":1}],"totalStitches":36},{"kind":"note","label":"Acabamento","text":"Faça 1 pbx no próximo ponto, corte o fio e arremate."},{"kind":"stitches","label":"Babado","groups":[{"pattern":[{"stitch":"pb","count":3}],"times":36}],"totalStitches":108},{"kind":"note","label":"Babado","text":"3 pb em cada um dos 36 pontos da borda. Finalize com 1 pbx, corte o fio e arremate."}]},{"id":"caule","name":"Caule","qty":1,"startColor":"bege-claro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"bege-claro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4–8","repeatRows":5,"groups":[{"pattern":[{"stitch":"pb","count":18}],"times":1}],"totalStitches":18},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"10–12","repeatRows":3,"groups":[{"pattern":[{"stitch":"pb","count":12}],"times":1}],"totalStitches":12},{"kind":"note","label":"Enchimento","text":"Comece a encher o caule firmemente com enchimento de fibra."},{"kind":"note","label":"Acabamento","text":"Faça 1 pbx no próximo ponto, corte o fio deixando uma cauda longa para costura."}]}],"assembly":[{"step":1,"text":"Costure o topo do caule ao centro do babado e à parte inferior do chapéu usando a cauda longa."},{"step":2,"text":"Prenda o chaveiro de metal na parte superior central do chapéu."}]}'::jsonb,
      status = 'published',
      seller_id = seller,
      updated_at = now()
    where id = (
      select m.id from public.market_recipes m
      left join public.recipe_bodies rb on rb.recipe_id = m.id
      where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'cogumelo-chaveiro'
      order by m.created_at desc
      limit 1
    );
  else
    insert into public.market_recipes (
      seller_id, title, subtitle, category, difficulty, price_cents, currency,
      play_product_id, emoji, tags, description, body, status
    ) values (
      seller,
      'Cogumelo Chaveiro',
      'Chaveiro · ~5 cm',
      'chaveiros',
      'iniciante',
      0,
      'BRL',
      null,
      '🍄',
      array['iniciante','chaveiro','comidinhas']::text[],
      'Cogumelo fofo pra chaveiro: chapéu com babado + caule estreito. Trabalhe em espiral.',
      '{"localSlug":"cogumelo-chaveiro","subtitle":"Chaveiro · ~5 cm","tags":["iniciante","chaveiro","comidinhas"],"yarnWeight":"fine","estimatedHours":2,"finalSizeCm":5,"emoji":"🍄","cover":"cogumelo-chaveiro/cover","author":{"name":"Amiguide","credit":"Padrão original (gerado e validado para o app)"},"colors":[{"id":"marrom-avermelhado","label":"Marrom avermelhado","hex":"#B84A3A"},{"id":"bege-claro","label":"Bege claro","hex":"#F5E6D3"}],"description":"Cogumelo fofo pra chaveiro: chapéu com babado + caule estreito. Trabalhe em espiral.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"Marrom avermelhado","amount":"sobra"},{"type":"fio","label":"Fio de algodão nº 4","color":"Bege claro","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Chaveiro de metal + agulha de tapeçaria"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","O babado é 3 pb em cada ponto da borda (36 → 108 pontos numa volta)."],"pieces":[{"id":"chapeu","name":"Chapéu","qty":1,"startColor":"marrom-avermelhado","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"marrom-avermelhado","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7–10","repeatRows":4,"groups":[{"pattern":[{"stitch":"pb","count":36}],"times":1}],"totalStitches":36},{"kind":"note","label":"Acabamento","text":"Faça 1 pbx no próximo ponto, corte o fio e arremate."},{"kind":"stitches","label":"Babado","groups":[{"pattern":[{"stitch":"pb","count":3}],"times":36}],"totalStitches":108},{"kind":"note","label":"Babado","text":"3 pb em cada um dos 36 pontos da borda. Finalize com 1 pbx, corte o fio e arremate."}]},{"id":"caule","name":"Caule","qty":1,"startColor":"bege-claro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"bege-claro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4–8","repeatRows":5,"groups":[{"pattern":[{"stitch":"pb","count":18}],"times":1}],"totalStitches":18},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"10–12","repeatRows":3,"groups":[{"pattern":[{"stitch":"pb","count":12}],"times":1}],"totalStitches":12},{"kind":"note","label":"Enchimento","text":"Comece a encher o caule firmemente com enchimento de fibra."},{"kind":"note","label":"Acabamento","text":"Faça 1 pbx no próximo ponto, corte o fio deixando uma cauda longa para costura."}]}],"assembly":[{"step":1,"text":"Costure o topo do caule ao centro do babado e à parte inferior do chapéu usando a cauda longa."},{"step":2,"text":"Prenda o chaveiro de metal na parte superior central do chapéu."}]}'::jsonb,
      'published'
    );
  end if;


  -- dinossauro-braquiossauro
  if exists (
    select 1 from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'dinossauro-braquiossauro'
  ) then
    update public.market_recipes set
      title = 'Dinossauro Braquiossauro',
      subtitle = 'Bichinho · ~14 cm',
      category = 'bichos',
      difficulty = 'intermediario',
      price_cents = 0,
      play_product_id = null,
      emoji = '🦕',
      tags = array['dinossauro','braquiossauro','bichinho']::text[],
      description = 'Braquiossauro com pescoço longo, barriga creme e quatro patas. Trabalhe em espiral.',
      body = '{"localSlug":"dinossauro-braquiossauro","subtitle":"Bichinho · ~14 cm","tags":["dinossauro","braquiossauro","bichinho"],"yarnWeight":"fine","estimatedHours":6,"finalSizeCm":14,"emoji":"🦕","cover":"dinossauro-braquiossauro/cover","author":{"name":"Amiguide","credit":"Padrão original (gerado e validado para o app)"},"colors":[{"id":"verde-claro","label":"Verde claro","hex":"#8FBC8F"},{"id":"creme","label":"Creme","hex":"#F0E3D0"},{"id":"marrom-escuro","label":"Marrom escuro","hex":"#5D4037"}],"description":"Braquiossauro com pescoço longo, barriga creme e quatro patas. Trabalhe em espiral.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"Verde claro","amount":"1 novelo"},{"type":"fio","label":"Fio de algodão nº 4","color":"Creme","amount":"sobra"},{"type":"fio","label":"Fio de algodão nº 4","color":"Marrom escuro","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto e agulha de tapeçaria"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Troque para creme nas carreiras 11–14 do corpo (barriga)."],"pieces":[{"id":"cabeca-pescoco","name":"Cabeça e Pescoço","qty":1,"startColor":"verde-claro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"verde-claro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5–9","repeatRows":5,"groups":[{"pattern":[{"stitch":"pb","count":24}],"times":1}],"totalStitches":24},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"note","label":"Enchimento","text":"Encha a cabeça firmemente com enchimento de fibra siliconada."},{"kind":"stitches","label":"12–20","repeatRows":9,"groups":[{"pattern":[{"stitch":"pb","count":12}],"times":1}],"totalStitches":12},{"kind":"note","label":"Acabamento","text":"Arremate deixando uma ponta longa para costurar."}]},{"id":"corpo","name":"Corpo","qty":1,"startColor":"verde-claro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"verde-claro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7–10","repeatRows":4,"groups":[{"pattern":[{"stitch":"pb","count":36}],"times":1}],"totalStitches":36},{"kind":"stitches","label":"11–14","repeatRows":4,"color":"creme","groups":[{"pattern":[{"stitch":"pb","count":36}],"times":1}],"totalStitches":36},{"kind":"stitches","label":"15–16","repeatRows":2,"color":"verde-claro","groups":[{"pattern":[{"stitch":"pb","count":36}],"times":1}],"totalStitches":36},{"kind":"stitches","label":"17","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"dim","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"18","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"19","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"20","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"note","label":"Enchimento","text":"Encha o corpo firmemente com enchimento de fibra siliconada."},{"kind":"stitches","label":"21","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Acabamento","text":"Passe a ponta pelos pontos restantes, feche a abertura e esconda o fio."}]},{"id":"perna","name":"Perna","qty":4,"startColor":"verde-claro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"verde-claro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3–5","repeatRows":3,"groups":[{"pattern":[{"stitch":"pb","count":12}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"dim","count":1},{"stitch":"pb","count":4}],"times":2}],"totalStitches":10},{"kind":"note","label":"Enchimento","text":"Encha levemente."},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"dim","count":5}],"times":1}],"totalStitches":5},{"kind":"note","label":"Acabamento","text":"Passe o fio pelos pontos restantes, feche e esconda a ponta."}]},{"id":"cauda","name":"Cauda","qty":1,"startColor":"verde-claro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"verde-claro","groups":[{"pattern":[{"stitch":"pb","count":4}],"times":1}],"totalStitches":4},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":2}],"totalStitches":6},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":2}],"totalStitches":8},{"kind":"stitches","label":"5–7","repeatRows":3,"groups":[{"pattern":[{"stitch":"pb","count":8}],"times":1}],"totalStitches":8},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":2}],"totalStitches":6},{"kind":"note","label":"Enchimento","text":"Encha levemente."},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"dim","count":3}],"times":1}],"totalStitches":3},{"kind":"note","label":"Acabamento","text":"Passe o fio pelos pontos restantes, feche e esconda a ponta."}]}],"assembly":[{"step":1,"text":"Costure o pescoço no centro superior do corpo usando a ponta longa."},{"step":2,"text":"Costure as quatro pernas, duas na frente e duas atrás, mantendo-as alinhadas."},{"step":3,"text":"Costure a cauda na parte traseira do corpo."},{"step":4,"text":"Borde dois olhos em formato de ''V'' com fio marrom escuro em cada lado da cabeça."}]}'::jsonb,
      status = 'published',
      seller_id = seller,
      updated_at = now()
    where id = (
      select m.id from public.market_recipes m
      left join public.recipe_bodies rb on rb.recipe_id = m.id
      where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'dinossauro-braquiossauro'
      order by m.created_at desc
      limit 1
    );
  else
    insert into public.market_recipes (
      seller_id, title, subtitle, category, difficulty, price_cents, currency,
      play_product_id, emoji, tags, description, body, status
    ) values (
      seller,
      'Dinossauro Braquiossauro',
      'Bichinho · ~14 cm',
      'bichos',
      'intermediario',
      0,
      'BRL',
      null,
      '🦕',
      array['dinossauro','braquiossauro','bichinho']::text[],
      'Braquiossauro com pescoço longo, barriga creme e quatro patas. Trabalhe em espiral.',
      '{"localSlug":"dinossauro-braquiossauro","subtitle":"Bichinho · ~14 cm","tags":["dinossauro","braquiossauro","bichinho"],"yarnWeight":"fine","estimatedHours":6,"finalSizeCm":14,"emoji":"🦕","cover":"dinossauro-braquiossauro/cover","author":{"name":"Amiguide","credit":"Padrão original (gerado e validado para o app)"},"colors":[{"id":"verde-claro","label":"Verde claro","hex":"#8FBC8F"},{"id":"creme","label":"Creme","hex":"#F0E3D0"},{"id":"marrom-escuro","label":"Marrom escuro","hex":"#5D4037"}],"description":"Braquiossauro com pescoço longo, barriga creme e quatro patas. Trabalhe em espiral.","materials":[{"type":"fio","label":"Fio de algodão nº 4","color":"Verde claro","amount":"1 novelo"},{"type":"fio","label":"Fio de algodão nº 4","color":"Creme","amount":"sobra"},{"type":"fio","label":"Fio de algodão nº 4","color":"Marrom escuro","amount":"sobra"},{"type":"agulha","label":"Agulha de crochê 2,5 mm"},{"type":"enchimento","label":"Fibra siliconada"},{"type":"extra","label":"Marcador de ponto e agulha de tapeçaria"}],"notes":["Trabalhe em espiral contínua, sem fechar a carreira.","Use marcador no 1º ponto de cada volta.","Troque para creme nas carreiras 11–14 do corpo (barriga)."],"pieces":[{"id":"cabeca-pescoco","name":"Cabeça e Pescoço","qty":1,"startColor":"verde-claro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"verde-claro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5–9","repeatRows":5,"groups":[{"pattern":[{"stitch":"pb","count":24}],"times":1}],"totalStitches":24},{"kind":"stitches","label":"10","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"note","label":"Enchimento","text":"Encha a cabeça firmemente com enchimento de fibra siliconada."},{"kind":"stitches","label":"12–20","repeatRows":9,"groups":[{"pattern":[{"stitch":"pb","count":12}],"times":1}],"totalStitches":12},{"kind":"note","label":"Acabamento","text":"Arremate deixando uma ponta longa para costurar."}]},{"id":"corpo","name":"Corpo","qty":1,"startColor":"verde-claro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"verde-claro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7–10","repeatRows":4,"groups":[{"pattern":[{"stitch":"pb","count":36}],"times":1}],"totalStitches":36},{"kind":"stitches","label":"11–14","repeatRows":4,"color":"creme","groups":[{"pattern":[{"stitch":"pb","count":36}],"times":1}],"totalStitches":36},{"kind":"stitches","label":"15–16","repeatRows":2,"color":"verde-claro","groups":[{"pattern":[{"stitch":"pb","count":36}],"times":1}],"totalStitches":36},{"kind":"stitches","label":"17","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"dim","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"18","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"19","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"20","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"note","label":"Enchimento","text":"Encha o corpo firmemente com enchimento de fibra siliconada."},{"kind":"stitches","label":"21","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Acabamento","text":"Passe a ponta pelos pontos restantes, feche a abertura e esconda o fio."}]},{"id":"perna","name":"Perna","qty":4,"startColor":"verde-claro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"verde-claro","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3–5","repeatRows":3,"groups":[{"pattern":[{"stitch":"pb","count":12}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"dim","count":1},{"stitch":"pb","count":4}],"times":2}],"totalStitches":10},{"kind":"note","label":"Enchimento","text":"Encha levemente."},{"kind":"stitches","label":"7","groups":[{"pattern":[{"stitch":"dim","count":5}],"times":1}],"totalStitches":5},{"kind":"note","label":"Acabamento","text":"Passe o fio pelos pontos restantes, feche e esconda a ponta."}]},{"id":"cauda","name":"Cauda","qty":1,"startColor":"verde-claro","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"verde-claro","groups":[{"pattern":[{"stitch":"pb","count":4}],"times":1}],"totalStitches":4},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":2}],"totalStitches":6},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":2}],"totalStitches":8},{"kind":"stitches","label":"5–7","repeatRows":3,"groups":[{"pattern":[{"stitch":"pb","count":8}],"times":1}],"totalStitches":8},{"kind":"stitches","label":"8","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":2}],"totalStitches":6},{"kind":"note","label":"Enchimento","text":"Encha levemente."},{"kind":"stitches","label":"9","groups":[{"pattern":[{"stitch":"dim","count":3}],"times":1}],"totalStitches":3},{"kind":"note","label":"Acabamento","text":"Passe o fio pelos pontos restantes, feche e esconda a ponta."}]}],"assembly":[{"step":1,"text":"Costure o pescoço no centro superior do corpo usando a ponta longa."},{"step":2,"text":"Costure as quatro pernas, duas na frente e duas atrás, mantendo-as alinhadas."},{"step":3,"text":"Costure a cauda na parte traseira do corpo."},{"step":4,"text":"Borde dois olhos em formato de ''V'' com fio marrom escuro em cada lado da cabeça."}]}'::jsonb,
      'published'
    );
  end if;


  -- ursinho
  if exists (
    select 1 from public.market_recipes m
    left join public.recipe_bodies rb on rb.recipe_id = m.id
    where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'ursinho'
  ) then
    update public.market_recipes set
      title = 'Ursinho Clássico',
      subtitle = 'Bichinho · ~22 cm',
      category = 'bichos',
      difficulty = 'intermediario',
      price_cents = 1990,
      play_product_id = 'receita_ursinho_classico',
      emoji = '🧸',
      tags = array['urso','presente','clássico']::text[],
      description = 'O ursinho de sempre: cabeça, corpo, focinho, orelhas, braços e pernas. Projeto completo pra treinar montagem.',
      body = '{"localSlug":"ursinho","subtitle":"Bichinho · ~22 cm","tags":["urso","presente","clássico"],"yarnWeight":"medium","estimatedHours":8,"finalSizeCm":22,"emoji":"🧸","cover":"ursinho/cover","author":{"name":"Amiguide","credit":"Modelo clássico de ursinho sentado"},"colors":[{"id":"marrom","label":"Marrom","hex":"#8B5A2B"},{"id":"creme","label":"Creme","hex":"#F0E3D0"}],"description":"O ursinho de sempre: cabeça, corpo, focinho, orelhas, braços e pernas. Projeto completo pra treinar montagem.","materials":[{"type":"fio","label":"Amigurumi Círculo","color":"Marrom","amount":"1 novelo"},{"type":"fio","label":"Amigurumi Círculo","color":"Creme","amount":"sobra"},{"type":"agulha","label":"Agulha 2,5 mm"},{"type":"olhos","label":"Olhos de segurança 9 mm","amount":"2"},{"type":"enchimento","label":"Fibra siliconada"}],"notes":["Trabalhe em espiral.","Encha firme a cabeça antes de fechar."],"pieces":[{"id":"cabeca","name":"Cabeça","qty":1,"startColor":"marrom","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7 a 12","repeatRows":6,"groups":[{"pattern":[{"stitch":"pb","count":36}],"times":1}],"totalStitches":36},{"kind":"note","label":"Rosto","text":"Prenda os olhos entre as carreiras 8 e 9 e costure o focinho."},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"dim","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"note","label":"Enchimento","text":"Encha bem firme a cabeça."},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"17","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Acabamento","text":"Feche e reserve pra costurar no corpo."}]},{"id":"focinho","name":"Focinho","qty":1,"startColor":"creme","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"creme","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"note","label":"Nariz","text":"Borde o nariz em marrom escuro e costure na cabeça."}]},{"id":"orelha","name":"Orelha","qty":2,"startColor":"marrom","note":"Faça 2.","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":12}],"times":1}],"totalStitches":12},{"kind":"note","label":"Montagem","text":"Não encha. Achate e costure no topo da cabeça."}]},{"id":"braco","name":"Braço","qty":2,"startColor":"marrom","note":"Faça 2.","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3 a 4","repeatRows":2,"groups":[{"pattern":[{"stitch":"pb","count":12}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":3}],"totalStitches":9},{"kind":"stitches","label":"6 a 10","repeatRows":5,"groups":[{"pattern":[{"stitch":"pb","count":9}],"times":1}],"totalStitches":9},{"kind":"note","label":"Montagem","text":"Encha levemente só a mão e costure na lateral do corpo."}]},{"id":"perna","name":"Perna","qty":2,"startColor":"marrom","note":"Faça 2.","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4 a 5","repeatRows":2,"groups":[{"pattern":[{"stitch":"pb","count":18}],"times":1}],"totalStitches":18},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"7 a 11","repeatRows":5,"groups":[{"pattern":[{"stitch":"pb","count":12}],"times":1}],"totalStitches":12},{"kind":"note","label":"Montagem","text":"Encha e costure na base do corpo."}]},{"id":"corpo","name":"Corpo","qty":1,"startColor":"marrom","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6 a 10","repeatRows":5,"groups":[{"pattern":[{"stitch":"pb","count":30}],"times":1}],"totalStitches":30},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"12 a 13","repeatRows":2,"groups":[{"pattern":[{"stitch":"pb","count":24}],"times":1}],"totalStitches":24},{"kind":"note","label":"Enchimento","text":"Encha o corpo firme."},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"note","label":"Acabamento","text":"Feche parcialmente pra costurar a cabeça por cima."}]}],"assembly":[{"step":1,"text":"Prenda os olhos na cabeça entre as carreiras 8 e 9, com cerca de 7 pontos de distância."},{"step":2,"text":"Costure o focinho no centro da cabeça e borde o nariz."},{"step":3,"text":"Costure as duas orelhas no topo da cabeça."},{"step":4,"text":"Costure a cabeça firmemente sobre o corpo."},{"step":5,"text":"Costure os braços nas laterais, logo abaixo da cabeça."},{"step":6,"text":"Costure as pernas na base do corpo pra ele sentar."}]}'::jsonb,
      status = 'published',
      seller_id = seller,
      updated_at = now()
    where id = (
      select m.id from public.market_recipes m
      left join public.recipe_bodies rb on rb.recipe_id = m.id
      where coalesce(rb.body->>'localSlug', m.body->>'localSlug') = 'ursinho'
      order by m.created_at desc
      limit 1
    );
  else
    insert into public.market_recipes (
      seller_id, title, subtitle, category, difficulty, price_cents, currency,
      play_product_id, emoji, tags, description, body, status
    ) values (
      seller,
      'Ursinho Clássico',
      'Bichinho · ~22 cm',
      'bichos',
      'intermediario',
      1990,
      'BRL',
      'receita_ursinho_classico',
      '🧸',
      array['urso','presente','clássico']::text[],
      'O ursinho de sempre: cabeça, corpo, focinho, orelhas, braços e pernas. Projeto completo pra treinar montagem.',
      '{"localSlug":"ursinho","subtitle":"Bichinho · ~22 cm","tags":["urso","presente","clássico"],"yarnWeight":"medium","estimatedHours":8,"finalSizeCm":22,"emoji":"🧸","cover":"ursinho/cover","author":{"name":"Amiguide","credit":"Modelo clássico de ursinho sentado"},"colors":[{"id":"marrom","label":"Marrom","hex":"#8B5A2B"},{"id":"creme","label":"Creme","hex":"#F0E3D0"}],"description":"O ursinho de sempre: cabeça, corpo, focinho, orelhas, braços e pernas. Projeto completo pra treinar montagem.","materials":[{"type":"fio","label":"Amigurumi Círculo","color":"Marrom","amount":"1 novelo"},{"type":"fio","label":"Amigurumi Círculo","color":"Creme","amount":"sobra"},{"type":"agulha","label":"Agulha 2,5 mm"},{"type":"olhos","label":"Olhos de segurança 9 mm","amount":"2"},{"type":"enchimento","label":"Fibra siliconada"}],"notes":["Trabalhe em espiral.","Encha firme a cabeça antes de fechar."],"pieces":[{"id":"cabeca","name":"Cabeça","qty":1,"startColor":"marrom","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"aum","count":1}],"times":6}],"totalStitches":36},{"kind":"stitches","label":"7 a 12","repeatRows":6,"groups":[{"pattern":[{"stitch":"pb","count":36}],"times":1}],"totalStitches":36},{"kind":"note","label":"Rosto","text":"Prenda os olhos entre as carreiras 8 e 9 e costure o focinho."},{"kind":"stitches","label":"13","groups":[{"pattern":[{"stitch":"pb","count":4},{"stitch":"dim","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"note","label":"Enchimento","text":"Encha bem firme a cabeça."},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"16","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"17","groups":[{"pattern":[{"stitch":"dim","count":6}],"times":1}],"totalStitches":6},{"kind":"note","label":"Acabamento","text":"Feche e reserve pra costurar no corpo."}]},{"id":"focinho","name":"Focinho","qty":1,"startColor":"creme","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"color":"creme","groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"note","label":"Nariz","text":"Borde o nariz em marrom escuro e costure na cabeça."}]},{"id":"orelha","name":"Orelha","qty":2,"startColor":"marrom","note":"Faça 2.","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":12}],"times":1}],"totalStitches":12},{"kind":"note","label":"Montagem","text":"Não encha. Achate e costure no topo da cabeça."}]},{"id":"braco","name":"Braço","qty":2,"startColor":"marrom","note":"Faça 2.","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3 a 4","repeatRows":2,"groups":[{"pattern":[{"stitch":"pb","count":12}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":3}],"totalStitches":9},{"kind":"stitches","label":"6 a 10","repeatRows":5,"groups":[{"pattern":[{"stitch":"pb","count":9}],"times":1}],"totalStitches":9},{"kind":"note","label":"Montagem","text":"Encha levemente só a mão e costure na lateral do corpo."}]},{"id":"perna","name":"Perna","qty":2,"startColor":"marrom","note":"Faça 2.","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4 a 5","repeatRows":2,"groups":[{"pattern":[{"stitch":"pb","count":18}],"times":1}],"totalStitches":18},{"kind":"stitches","label":"6","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"stitches","label":"7 a 11","repeatRows":5,"groups":[{"pattern":[{"stitch":"pb","count":12}],"times":1}],"totalStitches":12},{"kind":"note","label":"Montagem","text":"Encha e costure na base do corpo."}]},{"id":"corpo","name":"Corpo","qty":1,"startColor":"marrom","rounds":[{"kind":"stitches","label":"1","isMagicRing":true,"groups":[{"pattern":[{"stitch":"pb","count":6}],"times":1}],"totalStitches":6},{"kind":"stitches","label":"2","groups":[{"pattern":[{"stitch":"aum","count":6}],"times":1}],"totalStitches":12},{"kind":"stitches","label":"3","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"aum","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"4","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"aum","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"5","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"aum","count":1}],"times":6}],"totalStitches":30},{"kind":"stitches","label":"6 a 10","repeatRows":5,"groups":[{"pattern":[{"stitch":"pb","count":30}],"times":1}],"totalStitches":30},{"kind":"stitches","label":"11","groups":[{"pattern":[{"stitch":"pb","count":3},{"stitch":"dim","count":1}],"times":6}],"totalStitches":24},{"kind":"stitches","label":"12 a 13","repeatRows":2,"groups":[{"pattern":[{"stitch":"pb","count":24}],"times":1}],"totalStitches":24},{"kind":"note","label":"Enchimento","text":"Encha o corpo firme."},{"kind":"stitches","label":"14","groups":[{"pattern":[{"stitch":"pb","count":2},{"stitch":"dim","count":1}],"times":6}],"totalStitches":18},{"kind":"stitches","label":"15","groups":[{"pattern":[{"stitch":"pb","count":1},{"stitch":"dim","count":1}],"times":6}],"totalStitches":12},{"kind":"note","label":"Acabamento","text":"Feche parcialmente pra costurar a cabeça por cima."}]}],"assembly":[{"step":1,"text":"Prenda os olhos na cabeça entre as carreiras 8 e 9, com cerca de 7 pontos de distância."},{"step":2,"text":"Costure o focinho no centro da cabeça e borde o nariz."},{"step":3,"text":"Costure as duas orelhas no topo da cabeça."},{"step":4,"text":"Costure a cabeça firmemente sobre o corpo."},{"step":5,"text":"Costure os braços nas laterais, logo abaixo da cabeça."},{"step":6,"text":"Costure as pernas na base do corpo pra ele sentar."}]}'::jsonb,
      'published'
    );
  end if;

  raise notice 'Seed OK: formas + receitas gratis + ursinho premium';
end $$;
