-- Amiguide — schema inicial (auth + marketplace)
-- Rode no SQL Editor do Supabase (Dashboard → SQL → New query)
-- Plano Free do Supabase aguenta bem o início.

-- Perfis (1:1 com auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  is_seller boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_public_sellers"
  on public.profiles for select
  using (is_seller = true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Cria perfil automaticamente no signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Receitas do marketplace (criadas por artesãs)
-- As receitas seed gratuitas do app continuam no JSON local por enquanto.
create table if not exists public.market_recipes (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  subtitle text,
  category text not null,
  difficulty text not null,
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'BRL',
  cover_url text,
  body jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists market_recipes_status_idx on public.market_recipes (status);
create index if not exists market_recipes_seller_idx on public.market_recipes (seller_id);

alter table public.market_recipes enable row level security;

-- Qualquer um lê receitas publicadas
create policy "market_recipes_select_published"
  on public.market_recipes for select
  using (status = 'published' or seller_id = auth.uid());

-- Só a dona escreve
create policy "market_recipes_insert_own"
  on public.market_recipes for insert
  with check (seller_id = auth.uid());

create policy "market_recipes_update_own"
  on public.market_recipes for update
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

-- Compras (acesso às receitas pagas)
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.market_recipes (id) on delete restrict,
  amount_cents integer not null check (amount_cents >= 0),
  platform_fee_cents integer not null default 0 check (platform_fee_cents >= 0),
  seller_earnings_cents integer not null default 0 check (seller_earnings_cents >= 0),
  provider text,
  provider_payment_id text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'refunded', 'failed')),
  created_at timestamptz not null default now(),
  unique (buyer_id, recipe_id)
);

create index if not exists purchases_buyer_idx on public.purchases (buyer_id);

alter table public.purchases enable row level security;

-- Compradora só vê as próprias compras
create policy "purchases_select_own"
  on public.purchases for select
  using (buyer_id = auth.uid());

-- INSERT/UPDATE de purchases NÃO vem do app com anon key.
-- Só via Edge Function (service_role) depois do webhook de pagamento.
-- Sem policy de insert pro usuário = ninguém finge compra no client.

-- Fee da plataforma (ajuste quando for definir %)
-- Ex.: 15% → 1500 bps
create or replace function public.platform_fee_bps()
returns integer
language sql
immutable
as $$
  select 1500;
$$;
