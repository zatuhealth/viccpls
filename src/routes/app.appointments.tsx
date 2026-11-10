import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Chip, ScreenHeader, btnPrimary } from "@/components/zatu";
import { useStore } from "@/lib/store";
import { providers, slots, ugx } from "@/lib/data";

export const Route = createFileRoute("/app/appointments")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Appointments – ZatuHealth" }, { name: "description", content: "Upcoming and past visits; reschedule or cancel." }, { property: "og:title", content: "Appointments – ZatuHealth" }, { property: "og:description", content: "Manage your family's appointments." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Appointments,
});

function Appointments() {
  const { s, set } = useStore();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [edit, setEdit] = useState<string | null>(null);
  const [newTime, setNewTime] = useState("");
  const list = s.appointments.filter((a) => (tab === "upcoming" ? a.status === "confirmed" || a.status === "rescheduled" : a.status === "completed" || a.status === "cancelled"));
  const upd = (id: string, patch: object) => set((x) => ({ ...x, appointments: x.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));

  return (
    <div>
      <ScreenHeader title="Appointments" />
      <div className="mb-4 flex gap-2"><Chip on={tab === "upcoming"} onClick={() => setTab("upcoming")}>Upcoming</Chip><Chip on={tab === "past"} onClick={() => setTab("past")}>Past visits</Chip></div>
      <div className="space-y-3">
        {list.map((a) => {
          const p = providers.find((x) => x.id === a.providerId)!;
          const m = s.members.find((x) => x.id === a.memberId);
          return (
            <div key={a.id} className="rounded-2xl bg-surface p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div><div className="font-bold">{p.name}</div><div className="text-sm text-muted-foreground">{p.specialty} · {p.business} – {a.branch}</div><div className="mt-1 text-sm">For <b>{m?.name}</b> · {a.mode}</div></div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${a.status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-accent/25 text-accent-foreground"}`}>{a.status}</span>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm"><b>{a.date} · {a.time}</b><span>{ugx(a.amount)}{a.recurring !== "None" && ` · ${a.recurring}`}</span></div>
              {tab === "upcoming" && (edit === a.id ? (
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap gap-2">{slots.filter((t) => t !== "12:00").map((t) => <Chip key={t} on={newTime === t} onClick={() => setNewTime(t)}>{t}</Chip>)}</div>
                  <button disabled={!newTime} className={btnPrimary} onClick={() => { upd(a.id, { time: newTime, status: "rescheduled" }); setEdit(null); toast.success("Rescheduled – reminder updated"); }}>Confirm new time</button>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => { setEdit(a.id); setNewTime(""); }} className="flex-1 rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground">Reschedule</button>
                  <button onClick={() => { if (confirm("Cancel this appointment? Late cancellations may forfeit the booking fee.")) { upd(a.id, { status: "cancelled" }); toast("Appointment cancelled"); } }} className="flex-1 rounded-xl border border-destructive py-2 text-sm font-bold text-destructive">Cancel</button>
                </div>
              ))}
            </div>
          );
        })}
        {list.length === 0 && <div className="rounded-2xl bg-surface p-8 text-center text-muted-foreground">Nothing here yet. <Link to="/app/book" className="font-bold text-primary">Book a visit</Link></div>}
      </div>
    </div>
  );
}
