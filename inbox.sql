create table if not exists inbox (
  id uuid primary key default gen_random_uuid(),
  author text,
  email text,
  body text not null,
  created_at timestamptz default now()
);

alter table inbox enable row level security;

drop policy if exists inbox_ins on inbox;
drop policy if exists inbox_read on inbox;

create policy inbox_ins on inbox
  for insert
  with check (char_length(body) between 1 and 1000);

create policy inbox_read on inbox
  for select
  using (true);
