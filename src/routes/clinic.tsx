import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ClinicStaffPanel } from "@/components/clinic-staff";
import { Logo } from "@/components/zatu";
import { useStore } from "@/lib/store";
import { providers, ugx } from "@/lib/data";
import { VaccineScheduleBoard } from "@/components/vaccine-schedule";
import { ClinicVaccineCalendar } from '@/components/clinic-calendar';
import { ClinicTextConsents } from '@/components/clinic-text-consents';
import { Button } from '@/components/ui/button';
import { TextLog } from '@/components/text-log';

export const Route = createFileRoute("/clinic")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/clinic" });
    const { data: role } = await supabase.rpc("clinic_role");
    if (!role) throw redirect({ to: "/admin/clinic" });
    return { clinicRole: role };
  },
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Clinic dashboard – ZatuHealth" }, { name: "description", content: "See confirmed, rescheduled and cancelled appointments and revenue." }, { property: "og:title", content: "Clinic dashboard – ZatuHealth" }, { property: "og:description", content: "For clinics, salons, garages and schools." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Clinic,
});

function Clinic() {
  const { s } = useStore();
  const { clinicRole } = Route.useRouteContext();
  const count = (st: string) => s.appointments.filter((a) => a.status === st).length;
  const revenue = s.appointments.filter((a) => a.status !== "cancelled").reduce((n, a) => n + a.amount, 0);
  const channels = ["Wallet", "Mobile money", "Card", "Insurance"].map((c) => [c, s.appointments.filter((a) => a.payment === c).length] as const);
  const max = Math.max(1, ...channels.map((c) => c[1]));
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Logo className="h-8" /><div className="flex gap-4"><Link to="/family" className="font-bold text-primary">Parent dashboard →</Link><Link to="/app" className="font-bold text-primary">Patient app →</Link></div></div>
      <h1 className="mb-4 text-3xl font-bold">Clinic dashboard</h1>
      <Button asChild variant="outline" className="mb-6"><Link to="/clinic/profile">Edit clinic profile</Link></Button>
      {clinicRole === 'admin' && <Button asChild variant="outline" className="mb-6 ml-3"><Link to="/clinic/parents">Families, doses & messages</Link></Button>}
      {clinicRole === 'admin' && <Button asChild variant="outline" className="mb-6 ml-3"><Link to="/clinic/inbox">Parent inbox</Link></Button>}
      {clinicRole === 'admin' && <Button asChild variant="outline" className="mb-6 ml-3"><Link to="/clinic/payments">Payments</Link></Button>}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[["Confirmed", count("confirmed")], ["Rescheduled", count("rescheduled")], ["Cancelled", count("cancelled")], ["Completed", count("completed")], ["Revenue", ugx(revenue)]].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-surface p-4 shadow-card"><div className="text-sm text-muted-foreground">{k}</div><div className="font-display text-2xl font-bold text-primary">{v}</div></div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="overflow-x-auto rounded-2xl bg-surface p-4 shadow-card md:col-span-2">
          <h2 className="mb-3 font-bold">Appointments</h2>
          <table className="w-full text-sm"><thead className="text-left text-muted-foreground"><tr><th className="pb-2">Patient</th><th>Specialist</th><th>When</th><th>Status</th></tr></thead>
            <tbody>{s.appointments.map((a) => <tr key={a.id} className="border-t"><td className="py-2">{s.members.find((m) => m.id === a.memberId)?.name}</td><td>{providers.find((p) => p.id === a.providerId)?.name}</td><td>{a.date} {a.time}</td><td className="capitalize">{a.status}</td></tr>)}</tbody></table>
        </div>
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <h2 className="mb-3 font-bold">Payment channels</h2>
          {channels.map(([c, n]) => <div key={c} className="mb-2"><div className="flex justify-between text-sm"><span>{c}</span><b>{n}</b></div><div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-accent" style={{ width: `${(n / max) * 100}%` }} /></div></div>)}
        </div>
      </div>
      <ClinicVaccineCalendar />
      <h2 className="mb-1 mt-8 text-2xl font-bold">Vaccine schedules</h2>
      <p className="mb-4 text-sm text-muted-foreground">Confirm due dates, log doses given, edit rescheduled dates and manage reminders. Overdue doses are flagged at the top. A reminder email goes out automatically about a week before each confirmed date.</p>
      <VaccineScheduleBoard />
      <ClinicStaffPanel />
      <ClinicTextConsents />
      {clinicRole === 'admin' && <TextLog />}
    </div>
  );
}
