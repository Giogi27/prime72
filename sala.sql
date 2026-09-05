create table if not exists sala (
  id uuid primary key default gen_random_uuid(),
  author text,
  body text not null,
  created_at timestamptz default now()
);

alter table sala enable row level security;

drop policy if exists sala_read on sala;
drop policy if exists sala_ins on sala;

create policy sala_read on sala
  for select
  using (true);

create policy sala_ins on sala
  for insert
  with check (char_length(body) between 1 and 280);
