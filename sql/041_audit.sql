SELECT relname,relrowsecurity FROM pg_class WHERE oid='public.member_v4_profiles'::regclass;
SELECT policyname,roles,cmd,qual,with_check FROM pg_policies WHERE schemaname='public' AND tablename='member_v4_profiles';
SELECT has_table_privilege('anon','public.member_v4_profiles','SELECT') AS anon_read, has_table_privilege('authenticated','public.member_v4_profiles','DELETE') AS member_delete, has_column_privilege('authenticated','public.member_v4_profiles','user_id','UPDATE') AS change_owner;
