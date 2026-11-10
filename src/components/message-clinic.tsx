import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { sendClinicMessage } from "@/lib/clinic-message.functions";
import { Button } from "@/components/ui/button";

/** Lets a parent send a private note to their clinic about a child's doses. */
export function MessageClinic({ children }: { householdId?: string; children: { name: string }[] }) {
  const [child, setChild] = useState(children[0]?.name ?? "");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const sendFn = useServerFn(sendClinicMessage);
  const [past, setPast] = useState<{ id: string; child_name: string; body: string; created_at: string; reply_body: string | null; replied_at: string | null }[]>([]);
  const load = () => { void supabase.from("clinic_messages").select("id, child_name, body, created_at, reply_body, replied_at").order("created_at", { ascending: false }).limit(20).then(({ data }) => setPast(data ?? [])); };
  useEffect(load, []);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setBusy(true);
    let ok = true;
    try { await sendFn({ data: { childName: child, body: text.slice(0, 2000) } }); } catch { ok = false; }
    setBusy(false);
    if (!ok) { toast.error("Message could not be sent"); return; }
    setBody(""); toast.success("Message sent to your clinic"); load();
  };
  const field = "mt-1 w-full rounded-lg border bg-background px-3 py-2";
  return (
    <section aria-label="Message your clinic" className="border-t pt-6">
      <h2 className="mb-1 text-xl font-bold">Message your clinic</h2>
      <p className="mb-3 text-sm text-muted-foreground">Ask about a dose or a date. For emergencies, call your clinic directly.</p>
      <form onSubmit={send} className="space-y-3">
        {children.length > 0 && <label className="block text-sm">About<select className={field} value={child} onChange={(e) => setChild(e.target.value)}>{children.map((c) => <option key={c.name}>{c.name}</option>)}</select></label>}
        <label className="block text-sm">Message<textarea required maxLength={2000} rows={3} className={field} value={body} onChange={(e) => setBody(e.target.value)} /></label>
        <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send message"}</Button>
      </form>
      {past.length > 0 && <ul className="mt-5 space-y-3">{past.map((m) => <li key={m.id} className="rounded-xl border p-3 text-sm">
        <p className="text-muted-foreground">{m.created_at.slice(0, 10)}{m.child_name ? ` · about ${m.child_name}` : ""}</p>
        <p className="whitespace-pre-wrap break-words">{m.body}</p>
        {m.reply_body ? <div className="mt-2 border-l-2 border-primary pl-3"><p className="text-muted-foreground">Clinic reply · {m.replied_at?.slice(0, 10)}</p><p className="whitespace-pre-wrap break-words">{m.reply_body}</p></div> : <p className="mt-1 text-xs text-muted-foreground">Awaiting clinic reply</p>}
      </li>)}</ul>}
    </section>
  );
}
