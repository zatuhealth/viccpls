CREATE TABLE public.vaccine_sms_deliveries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
 member_id text NOT NULL,
 dose_id text NOT NULL,
 due_date date NOT NULL,
 status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','accepted','failed','unknown')),
 created_at timestamptz NOT NULL DEFAULT now(),
 processed_at timestamptz,
 UNIQUE(household_id, member_id, dose_id, due_date)
);
GRANT SELECT ON public.vaccine_sms_deliveries TO authenticated;
GRANT ALL ON public.vaccine_sms_deliveries TO service_role;
ALTER TABLE public.vaccine_sms_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read vaccine text status" ON public.vaccine_sms_deliveries FOR SELECT TO authenticated USING (public.is_household_member(household_id));