BEGIN;
CREATE TABLE public.member_v4_profiles (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 username text NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_]{3,30}$'),
 phone text NOT NULL CHECK (phone ~ '^\+?[0-9]{9,15}$'),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.member_v4_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.member_v4_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.member_v4_profiles TO authenticated;
GRANT INSERT (user_id,username,phone), UPDATE (username,phone) ON public.member_v4_profiles TO authenticated;
CREATE POLICY member_read ON public.member_v4_profiles FOR SELECT TO authenticated USING (user_id=(SELECT auth.uid()));
CREATE POLICY member_insert ON public.member_v4_profiles FOR INSERT TO authenticated WITH CHECK (user_id=(SELECT auth.uid()));
CREATE POLICY member_update ON public.member_v4_profiles FOR UPDATE TO authenticated USING (user_id=(SELECT auth.uid())) WITH CHECK (user_id=(SELECT auth.uid()));
COMMIT;
