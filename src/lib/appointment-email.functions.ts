import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { providers } from './data';
import type { State } from './store';

export const sendAppointmentConfirmation = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ appointmentId: z.string().min(1).max(100) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: householdId } = await context.supabase.rpc('my_household');
    if (!householdId) return { sent: false, message: 'Appointment saved, but its email could not be prepared.' };
    const { data: household, error } = await context.supabase.from('households').select('data').eq('id', householdId).single();
    if (error) return { sent: false, message: 'Appointment saved, but its email could not be prepared.' };
    const state = household.data as Partial<State>;
    const appointment = state.appointments?.find((a) => a.id === data.appointmentId && a.status === 'confirmed');
    if (!appointment) return { sent: false, message: 'A saved appointment is required before sending confirmation.' };
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData.user?.email;
    if (!email || email.endsWith('@phone.zatuhealth.com')) return { sent: false, message: 'Appointment saved. An email account is needed for confirmation emails.' };
    const { configuredFromDomain, sendTemplateEmail } = await import('./email-templates/send-email');
    if (!configuredFromDomain.endsWith('zatuhealth.com')) return { sent: false, message: 'Appointment saved. Confirmation email is waiting for ZatuHealth sender setup.' };
    const provider = providers.find((p) => p.id === appointment.providerId);
    try {
      const result = await sendTemplateEmail('appointment-confirmation', email, { idempotencyKey: `appointment-confirmation-${appointment.id}`, templateData: { date: appointment.date, time: appointment.time, clinic: provider?.business ?? 'Your clinic', branch: appointment.branch, mode: appointment.mode } });
      return { sent: result.sent, message: result.sent ? 'Appointment saved. Confirmation email sent.' : 'Appointment saved. Email delivery is unavailable for this address.' };
    } catch { return { sent: false, message: 'Appointment saved. Confirmation email could not be sent; check email setup.' }; }
  });