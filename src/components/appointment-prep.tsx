import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardList, LoaderCircle, Save, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { field } from "@/components/zatu";
import { appointmentPrepInput, type AppointmentPrep } from "@/lib/appointment-prep";
import { prepareAppointment } from "@/lib/appointment-prep.functions";
import type { Member } from "@/lib/data";
import { useStore } from "@/lib/store";

export function AppointmentPreparation({ member }: { member: Member }) {
  const prepare = useServerFn(prepareAppointment);
  const { save } = useStore();
  const [open, setOpen] = useState(false);
  const [concern, setConcern] = useState(member.visitNote?.concern ?? "");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState<AppointmentPrep | null>(member.visitNote ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!member.visitNote);
  const [pdf, setPdf] = useState<Blob | null>(null);
  useEffect(() => {
    let active = true; setPdf(null);
    if (note && open) import("@/lib/member-pdf").then(async (tools) => {
      const blob = await tools.createVisitPdf(member, note, await tools.loadReportFonts());
      if (active) setPdf(blob);
    }).catch(() => { if (active) setError("Could not prepare the PDF. Close and reopen this note to try again."); });
    return () => { active = false; };
  }, [note, open, member]);
  const saveNote = async () => {
    if (!note) return;
    setSaving(true); setError("");
    try {
      await save((state) => ({ ...state, members: state.members.map((m) => m.id === member.id ? { ...m, visitNote: { ...note, concern, savedAt: new Date().toISOString() } } : m) }));
      setSaved(true);
    } catch { setError("Could not save this note. Please try again."); }
    finally { setSaving(false); }
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = appointmentPrepInput.safeParse({ memberId: member.id, concern, consent });
    if (!parsed.success) { setError(consent ? "Please describe the concern in at least 10 characters." : "Please agree to AI processing before continuing."); return; }
    setBusy(true); setError(""); setNote(null); setSaved(false);
    try {
      const result = await prepare({ data: parsed.data });
      if (result.ok) setNote(result.note); else setError(result.error);
    } catch { setError("Could not prepare the note. Check your connection and sign-in, then try again."); }
    finally { setBusy(false); }
  };
  return <>
    <Button variant="outline" size="sm" onClick={() => setOpen(true)} aria-label={`Prepare appointment for ${member.name}`}><ClipboardList />Prepare visit</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto">
        <DialogHeader><DialogTitle>Prepare a clinic visit</DialogTitle><DialogDescription>{member.name}</DialogDescription></DialogHeader>
        <p className="text-sm text-muted-foreground">AI-prepared notes are not a diagnosis. For severe symptoms or an emergency, seek urgent local care now.</p>
        <form onSubmit={submit} className="space-y-3">
          <label htmlFor={`concern-${member.id}`} className="block text-sm font-semibold">Health concern</label>
          <textarea id={`concern-${member.id}`} className={`${field} min-h-32 resize-y`} value={concern} maxLength={4000} disabled={busy} onChange={(e) => { setConcern(e.target.value); setNote(null); }} placeholder="Symptoms, when they started, changes, medicines and what worries you" required />
          <label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" className="mt-0.5" checked={consent} disabled={busy} onChange={(e) => setConsent(e.target.checked)} />I agree to send this concern and relevant age, gender and body details to AI for this note. Names, contact and school details are not sent. Do not include identifying details in your concern.</label>
          <Button type="submit" disabled={busy || !consent || concern.trim().length < 10} className="w-full">{busy ? <LoaderCircle className="animate-spin" /> : <ClipboardList />}{busy ? "Preparing note…" : "Prepare summary & questions"}</Button>
        </form>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {note && <div aria-live="polite" className="space-y-4 border-t pt-4">
          <section><h3 className="mb-2 font-bold text-primary">Appointment summary</h3><p className="whitespace-pre-wrap text-sm">{note.summary}</p></section>
          <section><h3 className="mb-2 font-bold text-primary">Questions for your clinician</h3><ol className="list-decimal space-y-2 pl-5 text-sm">{note.questions.map((question, i) => <li key={i}>{question}</li>)}</ol></section>
          <p className="text-sm font-semibold text-primary">{note.safetyNote}</p>
          <p className="text-xs text-muted-foreground">Review for accuracy before your visit. {saved ? "Saved to shared family records." : "Not saved yet."}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={saveNote} disabled={saving || saved}>{saving ? <LoaderCircle className="animate-spin" /> : <Save />}{saved ? "Saved" : "Save note"}</Button>
            <Button variant="outline" disabled={!pdf} onClick={async () => { if (pdf) { const tools = await import("@/lib/member-pdf"); await tools.deliverReport(pdf, "ZatuHealth-appointment-summary.pdf"); } }}><Printer />Print / PDF</Button>
          </div>
        </div>}
      </DialogContent>
    </Dialog>
  </>;
}