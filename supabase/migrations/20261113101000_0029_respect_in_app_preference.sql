-- =============================================================================
-- 0029 — Respectă preferința de notificări în aplicație
-- =============================================================================
set search_path = public, extensions;

create or replace function public.notify_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient uuid;
  v_sender_name text;
  v_recipient_role public.user_role;
  v_action_url text;
begin
  select case
           when c.client_id = new.sender_id then c.psychologist_id
           else c.client_id
         end
    into v_recipient
    from public.conversations c
   where c.id = new.conversation_id;

  if v_recipient is null then
    return new;
  end if;

  if exists (
    select 1
      from public.notification_preferences np
     where np.user_id = v_recipient
       and np.in_app = false
  ) then
    return new;
  end if;

  select full_name, role into v_sender_name, v_recipient_role
    from public.profiles
   where id = new.sender_id;

  v_action_url := case
    when v_recipient_role = 'psychologist' then '/cabinet/mesaje/'
    else '/dashboard/mesaje/'
  end || new.conversation_id::text;

  insert into public.notifications (user_id, type, title, body, action_url, metadata)
  values (
    v_recipient,
    'message_new',
    'Mesaj nou',
    coalesce(v_sender_name, 'Un utilizator') || ' ți-a trimis un mesaj privat.',
    v_action_url,
    jsonb_build_object('conversation_id', new.conversation_id)
  );

  return new;
end;
$$;
