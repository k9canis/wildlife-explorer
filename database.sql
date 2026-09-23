-- Run in the Supabase SQL Editor. Replace YOUR_USER_UUID in the policies
-- with the UUID of your own Auth user (Authentication > Users).
create table if not exists public.species (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.species enable row level security;
grant select on public.species to anon, authenticated;
grant insert, update, delete on public.species to authenticated;
create policy "Everyone can read species" on public.species for select to anon, authenticated using (true);
create policy "Owner can add species" on public.species for insert to authenticated with check (auth.uid() = 'YOUR_USER_UUID'::uuid);
create policy "Owner can edit species" on public.species for update to authenticated using (auth.uid() = 'YOUR_USER_UUID'::uuid) with check (auth.uid() = 'YOUR_USER_UUID'::uuid);
create policy "Owner can delete species" on public.species for delete to authenticated using (auth.uid() = 'YOUR_USER_UUID'::uuid);
