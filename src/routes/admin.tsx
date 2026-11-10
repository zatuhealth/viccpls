import { useState } from 'react';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { addPlatformStaff, getPlatformOverview, removePlatformStaff } from '@/lib/platform-admin.functions';
import { staffOccupations, staffOccupationLabels } from '@/lib/clinic-staff-roles';
import { Button } from '@/components/ui/button';

const overviewQuery = queryOptions({ queryKey: ['platform-admin'], queryFn: () => getPlatformOverview() });
export const Route = createFileRoute('/admin')({
  ssr: false, staticData: { sitemap: false },
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: '/admin/clinic' });
    const r = await supabase.rpc('is_platform_admin');
    if (r.data !== true) throw redirect({ to: '/' });
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(overviewQuery),
  errorComponent: () => <main className="p-6">The admin panel could not be loaded. <Link to="/">Home</Link></main>,
  head: () => ({ meta: [{ title: 'Platform admin – ZatuHealth' }, { name: 'description', content: 'Manage ZatuHealth clinics, parents and staff.' }, { property: 'og:title', content: 'ZatuHealth platform admin' }, { property: 'og:description', content: 'Private platform administration.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: Admin,
});

const tabs = ['Clinics', 'Parents', 'Staff'] as const;

function Admin() {
  const { data } = useSuspenseQuery(overviewQuery);
  const [tab, setTab] = useState<(typeof tabs)[number]>('Clinics');
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
    <h1 className="text-3xl font-bold">Platform admin</h1>
    <div className="grid grid-cols-3 gap-3 border-y py-4">{[['Clinics', data.clinics.length], ['Parents invited', data.parents.length], ['Staff & owners', data.staff.length]].map(([k, v]) => <div key={k}><b className="text-2xl">{v}</b><p className="text-sm">{k}</p></div>)}</div>
    <div role="tablist" className="flex gap-2">{tabs.map((t) => <Button key={t} role="tab" aria-selected={tab === t} variant={tab === t ? 'default' : 'outline'} size="sm" onClick={() => setTab(t)}>{t}</Button>)}</div>
    {tab === 'Clinics' && <Table head={['Clinic', 'Owner', 'Phone', 'Parents']} rows={data.clinics.map((c) => [<span key="n"><b>{c.name}</b><br /><span className="text-muted-foreground">{c.address}</span></span>, c.owner, c.phone || '—', String(c.parents)])} empty="No clinics yet. Add a clinic owner in the Staff tab." />}
    {tab === 'Parents' && <Table head={['Parent', 'Clinic', 'Status', 'Children', 'Invited']} rows={data.parents.map((p) => [<span key="n" className="break-all">{p.name || p.email}{p.name && <><br /><span className="text-muted-foreground">{p.email}</span></>}</span>, p.clinic, p.registered ? 'Registered' : 'Awaiting signup', String(p.children), p.invitedAt.slice(0, 10)])} empty="No parents invited yet." />}
    {tab === 'Staff' && <Staff staff={data.staff} />}
  </main>;
}

function Table({ head, rows, empty }: { head: string[]; rows: React.ReactNode[][]; empty: string }) {
  if (!rows.length) return <p className="text-muted-foreground">{empty}</p>;
  return <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="text-left text-muted-foreground"><tr>{head.map((h) => <th key={h} className="pb-1">{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i} className="border-t align-top">{r.map((c, j) => <td key={j} className="py-2 pr-3">{c}</td>)}</tr>)}</tbody></table></div>;
}

function Staff({ staff }: { staff: { id: string; email: string; role: string; occupation: string; active: boolean; clinic: string; addedAt: string }[] }) {
  const qc = useQueryClient();
  const add = useServerFn(addPlatformStaff);
  const remove = useServerFn(removePlatformStaff);
  const [f, setF] = useState({ email: '', role: 'admin' as 'admin' | 'staff', occupation: 'other' as (typeof staffOccupations)[number] });
  const refresh = () => qc.invalidateQueries({ queryKey: overviewQuery.queryKey });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await add({ data: f }); toast.success('Added — an activation link was emailed; they sign in at /admin/clinic'); setF({ ...f, email: '' }); await refresh(); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Could not add'); }
  };
  const del = async (id: string) => { try { await remove({ data: { id } }); toast.success('Access removed'); await refresh(); } catch (err) { toast.error(err instanceof Error ? err.message : 'Could not remove'); } };
  const field = 'mt-1 w-full rounded-lg border bg-background px-3 py-2';
  return <div className="space-y-6">
    <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-surface p-4 shadow-card sm:grid-cols-4">
      <label className="text-sm sm:col-span-2">Email<input type="email" required className={field} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      <label className="text-sm">Access<select className={field} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as 'admin' | 'staff' })}><option value="admin">Clinic owner (admin)</option><option value="staff">Staff</option></select></label>
      <label className="text-sm">Job title<select className={field} value={f.occupation} onChange={(e) => setF({ ...f, occupation: e.target.value as (typeof staffOccupations)[number] })}>{staffOccupations.map((o) => <option key={o} value={o}>{staffOccupationLabels[o]}</option>)}</select></label>
      <div className="sm:col-span-4"><Button type="submit">Add person</Button></div>
    </form>
    <Table head={['Email', 'Access', 'Clinic', 'Job title', 'Status', '']} rows={staff.map((s) => [<span key="e" className="break-all">{s.email}</span>, s.role === 'admin' ? 'Clinic owner' : 'Staff', s.clinic, s.occupation, s.active ? 'Active' : 'Invited', <Button key="r" size="sm" variant="outline" onClick={() => del(s.id)}>Remove</Button>])} empty="No staff yet." />
  </div>;
}
