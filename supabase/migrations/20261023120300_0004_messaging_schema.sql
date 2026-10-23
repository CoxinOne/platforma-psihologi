-- =============================================================================
-- 0004 — Mesagerie privată
-- =============================================================================
set search_path = public, extensions;

-- -----------------------------------------------------------------------------
-- conversations — exact una între un client și un psiholog
-- -----------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  psychologist_id uuid not null references public.psychologist_profiles (user_id) on delete cascade,
  last_message_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint conversations_participants_distinct check (client_id <> psychologist_id),
  constraint conversations_unique_pair unique (client_id, psychologist_id)
);

create index if not exists conversations_last_message_idx
  on public.conversations (last_message_at desc);

-- -----------------------------------------------------------------------------
-- conversation_participants — membri + momentul ultimei citiri
-- -----------------------------------------------------------------------------
create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_in_conversation text not null,
  last_read_at timestamptz not null default now(),
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id),
  constraint conversation_participant_role check (role_in_conversation in ('client', 'psychologist'))
);

create index if not exists conversation_participants_user_idx
  on public.conversation_participants (user_id);

-- -----------------------------------------------------------------------------
-- messages — imutabile; fără politică de UPDATE sau DELETE
-- -----------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint messages_body_length check (char_length(body) between 1 and 4000),
  constraint messages_body_not_blank check (btrim(body) <> '')
);

comment on table public.messages is
  'Mesaje private. Conținutul nu este jurnalizat și nu este trimis către servicii AI externe.';

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at);
create index if not exists messages_sender_idx on public.messages (sender_id);

-- -----------------------------------------------------------------------------
-- Trigger: actualizează last_message_at (folosit pentru ordonarea conversațiilor)
-- -----------------------------------------------------------------------------
create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation_on_message();
