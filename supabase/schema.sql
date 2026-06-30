-- À exécuter dans l'éditeur SQL de ton projet Supabase.

create table if not exists collections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  series text,
  rarity text,
  condition text,
  price numeric,
  buy_price numeric,
  image text,
  created_at timestamp default now()
);

alter table collections enable row level security;

create policy "Users can view their own cards"
  on collections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own cards"
  on collections for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own cards"
  on collections for delete
  using (auth.uid() = user_id);
