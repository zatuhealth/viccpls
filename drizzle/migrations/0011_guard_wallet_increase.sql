CREATE OR REPLACE FUNCTION public.guard_household_wallet() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  -- Only trusted server code (no signed-in user) may raise a wallet balance; families can only spend it.
  IF auth.uid() IS NOT NULL
     AND coalesce((NEW.data->>'wallet')::numeric, 0) > coalesce((OLD.data->>'wallet')::numeric, 0) THEN
    RAISE EXCEPTION 'Wallet balance can only increase after a confirmed payment';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_household_wallet ON public.households;
CREATE TRIGGER guard_household_wallet BEFORE UPDATE ON public.households FOR EACH ROW EXECUTE FUNCTION public.guard_household_wallet();