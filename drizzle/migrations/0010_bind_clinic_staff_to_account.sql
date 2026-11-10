ALTER TABLE public.clinic_staff ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE;
UPDATE public.clinic_staff s SET user_id = u.id FROM auth.users u WHERE s.role = 'admin' AND s.user_id IS NULL AND lower(u.email) = lower(s.email);

CREATE OR REPLACE FUNCTION public.clinic_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.clinic_staff WHERE user_id = auth.uid() LIMIT 1
$$;

-- Staff access binds to an account only after the caller proves mailbox ownership (email link or Google), never by password signup alone.
CREATE OR REPLACE FUNCTION public.claim_clinic_staff() RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(auth.jwt()->'amr', '[]'::jsonb)) a WHERE a->>'method' IN ('otp', 'magiclink', 'oauth', 'sso/saml')) THEN
    UPDATE public.clinic_staff SET user_id = auth.uid()
    WHERE user_id IS NULL AND lower(email) = lower(auth.jwt()->>'email')
      AND NOT EXISTS (SELECT 1 FROM public.clinic_staff x WHERE x.user_id = auth.uid());
  END IF;
  SELECT role INTO r FROM public.clinic_staff WHERE user_id = auth.uid() LIMIT 1;
  RETURN r;
END $$;
REVOKE ALL ON FUNCTION public.claim_clinic_staff() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_clinic_staff() TO authenticated;