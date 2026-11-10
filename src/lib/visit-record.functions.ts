import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { visitRecordSchema } from './visit-record';
import type { State } from './store';
export const saveVisitRecord = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ memberId: z.string().min(1).max(100), visit: visitRecordSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: householdId } = await context.supabase.rpc('my_household');
    if (!householdId) throw new Error('Could not load family records.');
    const { data: household, error } = await context.supabase.from('households').select('id,data').eq('id', householdId).single();
    if (error || !household) throw new Error('Could not load family records.');
    const state = household.data as State;
    if (!state.members?.some((m) => m.id === data.memberId)) throw new Error('Family member not found.');
    const next = { ...state, members: state.members.map((m) => m.id === data.memberId ? { ...m, visits: [data.visit, ...(m.visits ?? []).filter((v) => v.id !== data.visit.id)] } : m) };
    const { error: updateError } = await context.supabase.from('households').update({ data: next as never, updated_at: new Date().toISOString() }).eq('id', household.id);
    if (updateError) throw new Error('Could not save visit record.');
    return { ok: true };
  });