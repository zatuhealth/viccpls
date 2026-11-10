import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { btnAccent, field } from "@/components/zatu";
import { useStore } from "@/lib/store";

const makeCode = () => Array.from(crypto.getRandomValues(new Uint8Array(6))).map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");

export function PartnerInvite() {
  const { householdId, session } = useStore();
  const [code, setCode] = useState<string | null>(null);
  const [join, setJoin] = useState("");
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (!householdId) return;
    supabase.from("household_members").select("user_id", { count: "exact", head: true }).eq("household_id", householdId).then(({ count }) => setCount(count ?? 1));
  }, [householdId]);

  const create = async () => {
    if (!householdId || !session) return;
    const c = makeCode();
    const { error } = await supabase.from("household_invites").insert({ code: c, household_id: householdId, created_by: session.user.id });
    if (error) { toast.error(error.message); return; }
    setCode(c);
  };
  const accept = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.rpc("accept_invite", { _code: join.trim() });
    if (error) { toast.error(error.message); return; }
    toast.success("You've joined the family");
    window.location.reload();
  };

  return (
    <div className="mt-4 space-y-3 rounded-2xl bg-surface p-4 shadow-card">
      <div className="font-bold text-primary">Share with your partner</div>
      <p className="text-sm text-muted-foreground">{count > 1 ? `${count} parents share these records.` : "Give your partner a code so you both see the same family records."}</p>
      {code ? (
        <div className="rounded-xl bg-muted p-3 text-center"><div className="text-xs text-muted-foreground">Invite code — they enter it on their Profile screen</div><div className="font-display text-2xl font-bold tracking-widest text-primary">{code}</div></div>
      ) : (
        <button onClick={create} className={btnAccent}>Create invite code</button>
      )}
      <form onSubmit={accept} className="flex gap-2">
        <input className={field} placeholder="Have a code? Enter it" value={join} onChange={(e) => setJoin(e.target.value)} />
        <button className={btnAccent}>Join</button>
      </form>
    </div>
  );
}

export function SignOutButton() {
  const nav = useNavigate();
  const qc = useQueryClient();
  return (
    <button
      className="mt-4 w-full rounded-xl border border-input px-5 py-3 font-bold text-primary hover:bg-muted"
      onClick={async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); nav({ to: "/auth", replace: true }); }}
    >
      Sign out
    </button>
  );
}
