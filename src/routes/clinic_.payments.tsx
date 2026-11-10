import { useState } from 'react';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getClinicPayments, recordFamilyPayment } from '@/lib/clinic-admin.functions';
import { Button } from '@/components/ui/button';

const paymentsQuery = queryOptions({ queryKey: ['clinic-payments'], queryFn: () => getClinicPayments() });
const methods = ['Cash', 'Mobile money', 'Card', 'Bank transfer'] as const;
const ugx = (n: number) => `UGX ${n.toLocaleString()}`;
export const Route = createFileRoute('/clinic_/payments')({
  ssr: false, staticData: { sitemap: false },
  beforeLoad: async () => { const role = await supabase.rpc('clinic_role'); if (role.data !== 'admin') throw redirect({ to: '/clinic/login' }); },
  loader: ({ context }) => context.queryClient.ensureQueryData(paymentsQuery),
  errorComponent: () => <main className="p-6">Payments could not be loaded. <Link to="/clinic">Back to dashboard</Link></main>,
  head: () => ({ meta: [{ title: 'Family payments – ZatuHealth clinic' }, { name: 'description', content: 'Record payments from families and top up their ZatuHealth wallet.' }, { property: 'og:title', content: 'ZatuHealth family payments' }, { property: 'og:description', content: 'Private clinic payments page.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: Payments,
});

function Payments() {
  const { data } = useSuspenseQuery(paymentsQuery);
  const qc = useQueryClient();
  const record = useServerFn(recordFamilyPayment);
  const [f, setF] = useState({ householdId: data.families[0]?.id ?? '', amount: '', method: 'Cash' as (typeof methods)[number], reference: '' });
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Math.round(Number(f.amount));
    if (!f.householdId || !(amount > 0)) { toast.error('Choose a family and enter an amount'); return; }
    setBusy(true);
    try { const r = await record({ data: { householdId: f.householdId, amount, method: f.method, reference: f.reference } }); toast.success(`Payment recorded · new balance ${ugx(r.wallet)}`); setF({ ...f, amount: '', reference: '' }); await qc.invalidateQueries({ queryKey: paymentsQuery.queryKey }); }
    catch { toast.error('Payment could not be recorded'); }
    setBusy(false);
  };
  const field = 'mt-1 w-full rounded-lg border bg-background px-3 py-2';
  return <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
    <Link to="/clinic" className="text-primary">← Clinic dashboard</Link>
    <h1 className="text-3xl font-bold">Family payments</h1>
    {data.families.length === 0 ? <p className="text-muted-foreground">No registered families are linked to your clinic yet. Invite a parent first.</p> :
      <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-surface p-4 shadow-card sm:grid-cols-2">
        <label className="text-sm">Family<select className={field} value={f.householdId} onChange={(e) => setF({ ...f, householdId: e.target.value })}>{data.families.map((x) => <option key={x.id} value={x.id}>{x.name} · {ugx(x.wallet)}</option>)}</select></label>
        <label className="text-sm">Amount received (UGX)<input className={field} inputMode="numeric" required value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/\D/g, '') })} /></label>
        <label className="text-sm">Method<select className={field} value={f.method} onChange={(e) => setF({ ...f, method: e.target.value as (typeof methods)[number] })}>{methods.map((m) => <option key={m}>{m}</option>)}</select></label>
        <label className="text-sm">Receipt or reference (optional)<input className={field} maxLength={100} value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} /></label>
        <div className="sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? 'Recording…' : 'Record payment and top up wallet'}</Button></div>
      </form>}
    <section><h2 className="mb-2 text-xl font-bold">Recorded payments</h2>
      {data.payments.length === 0 ? <p className="text-sm text-muted-foreground">No payments recorded yet.</p> :
        <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-sm"><thead className="text-left text-muted-foreground"><tr><th className="pb-1">Date</th><th>Family</th><th>Amount</th><th>Method</th><th>Reference</th></tr></thead>
          <tbody>{data.payments.map((p) => <tr key={p.id} className="border-t"><td className="py-1.5">{p.createdAt.slice(0, 16).replace('T', ' ')}</td><td>{p.family}</td><td>{ugx(p.amount)}</td><td>{p.method}</td><td>{p.reference || '—'}</td></tr>)}</tbody></table></div>}
    </section>
  </main>;
}
