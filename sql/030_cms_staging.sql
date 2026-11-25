-- STAGING ONLY. Run in separate Supabase project with existing admin_users and Auth.
begin;
create table public.cms_v3_published (id integer primary key check(id=1), settings jsonb not null check(jsonb_typeof(settings)='object' and octet_length(settings::text)<=65536));
alter table public.cms_v3_published enable row level security;
revoke all on public.cms_v3_published from public, anon, authenticated;
grant select on public.cms_v3_published to anon, authenticated;
grant insert, update on public.cms_v3_published to authenticated;
create policy cms_read on public.cms_v3_published for select to anon, authenticated using(true);
create policy cms_insert on public.cms_v3_published for insert to authenticated with check(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy cms_update on public.cms_v3_published for update to authenticated using(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))) with check(exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('cms-v3-media','cms-v3-media',true,5242880,array['image/jpeg','image/png','image/webp']);
create policy cms_media_insert on storage.objects for insert to authenticated with check(bucket_id='cms-v3-media' and name ~ '^[0-9a-f-]{36}\.(jpg|png|webp)$' and exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
commit;
