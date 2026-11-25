-- Staging only. No persistent data changes. Anonymous and non-admin must fail.
begin;
set local role anon;
select count(*) from public.cms_v3_published;
do $$begin
 begin insert into public.cms_v3_published values(1,'{}'); raise exception 'FAIL: anonymous write allowed'; exception when insufficient_privilege then raise notice 'PASS: anonymous write blocked'; end;
end$$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$begin
 if exists(select 1 from public.admin_users where user_id=auth.uid()) then raise exception 'Test UUID is admin; stop'; end if;
 begin insert into public.cms_v3_published values(1,'{}') on conflict(id) do update set settings=excluded.settings; raise exception 'FAIL: non-admin write allowed'; exception when insufficient_privilege then raise notice 'PASS: non-admin write blocked'; end;
end$$;
rollback;
