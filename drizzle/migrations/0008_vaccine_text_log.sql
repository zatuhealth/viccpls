ALTER TABLE public.vaccine_sms_deliveries ADD COLUMN IF NOT EXISTS parent_confirmed_at timestamptz;

CREATE POLICY "clinic admins read linked text log" ON public.vaccine_sms_deliveries FOR SELECT TO authenticated
USING (public.clinic_role() = 'admin' AND EXISTS (SELECT 1 FROM public.clinic_parent_links l WHERE l.parent_household_id = vaccine_sms_deliveries.household_id AND public.is_household_member(l.clinic_household_id)));

CREATE OR REPLACE FUNCTION public.confirm_vaccine_text(_id uuid) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.vaccine_sms_deliveries SET parent_confirmed_at = now()
  WHERE id = _id AND status = 'accepted' AND parent_confirmed_at IS NULL AND public.is_household_member(household_id);
$$;
REVOKE ALL ON FUNCTION public.confirm_vaccine_text(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.confirm_vaccine_text(uuid) TO authenticated;