ALTER TABLE public.clinic_messages ADD COLUMN reply_body text, ADD COLUMN replied_at timestamptz, ADD COLUMN replied_by uuid;
CREATE TABLE public.clinic_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0 AND amount <= 10000000),
  method text NOT NULL,
  reference text NOT NULL DEFAULT '',
  recorded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.clinic_payments TO authenticated;
GRANT ALL ON public.clinic_payments TO service_role;
ALTER TABLE public.clinic_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clinic admins read linked payments" ON public.clinic_payments FOR SELECT TO authenticated
  USING (public.clinic_role() = 'admin' AND EXISTS (SELECT 1 FROM public.clinic_parent_links l WHERE l.parent_household_id = clinic_payments.household_id AND public.is_household_member(l.clinic_household_id)));
CREATE POLICY "families read own payments" ON public.clinic_payments FOR SELECT TO authenticated USING (public.is_household_member(household_id));