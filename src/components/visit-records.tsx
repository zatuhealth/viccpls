import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { FileText, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { field } from '@/components/zatu';
import type { Member } from '@/lib/data';
import { uid } from '@/lib/store';
import { visitRecordSchema, type VisitRecord } from '@/lib/visit-record';
import { saveVisitRecord } from '@/lib/visit-record.functions';

function VisitPdf({ member, visit }: { member: Member; visit: VisitRecord }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true; let objectUrl = '';
    import('@/lib/member-pdf').then(async (tools) => {
      const prep = visit.preparation;
      const blob = await tools.createVisitPdf(member, { summary: `Visit date: ${visit.date}\nClinic: ${visit.clinic}\nDoctor: ${visit.doctor}\nResults: ${visit.results}${prep ? `\n\nPreparation summary: ${prep.summary}` : ''}`, questions: prep?.questions ?? [], safetyNote: prep?.safetyNote ?? 'Caregiver-recorded visit details. Confirm results with your clinician.' }, await tools.loadReportFonts());
      objectUrl = URL.createObjectURL(blob);
      if (active) setUrl(objectUrl); else URL.revokeObjectURL(objectUrl);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [member, visit]);
  return url ? <a className="inline-flex items-center gap-1 font-semibold text-primary underline" href={url} download={`ZatuHealth-visit-${visit.date}.pdf`}><FileText className="h-4 w-4" />Visit PDF</a> : <span className="text-muted-foreground">{error ? 'PDF unavailable; reopen to retry.' : 'Preparing PDF…'}</span>;
}

export function VisitRecords({ member }: { member: Member }) {
  const saveVisit = useServerFn(saveVisitRecord);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [visits, setVisits] = useState(member.visits ?? []);
  const [f, setF] = useState({ date: '', clinic: '', doctor: '', results: '' });
  const [attach, setAttach] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => setVisits(member.visits ?? []), [member.visits]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = visitRecordSchema.safeParse({ ...f, id: uid(), preparation: attach ? member.visitNote : undefined });
    if (!parsed.success) { setError('Enter a valid date, clinic, doctor and results.'); return; }
    setBusy(true); setError('');
    try { await saveVisit({ data: { memberId: member.id, visit: parsed.data } }); setVisits((v) => [parsed.data, ...v]); setAdding(false); }
    catch { setError('Could not save the visit. Please try again.'); }
    finally { setBusy(false); }
  };
  return <>
    <Button size="sm" variant="outline" aria-label={`Visit records for ${member.name}`} onClick={() => setOpen(true)}><FileText />Visit records</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Visit records</DialogTitle><DialogDescription>{member.name}</DialogDescription></DialogHeader>
      {!adding && <Button variant="outline" onClick={() => { setF({ date: new Date().toISOString().slice(0, 10), clinic: member.hospital ?? '', doctor: member.doctor ?? '', results: '' }); setAdding(true); }}><Plus />Add visit</Button>}
      {adding && <form className="space-y-3" onSubmit={submit}>
        <label className="block text-sm">Visit date<input aria-label="Visit date" type="date" className={field} required value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></label>
        <label className="block text-sm">Clinic<input aria-label="Visit clinic" className={field} maxLength={150} required value={f.clinic} onChange={(e) => setF({ ...f, clinic: e.target.value })} /></label>
        <label className="block text-sm">Doctor<input aria-label="Visit doctor" className={field} maxLength={150} required value={f.doctor} onChange={(e) => setF({ ...f, doctor: e.target.value })} /></label>
        <label className="block text-sm">Results<textarea aria-label="Visit results" className={`${field} min-h-28`} maxLength={4000} required value={f.results} onChange={(e) => setF({ ...f, results: e.target.value })} /></label>
        {member.visitNote && <label className="flex gap-2 text-sm"><input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} />Include saved appointment summary in the PDF</label>}
        <div className="flex gap-2"><Button disabled={busy} type="submit"><Save />{busy ? 'Saving…' : 'Save visit'}</Button><Button variant="outline" type="button" onClick={() => setAdding(false)}>Cancel</Button></div>
      </form>}
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {!adding && visits.length === 0 && <p className="text-sm text-muted-foreground">No visits recorded.</p>}
      {!adding && visits.map((visit) => <section key={visit.id} className="space-y-2 border-t pt-3 text-sm"><h3 className="font-bold">{visit.date} · {visit.clinic}</h3><p>{visit.doctor}</p><p className="whitespace-pre-wrap">{visit.results}</p><VisitPdf member={member} visit={visit} /></section>)}
    </DialogContent></Dialog>
  </>;
}