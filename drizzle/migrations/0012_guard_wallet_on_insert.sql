CREATE OR REPLACE FUNCTION public.guard_household_wallet() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF TG_OP = 'INSERT' AND coalesce((NEW.data->>'wallet')::numeric, 0) > 0 THEN
      NEW.data := jsonb_set(coalesce(NEW.data, '{}'::jsonb), '{wallet}', '0'::jsonb);
    ELSIF TG_OP = 'UPDATE' AND coalesce((NEW.data->>'wallet')::numeric, 0) > coalesce((OLD.data->>'wallet')::numeric, 0) THEN
      RAISE EXCEPTION 'Wallet balance can only increase after a confirmed payment';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_household_wallet ON public.households;
CREATE TRIGGER guard_household_wallet BEFORE INSERT OR UPDATE ON public.households FOR EACH ROW EXECUTE FUNCTION public.guard_household_wallet();