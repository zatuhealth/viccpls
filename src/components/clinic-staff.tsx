import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { field } from "@/components/zatu";
import { supabase } from "@/integrations/supabase/client";
import { sendParentInvite, inviteClinicStaff } from "@/lib/clinic.functions";
import { staffOccupations, staffOccupationLabels } from '@/lib/clinic-staff-roles';

type Staff = { id: string; email: string; role: string; occupation: string };

export function ClinicStaffPanel() {
  const invite = useServerFn(sendParentInvite);
  const inviteStaff = useServerFn(inviteClinicStaff);
  const [role, setRole] = useState<string | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [parentEmail, setParentEmail] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [occupation, setOccupation] = useState<(typeof staffOccupations)[number]>('other');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [{ data: r }, { data: list }] = await Promise.all([supabase.rpc("clinic_role"), supabase.from("clinic_staff").select("id, email, role, occupation").order("created_at")]);
    setRole(r ?? null); setStaff(list ?? []);
  };
  useEffect(() => { void load(); }, []);

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const r = await invite({ data: { email: parentEmail } });
      if (r.sent) { toast.success("Sign-in link emailed"); setParentEmail(""); } else toast.error("That address has unsubscribed from ZatuHealth emails");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not send invite"); }
    setBusy(false);
  };
  const addStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try { const result = await inviteStaff({ data: { email: staffEmail, occupation } }); toast.success(result.sent ? 'Staff added and login invitation emailed' : 'Staff access added; email delivery is suppressed'); setStaffEmail(''); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Could not invite staff'); }
    finally { setBusy(false); void load(); }
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("clinic_staff").delete().eq("id", id);
    if (error) toast.error("Could not remove"); else void load();
  };

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      <section className="rounded-2xl bg-surface p-4 shadow-card">
        <h2 className="mb-1 font-bold">Invite a parent</h2>
        <p className="mb-3 text-sm text-muted-foreground">Emails a one-time link that signs the parent in to their own family dashboard. It works once and expires soon.</p>
        <form onSubmit={sendInvite} className="flex gap-2">
          <input className={field} type="email" required aria-label="Parent email" placeholder="parent@example.com" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
          <Button disabled={busy}>{busy ? "Sending…" : "Send link"}</Button>
        </form>
      </section>
      <section className="rounded-2xl bg-surface p-4 shadow-card">
        <h2 className="mb-1 font-bold">Clinic staff</h2>
        <p className="mb-3 text-sm text-muted-foreground">People who can sign in at /admin/clinic.</p>
        <ul className="mb-3 space-y-1 text-sm">
          {staff.map((s) => <li key={s.id} className="flex items-center justify-between border-t pt-1"><span className="break-all">{s.email} <span className="text-muted-foreground">· {s.role === 'admin' ? 'Administrator' : staffOccupationLabels[s.occupation]}</span></span>{role === "admin" && s.role === "staff" && <Button size="sm" variant="ghost" onClick={() => remove(s.id)}>Remove</Button>}</li>)}
        </ul>
        {role === "admin" && <form onSubmit={addStaff} className="flex flex-wrap gap-2">
          <input className={field} type="email" required aria-label="Staff email" placeholder="nurse@yourclinic.com" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} />
          <select aria-label="Staff role" className={field} value={occupation} onChange={(event) => { const value = staffOccupations.find((item) => item === event.target.value); if (value) setOccupation(value); }}>{staffOccupations.map((item) => <option key={item} value={item}>{staffOccupationLabels[item]}</option>)}</select>
          <Button variant="outline" disabled={busy}>Add & invite</Button>
        </form>}
      </section>
    </div>
  );
}
