import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { requireClinicOwner } from './clinic-profile';
import type { Database } from '@/integrations/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Confirms the caller is a clinic admin and returns the parent households linked to their clinic. */
async function linkedFamilies(supabase: SupabaseClient<Database>) {
  const clinic = await supabase.rpc('my_clinic');
  if (!clinic.data) throw new Error('Clinic could not be loaded');
  const role = await supabase.rpc('clinic_role_for', { _hid: clinic.data });
  requireClinicOwner(role.data);
  const links = await supabase.from('clinic_parent_links').select('parent_email, parent_household_id').eq('clinic_household_id', clinic.data);
  if (links.error) throw new Error('Families could not be loaded');
  return { clinicId: clinic.data, links: (links.data ?? []).filter((l): l is { parent_email: string; parent_household_id: string } => !!l.parent_household_id) };
}

const familyName = (data: unknown, fallback: string) => {
  const p = (data as { profile?: { firstName?: string; lastName?: string } } | null)?.profile;
  return `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim() || fallback;
};

export const getClinicInbox = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { links } = await linkedFamilies(context.supabase);
  const ids = links.map((l) => l.parent_household_id);
  if (!ids.length) return { messages: [] };
  const [msgs, hh] = await Promise.all([
    context.supabase.from('clinic_messages').select('id, household_id, child_name, body, read_at, created_at, reply_body, replied_at').in('household_id', ids).order('created_at', { ascending: false }).limit(200),
    context.supabase.from('households').select('id, data').in('id', ids),
  ]);
  if (msgs.error || hh.error) throw new Error('Inbox could not be loaded');
  return { messages: (msgs.data ?? []).map((m) => ({ id: m.id, from: familyName(hh.data?.find((h) => h.id === m.household_id)?.data, links.find((l) => l.parent_household_id === m.household_id)?.parent_email ?? 'Parent'), childName: m.child_name, body: m.body, readAt: m.read_at, createdAt: m.created_at, reply: m.reply_body, repliedAt: m.replied_at })) };
});

/** Saves a clinic reply on the message (parents see it on their dashboard) and emails the parent when they have a real email. */
export const replyToParent = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), body: z.string().trim().min(1).max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { clinicId, links } = await linkedFamilies(context.supabase);
    const msg = await context.supabase.from('clinic_messages').select('id, household_id, child_name, body').eq('id', data.id).maybeSingle();
    if (!msg.data || !links.some((l) => l.parent_household_id === msg.data!.household_id)) throw new Error('Message not found');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const now = new Date().toISOString();
    const upd = await supabaseAdmin.from('clinic_messages').update({ reply_body: data.body, replied_at: now, replied_by: context.userId, read_at: now }).eq('id', data.id);
    if (upd.error) throw new Error('Reply could not be saved');
    const [parentHh, clinicHh] = await Promise.all([
      supabaseAdmin.from('households').select('owner_id').eq('id', msg.data.household_id).single(),
      supabaseAdmin.from('households').select('data').eq('id', clinicId).single(),
    ]);
    const owner = parentHh.data ? await supabaseAdmin.auth.admin.getUserById(parentHh.data.owner_id) : null;
    const to = owner?.data.user?.email;
    if (!to || to.endsWith('@phone.zatuhealth.com')) return { saved: true, emailed: false };
    const clinicName = (clinicHh.data?.data as { familyClinic?: { name?: string } } | undefined)?.familyClinic?.name || 'Your clinic';
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email');
    try {
      const r = await sendTemplateEmail('clinic-reply', to, { templateData: { clinic: clinicName, child: msg.data.child_name, original: msg.data.body, reply: data.body }, idempotencyKey: `clinic-reply-${data.id}-${now}` });
      return { saved: true, emailed: r.sent };
    } catch (err) {
      console.error('clinic reply email failed', data.id, err);
      return { saved: true, emailed: false };
    }
  });

export const getClinicPayments = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { links } = await linkedFamilies(context.supabase);
  const ids = links.map((l) => l.parent_household_id);
  if (!ids.length) return { families: [], payments: [] };
  const [hh, pays] = await Promise.all([
    context.supabase.from('households').select('id, data').in('id', ids),
    context.supabase.from('clinic_payments').select('id, household_id, amount, method, reference, created_at').in('household_id', ids).order('created_at', { ascending: false }).limit(200),
  ]);
  if (hh.error || pays.error) throw new Error('Payments could not be loaded');
  const families = links.map((l) => { const d = hh.data?.find((h) => h.id === l.parent_household_id)?.data as { wallet?: number } | undefined; return { id: l.parent_household_id, name: familyName(d, l.parent_email), wallet: Number(d?.wallet ?? 0) }; });
  return { families, payments: (pays.data ?? []).map((p) => ({ id: p.id, family: families.find((f) => f.id === p.household_id)?.name ?? 'Family', amount: Number(p.amount), method: p.method, reference: p.reference, createdAt: p.created_at })) };
});

export const paymentInput = z.object({ householdId: z.string().uuid(), amount: z.number().int().positive().max(10_000_000), method: z.enum(['Cash', 'Mobile money', 'Card', 'Bank transfer']), reference: z.string().trim().max(100) });

/** Records a payment received by the clinic and raises that family's wallet by the same amount (server-only write). */
export const recordFamilyPayment = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => paymentInput.parse(d))
  .handler(async ({ data, context }) => {
    const { links } = await linkedFamilies(context.supabase);
    if (!links.some((l) => l.parent_household_id === data.householdId)) throw new Error('Family is not linked to this clinic');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const row = await supabaseAdmin.from('households').select('data').eq('id', data.householdId).single();
    if (row.error || !row.data) throw new Error('Family could not be loaded');
    const current = (row.data.data ?? {}) as Record<string, unknown>;
    const wallet = Number(current['wallet'] ?? 0) + data.amount;
    const pay = await supabaseAdmin.from('clinic_payments').insert({ household_id: data.householdId, amount: data.amount, method: data.method, reference: data.reference, recorded_by: context.userId }).select('id').single();
    if (pay.error) throw new Error('Payment could not be recorded');
    const upd = await supabaseAdmin.from('households').update({ data: { ...current, wallet } as never, updated_at: new Date().toISOString() }).eq('id', data.householdId);
    if (upd.error) { await supabaseAdmin.from('clinic_payments').delete().eq('id', pay.data.id); throw new Error('Wallet could not be updated'); }
    return { wallet };
  });
