-- =============================================================================
-- 0011 — Realtime și Storage
-- =============================================================================
set search_path = public, extensions;

-- -----------------------------------------------------------------------------
-- Realtime: mesaje, notificări, conversații și programări.
-- RLS este aplicat de Supabase Realtime pentru fiecare abonat.
-- -----------------------------------------------------------------------------
do $$
declare
  v_table text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach v_table in array array['messages', 'notifications', 'conversations', 'appointments']
    loop
      if not exists (
        select 1 from pg_publication_tables
         where pubname = 'supabase_realtime'
           and schemaname = 'public'
           and tablename = v_table
      ) then
        execute format('alter publication supabase_realtime add table public.%I', v_table);
      end if;
    end loop;
  end if;
end $$;

alter table public.messages replica identity full;
alter table public.notifications replica identity full;
alter table public.conversations replica identity full;
alter table public.appointments replica identity full;

-- -----------------------------------------------------------------------------
-- Storage: bucket public pentru fotografii de profil (fără date sensibile).
-- Blocul este condiționat pentru mediile locale fără schema storage.
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'avatars',
      'avatars',
      true,
      2097152,
      array['image/jpeg', 'image/png', 'image/webp']
    )
    on conflict (id) do update
      set public = excluded.public,
          file_size_limit = excluded.file_size_limit,
          allowed_mime_types = excluded.allowed_mime_types;

    begin
      create policy "avatars_public_read" on storage.objects
        for select to anon, authenticated
        using (bucket_id = 'avatars');
    exception when duplicate_object then null;
    end;

    begin
      create policy "avatars_owner_insert" on storage.objects
        for insert to authenticated
        with check (
          bucket_id = 'avatars'
          and (storage.foldername(name))[1] = auth.uid()::text
        );
    exception when duplicate_object then null;
    end;

    begin
      create policy "avatars_owner_update" on storage.objects
        for update to authenticated
        using (
          bucket_id = 'avatars'
          and (storage.foldername(name))[1] = auth.uid()::text
        )
        with check (
          bucket_id = 'avatars'
          and (storage.foldername(name))[1] = auth.uid()::text
        );
    exception when duplicate_object then null;
    end;

    begin
      create policy "avatars_owner_delete" on storage.objects
        for delete to authenticated
        using (
          bucket_id = 'avatars'
          and (storage.foldername(name))[1] = auth.uid()::text
        );
    exception when duplicate_object then null;
    end;
  end if;
end $$;
