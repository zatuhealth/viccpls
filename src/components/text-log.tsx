import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Row = { id: string; member_id: string; due_date: string; status: string; processed_at: string | null; parent_confirmed_at: string | null };

const statusLabel = (r: Row) =>
  r.parent_confirmed_at ? `Parent confirmed ${r.parent_confirmed_at.slice(0, 10)}` :
  r.status === "accepted" ? "Sent · awaiting parent confirmation" :
  r.status === "unknown" ? "Outcome unclear · not retried" :
  r.status === "processing" ? "Sending" : "Not sent";

/** Overdue text history. Clinic admins see linked families; parents see their own and can confirm receipt. */
export function TextLog({ parent = false }: { parent?: boolean }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const load = async () => {
    const { data, error } = await supabase.from("vaccine_sms_deliveries").select("id, member_id, due_date, status, processed_at, parent_confirmed_at").order("created_at", { ascending: false }).limit(50);
    if (error) { toast.error("Could not load the text log"); setRows([]); return; }
    setRows(data as Row[]);
  };
  useEffect(() => { void load(); }, []);
  const confirm = async (id: string) => {
    const { error } = await supabase.rpc("confirm_vaccine_text", { _id: id });
    if (error) { toast.error("Could not confirm"); return; }
    toast.success("Thanks — the clinic can see you got the text");
    void load();
  };
  return (
    <section aria-label="Overdue text log" className="mt-8 rounded-2xl bg-surface p-4 shadow-card">
      <h2 className="mb-1 text-xl font-bold">{parent ? "Texts from your clinic" : "Overdue text log"}</h2>
      <p className="mb-3 text-sm text-muted-foreground">{parent ? "Tap “I got this text” so your clinic knows it arrived." : "Texts sent to invited families, and whether the parent confirmed they arrived."}</p>
      {rows === null ? <p className="text-sm text-muted-foreground">Loading…</p> : rows.length === 0 ? <p className="text-sm text-muted-foreground">No overdue texts yet.</p> : (
        <ul className="divide-y text-sm">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>Overdue dose due {r.due_date}{r.processed_at ? ` · sent ${r.processed_at.slice(0, 10)}` : ""}</span>
              <span className="flex items-center gap-2">
                <span className={r.parent_confirmed_at ? "font-semibold text-primary" : "text-muted-foreground"}>{statusLabel(r)}</span>
                {parent && r.status === "accepted" && !r.parent_confirmed_at && <Button size="sm" variant="outline" onClick={() => confirm(r.id)}>I got this text</Button>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
