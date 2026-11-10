import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

const input = z.object({ childName: z.string().max(100), body: z.string().trim().min(1).max(2000) });

/** Saves a parent's note to their clinic, then emails the clinic admin who invited them (reply goes to the parent). */
export const sendClinicMessage = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data, context }) => {
    const hid = await context.supabase.rpc('my_household');
    if (!hid.data) throw new Error('Family could not be loaded');
    const saved = await context.supabase.from('clinic_messages').insert({ household_id: hid.data, sender_id: context.userId, child_name: data.childName, body: data.body }).select('id').single();
    if (saved.error || !saved.data) throw new Error('Message could not be sent');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const link = await supabaseAdmin.from('clinic_parent_links').select('created_by').eq('parent_household_id', hid.data).order('created_at').limit(1).maybeSingle();
    if (!link.data) return { saved: true, emailed: false };
    const admin = await supabaseAdmin.auth.admin.getUserById(link.data.created_by);
    const to = admin.data.user?.email;
    if (!to || to.endsWith('@phone.zatuhealth.com')) return { saved: true, emailed: false };
    const email = typeof context.claims['email'] === 'string' ? context.claims['email'] : '';
    const canReply = !!email && !email.endsWith('@phone.zatuhealth.com');
    const household = await context.supabase.from('households').select('data').eq('id', hid.data).single();
    const p = (household.data?.data as { profile?: { firstName?: string; lastName?: string } } | undefined)?.profile;
    const from = `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim() || 'A parent';
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email');
    try {
      const r = await sendTemplateEmail('clinic-message', to, { templateData: { from, child: data.childName, body: data.body, canReply }, idempotencyKey: `clinic-message-${saved.data.id}`, ...(canReply ? { replyTo: email } : {}) });
      return { saved: true, emailed: r.sent };
    } catch (err) {
      console.error('clinic message email failed', saved.data.id, err);
      return { saved: true, emailed: false };
    }
  });
