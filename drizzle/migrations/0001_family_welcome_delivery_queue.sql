CREATE TABLE public.family_welcome_deliveries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
 channel text NOT NULL CHECK (channel IN ('sms', 'email')),
 recipient text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','sent','failed','suppressed')),
 created_at timestamptz NOT NULL DEFAULT now(),
 processed_at timestamptz,
 UNIQUE (household_id, channel)
);
GRANT ALL ON public.family_welcome_deliveries TO service_role;
ALTER TABLE public.family_welcome_deliveries ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.queue_family_welcome() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF coalesce(OLD.data->'profile'->>'firstName','') = '' AND coalesce(NEW.data->'profile'->>'firstName','') <> '' THEN
  IF coalesce(NEW.data->'profile'->>'phone','') ~ '^\+[1-9][0-9]{6,14}$' THEN
   INSERT INTO public.family_welcome_deliveries(household_id,channel,recipient) VALUES (NEW.id,'sms',NEW.data->'profile'->>'phone') ON CONFLICT DO NOTHING;
  END IF;
  IF coalesce(NEW.data->'profile'->>'email','') ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' AND (NEW.data->'profile'->>'email') NOT LIKE '%@phone.zatuhealth.com' THEN
   INSERT INTO public.family_welcome_deliveries(household_id,channel,recipient) VALUES (NEW.id,'email',NEW.data->'profile'->>'email') ON CONFLICT DO NOTHING;
  END IF;
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.queue_family_welcome() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER family_welcome_after_profile AFTER UPDATE OF data ON public.households FOR EACH ROW EXECUTE FUNCTION public.queue_family_welcome();