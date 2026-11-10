CREATE OR REPLACE FUNCTION public.guard_household_clinic_details()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE previous_clinic jsonb;
BEGIN
 IF TG_OP = 'UPDATE' THEN previous_clinic := OLD.data->'familyClinic'; END IF;
 IF (NEW.data->'familyClinic') IS DISTINCT FROM previous_clinic
    AND public.clinic_role() IS DISTINCT FROM 'admin' THEN
   RAISE EXCEPTION 'Only clinic administrators can change clinic details' USING ERRCODE = '42501';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER administrator_only_clinic_details BEFORE INSERT OR UPDATE ON public.households FOR EACH ROW EXECUTE FUNCTION public.guard_household_clinic_details();