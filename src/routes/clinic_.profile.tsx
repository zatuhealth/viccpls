import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Eye, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/lib/store';
import { clinicProfileSchema } from '@/lib/clinic-profile';
import { saveClinicProfile } from '@/lib/clinic.functions';
import { defaultClinicHours } from '@/lib/clinic-directory';
import { countryCodeForName, internationalPhone, phoneParts } from '@/lib/countries';
import { PhoneField } from '@/components/country-fields';
import { ClinicContact } from '@/components/clinic-contact';
import { ClinicStaffPanel } from '@/components/clinic-staff';
import { ClinicTextConsents } from '@/components/clinic-text-consents';
import { Button } from '@/components/ui/button';
import { field } from '@/components/zatu';

export const Route = createFileRoute('/clinic_/profile')({
  ssr: false,
  staticData: { sitemap: false },
  beforeLoad: async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw redirect({ to: '/clinic/login' });
    const role = await supabase.rpc('clinic_role');
    if (!role.data) throw redirect({ to: '/clinic/login' });
    return { clinicRole: role.data };
  },
  head: () => ({ meta: [{ title: 'Edit clinic profile – ZatuHealth' }, { name: 'description', content: 'Manage your saved clinic contacts, opening hours and staff access with a parent-facing preview.' }, { property: 'og:title', content: 'ZatuHealth clinic profile editor' }, { property: 'og:description', content: 'Private clinic profile and staff access management.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: ClinicProfilePage,
});
function ClinicProfilePage() {
  const { loading } = useStore();
  return <main className="mx-auto max-w-5xl px-4 py-8"><Link to="/clinic" className="font-semibold text-primary">← Clinic dashboard</Link><h1 className="my-5 text-3xl font-bold">Clinic profile</h1>{loading ? <p>Loading clinic details…</p> : <ProfileEditor />}<ClinicStaffPanel /><ClinicTextConsents /></main>;
}
function ProfileEditor() {
  const { s } = useStore();
  const { clinicRole } = Route.useRouteContext();
  const submitProfile = useServerFn(saveClinicProfile);
  const [draft, setDraft] = useState(s.familyClinic ?? { name: '', address: '', phone: '', hours: defaultClinicHours });
  const [phone, setPhone] = useState(() => phoneParts(draft.phone, countryCodeForName(s.profile?.country ?? 'Uganda')));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const preview = { ...draft, phone: internationalPhone(phone.number, phone.country) };
  const editable = clinicRole === 'admin';
  return <div className="grid gap-8 border-y py-6 md:grid-cols-2"><form onSubmit={async (event) => { event.preventDefault(); const parsed = clinicProfileSchema.safeParse(preview); if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? 'Check clinic details'); return; } setBusy(true); try { await submitProfile({ data: parsed.data }); setSaved(true); toast.success('Clinic details saved'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save profile'); } finally { setBusy(false); } }} className="space-y-4"><fieldset disabled={!editable || busy} className="space-y-4"><label className="block text-sm">Clinic name<input required maxLength={150} className={field} value={draft.name} onChange={(event) => { setDraft({ ...draft, name: event.target.value }); setSaved(false); }} /></label><label className="block text-sm">Address<textarea required maxLength={300} className={field} value={draft.address} onChange={(event) => { setDraft({ ...draft, address: event.target.value }); setSaved(false); }} /></label><PhoneField label="Clinic phone" country={phone.country} number={phone.number} onCountryChange={(country) => { setPhone({ ...phone, country }); setSaved(false); }} onNumberChange={(number) => { setPhone({ ...phone, number }); setSaved(false); }} /><label className="block text-sm">Opening hours and date exceptions<textarea required rows={4} maxLength={1000} className={field} value={draft.hours} onChange={(event) => { setDraft({ ...draft, hours: event.target.value }); setSaved(false); }} /></label><Button type="submit"><Save />{busy ? 'Saving…' : 'Save clinic profile'}</Button></fieldset>{saved && <p role="status" className="text-sm text-primary">Saved to your family’s clinic details.</p>}{!editable && <p className="text-sm text-muted-foreground">Only the clinic owner can change these details.</p>}</form><section aria-label="Parent clinic preview" className="border-l pl-6"><h2 className="mb-4 flex items-center gap-2 font-semibold text-muted-foreground"><Eye className="size-4" />Parent preview · {saved ? 'Saved' : 'Unsaved'}</h2><ClinicContact clinic={preview} /><Button asChild variant="outline" className="mt-6"><Link to="/family">Open parent dashboard</Link></Button></section></div>;
}