import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getClinicFamilies } from '@/lib/clinic-overview.functions';
import { Button } from '@/components/ui/button';

const familiesQuery = queryOptions({ queryKey: ['clinic-parent-overview'], queryFn: () => getClinicFamilies() });
export const Route = createFileRoute('/clinic_/parents')({
  ssr: false, staticData: { sitemap: false },
  beforeLoad: async () => { const role = await supabase.rpc('clinic_role'); if (role.data !== 'admin') throw redirect({ to: '/clinic/login' }); },
  loader: ({ context }) => context.queryClient.ensureQueryData(familiesQuery),
  errorComponent: () => <main className="p-6">Clinic families could not be loaded. <Link to="/clinic">Back to dashboard</Link></main>,
  notFoundComponent: () => <main className="p-6">Clinic overview unavailable.</main>,
  head: () => ({ meta: [{ title: 'Clinic families, doses and texts – ZatuHealth' }, { name: 'description', content: 'Administrator overview of linked families, confirmed doses, overdue texts and parent messages.' }, { property: 'og:title', content: 'ZatuHealth clinic family overview' }, { property: 'og:description', content: 'Private administrator overview of doses, texts and messages.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: ClinicParents,
});

const textLabel = (d: { textStatus: string | null; textSentAt: string | null; textConfirmedAt: string | null; textApproved: boolean; overdue: boolean }) =>
  d.textConfirmedAt ? `Text sent ${d.textSentAt?.slice(0, 10) ?? ''} · parent confirmed ${d.textConfirmedAt.slice(0, 10)}` :
  d.textStatus === 'accepted' ? `Text sent ${d.textSentAt?.slice(0, 10) ?? ''} · awaiting parent` :
  d.textStatus === 'unknown' ? 'Text outcome unclear · not retried' :
  d.textStatus ? 'Text not sent' :
  d.overdue ? (d.textApproved ? 'Text approved · sends next morning' : 'Text awaiting clinician approval') : '—';

function ClinicParents() {
  const { data } = useSuspenseQuery(familiesQuery);
  const qc = useQueryClient();
  const router = useRouter();
  const children = data.families.flatMap((parent) => parent.children);
  const doses = children.flatMap((c) => c.doses);
  const unread = data.messages.filter((m) => !m.readAt).length;
  const markRead = async (id: string) => {
    const { error } = await supabase.rpc('mark_clinic_message_read', { _id: id });
    if (error) { toast.error('Could not mark as read'); return; }
    await qc.invalidateQueries({ queryKey: familiesQuery.queryKey }); void router.invalidate();
  };
  return <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
    <Link to="/clinic" className="text-primary">← Clinic dashboard</Link>
    <h1 className="text-3xl font-bold">Families, doses & texts</h1>
    <div className="grid grid-cols-2 gap-3 border-y py-5 md:grid-cols-5">
      {[['Parents invited', data.families.length], ['Children', children.length], ['Confirmed doses', doses.length], ['Overdue', doses.filter((d) => d.overdue).length], ['Texts sent', doses.filter((d) => d.textStatus === 'accepted').length]].map(([k, v]) => <div key={k}><b className="text-2xl">{v}</b><p className="text-sm">{k}</p></div>)}
    </div>

    <section aria-label="Parent messages" className="rounded-2xl bg-surface p-4 shadow-card">
      <h2 className="mb-3 text-xl font-bold">Messages from parents {unread > 0 && <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-sm text-destructive">{unread} new</span>}</h2>
      {data.messages.length === 0 ? <p className="text-sm text-muted-foreground">No messages yet. Parents can write to you from their family dashboard.</p> :
        <ul className="divide-y">{data.messages.map((m) => <li key={m.id} className="space-y-1 py-3">
          <div className="flex flex-wrap justify-between gap-2 text-sm"><b>{m.from}{m.childName ? ` · about ${m.childName}` : ''}</b><span className="text-muted-foreground">{m.createdAt.slice(0, 16).replace('T', ' ')}</span></div>
          <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
          {m.readAt ? <p className="text-xs text-muted-foreground">Read</p> : <Button size="sm" variant="outline" onClick={() => markRead(m.id)}>Mark as read</Button>}
        </li>)}</ul>}
    </section>

    {data.families.length === 0 && <p className="text-muted-foreground">No parents linked to this clinic yet.</p>}
    <div className="divide-y">{data.families.map((parent) => <section key={parent.email} className="space-y-3 py-5">
      <h2 className="text-xl font-bold">{parent.name || parent.email}</h2>
      <p className="break-all text-sm text-muted-foreground">{parent.email} · {parent.registered ? 'Registered' : 'Awaiting signup'}</p>
      {parent.children.map((child) => <article key={child.id} className="overflow-x-auto border-l pl-4">
        <h3 className="font-semibold">{child.name}</h3>
        {child.doses.length === 0 ? <p className="text-sm text-muted-foreground">No confirmed doses yet</p> :
          <table className="mt-2 w-full min-w-[560px] text-sm"><thead className="text-left text-muted-foreground"><tr><th className="pb-1">Vaccine</th><th>Due</th><th>Confirmed by</th><th>Status</th><th>Overdue text</th></tr></thead>
            <tbody>{child.doses.map((d) => <tr key={d.id} className="border-t"><td className="py-1.5">{d.vaccine}</td><td>{d.dueDate}</td><td>{d.confirmedBy}</td><td className={d.overdue ? 'font-semibold text-destructive' : ''}>{d.givenOn ? `Given ${d.givenOn}` : d.overdue ? 'Overdue' : 'Upcoming'}</td><td>{textLabel(d)}</td></tr>)}</tbody></table>}
      </article>)}
      {parent.registered && !parent.children.length && <p className="text-sm text-muted-foreground">No children registered yet.</p>}
    </section>)}</div>
  </main>;
}
