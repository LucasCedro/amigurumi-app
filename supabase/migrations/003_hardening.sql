-- =============================================================================
-- 003 — Hardening (fase 0.5): trava is_admin + body premium protegido
-- Rode no SQL Editor DEPOIS do SETUP.sql / seed
-- =============================================================================

-- ── 1) is_admin / is_seller imutáveis no client ─────────
create or replace function public.protect_profile_roles()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.is_admin is distinct from old.is_admin then
      -- SQL Editor (postgres) e service_role (Edge Functions) podem alterar
      if current_user in ('postgres', 'supabase_admin') then
        return new;
      end if;
      if coalesce(auth.jwt() ->> 'role', '') = 'service_role' then
        return new;
      end if;
      raise exception 'is_admin não pode ser alterado pelo client';
    end if;

    if new.is_seller is distinct from old.is_seller then
      if current_user in ('postgres', 'supabase_admin') then
        return new;
      end if;
      if coalesce(auth.jwt() ->> 'role', '') = 'service_role' then
        return new;
      end if;
      if public.is_admin() then
        return new;
      end if;
      raise exception 'is_seller não pode ser alterado pelo client';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_roles on public.profiles;
create trigger trg_protect_profile_roles
  before update on public.profiles
  for each row execute function public.protect_profile_roles();

-- ── 2) Pode acessar o body secreto? ────────────────────
create or replace function public.can_access_recipe_body(p_recipe_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.market_recipes m
    where m.id = p_recipe_id
      and (
        m.price_cents = 0
        or m.seller_id = auth.uid()
        or public.is_admin()
        or exists (
          select 1
          from public.purchases p
          where p.recipe_id = p_recipe_id
            and p.buyer_id = auth.uid()
            and p.status = 'paid'
        )
      )
  );
$$;

grant execute on function public.can_access_recipe_body(uuid) to authenticated, anon;

-- ── 3) Tabela secreta (carreiras / montagem) ───────────
create table if not exists public.recipe_bodies (
  recipe_id uuid primary key references public.market_recipes (id) on delete cascade,
  body jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Copia body completo pra tabela secreta (só se ainda tiver carreiras; não sobrescreve em re-run)
insert into public.recipe_bodies (recipe_id, body)
select id, body
from public.market_recipes m
where (
  (m.body ? 'assembly')
  or exists (
    select 1
    from jsonb_array_elements(coalesce(m.body->'pieces', '[]'::jsonb)) p
    where p ? 'rounds'
  )
)
on conflict (recipe_id) do nothing;

-- Reduz market_recipes.body ao teaser público (sem rounds) — só linhas que ainda têm segredo
update public.market_recipes m
set body = jsonb_build_object(
  'localSlug', coalesce(m.body->>'localSlug', m.id::text),
  'materials', m.body->'materials',
  'notes', m.body->'notes',
  'colors', m.body->'colors',
  'author', m.body->'author',
  'estimatedHours', m.body->'estimatedHours',
  'finalSizeCm', m.body->'finalSizeCm',
  'yarnWeight', m.body->'yarnWeight',
  'cover', m.body->'cover',
  'gallery', m.body->'gallery',
  'video', m.body->'video',
  'pieces', coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', p->>'id',
        'name', p->>'name',
        'qty', p->'qty'
      )
    )
    from jsonb_array_elements(coalesce(m.body->'pieces', '[]'::jsonb)) p
  ), '[]'::jsonb)
)
where (
  (m.body ? 'assembly')
  or exists (
    select 1
    from jsonb_array_elements(coalesce(m.body->'pieces', '[]'::jsonb)) p
    where p ? 'rounds'
  )
);

alter table public.recipe_bodies enable row level security;

drop policy if exists "bodies_select_allowed" on public.recipe_bodies;
create policy "bodies_select_allowed"
  on public.recipe_bodies for select
  using (public.can_access_recipe_body(recipe_id));

drop policy if exists "bodies_write_admin_or_owner" on public.recipe_bodies;
create policy "bodies_write_admin_or_owner"
  on public.recipe_bodies for all
  using (
    public.is_admin()
    or exists (
      select 1 from public.market_recipes m
      where m.id = recipe_id and m.seller_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.market_recipes m
      where m.id = recipe_id and m.seller_id = auth.uid()
    )
  );

drop policy if exists "market_recipes_admin_all" on public.market_recipes;
create policy "market_recipes_admin_all"
  on public.market_recipes for all
  using (public.is_admin())
  with check (public.is_admin());

-- Fase 0.5: só admin publica (artesãs = fase 3)
drop policy if exists "market_recipes_insert_own" on public.market_recipes;
drop policy if exists "market_recipes_update_own" on public.market_recipes;

-- ── 4) Helper: grava teaser + body secreto ─────────────
-- (teaser builder + trigger estão na seção 7; aqui o RPC de admin)
create or replace function public.upsert_recipe_content(
  p_recipe_id uuid,
  p_full_body jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (
    public.is_admin()
    or exists (select 1 from public.market_recipes m where m.id = p_recipe_id and m.seller_id = auth.uid())
  ) then
    raise exception 'Sem permissão';
  end if;

  -- Dispara trg_split_recipe_body → recipe_bodies + teaser em market_recipes
  update public.market_recipes
  set body = p_full_body, updated_at = now()
  where id = p_recipe_id;

  if not found then
    raise exception 'Receita não encontrada';
  end if;
end;
$$;

grant execute on function public.upsert_recipe_content(uuid, jsonb) to authenticated;

-- ── 5) admin_grant: só se allow_admin_grant = true ─────
-- Desligue em produção:
--   update public.app_config set value = 'false' where key = 'allow_admin_grant';
create table if not exists public.app_config (
  key text primary key,
  value text not null
);

insert into public.app_config (key, value)
values ('allow_admin_grant', 'true')
on conflict (key) do nothing;

alter table public.app_config enable row level security;

drop policy if exists "config_read_all" on public.app_config;
create policy "config_read_all"
  on public.app_config for select
  using (true);
-- sem policy de write pro client → só SQL Editor / service_role

create or replace function public.admin_grant_purchase(p_recipe_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  rid uuid;
  amt integer;
  allowed text;
begin
  if not public.is_admin() then
    raise exception 'Apenas admin';
  end if;

  select value into allowed from public.app_config where key = 'allow_admin_grant';
  if coalesce(allowed, 'false') <> 'true' then
    raise exception 'admin_grant desabilitado (produção)';
  end if;

  select price_cents into amt from public.market_recipes where id = p_recipe_id;
  if amt is null then
    raise exception 'Receita não encontrada';
  end if;

  insert into public.purchases (
    buyer_id, recipe_id, amount_cents,
    platform_fee_cents, seller_earnings_cents,
    provider, status
  )
  values (
    auth.uid(), p_recipe_id, amt,
    0, amt, 'admin_grant', 'paid'
  )
  on conflict (buyer_id, recipe_id) do update
    set status = 'paid',
        amount_cents = excluded.amount_cents,
        provider = 'admin_grant'
  returning id into rid;

  return rid;
end;
$$;

-- ── 6) RPC: registrar compra após IAP (só service_role) ─
-- Chamada pela Edge Function com service role key.
create or replace function public.record_play_purchase(
  p_buyer_id uuid,
  p_recipe_id uuid,
  p_product_id text,
  p_purchase_token text,
  p_order_id text,
  p_amount_cents integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  rid uuid;
  expected_sku text;
  amt integer;
begin
  -- Só service_role (Edge Function). Client autenticado normal não passa.
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role'
     and current_user not in ('postgres', 'supabase_admin') then
    raise exception 'Forbidden';
  end if;

  select play_product_id, price_cents
    into expected_sku, amt
  from public.market_recipes
  where id = p_recipe_id;

  if expected_sku is null then
    raise exception 'Receita não encontrada';
  end if;

  if expected_sku <> p_product_id then
    raise exception 'SKU não confere';
  end if;

  if p_amount_cents is null then
    p_amount_cents := amt;
  end if;

  insert into public.purchases (
    buyer_id, recipe_id, amount_cents,
    platform_fee_cents, seller_earnings_cents,
    provider, provider_payment_id, status
  )
  values (
    p_buyer_id, p_recipe_id, p_amount_cents,
    0, p_amount_cents,
    'play_billing', coalesce(p_order_id, p_purchase_token), 'paid'
  )
  on conflict (buyer_id, recipe_id) do update
    set status = 'paid',
        provider = 'play_billing',
        provider_payment_id = coalesce(excluded.provider_payment_id, purchases.provider_payment_id),
        amount_cents = excluded.amount_cents
  returning id into rid;

  return rid;
end;
$$;

-- Ninguém no client pode chamar direto — só service_role / SQL Editor
revoke all on function public.record_play_purchase(uuid, uuid, text, text, text, integer) from public, anon, authenticated;
grant execute on function public.record_play_purchase(uuid, uuid, text, text, text, integer) to service_role;

-- ── 7) Trigger: qualquer INSERT/UPDATE com body completo vira teaser + secreto
-- Protege seed re-rodado e upserts manuais que esquecem o RPC.
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
  -- AFTER INSERT/UPDATE: a linha em market_recipes já existe (FK ok).
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

  -- Segundo UPDATE cai no ramo sem rounds → não recursa
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

-- ── 8) Reviews: premium exige compra paga (ou admin / dona) ─
create or replace function public.can_review_recipe(p_recipe_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.market_recipes m
    where m.id = p_recipe_id
      and (
        m.price_cents = 0
        or m.seller_id = auth.uid()
        or public.is_admin()
        or exists (
          select 1
          from public.purchases p
          where p.recipe_id = p_recipe_id
            and p.buyer_id = auth.uid()
            and p.status = 'paid'
        )
      )
  );
$$;

grant execute on function public.can_review_recipe(uuid) to authenticated, anon;

drop policy if exists "reviews_insert_own" on public.recipe_reviews;
create policy "reviews_insert_own"
  on public.recipe_reviews for insert
  with check (auth.uid() = user_id and public.can_review_recipe(recipe_id));

drop policy if exists "reviews_update_own" on public.recipe_reviews;
create policy "reviews_update_own"
  on public.recipe_reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and public.can_review_recipe(recipe_id));
