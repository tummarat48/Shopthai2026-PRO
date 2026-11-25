-- Staging: inspect existing policies, including broad policies that might bypass CMS rules.
select schemaname,tablename,policyname,roles,cmd,qual,with_check from pg_policies where (schemaname='public' and tablename in ('admin_users','cms_v3_published')) or (schemaname='storage' and tablename='objects');
select id,public,file_size_limit,allowed_mime_types from storage.buckets where id='cms-v3-media';
select grantee,privilege_type from information_schema.role_table_grants where table_schema='public' and table_name in ('admin_users','cms_v3_published');
