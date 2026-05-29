-- ============================================================
-- JLI Wealth Suite — schema para Supabase
-- Correr una sola vez en SQL Editor del proyecto Supabase.
-- Idempotente: usa "if not exists" + "drop policy if exists ..."
-- ============================================================

-- 1) Snapshot de objetivos del usuario (1 row por usuario)
create table if not exists public.objetivos (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.objetivos is
  'Snapshot del wizard de Objetivos (jli_objetivos en localStorage). 1 row por usuario.';

-- 2) Cartera actual del usuario (CSV crudo + posiciones parseadas)
create table if not exists public.cartera_actual (
  user_id uuid primary key references auth.users on delete cascade,
  csv_text text,
  positions jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.cartera_actual is
  'Cartera actual subida vía CSV en portfolio.html. csv_text = archivo crudo, positions = array de posiciones parseadas.';

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.objetivos     enable row level security;
alter table public.cartera_actual enable row level security;

-- Limpieza idempotente de policies previas
drop policy if exists "objetivos_select_own" on public.objetivos;
drop policy if exists "objetivos_insert_own" on public.objetivos;
drop policy if exists "objetivos_update_own" on public.objetivos;
drop policy if exists "objetivos_delete_own" on public.objetivos;
drop policy if exists "cartera_select_own"    on public.cartera_actual;
drop policy if exists "cartera_insert_own"    on public.cartera_actual;
drop policy if exists "cartera_update_own"    on public.cartera_actual;
drop policy if exists "cartera_delete_own"    on public.cartera_actual;

-- Cada usuario ve / inserta / edita / borra SOLO su propia row
create policy "objetivos_select_own" on public.objetivos
  for select using (auth.uid() = user_id);
create policy "objetivos_insert_own" on public.objetivos
  for insert with check (auth.uid() = user_id);
create policy "objetivos_update_own" on public.objetivos
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "objetivos_delete_own" on public.objetivos
  for delete using (auth.uid() = user_id);

create policy "cartera_select_own" on public.cartera_actual
  for select using (auth.uid() = user_id);
create policy "cartera_insert_own" on public.cartera_actual
  for insert with check (auth.uid() = user_id);
create policy "cartera_update_own" on public.cartera_actual
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cartera_delete_own" on public.cartera_actual
  for delete using (auth.uid() = user_id);

-- ============================================================
-- Trigger: actualizar updated_at automáticamente
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_objetivos_touch     on public.objetivos;
drop trigger if exists trg_cartera_touch       on public.cartera_actual;

create trigger trg_objetivos_touch
  before update on public.objetivos
  for each row execute function public.touch_updated_at();

create trigger trg_cartera_touch
  before update on public.cartera_actual
  for each row execute function public.touch_updated_at();
