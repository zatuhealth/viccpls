CREATE TABLE public.clinic_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(email)),
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin','staff')),
  added_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.clinic_staff TO authenticated;
GRANT ALL ON public.clinic_staff TO service_role;
ALTER TABLE public.clinic_staff ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.clinic_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.clinic_staff WHERE email = lower(coalesce(auth.jwt()->>'email','')) LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.clinic_role() TO authenticated;

CREATE POLICY "staff read staff" ON public.clinic_staff FOR SELECT TO authenticated USING (public.clinic_role() IS NOT NULL);
CREATE POLICY "admins add staff" ON public.clinic_staff FOR INSERT TO authenticated WITH CHECK (public.clinic_role() = 'admin' AND role = 'staff' AND added_by = auth.uid());
CREATE POLICY "admins remove staff" ON public.clinic_staff FOR DELETE TO authenticated USING (public.clinic_role() = 'admin' AND role = 'staff');

INSERT INTO public.clinic_staff (email, role) VALUES ('zatupay@gmail.com', 'admin');