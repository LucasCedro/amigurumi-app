-- Fase 0: admin, IAP product id, reviews (comentário + nota)
-- Rode no SQL Editor do Supabase DEPOIS do 001_init.sql

-- ── Admin ──────────────────────────────────────────────
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Você (dono) vira admin: rode DEPOIS de criar a conta no app,
-- trocando o e-mail:
--
--   update public.profiles
--   set is_admin = true
--   where id = (
--     select id from auth.users where email = 'SEU_EMAIL@gmail.com'
--   );

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Admin lê qualquer perfil
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select"
  on public.profiles for select
  using (public.is_admin());

-- Nomes públicos (pra reviews / autor). RLS é por linha, não por coluna.
drop policy if exists "profiles_select_public_read" on public.profiles;
create policy "profiles_select_public_read"
  on public.profiles for select
  using (true);

-- ── Receitas: campos fase 0 ────────────────────────────
alter table public.market_recipes
  add column if not exists play_product_id text,
  add column if not exists emoji text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists description text;

-- Admin gerencia qualquer receita
drop policy if exists "market_recipes_admin_all" on public.market_recipes;
create policy "market_recipes_admin_all"
  on public.market_recipes
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── Reviews (1 por usuária por receita) ────────────────
create table if not exists public.recipe_reviews (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.market_recipes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recipe_id, user_id)
);

create index if not exists recipe_reviews_recipe_idx on public.recipe_reviews (recipe_id);

alter table public.recipe_reviews enable row level security;

drop policy if exists "reviews_select_all" on public.recipe_reviews;
create policy "reviews_select_all"
  on public.recipe_reviews for select
  using (true);

drop policy if exists "reviews_insert_own" on public.recipe_reviews;
create policy "reviews_insert_own"
  on public.recipe_reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.recipe_reviews;
create policy "reviews_update_own"
  on public.recipe_reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "reviews_delete_own" on public.recipe_reviews;
create policy "reviews_delete_own"
  on public.recipe_reviews for delete
  using (auth.uid() = user_id or public.is_admin());

-- ── Admin libera compra (teste / suporte) ──────────────
-- NÃO use em produção como atalho de pagamento real.
create or replace function public.admin_grant_purchase(p_recipe_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  rid uuid;
  amt integer;
begin
  if not public.is_admin() then
    raise exception 'Apenas admin';
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

grant execute on function public.admin_grant_purchase(uuid) to authenticated;
grant execute on function public.is_admin() to authenticated, anon;
