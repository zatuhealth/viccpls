CREATE TABLE public.clinic_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  child_name text NOT NULL DEFAULT '',
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.clinic_messages TO authenticated;
GRANT ALL ON public.clinic_messages TO service_role;
ALTER TABLE public.clinic_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parents send own messages" ON public.clinic_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_household_member(household_id) AND read_at IS NULL);
CREATE POLICY "parents read own messages" ON public.clinic_messages FOR SELECT TO authenticated
  USING (public.is_household_member(household_id));
CREATE POLICY "clinic admins read linked messages" ON public.clinic_messages FOR SELECT TO authenticated
  USING (public.clinic_role() = 'admin' AND EXISTS (SELECT 1 FROM public.clinic_parent_links l WHERE l.parent_household_id = clinic_messages.household_id AND public.is_household_member(l.clinic_household_id)));
CREATE OR REPLACE FUNCTION public.mark_clinic_message_read(_id uuid) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.clinic_messages m SET read_at = now()
  WHERE m.id = _id AND m.read_at IS NULL AND public.clinic_role() = 'admin'
    AND EXISTS (SELECT 1 FROM public.clinic_parent_links l WHERE l.parent_household_id = m.household_id AND public.is_household_member(l.clinic_household_id));
$$;
REVOKE ALL ON FUNCTION public.mark_clinic_message_read(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.mark_clinic_message_read(uuid) TO authenticated;