ALTER TABLE public.clinic_staff ADD COLUMN occupation text NOT NULL DEFAULT 'other';
ALTER TABLE public.clinic_staff ADD CONSTRAINT clinic_staff_occupation_valid CHECK (occupation IN ('doctor','nurse','lab_assistant','pharmacist','other'));
CREATE TABLE public.clinic_parent_links (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), clinic_household_id uuid NOT NULL REFERENCES public.households(id), parent_email text NOT NULL, parent_household_id uuid REFERENCES public.households(id), created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(clinic_household_id,parent_email));
GRANT SELECT, INSERT ON public.clinic_parent_links TO authenticated;
GRANT ALL ON public.clinic_parent_links TO service_role;
ALTER TABLE public.clinic_parent_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clinic administrators read linked parents" ON public.clinic_parent_links FOR SELECT TO authenticated USING (public.clinic_role()='admin' AND public.is_household_member(clinic_household_id));
CREATE POLICY "clinic staff invite linked parents" ON public.clinic_parent_links FOR INSERT TO authenticated WITH CHECK (public.clinic_role() IS NOT NULL AND public.is_household_member(clinic_household_id) AND created_by=auth.uid());
CREATE OR REPLACE FUNCTION public.accept_pending_clinic_links() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE hid uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
 hid:=public.my_household();
 UPDATE public.clinic_parent_links SET parent_household_id=hid WHERE parent_email=lower(coalesce(auth.jwt()->>'email','')) AND parent_household_id IS NULL;
END; $$;
REVOKE ALL ON FUNCTION public.accept_pending_clinic_links() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_pending_clinic_links() TO authenticated;
CREATE POLICY "clinic admin read invited households" ON public.households FOR SELECT TO authenticated USING (public.clinic_role()='admin' AND EXISTS (SELECT 1 FROM public.clinic_parent_links l WHERE l.parent_household_id=households.id AND public.is_household_member(l.clinic_household_id)));
CREATE OR REPLACE FUNCTION public.parent_clinic_contacts() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT h.data->'familyClinic' FROM public.clinic_parent_links l JOIN public.households h ON h.id=l.clinic_household_id WHERE l.parent_household_id IN (SELECT m.household_id FROM public.household_members m WHERE m.user_id=auth.uid()) ORDER BY l.created_at DESC LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.parent_clinic_contacts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.parent_clinic_contacts() TO authenticated;