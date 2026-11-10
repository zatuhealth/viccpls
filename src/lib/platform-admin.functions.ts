import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { staffOccupations } from './clinic-staff-roles';
import type { Database } from '@/integrations/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Platform owners only; checked as the caller, never via the admin client. */
async function requirePlatformAdmin(supabase: SupabaseClient<Database>) {
  const r = await supabase.rpc('is_platform_admin');
  if (r.data !== true) throw new Error('Only the platform owner can use the admin panel');
}

type HH = { familyClinic?: { name?: string; address?: string; phone?: string }; profile?: { firstName?: string; lastName?: string }; members?: unknown[] };

export const getPlatformOverview = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await requirePlatformAdmin(context.supabase);
  const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server');
  const [staff, links] = await Promise.all([
    db.from('clinic_staff').select('id, email, role, occupation, user_id, clinic_household_id, created_at').order('created_at'),
    db.from('clinic_parent_links').select('id, clinic_household_id, parent_email, parent_household_id, created_at').order('created_at', { ascending: false }),
  ]);
  if (staff.error || links.error) throw new Error('Admin data could not be loaded');
  const clinicIds = [...new Set([...(staff.data ?? []).flatMap((s) => (s.clinic_household_id ? [s.clinic_household_id] : [])), ...(links.data ?? []).map((l) => l.clinic_household_id)])];
  const parentIds = (links.data ?? []).flatMap((l) => (l.parent_household_id ? [l.parent_household_id] : []));
  const hh = clinicIds.length + parentIds.length ? await db.from('households').select('id, data').in('id', [...clinicIds, ...parentIds]) : { data: [] };
  const get = (id: string | null) => (hh.data?.find((h) => h.id === id)?.data ?? {}) as HH;
  const clinics = clinicIds.map((id) => {
    const owner = (staff.data ?? []).find((s) => s.clinic_household_id === id && s.role === 'admin');
    return { id, name: get(id).familyClinic?.name || 'Clinic profile not saved', address: get(id).familyClinic?.address ?? '', phone: get(id).familyClinic?.phone ?? '', owner: owner?.email ?? '—', parents: (links.data ?? []).filter((l) => l.clinic_household_id === id).length };
  });
  const clinicName = (id: string | null) => clinics.find((c) => c.id === id)?.name ?? 'Not activated yet';
  const parents = (links.data ?? []).map((l) => { const d = get(l.parent_household_id); return { id: l.id, email: l.parent_email, name: `${d.profile?.firstName ?? ''} ${d.profile?.lastName ?? ''}`.trim(), registered: !!d.profile?.firstName, children: d.members?.length ?? 0, clinic: clinics.find((c) => c.id === l.clinic_household_id)?.name ?? '—', invitedAt: l.created_at }; });
  return { clinics, parents, staff: (staff.data ?? []).map((s) => ({ id: s.id, email: s.email, role: s.role, occupation: s.occupation, active: !!s.user_id, clinic: clinicName(s.clinic_household_id), addedAt: s.created_at })) };
});

export const staffInput = z.object({ email: z.string().trim().toLowerCase().email().max(200), role: z.enum(['admin', 'staff']), occupation: z.enum(staffOccupations) });

/** Adds a clinic owner (admin) or staff member and emails a one-time activation link that opens /admin/clinic. */
export const addPlatformStaff = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => staffInput.parse(d))
  .handler(async ({ data, context }) => {
    await requirePlatformAdmin(context.supabase);
    const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server');
    const exists = await db.from('clinic_staff').select('id').ilike('email', data.email).maybeSingle();
    if (exists.data) throw new Error('This email already has clinic access');
    const r = await db.from('clinic_staff').insert({ email: data.email, role: data.role, occupation: data.occupation, added_by: context.userId });
    if (r.error) throw new Error('Could not add this person');
    // One-time email link proves mailbox ownership; on first sign-in their own household becomes their clinic space.
    await db.auth.admin.createUser({ email: data.email, email_confirm: true });
    const generated = await db.auth.admin.generateLink({ type: 'magiclink', email: data.email, options: { redirectTo: 'https://zatuhealth.com/admin/clinic' } });
    const link = generated.data?.properties?.action_link;
    if (generated.error || !link) throw new Error('Access was added, but the sign-in link could not be created. Try again.');
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email');
    try {
      const result = await sendTemplateEmail('clinic-staff-invite', data.email, { templateData: { clinic: 'ZatuHealth', occupation: data.occupation, link }, idempotencyKey: `platform-staff-${data.email}-${Date.now()}` });
      return { ok: true, sent: result.sent };
    } catch { throw new Error('Access was added, but the invitation email could not be sent. Try again.'); }
  });

export const removePlatformStaff = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requirePlatformAdmin(context.supabase);
    const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server');
    const row = await db.from('clinic_staff').select('user_id').eq('id', data.id).maybeSingle();
    if (row.data?.user_id === context.userId) throw new Error('You cannot remove your own access');
    const r = await db.from('clinic_staff').delete().eq('id', data.id);
    if (r.error) throw new Error('Could not remove access');
    return { ok: true };
  });
