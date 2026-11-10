import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { requireClinicOwner } from './clinic-profile';
import { childrenForParent } from './parent-vaccines';
import { isOverdue } from './data';
import type { State } from './store';

export const getClinicFamilies = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const clinic = await context.supabase.rpc('my_clinic');
  if (!clinic.data) throw new Error('Clinic could not be loaded');
  const role = await context.supabase.rpc('clinic_role_for', { _hid: clinic.data });
  requireClinicOwner(role.data);
  const links = await context.supabase.from('clinic_parent_links').select('parent_email, parent_household_id').eq('clinic_household_id', clinic.data);
  if (links.error) throw new Error('Parents could not be loaded');
  const ids = (links.data ?? []).flatMap((link) => link.parent_household_id ? [link.parent_household_id] : []);
  const households = ids.length ? await context.supabase.from('households').select('id, data').in('id', ids) : { data: [], error: null };
  if (households.error) throw new Error('Family records could not be loaded');
  const texts = ids.length ? await context.supabase.from('vaccine_sms_deliveries').select('household_id, member_id, dose_id, due_date, status, processed_at, parent_confirmed_at').in('household_id', ids) : { data: [], error: null };
  if (texts.error) throw new Error('Text log could not be loaded');
  const messages = ids.length ? await context.supabase.from('clinic_messages').select('id, household_id, child_name, body, read_at, created_at').in('household_id', ids).order('created_at', { ascending: false }).limit(100) : { data: [], error: null };
  if (messages.error) throw new Error('Messages could not be loaded');
  const today = new Date().toISOString().slice(0, 10);
  const families = (links.data ?? []).map((link) => {
    const saved = households.data?.find((row) => row.id === link.parent_household_id)?.data as Partial<State> | undefined;
    return { email: link.parent_email, name: saved?.profile ? `${saved.profile.firstName} ${saved.profile.lastName}`.trim() : '', registered: !!saved?.profile?.firstName, children: childrenForParent(saved?.members ?? []).map((child) => ({ id: child.id, name: child.name, overdue: (child.schedule ?? []).filter((dose) => isOverdue(dose, today)).map((dose) => ({ id: dose.id, vaccine: dose.vaccine, dueDate: dose.dueDate })),
      doses: (child.schedule ?? []).filter((dose) => dose.confirmedBy).map((dose) => {
        const text = texts.data?.find((t) => t.household_id === link.parent_household_id && t.member_id === child.id && t.dose_id === dose.id && t.due_date === dose.dueDate);
        return { id: dose.id, vaccine: dose.vaccine, dueDate: dose.dueDate, confirmedBy: dose.confirmedBy, givenOn: dose.givenOn ?? null, overdue: isOverdue(dose, today), textApproved: !!dose.textApprovedBy && dose.textApprovedFor === dose.dueDate, textStatus: text?.status ?? null, textSentAt: text?.processed_at ?? null, textConfirmedAt: text?.parent_confirmed_at ?? null };
      }) })) };
  });
  const names = new Map(families.map((f, i) => [links.data?.[i]?.parent_household_id ?? '', f.name || f.email]));
  return { families, messages: (messages.data ?? []).map((m) => ({ id: m.id, from: names.get(m.household_id) ?? 'Parent', childName: m.child_name, body: m.body, readAt: m.read_at, createdAt: m.created_at })) };
});