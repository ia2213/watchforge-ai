-- Table principale des designs
create table if not exists designs (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  result jsonb not null,
  created_at timestamptz default now()
);

-- Accès public en lecture (galerie publique)
alter table designs enable row level security;

create policy "Public read" on designs
  for select using (true);

create policy "Public insert" on designs
  for insert with check (true);
