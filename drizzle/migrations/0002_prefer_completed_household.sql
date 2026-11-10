CREATE OR REPLACE FUNCTION public.my_household() RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public AS $function$
DECLARE hid uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
 SELECT m.household_id INTO hid FROM public.household_members m JOIN public.households h ON h.id=m.household_id WHERE m.user_id=auth.uid() ORDER BY (coalesce(h.data->'profile'->>'firstName','') <> '') DESC, m.created_at, m.household_id LIMIT 1;
 IF hid IS NULL THEN
  INSERT INTO public.households(owner_id) VALUES (auth.uid()) RETURNING id INTO hid;
  INSERT INTO public.household_members(household_id,user_id,role) VALUES(hid,auth.uid(),'owner');
 END IF;
 RETURN hid;
END $function$;
REVOKE EXECUTE ON FUNCTION public.my_household() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_household() TO authenticated;