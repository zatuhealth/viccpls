import { MessageClinic } from '@/components/message-clinic';
import { TextLog } from '@/components/text-log';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Apple, CalendarDays, CheckCircle2, Copy, Download, LogOut, Plus, Share2, ShieldCheck, Syringe, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Logo, field } from '@/components/zatu';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/lib/store';
import { childrenForParent, recordParentDose, parentReminderSummary, parentDoseStatus } from '@/lib/parent-vaccines';
import { isOverdue, type Member, type ScheduledVaccine } from '@/lib/data';
import { ClinicDirectory } from '@/components/clinic-directory';
import { ClinicContact } from '@/components/clinic-contact';
import { useParentClinic } from '@/lib/use-parent-clinic';

export const Route = createFileRoute('/family')({
  staticData: { sitemap: false },
  ssr: false,
  head: () => ({ meta: [
    { title: 'Family vaccine dashboard – ZatuHealth' },
    { name: 'description', content: 'Your private child vaccination schedule, doses given and saved clinic contacts.' },
    { property: 'og:title', content: 'ZatuHealth Family' },
    { property: 'og:description', content: 'Sign in to your private family vaccination dashboard.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: '/auth', search: { next: '/family' } });
  },
  component: ParentFamily,
});

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
function ParentFamily() {
  const { s, loading, householdId } = useStore();
  const clinic = useParentClinic();
  const [selected, setSelected] = useState('');
  const [tab, setTab] = useState<'schedule' | 'given' | 'overdue'>('schedule');
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [installHelp, setInstallHelp] = useState(false);
  useEffect(() => {
    sessionStorage.removeItem('zatu-parent-next');
    const listener = (e: Event) => { e.preventDefault(); setInstall(e as InstallEvent); };
    window.addEventListener('beforeinstallprompt', listener);
    return () => window.removeEventListener('beforeinstallprompt', listener);
  }, []);
  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading your family…</div>;
  if (!householdId) return <div className="mx-auto max-w-lg p-6">Your family could not be loaded. Please sign in again.</div>;
  if (!s.profile?.firstName) return <div className="mx-auto max-w-lg space-y-4 p-6"><Logo className="h-9" /><h1 className="text-2xl font-bold">Complete your family profile</h1><Button asChild><Link to="/onboarding">Continue signup</Link></Button></div>;
  const children = childrenForParent(s.members);
  const child = children.find((m) => m.id === selected) ?? children[0];
  const today = new Date().toISOString().slice(0, 10);
  const reminders = parentReminderSummary(s.members, today);
  const schedule = (child?.schedule ?? []).filter((dose) => tab === 'given' ? !!dose.givenOn : tab === 'overdue' ? isOverdue(dose, today) : !dose.givenOn).sort((a, b) => (tab === 'given' ? (b.givenOn ?? '').localeCompare(a.givenOn ?? '') : a.dueDate.localeCompare(b.dueDate)));
  const given = children.reduce((n, m) => n + (m.schedule ?? []).filter((d) => d.givenOn).length, 0);
  const pending = children.reduce((n, m) => n + (m.schedule ?? []).filter((d) => !d.givenOn).length, 0);
  const share = async () => {
    const url = 'https://zatuhealth.com/family';
    try {
      if (navigator.share) await navigator.share({ title: 'ZatuHealth Family', text: 'Open your family vaccine dashboard', url });
      else { await navigator.clipboard.writeText(url); toast.success('Parent link copied'); }
    } catch { /* Share dismissal is not an error. */ }
  };
  return <div className="min-h-screen bg-background">
    <header className="border-b bg-surface"><div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4"><Logo className="h-8" /><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label="Share parent link" title="Share parent link" onClick={share}><Share2 /></Button><Button variant="ghost" size="icon" aria-label="Install family app" title="Install family app" onClick={async () => { if (install) { await install.prompt(); await install.userChoice; setInstall(null); } else setInstallHelp(true); }}><Download /></Button><Button variant="ghost" size="icon" aria-label="Sign out" title="Sign out" onClick={async () => { await supabase.auth.signOut(); window.location.assign('/auth?next=%2Ffamily'); }}><LogOut /></Button></div></div></header>
    <main className="mx-auto max-w-4xl space-y-7 px-4 py-6 pb-12">
      <div><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary"><ShieldCheck className="size-4" />Private family dashboard</div><h1 className="text-3xl font-bold">Your children’s vaccines</h1><p className="mt-2 text-muted-foreground">{s.profile.firstName}’s family</p></div>
      <div className="grid grid-cols-3 gap-3 border-y py-4">{[[Users, children.length, 'Children'], [CalendarDays, pending, 'Scheduled'], [CheckCircle2, given, 'Doses given']].map(([Icon, value, label]) => { const I = Icon as typeof Users; return <div key={String(label)} className="flex flex-col gap-1"><I className="size-5 text-primary" /><b className="text-2xl">{String(value)}</b><span className="text-xs text-muted-foreground">{String(label)}</span></div>; })}</div>
      <section aria-label="Children"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Children</h2><Button asChild variant="ghost" size="sm"><Link to="/family/onboarding"><Plus />Add child</Link></Button></div><div className="flex flex-wrap gap-2">{children.map((m) => <Button key={m.id} variant={m.id === child?.id ? 'default' : 'outline'} onClick={() => setSelected(m.id)}>{m.name}</Button>)}</div>{!child && <p className="py-6 text-muted-foreground">No children added yet.</p>}</section>
      {child && <section aria-label={`Vaccine schedule for ${child.name}`}><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">{child.name}</h2><p className="text-sm text-muted-foreground">{child.hospital || child.center || clinic?.name || 'Clinic not saved'}</p></div><div className="flex flex-wrap gap-1 rounded-md bg-muted p-1"><Button variant={tab === 'schedule' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('schedule')}>Schedule</Button><Button variant={tab === 'overdue' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('overdue')}>Overdue</Button><Button variant={tab === 'given' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('given')}>Doses given</Button></div></div><div className="space-y-3">{schedule.map((dose) => <DoseRow key={dose.id} child={child} dose={dose} />)}{schedule.length === 0 && <p className="border-y py-8 text-sm text-muted-foreground">{tab === 'given' ? 'No doses recorded yet.' : tab === 'overdue' ? 'No overdue doses.' : 'No upcoming doses saved by your clinic yet.'}</p>}</div></section>}
      <section className="flex flex-wrap items-center justify-between gap-3 border-t pt-6" aria-label="Nutrition guide"><div><h2 className="flex items-center gap-2 text-xl font-bold"><Apple className="size-5 text-primary" />Nutrition guide</h2><p className="text-sm text-muted-foreground">Food tips for pregnancy, babies, toddlers and the whole family.</p></div><Button asChild variant="outline"><Link to="/family/nutrition">Open guide</Link></Button></section>
      <section className="border-t pt-6" aria-label="Your clinic"><h2 className="mb-3 text-xl font-bold">Your clinic</h2>{clinic ? <ClinicContact clinic={clinic} /> : <p className="text-sm text-muted-foreground">Clinic contacts and hours have not been provided by your clinic administrator.</p>}</section>
      <ClinicDirectory />
      <section aria-label="Upcoming reminders" className="border-t pt-6"><h2 className="mb-3 text-xl font-bold">Upcoming reminders</h2><div className="grid grid-cols-2 gap-4"><div><b className="text-2xl text-destructive">{reminders.overdue.length}</b><p className="text-sm text-muted-foreground">Overdue doses</p></div><div><b className="text-2xl text-primary">{reminders.upcoming.length}</b><p className="text-sm text-muted-foreground">Reminder emails pending · next 7 days</p></div></div>{reminders.upcoming.length > 0 && <ul className="mt-4 divide-y">{reminders.upcoming.map((dose, index) => <li key={`${dose.id}-${index}`} className="flex flex-wrap justify-between gap-2 py-3"><span className="font-medium">{dose.vaccine}</span><span className="text-sm text-muted-foreground">Due {dose.dueDate}</span></li>)}</ul>}</section><TextLog parent /><MessageClinic householdId={householdId} children={childrenForParent(s.members)} />
      <section className="flex flex-wrap items-center justify-between gap-3 border-t pt-5" aria-label="Text reminders"><div><b>Overdue vaccine texts</b><p className="text-sm text-muted-foreground">{s.overdueSmsEnabled ? 'Opted in' : 'Not opted in'} · {s.profile.phone || 'No mobile number saved'}</p></div><Button asChild variant="outline"><Link to="/family/alerts">Manage text consent</Link></Button></section>
      <div className="flex flex-wrap items-center gap-3 border-t pt-5"><Button variant="outline" onClick={share}><Copy />Copy parent link</Button><Button asChild variant="ghost"><a href="sms:?body=Open%20your%20family%20vaccine%20dashboard%3A%20https%3A%2F%2Fzatuhealth.com%2Ffamily">Send by text</a></Button></div>
      {installHelp && <div role="dialog" aria-label="Install family app" className="border-t pt-4"><h2 className="font-bold">Install ZatuHealth Family</h2><p className="my-2 text-sm">Android: open this page in Chrome, then choose Add to Home screen from the menu. iPhone: open in Safari, tap Share, then Add to Home Screen.</p><Button size="sm" variant="outline" onClick={() => setInstallHelp(false)}>Close</Button></div>}
    </main>
  </div>;
}

function DoseRow({ child, dose }: { child: Member; dose: ScheduledVaccine }) {
  const { save } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(today);
  const [busy, setBusy] = useState(false);
  const log = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      await save((state) => ({ ...state, members: state.members.map((m) => m.id === child.id ? recordParentDose(m, dose.id, date, today) : m) }));
      toast.success('Dose given recorded'); setOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not record dose'); } finally { setBusy(false); }
  };
  return <article className="rounded-lg border bg-surface p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="flex items-start gap-2 font-bold"><Syringe className="mt-0.5 size-4 shrink-0 text-primary" />{dose.vaccine}</h3><p className="mt-1 text-sm">{dose.givenOn ? `Given ${dose.givenOn}` : `Due ${dose.dueDate}`}</p><p className="mt-1 break-words text-xs text-muted-foreground">Confirmed by {dose.confirmedBy || 'Pending'}</p>{isOverdue(dose, today) && <p className="mt-2 text-sm font-semibold text-destructive">Overdue · {dose.dueDate}</p>}<p className="mt-2 text-xs text-muted-foreground">{parentDoseStatus(dose, today)}</p></div>{!dose.givenOn ? <Button variant="outline" size="sm" onClick={() => setOpen(!open)}><CheckCircle2 />Mark dose given</Button> : <CheckCircle2 className="size-5 text-accent-foreground" />}</div>{open && <form onSubmit={log} className="mt-4 flex flex-wrap items-end gap-2 border-t pt-3"><label className="text-sm">Date given<input aria-label={`Date given for ${dose.vaccine}`} required type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} className={field} /></label><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save dose'}</Button><Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button></form>}</article>;
}
