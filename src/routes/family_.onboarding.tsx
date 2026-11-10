import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/lib/store';
import { validateChildRegistration } from '@/lib/parent-consent';
import { ClinicContact } from '@/components/clinic-contact';
import { Button } from '@/components/ui/button';
import { field } from '@/components/zatu';
import { useParentClinic } from '@/lib/use-parent-clinic';

export const Route = createFileRoute('/family_/onboarding')({
  ssr: false, staticData: { sitemap: false },
  beforeLoad: async () => { const user = await supabase.auth.getUser(); if (!user.data.user) throw redirect({ to: '/auth', search: { next: '/family' } }); },
  head: () => ({ meta: [{ title: 'Register your child – ZatuHealth Family' }, { name: 'description', content: 'Register your child and confirm administrator-provided clinic contacts.' }, { property: 'og:title', content: 'ZatuHealth child registration' }, { property: 'og:description', content: 'Private parent onboarding and clinic confirmation.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: ParentOnboarding,
});
function ParentOnboarding() {
  const { s, save, loading } = useStore();
  const clinic = useParentClinic();
  const [form, setForm] = useState({ name: '', dob: '', gender: 'Male', relationship: 'Son' });
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  if (loading) return <main className="p-6">Loading…</main>;
  if (!s.profile?.firstName) return <main className="mx-auto max-w-xl space-y-4 p-6"><h1 className="text-2xl font-bold">Complete your parent profile</h1><Button asChild><Link to="/onboarding">Continue signup</Link></Button></main>;
  return <main className="mx-auto max-w-xl space-y-6 px-4 py-8"><Link to="/family" className="text-primary">← Parent dashboard</Link><h1 className="text-3xl font-bold">Register your child</h1><form className="space-y-5" onSubmit={async (event) => { event.preventDefault(); setBusy(true); try { validateChildRegistration(form.name, form.dob, new Date().toISOString().slice(0, 10)); if (clinic && !confirmed) throw new Error('Confirm your clinic details before continuing'); await save((state) => ({ ...state, members: [...state.members, { id: crypto.randomUUID(), name: form.name.trim(), dob: form.dob, gender: form.gender, relationship: form.relationship, kind: 'human', country: state.profile?.country ?? 'Uganda', state: state.profile?.state ?? '', center: clinic?.name ?? '', ...(clinic ? { hospital: clinic.name } : {}) }], ...(clinic && confirmed ? { clinicConfirmation: { clinic, confirmedAt: new Date().toISOString() } } : {}) })); toast.success('Child registered'); setForm({ ...form, name: '', dob: '' }); } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not register child'); } finally { setBusy(false); } }}><label className="block text-sm">Child’s full name<input required maxLength={100} className={field} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="block text-sm">Date of birth<input required type="date" max={new Date().toISOString().slice(0, 10)} className={field} value={form.dob} onChange={(event) => setForm({ ...form, dob: event.target.value })} /></label><div className="grid grid-cols-2 gap-3"><label className="text-sm">Relationship<select className={field} value={form.relationship} onChange={(event) => setForm({ ...form, relationship: event.target.value })}><option>Son</option><option>Daughter</option><option>Child</option><option>Dependent</option></select></label><label className="text-sm">Gender<select className={field} value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}><option>Male</option><option>Female</option></select></label></div><section className="space-y-4 border-y py-5"><h2 className="text-xl font-bold">Confirm your clinic</h2>{clinic ? <><ClinicContact clinic={clinic} /><label className="flex items-start gap-3 text-sm"><input type="checkbox" required checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />These are my child’s clinic details</label></> : <p className="text-sm text-muted-foreground">Your clinic administrator has not provided clinic details yet. You can register your child now.</p>}</section><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Register child'}</Button></form><div className="flex flex-wrap gap-3"><Button asChild variant="outline"><Link to="/family/alerts">Text alert consent</Link></Button><Button asChild variant="ghost"><Link to="/family">Done</Link></Button></div></main>;
}