import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const deliverFamilyWelcome = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: householdId, error } = await context.supabase.rpc('my_household');
    if (error || !householdId) throw new Error('Family account unavailable');
    const { processFamilyWelcomes } = await import('./welcome.server');
    return processFamilyWelcomes(householdId);
  });