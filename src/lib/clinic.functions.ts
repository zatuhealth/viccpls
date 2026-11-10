import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { clinicProfileSchema, requireClinicOwner } from './clinic-profile';
import { staffInviteSchema } from './clinic-staff-roles';

const inviteInput = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

/** Clinic staff email a parent a one-time sign-in link that opens their own family dashboard. */
export const sendParentInvite = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inviteInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: hid } = await context.supabase.rpc('my_clinic');
    if (!hid) throw new Error('Only clinic staff can invite parents');
    if (data.email.endsWith('@phone.zatuhealth.com')) throw new Error('Use a real email address');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    // Make sure the parent has an account (their own, empty household is created on first sign-in).
    const created = await supabaseAdmin.auth.admin.createUser({ email: data.email, email_confirm: true });
    if (created.error && !/already|registered|exists/i.test(created.error.message)) throw new Error('Could not prepare the parent account');
    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({ type: 'magiclink', email: data.email, options: { redirectTo: 'https://zatuhealth.com/auth?next=%2Ffamily' } });
    if (error || !link.properties?.action_link) throw new Error('Could not create the sign-in link');
    const linked = await context.supabase.from('clinic_parent_links').insert({ clinic_household_id: hid, parent_email: data.email, created_by: context.userId });
    if (linked.error && linked.error.code !== '23505') throw new Error('Could not link parent invitation to your clinic');
    const { data: h } = await supabaseAdmin.from('households').select('data').eq('id', hid).maybeSingle();
    const clinic = ((h?.data ?? {}) as { familyClinic?: { name?: string } }).familyClinic?.name ?? '';
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email');
    const r = await sendTemplateEmail('parent-invite', data.email, { templateData: { link: link.properties.action_link, clinic }, idempotencyKey: `parent-invite-${data.email}-${Date.now()}` });
    return { sent: r.sent };
  });

export const saveClinicProfile = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => clinicProfileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const household = await context.supabase.rpc('my_clinic');
    if (household.error || !household.data) throw new Error('Could not find your clinic profile');
    const role = await context.supabase.rpc('clinic_role_for', { _hid: household.data });
    if (role.error) throw new Error('Could not check clinic access');
    requireClinicOwner(role.data);
    const current = await context.supabase.from('households').select('data, updated_at').eq('id', household.data).single();
    if (current.error) throw new Error('Could not read your clinic profile');
    const saved = await context.supabase.from('households').update({ data: { ...(current.data.data as Record<string, any>), familyClinic: data } }).eq('id', household.data).eq('updated_at', current.data.updated_at).select('id').maybeSingle();
    if (saved.error || !saved.data) throw new Error('Profile changed while saving. Refresh and try again.');
    return data;
  });

export const inviteClinicStaff = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => staffInviteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const household = await context.supabase.rpc('my_clinic');
    if (household.error || !household.data) throw new Error('Could not find your clinic');
    const role = await context.supabase.rpc('clinic_role_for', { _hid: household.data });
    if (role.error) throw new Error('Could not check clinic access');
    requireClinicOwner(role.data);
    if (data.email.endsWith('@phone.zatuhealth.com')) throw new Error('Use a real staff email address');
    const existing = await context.supabase.from('clinic_staff').select('id, created_at, occupation').eq('email', data.email).maybeSingle();
    if (existing.error) throw new Error('Could not check staff list');
    let staff = existing.data;
    if (!staff) {
      const added = await context.supabase.from('clinic_staff').insert({ email: data.email, role: 'staff', occupation: data.occupation, added_by: context.userId, clinic_household_id: household.data }).select('id, created_at, occupation').single();
      if (added.error) throw new Error('Could not add clinic staff');
      staff = added.data;
    }
    if (!staff) throw new Error('Could not find staff record');
    const saved = await context.supabase.from('households').select('data').eq('id', household.data).maybeSingle();
    const clinic = ((saved.data?.data ?? {}) as { familyClinic?: { name?: string } }).familyClinic?.name ?? '';
    // One-time email link proves the staff member owns this mailbox before access binds to their account.
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    await supabaseAdmin.auth.admin.createUser({ email: data.email, email_confirm: true });
    const generated = await supabaseAdmin.auth.admin.generateLink({ type: 'magiclink', email: data.email, options: { redirectTo: 'https://zatuhealth.com/admin/clinic' } });
    const link = generated.data?.properties?.action_link;
    if (generated.error || !link) throw new Error('Staff access was added, but the sign-in link could not be created. Try again.');
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email');
    try {
      const result = await sendTemplateEmail('clinic-staff-invite', data.email, { templateData: { clinic, occupation: staff.occupation, link }, idempotencyKey: `clinic-staff-invite-${staff.id}-${Date.now()}` });
      return { added: true, sent: result.sent };
    } catch { throw new Error('Staff access was added, but the invitation email could not be sent. Try again.'); }
  });
