import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { seedMembers, type Member } from "./data";

export type Appointment = {
  id: string; providerId: string; memberId: string; date: string; time: string;
  mode: string; payment: string; deposit: boolean; recurring: string; branch: string;
  status: "confirmed" | "cancelled" | "rescheduled" | "completed"; amount: number;
};
export type Profile = { phone: string; email: string; firstName: string; lastName: string; gender: string; dob: string; blood: string; nationality: string; country: string; state: string; marital: string };
export type VaxRecord = { taken: boolean; date: string; note: string };

export type State = {
  overdueSmsEnabled?: boolean;
  clinicConfirmation?: { clinic: { name: string; address: string; phone: string; hours: string }; confirmedAt: string };
  familyClinic?: { name: string; address: string; phone: string; hours: string };
  profile: Profile | null;
  members: Member[];
  records: Record<string, VaxRecord>; // key `${memberId}:${vaccineId}`
  appointments: Appointment[];
  wallet: number;
  /** Top-up requests awaiting payment confirmation; never spendable until confirmed. */
  pendingTopUps?: { id: string; amount: number; requestedAt: string }[];
};

const fresh = (authEmail = ""): State => {
  const m = /^(\d+)@phone\.zatuhealth\.com$/.exec(authEmail);
  const email = m ? "" : authEmail;
  const phone = m ? `+${m[1]}` : "";
  return freshProfile(email, phone);
};
const freshProfile = (email: string, phone: string): State => ({
  profile: { phone, email, firstName: "", lastName: "", gender: "Male", dob: "", blood: "O+", nationality: "", country: "Uganda", state: "", marital: "Married" },
  members: seedMembers.filter((m) => m.id === "self").map((m) => ({ ...m, name: "Me", dob: "", center: "" })),
  records: {},
  appointments: [],
  wallet: 0,
});

type Ctx = {
  s: State;
  set: (fn: (s: State) => State) => void;
  save: (fn: (s: State) => State) => Promise<void>;
  session: Session | null;
  householdId: string | null;
  loading: boolean;
};
const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [householdId, setHid] = useState<string | null>(null);
  const [s, setS] = useState<State>(fresh());
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef<string>("");

  const load = useCallback(async (sess: Session | null) => {
    setSession(sess);
    if (!sess) { setHid(null); setS(fresh()); setLoading(false); return; }
    const { data: hid, error } = await supabase.rpc("my_household");
    if (error || !hid) { setLoading(false); return; }
    setHid(hid as string);
    await supabase.rpc('accept_pending_clinic_links');
    const { data } = await supabase.from("households").select("data").eq("id", hid as string).single();
    const d = (data?.data ?? {}) as Partial<State>;
    const st = Object.keys(d).length ? { ...fresh(sess.user.email ?? ""), ...d } : fresh(sess.user.email ?? "");
    lastSaved.current = JSON.stringify(st);
    setS(st);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => load(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") { setLoading(true); load(sess); }
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  // Live updates from a partner editing the same family
  useEffect(() => {
    if (!householdId) return;
    const ch = supabase
      .channel(`hh-${householdId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "households", filter: `id=eq.${householdId}` }, (p) => {
        const d = (p.new as { data: State }).data;
        const j = JSON.stringify(d);
        if (j !== lastSaved.current) { lastSaved.current = j; setS(d); }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [householdId]);

  const persist = useCallback(async (next: State) => {
    if (!householdId) return { error: new Error("no household"), next };
    const base = (() => { try { return Number((JSON.parse(lastSaved.current || "{}") as Partial<State>).wallet ?? next.wallet); } catch { return next.wallet; } })();
    const cur = await supabase.from("households").select("data").eq("id", householdId).single();
    const serverWallet = Number((cur.data?.data as Partial<State> | undefined)?.wallet ?? base);
    const merged = { ...next, wallet: mergeWallet(serverWallet, base, next.wallet) };
    lastSaved.current = JSON.stringify(merged);
    const { error } = await supabase.from("households").update({ data: merged as never, updated_at: new Date().toISOString() }).eq("id", householdId);
    if (merged.wallet !== next.wallet) setS((p) => ({ ...p, wallet: merged.wallet }));
    return { error, next: merged };
  }, [householdId]);

  const set = useCallback((fn: (s: State) => State) => {
    setS((prev) => {
      const next = fn(prev);
      if (householdId) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
          await persist(next);
        }, 400);
      }
      return next;
    });
  }, [householdId, persist]);

  const save = async (fn: (s: State) => State) => {
    if (!householdId) throw new Error("Sign in to save this note.");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const next = fn(s);
    const r = await persist(next);
    if (r.error) throw new Error("Could not save this note. Please try again.");
    setS(r.next);
  };

  return <C.Provider value={{ s, set, save, session, householdId, loading }}>{children}</C.Provider>;
}

export function useStore() {
  const c = useContext(C);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}

/** Applies the family's own wallet change (spending) on top of the latest saved balance, so a payment recorded by the clinic is never undone by a stale save. */
export const mergeWallet = (serverWallet: number, baseWallet: number, nextWallet: number) => Math.max(0, serverWallet + (nextWallet - baseWallet));

export const uid = () => Math.random().toString(36).slice(2, 9);
export const age = (dob: string) => {
  const d = new Date(dob), n = new Date();
  let m = (n.getFullYear() - d.getFullYear()) * 12 + n.getMonth() - d.getMonth();
  if (m < 0) m = 0;
  const y = Math.floor(m / 12);
  return y ? `${y} yr${y > 1 ? "s" : ""}, ${m % 12} mo` : `${m} months`;
};
