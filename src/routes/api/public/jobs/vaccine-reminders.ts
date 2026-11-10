import { createFileRoute } from '@tanstack/react-router';
import { authenticateCronRequest } from '@/integrations/supabase/cron-auth';
import { dueForReminder, overdueForReminder, type Member } from '@/lib/data';
import { overdueSmsEligible, overdueSmsText } from '@/lib/overdue-sms';
import { clinicEmailDetails } from '@/lib/clinic-profile';

export const Route = createFileRoute('/api/public/jobs/vaccine-reminders')({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { sendTemplateEmail } = await import('@/lib/email-templates/send-email');
        const { sendSms } = await import('@/lib/egosms.server');
        const today = new Date().toISOString().slice(0, 10);
        const { data: rows, error } = await supabaseAdmin.from('households').select('id, data, updated_at');
        if (error) return Response.json({ error: 'Could not read households' }, { status: 500 });
        // Invited parents inherit the inviting clinic's saved contact details when they have none of their own.
        const { data: links } = await supabaseAdmin.from('clinic_parent_links').select('clinic_household_id, parent_household_id');
        type ClinicInfo = { name?: string; phone?: string; address?: string };
        const clinicById = new Map((rows ?? []).map((r) => [r.id, ((r.data ?? {}) as { familyClinic?: ClinicInfo }).familyClinic]));
        const linkedClinic = new Map<string, ClinicInfo>();
        for (const l of links ?? []) { const c = clinicById.get(l.clinic_household_id); if (l.parent_household_id && c?.name && !linkedClinic.has(l.parent_household_id)) linkedClinic.set(l.parent_household_id, c); }
        const clinicFor = (id: string, d: { familyClinic?: ClinicInfo }) => (d.familyClinic?.name ? d.familyClinic : linkedClinic.get(id));
        let sent = 0;
        let textsAccepted = 0;
        for (const row of rows ?? []) {
          const data = (row.data ?? {}) as { profile?: { email?: string; phone?: string }; overdueSmsEnabled?: boolean; members?: Member[]; familyClinic?: { name?: string; phone?: string; address?: string } };
          const to = data.profile?.email ?? '';
          const canEmail = /^\S+@\S+\.\S+$/.test(to) && !to.endsWith('@phone.zatuhealth.com');
          let changed = false;
          for (const m of data.members ?? []) {
            for (const e of canEmail ? dueForReminder(m.schedule, today) : []) {
              try {
                const r = await sendTemplateEmail('vaccine-due-soon', to, { templateData: { vaccine: e.vaccine, dueDate: e.dueDate, member: m.name, clinician: e.confirmedBy }, idempotencyKey: `vaccine-due-${row.id}-${m.id}-${e.id}` });
                e.remindedAt = new Date().toISOString(); changed = true; if (r.sent) sent++;
              } catch (err) { console.error('vaccine reminder failed', row.id, err); }
            }
            for (const e of canEmail ? overdueForReminder(m.schedule, today) : []) {
              try {
                const r = await sendTemplateEmail('vaccine-overdue', to, { templateData: { vaccine: e.vaccine, dueDate: e.dueDate, member: m.name, ...clinicEmailDetails(clinicFor(row.id, data)) }, idempotencyKey: `vaccine-overdue-${row.id}-${m.id}-${e.id}-${e.dueDate}` });
                e.overdueRemindedAt = new Date().toISOString(); changed = true; if (r.sent) sent++;
              } catch (err) { console.error('overdue reminder failed', row.id, err); }
            }
            for (const e of m.schedule ?? []) {
              const phone = data.profile?.phone ?? '';
              const clinicName = clinicFor(row.id, data)?.name ?? '';
              if (!overdueSmsEligible(e, today, data.overdueSmsEnabled === true, phone, clinicName)) continue;
              // The unique insert is the atomic claim. Never send after a failed claim.
              const claim = await supabaseAdmin.from('vaccine_sms_deliveries').insert({ household_id: row.id, member_id: m.id, dose_id: e.id, due_date: e.dueDate }).select('id').single();
              if (claim.error) {
                if (claim.error.code !== '23505') return Response.json({ error: 'Could not claim vaccine text' }, { status: 500 });
                continue;
              }
              if (!claim.data) return Response.json({ error: 'Missing vaccine text claim' }, { status: 500 });
              // Re-read before sending so doses logged or opt-outs during the run are respected.
              const current = await supabaseAdmin.from('households').select('data').eq('id', row.id).single();
              if (current.error) return Response.json({ error: 'Could not check vaccine text' }, { status: 500 });
              const latest = current.data?.data as typeof data;
              const latestDose = latest.members?.find((member) => member.id === m.id)?.schedule?.find((dose) => dose.id === e.id);
              let status: 'accepted' | 'failed' | 'unknown' = 'failed';
              if (latestDose && latestDose.dueDate === e.dueDate && overdueSmsEligible(latestDose, today, latest.overdueSmsEnabled === true, latest.profile?.phone ?? '', clinicFor(row.id, latest)?.name ?? '')) {
                try {
                  await sendSms(latest.profile?.phone ?? '', overdueSmsText({ name: clinicFor(row.id, latest)?.name ?? '', ...(clinicFor(row.id, latest)?.phone ? { phone: clinicFor(row.id, latest)?.phone ?? '' } : {}) }));
                  status = 'accepted'; textsAccepted++;
                } catch { status = 'unknown'; console.error('Vaccine text outcome unconfirmed', claim.data.id); }
              }
              const marked = await supabaseAdmin.from('vaccine_sms_deliveries').update({ status, processed_at: new Date().toISOString() }).eq('id', claim.data.id);
              if (marked.error) return Response.json({ error: 'Could not record vaccine text outcome' }, { status: 500 });
            }
          }
          if (changed) {
            // Do not overwrite a caregiver's dose/date/preference edit made during delivery.
            const saved = await supabaseAdmin.from('households').update({ data: data as never }).eq('id', row.id).eq('updated_at', row.updated_at);
            if (saved.error) return Response.json({ error: 'Could not save reminder status' }, { status: 500 });
          }
        }
        return Response.json({ success: true, sent, textsAccepted });
      },
    },
  },
});
