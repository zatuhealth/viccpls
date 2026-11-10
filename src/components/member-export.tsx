import { useEffect, useState } from "react";
import { Download, FileDown, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Member } from "@/lib/data";
import { memberReportFilename, memberReportSections } from "@/lib/member-report";
import { deliverReport } from "@/lib/member-pdf";

export function MemberExport({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!open) return;
    let active = true;
    setBlob(null); setError("");
    void import("@/lib/member-pdf").then(async ({ createMemberPdf, loadReportFonts }) => {
      const result = await createMemberPdf(member, await loadReportFonts());
      if (active) setBlob(result);
    }).catch(() => { if (active) setError("Could not prepare the PDF. Please try again."); });
    return () => { active = false; };
  }, [open, member, attempt]);
  const download = () => {
    if (!blob) return;
    void deliverReport(blob, memberReportFilename(member.name)).catch(() => toast.error("Could not download the PDF. Please try again."));
  };
  return <>
    <Button variant="outline" size="sm" onClick={() => setOpen(true)} aria-label={`Export PDF for ${member.name}`}><FileDown />Export PDF</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto">
        <DialogHeader><DialogTitle>Clinic details</DialogTitle><DialogDescription>{member.name} · Health & school details</DialogDescription></DialogHeader>
        <div className="space-y-4">
          {memberReportSections(member).map((section) => <section key={section.title}>
            <h3 className="mb-2 font-semibold text-primary">{section.title}</h3>
            <dl className="space-y-2 text-sm">{section.rows.map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-3"><dt className="text-muted-foreground">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl>
          </section>)}
        </div>
        {error ? <div role="alert" className="text-sm text-destructive">{error}<Button variant="link" onClick={() => setAttempt((n) => n + 1)}>Try again</Button></div> :
          <Button disabled={!blob} onClick={download}>{blob ? <Download /> : <LoaderCircle className="animate-spin" />}{blob ? "Download PDF" : "Preparing PDF…"}</Button>}
      </DialogContent>
    </Dialog>
  </>;
}