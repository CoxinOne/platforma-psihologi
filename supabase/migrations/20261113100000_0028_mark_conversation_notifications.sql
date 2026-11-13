-- =============================================================================
-- 0028 — Marcaj citit: conversație + notificările ei
-- =============================================================================
set search_path = public, extensions;

create or replace function public.mark_conversation_read(p_conversation uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversation_participants
     set last_read_at = now()
   where conversation_id = p_conversation
     and user_id = auth.uid();

  update public.notifications
     set read_at = now()
   where user_id = auth.uid()
     and read_at is null
     and action_url in (
       '/dashboard/mesaje/' || p_conversation::text,
       '/cabinet/mesaje/' || p_conversation::text
     );
end;
$$;
