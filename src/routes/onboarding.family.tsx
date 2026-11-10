import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo, btnPrimary, field } from "@/components/zatu";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/onboarding/family")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Add your family – ZatuHealth" }, { name: "description", content: "Add family members with date of birth and clinic." }, { property: "og:title", content: "Add your family – ZatuHealth" }, { property: "og:description", content: "Set up each family profile." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: FamilySetup,
});

const relationships = ["Spouse", "Son", "Daughter", "Parent", "Other"];

function FamilySetup() {
  const [parentFlow, setParentFlow] = useState(false);
  useEffect(() => { setParentFlow(sessionStorage.getItem('zatu-parent-next') === '/family'); }, []);
  const { s, save, loading } = useStore();
  const [f, setF] = useState({ name: "", relationship: "Son", gender: "Male", dob: "", clinic: "" });
  const [busy, setBusy] = useState(false);
  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !f.dob || !f.clinic.trim()) { toast.error("Add a name, date of birth and clinic"); return; }
    setBusy(true);
    try {
      await save((x) => ({ ...x, members: [...x.members, { id: crypto.randomUUID(), name: f.name.trim(), relationship: f.relationship, kind: "human", gender: f.gender, dob: f.dob, country: x.profile?.country ?? "Uganda", state: x.profile?.state ?? "", center: f.clinic.trim(), hospital: f.clinic.trim() }] }));
      toast.success(`${f.name.trim()} added`);
      setF({ ...f, name: "", dob: "" });
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not save"); } finally { setBusy(false); }
  };
  const others = s.members.filter((m) => m.id !== "self");
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md space-y-4 rounded-3xl bg-surface p-6 shadow-card">
        <Logo className="h-9" />
        <h1 className="text-2xl font-bold">Add your family</h1>
        <ul className="space-y-1 text-sm">{others.length === 0 ? <li className="text-muted-foreground">No family members yet.</li> : others.map((m) => <li key={m.id} className="border-t pt-1"><b>{m.name}</b> · {m.relationship} · {m.dob} · {m.hospital || m.center}</li>)}</ul>
        <form onSubmit={add} className="grid grid-cols-2 gap-3">
          <input aria-label="Member name" placeholder="Full name" maxLength={100} className={`${field} col-span-2`} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <select aria-label="Relationship" className={field} value={f.relationship} onChange={(e) => setF({ ...f, relationship: e.target.value })}>{relationships.map((r) => <option key={r}>{r}</option>)}</select>
          <select aria-label="Gender" className={field} value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}><option>Male</option><option>Female</option></select>
          <label className="col-span-2 text-xs font-semibold text-muted-foreground">Date of birth<input aria-label="Member date of birth" type="date" className={field} value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} /></label>
          <input aria-label="Member clinic" placeholder="Clinic or hospital" maxLength={150} className={`${field} col-span-2`} value={f.clinic} onChange={(e) => setF({ ...f, clinic: e.target.value })} />
          <Button type="submit" variant="outline" disabled={busy} className="col-span-2">+ Add member</Button>
        </form>
        <Link to={parentFlow ? '/family' : '/app/family'} className={`${btnPrimary} block text-center`}>Done</Link>
      </div>
    </div>
  );
}
