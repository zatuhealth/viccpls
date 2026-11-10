import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MemberAvatar, ScreenHeader, btnPrimary, field } from "@/components/zatu";
import { age, uid, useStore } from "@/lib/store";
import { CountrySelect } from "@/components/country-fields";
import { MemberDetails } from "@/components/member-details";
import { VisitRecords } from '@/components/visit-records';

export const Route = createFileRoute("/app/family")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Family – ZatuHealth" }, { name: "description", content: "Add dependents and pets and manage their profiles." }, { property: "og:title", content: "Family – ZatuHealth" }, { property: "og:description", content: "Your dependents on ZatuHealth." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Family,
});

const empty = { relationship: "Son", name: "", gender: "Male", dob: "", country: "Uganda", state: "", center: "" };
const rels = ["Son", "Daughter", "Spouse", "Father", "Mother", "Pet – Cat", "Pet – Dog", "Other"];

function Family() {
  const { s, set } = useStore();
  const [f, setF] = useState(empty);
  const [open, setOpen] = useState(false);
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name || !f.dob) { toast.error("Name and date of birth are required"); return; }
    set((x) => ({ ...x, members: [...x.members, { ...f, id: uid(), kind: f.relationship.startsWith("Pet") ? "pet" : "human" }] }));
    setF(empty); setOpen(false);
    toast.success(`${f.name} added`);
  };
  return (
    <div>
      <ScreenHeader title="Family" />
      <div className="space-y-2">
        {s.members.map((m) => (
          <div key={m.id} className="rounded-2xl bg-surface p-3 shadow-card"><div className="flex items-center gap-3">
            <MemberAvatar m={m} size="h-14 w-14" />
            <div className="min-w-0 flex-1"><div className="font-bold">{m.name}</div><div className="text-sm text-muted-foreground">{m.relationship} · {age(m.dob)} · Born {m.dob}</div><div className="text-xs text-muted-foreground">{m.center}</div></div>
            <Link to="/app/vaccination" search={{ member: m.id }} className="text-sm font-bold text-primary">Records</Link>
            {m.id !== "self" && <button onClick={() => set((x) => ({ ...x, members: x.members.filter((y) => y.id !== m.id) }))} className="text-xs text-destructive">Remove</button>}
          </div>
          {m.kind === "human" && <MemberDetails m={m} />}
          {m.kind === "pet" && <div className="mt-2"><VisitRecords member={m} /></div>}
          </div>
        ))}
      </div>
      {!open ? (
        <button onClick={() => setOpen(true)} className={`${btnPrimary} mt-4`}>+ Add dependent</button>
      ) : (
        <form onSubmit={add} className="mt-4 space-y-3 rounded-2xl bg-surface p-4 shadow-card">
          <h2 className="text-lg font-bold">Add dependent</h2>
          <select value={f.relationship} onChange={(e) => setF({ ...f, relationship: e.target.value })} className={field}>{rels.map((r) => <option key={r}>{r}</option>)}</select>
          <input placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={field} />
          <select value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })} className={field}><option>Male</option><option>Female</option></select>
          <label className="block text-xs font-semibold text-muted-foreground">Date of birth<input type="date" value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} className={`${field} mt-1`} /></label>
          <CountrySelect value={f.country} onChange={(country) => setF({ ...f, country })} />
          <input placeholder="State / Province" value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })} className={field} />
          <input placeholder="Vaccination center" value={f.center} onChange={(e) => setF({ ...f, center: e.target.value })} className={field} />
          <div className="flex gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-xl border px-5 font-bold">Cancel</button><button className={btnPrimary}>Save</button></div>
        </form>
      )}
    </div>
  );
}
