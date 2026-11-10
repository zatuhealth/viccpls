ALTER TABLE public.clinic_staff ADD COLUMN IF NOT EXISTS clinic_household_id uuid REFERENCES public.households(id);

-- Existing bound staff: their clinic is their own household.
UPDATE public.clinic_staff s SET clinic_household_id = (
  SELECT m.household_id FROM public.household_members m WHERE m.user_id = s.user_id ORDER BY m.created_at LIMIT 1
) WHERE s.user_id IS NOT NULL AND s.clinic_household_id IS NULL;

-- Per-clinic role lookup: the caller's role at one specific clinic.
CREATE OR REPLACE FUNCTION public.clinic_role_for(_hid uuid) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.clinic_staff WHERE user_id = auth.uid() AND clinic_household_id = _hid LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.clinic_role_for(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.clinic_role_for(uuid) TO authenticated;

-- The clinic the signed-in caller belongs to (owners and staff alike).
CREATE OR REPLACE FUNCTION public.my_clinic() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT clinic_household_id FROM public.clinic_staff WHERE user_id = auth.uid() LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.my_clinic() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.my_clinic() TO authenticated;

-- Claim binds the account after mailbox proof; owners added by the platform adopt their own household as their clinic.
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
  UPDATE public.clinic_staff SET clinic_household_id = public.my_household()
  WHERE user_id = auth.uid() AND clinic_household_id IS NULL;
  SELECT role INTO r FROM public.clinic_staff WHERE user_id = auth.uid() LIMIT 1;
  RETURN r;
END $$;

-- Clinic details may only change for the caller's own clinic.
CREATE OR REPLACE FUNCTION public.guard_household_clinic_details()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE previous_clinic jsonb;
BEGIN
 IF TG_OP = 'UPDATE' THEN previous_clinic := OLD.data->'familyClinic'; END IF;
 IF (NEW.data->'familyClinic') IS DISTINCT FROM previous_clinic
    AND public.clinic_role_for(NEW.id) IS DISTINCT FROM 'admin' THEN
   RAISE EXCEPTION 'Only clinic administrators can change clinic details' USING ERRCODE = '42501';
 END IF;
 RETURN NEW;
END;
$$;

-- Every clinic rule now scopes to the clinic named in the row or link.
DROP POLICY IF EXISTS "clinic administrators read linked parents" ON public.clinic_parent_links;
CREATE POLICY "clinic administrators read linked parents" ON public.clinic_parent_links FOR SELECT TO authenticated
  USING (public.clinic_role_for(clinic_household_id) = 'admin');
DROP POLICY IF EXISTS "clinic staff invite linked parents" ON public.clinic_parent_links;
CREATE POLICY "clinic staff invite linked parents" ON public.clinic_parent_links FOR INSERT TO authenticated
  WITH CHECK (public.clinic_role_for(clinic_household_id) IS NOT NULL AND created_by = auth.uid());

DROP POLICY IF EXISTS "clinic admins read linked messages" ON public.clinic_messages;
CREATE POLICY "clinic admins read linked messages" ON public.clinic_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clinic_parent_links l WHERE l.parent_household_id = clinic_messages.household_id AND public.clinic_role_for(l.clinic_household_id) = 'admin'));

DROP POLICY IF EXISTS "clinic admins read linked payments" ON public.clinic_payments;
CREATE POLICY "clinic admins read linked payments" ON public.clinic_payments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clinic_parent_links l WHERE l.parent_household_id = clinic_payments.household_id AND public.clinic_role_for(l.clinic_household_id) = 'admin'));

DROP POLICY IF EXISTS "clinic admins read linked text log" ON public.vaccine_sms_deliveries;
CREATE POLICY "clinic admins read linked text log" ON public.vaccine_sms_deliveries FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clinic_parent_links l WHERE l.parent_household_id = vaccine_sms_deliveries.household_id AND public.clinic_role_for(l.clinic_household_id) = 'admin'));

DROP POLICY IF EXISTS "clinic admin read invited households" ON public.households;
CREATE POLICY "clinic admin read invited households" ON public.households FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clinic_parent_links l WHERE l.parent_household_id = households.id AND public.clinic_role_for(l.clinic_household_id) = 'admin'));

DROP POLICY IF EXISTS "staff read staff" ON public.clinic_staff;
CREATE POLICY "staff read staff" ON public.clinic_staff FOR SELECT TO authenticated
  USING (public.clinic_role_for(clinic_household_id) IS NOT NULL);
DROP POLICY IF EXISTS "admins add staff" ON public.clinic_staff;
CREATE POLICY "admins add staff" ON public.clinic_staff FOR INSERT TO authenticated
  WITH CHECK (role = 'staff' AND added_by = auth.uid() AND public.clinic_role_for(clinic_household_id) = 'admin');
DROP POLICY IF EXISTS "admins remove staff" ON public.clinic_staff;
CREATE POLICY "admins remove staff" ON public.clinic_staff FOR DELETE TO authenticated
  USING (role = 'staff' AND public.clinic_role_for(clinic_household_id) = 'admin');

DROP POLICY IF EXISTS "household and clinic read text consent" ON public.parent_text_consents;
CREATE POLICY "household and clinic read text consent" ON public.parent_text_consents FOR SELECT TO authenticated
  USING (public.is_household_member(household_id) OR EXISTS (SELECT 1 FROM public.clinic_parent_links l WHERE l.parent_household_id = parent_text_consents.household_id AND public.clinic_role_for(l.clinic_household_id) IS NOT NULL));