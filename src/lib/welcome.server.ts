import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { sendWelcomeSms } from './egosms.server';
import { sendTemplateEmail } from './email-templates/send-email';

export async function processFamilyWelcomes(householdId?: string) {
  let query = supabaseAdmin.from('family_welcome_deliveries').select('*').eq('status', 'pending').order('created_at').limit(10);
  if (householdId) query = query.eq('household_id', householdId);
  const { data: rows, error } = await query;
  if (error) throw new Error('Could not read welcome queue');
  let sent = 0;
  for (const row of rows ?? []) {
    const { data: claimed, error: claimError } = await supabaseAdmin.from('family_welcome_deliveries').update({ status: 'processing' }).eq('id', row.id).eq('status', 'pending').select('id').maybeSingle();
    if (claimError || !claimed) continue;
    try {
      let status = 'sent';
      if (row.channel === 'sms') await sendWelcomeSms(row.recipient);
      else {
        const result = await sendTemplateEmail('welcome', row.recipient, { idempotencyKey: `family-welcome-${row.id}` });
        if (!result.sent) status = 'suppressed';
      }
      const { error: saveError } = await supabaseAdmin.from('family_welcome_deliveries').update({ status, processed_at: new Date().toISOString() }).eq('id', row.id);
      if (saveError) throw new Error('Could not record welcome delivery');
      if (status === 'sent') sent++;
    } catch {
      // No automatic SMS retries: an interrupted request may already have sent.
      await supabaseAdmin.from('family_welcome_deliveries').update({ status: 'failed', processed_at: new Date().toISOString() }).eq('id', row.id);
      console.error('Family welcome delivery requires review', row.id);
    }
  }
  return { sent };
}