CREATE TABLE public.parent_text_consents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
 actor_id uuid, phone text NOT NULL, enabled boolean NOT NULL, recorded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.parent_text_consents TO authenticated;
GRANT ALL ON public.parent_text_consents TO service_role;
ALTER TABLE public.parent_text_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "household and clinic read text consent" ON public.parent_text_consents FOR SELECT TO authenticated USING (public.is_household_member(household_id) OR public.clinic_role() IS NOT NULL);
CREATE OR REPLACE FUNCTION public.record_parent_text_consent() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE enabled_now boolean; enabled_before boolean;
BEGIN
 enabled_now := coalesce((NEW.data->>'overdueSmsEnabled')::boolean, false);
 enabled_before := coalesce((OLD.data->>'overdueSmsEnabled')::boolean, false);
 IF enabled_now IS DISTINCT FROM enabled_before OR (enabled_now AND (NEW.data->'profile'->>'phone') IS DISTINCT FROM (OLD.data->'profile'->>'phone')) THEN
  IF enabled_now AND coalesce(NEW.data->'profile'->>'phone', '') !~ '^\+[1-9][0-9]{6,14}$' THEN
   RAISE EXCEPTION 'A valid international parent phone is required for text alerts' USING ERRCODE='23514';
  END IF;
  INSERT INTO public.parent_text_consents(household_id, actor_id, phone, enabled) VALUES (NEW.id, auth.uid(), coalesce(NEW.data->'profile'->>'phone', ''), enabled_now);
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER parent_text_consent_changed AFTER UPDATE ON public.households FOR EACH ROW EXECUTE FUNCTION public.record_parent_text_consent();
INSERT INTO public.parent_text_consents(household_id, actor_id, phone, enabled) SELECT id, NULL, coalesce(data->'profile'->>'phone', ''), true FROM public.households WHERE data->>'overdueSmsEnabled' = 'true';