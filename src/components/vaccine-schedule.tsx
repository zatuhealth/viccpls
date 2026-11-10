import { useState } from "react";
import { toast } from "sonner";
import { field } from "@/components/zatu";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { isOverdue, pet, vaccines, type Member, type ScheduledVaccine } from "@/lib/data";

const today = () => new Date().toISOString().slice(0, 10);

export function VaccineScheduleBoard() {
  const { s, save } = useStore();
  const overdue = s.members.flatMap((m) => (m.schedule ?? []).filter((e) => isOverdue(e, today())).map((e) => ({ member: m.name, entry: e })));
  return (
    <div className="space-y-4">
      {overdue.length > 0 && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4" role="alert">
          <h3 className="mb-2 font-bold text-destructive">Overdue doses ({overdue.length})</h3>
          <ul className="space-y-1 text-sm">
            {overdue.map(({ member, entry }) => (
              <li key={entry.id}><b>{member}</b> — {entry.vaccine}, was due {entry.dueDate}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">Log the dose below once given, or edit the due date if the visit was rescheduled.</p>
        </div>
      )}
      {s.members.map((m) => <MemberSchedule key={m.id} m={m} save={save} />)}
    </div>
  );
}

function MemberSchedule({ m, save }: { m: Member; save: ReturnType<typeof useStore>["save"] }) {
  const options = m.kind === "pet" ? pet.schedule.map((v) => v.name) : vaccines.map((v) => v.code);
  const [f, setF] = useState({ vaccine: options[0] ?? "", dueDate: "", confirmedBy: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [busy, setBusy] = useState(false);
  const write = async (fn: (list: NonNullable<Member["schedule"]>) => NonNullable<Member["schedule"]>, ok: string) => {
    setBusy(true);
    try {
      await save((x) => ({ ...x, members: x.members.map((y) => (y.id === m.id ? { ...y, schedule: fn(y.schedule ?? []) } : y)) }));
      toast.success(ok);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not save"); } finally { setBusy(false); }
  };
  const confirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.dueDate || f.confirmedBy.trim().length < 2) { toast.error("Add a due date and the confirming clinician"); return; }
    void write((l) => [...l, { id: crypto.randomUUID(), vaccine: f.vaccine, dueDate: f.dueDate, confirmedBy: f.confirmedBy.trim(), confirmedAt: new Date().toISOString() }].sort((a, b) => a.dueDate.localeCompare(b.dueDate)), "Due date confirmed");
    setF({ ...f, dueDate: "" });
  };
  const startEdit = (e: ScheduledVaccine) => { setEditing(e.id); setEditDate(e.dueDate); };
  const saveEdit = (id: string) => {
    if (!editDate) { toast.error("Pick a due date"); return; }
    setEditing(null);
    void write((l) => l.map((x) => {
      if (x.id !== id) return x;
      const { remindedAt: _cleared, overdueRemindedAt: _clearedOverdue, ...rest } = x;
      return { ...rest, dueDate: editDate };
    }).sort((a, b) => a.dueDate.localeCompare(b.dueDate)), "Due date updated");
  };
  return <section className="rounded-2xl bg-surface p-4 shadow-card" aria-label={`Vaccine schedule for ${m.name}`}>
    <h3 className="font-bold">{m.name} <span className="text-sm font-normal text-muted-foreground">· {m.relationship}</span></h3>
    <ul className="my-3 space-y-1 text-sm">
      {(m.schedule ?? []).length === 0 && <li className="text-muted-foreground">No confirmed due dates.</li>}
      {(m.schedule ?? []).map((e) => {
        const late = isOverdue(e, today());
        return <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 border-t pt-1">
          <span>
            <b>{e.vaccine}</b> · due {e.dueDate} · confirmed by {e.confirmedBy}
            {late && <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">Overdue</span>}
          </span>
          <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {e.givenOn ? `Dose given ${e.givenOn}` : late ? (e.overdueRemindedAt ? `Overdue email sent ${e.overdueRemindedAt.slice(0, 10)}` : "Overdue email goes out with the next daily run") : e.remindedAt ? `Reminder sent ${e.remindedAt.slice(0, 10)}` : "Reminder pending"}
            {editing === e.id ? (
              <span className="flex items-center gap-1">
                <input aria-label={`New due date for ${e.vaccine}`} type="date" className={field} value={editDate} onChange={(ev) => setEditDate(ev.target.value)} />
                <Button size="sm" disabled={busy} onClick={() => saveEdit(e.id)}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              </span>
            ) : (
              !e.givenOn && <>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => write((l) => l.map((x) => (x.id === e.id ? { ...x, givenOn: today() } : x)), "Dose logged")}>Mark dose given</Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => startEdit(e)}>Edit date</Button>
                {late && (e.textApprovedFor === e.dueDate ? <span className="font-semibold text-foreground">Text approved by {e.textApprovedBy}</span> : <Button size="sm" disabled={busy} onClick={() => { const by = window.prompt(`Approving clinician for the overdue ${e.vaccine} text`)?.trim(); if (!by || by.length < 2) return; void write((l) => l.map((x) => (x.id === e.id ? { ...x, textApprovedBy: by.slice(0, 120), textApprovedFor: x.dueDate } : x)), "Overdue text approved"); }}>Approve overdue text</Button>)}
                {e.remindedAt && <Button size="sm" variant="outline" disabled={busy} onClick={() => write((l) => l.map((x) => {
                  if (x.id !== e.id) return x;
                  const { remindedAt: _cleared, ...rest } = x;
                  return rest;
                }), "Reminder will be re-sent by the daily job")}>Resend reminder</Button>}
              </>
            )}
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => write((l) => l.filter((x) => x.id !== e.id), "Removed")}>Remove</Button>
          </span>
        </li>;
      })}
    </ul>
    <form onSubmit={confirm} className="grid gap-2 md:grid-cols-4">
      <select aria-label={`Vaccine for ${m.name}`} className={field} value={f.vaccine} onChange={(e) => setF({ ...f, vaccine: e.target.value })}>{options.map((o) => <option key={o}>{o}</option>)}</select>
      <input aria-label={`Due date for ${m.name}`} type="date" className={field} value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} />
      <input aria-label={`Confirming clinician for ${m.name}`} placeholder="Confirming clinician" maxLength={120} className={field} value={f.confirmedBy} onChange={(e) => setF({ ...f, confirmedBy: e.target.value })} />
      <Button type="submit" disabled={busy} className="h-auto">Confirm due date</Button>
    </form>
  </section>;
}
