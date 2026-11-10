import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { clinicProfileSchema, type ClinicProfile } from './clinic-profile';
import { useStore } from './store';

export function useParentClinic() {
  const { s, householdId } = useStore();
  const [linked, setLinked] = useState<ClinicProfile | null>(null);
  useEffect(() => {
    let active = true;
    setLinked(null);
    if (householdId) void supabase.rpc('parent_clinic_contacts').then(({ data }) => { const parsed = clinicProfileSchema.safeParse(data); if (active && parsed.success) setLinked(parsed.data); });
    return () => { active = false; };
  }, [householdId]);
  return linked ?? s.familyClinic;
}