import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isPossiblePhoneNumber, type CountryCode } from "libphonenumber-js";
import { Logo, btnPrimary, field } from "@/components/zatu";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useStore } from "@/lib/store";
import { PhoneField } from "@/components/country-fields";
import { internationalPhone, phoneAuthEmail } from "@/lib/countries";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { next?: '/family' } => (search['next'] === '/family' ? { next: '/family' } : {}),
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Sign in – ZatuHealth" },
      { name: "description", content: "Sign in or create your ZatuHealth family account." },
      { property: "og:title", content: "Sign in – ZatuHealth" },
      { property: "og:description", content: "Sign in or create your ZatuHealth family account." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const nav = useNavigate();
  const { session, loading, s } = useStore();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [tab, setTab] = useState<"email" | "mobile">("email");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [phone, setPhone] = useState<{ country: CountryCode; number: string }>({ country: "UG", number: "" });
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (next === '/family') sessionStorage.setItem('zatu-parent-next', '/family');
    if (!loading && session) nav({ to: s.profile?.firstName ? (next === '/family' || sessionStorage.getItem('zatu-parent-next') === '/family' ? '/family' : '/app') : '/onboarding', replace: true });
  }, [loading, session, s.profile?.firstName, nav, next]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (tab === "mobile") {
      const number = internationalPhone(phone.number, phone.country);
      if (!isPossiblePhoneNumber(number)) {
        toast.error("Enter a valid mobile number");
      } else if (!/^\d{6}$/.test(pin)) {
        toast.error("Your PIN must be exactly 6 digits");
      } else {
        const authEmail = phoneAuthEmail(phone.number, phone.country);
        const { error } =
          mode === "up"
            ? await supabase.auth.signUp({ email: authEmail, password: pin })
            : await supabase.auth.signInWithPassword({ email: authEmail, password: pin });
        if (error) toast.error(mode === "in" ? "Wrong number or PIN" : error.message);
      }
    } else if (mode === "up") {
      const { error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin + "/auth" } });
      if (error) toast.error(error.message); else setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) toast.error(error.message);
    }
    setBusy(false);
  };

  const forgot = async () => {
    if (!email) { toast.error("Type your email first"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
    if (error) {
      if (error.status === 429) toast.error("Too many reset emails — try again in about an hour");
      else toast.error(error.message);
    } else toast.success("Check your email for a reset link");
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + (next === '/family' ? '/auth?next=%2Ffamily' : '/auth') });
    if (r.error) toast.error(r.error.message ?? "Google sign-in failed");
  };

  const tabBtn = (active: boolean) =>
    `flex-1 rounded-xl px-4 py-2 text-sm font-bold ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`;

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md space-y-4 rounded-3xl bg-surface p-6 shadow-card">
        <Logo className="h-8" />
        <h1 className="font-display text-2xl font-bold text-primary">{mode === "in" ? "Welcome back" : "Create your family account"}</h1>
        {sent ? (
          <p className="rounded-xl bg-muted p-4 text-sm">We sent a confirmation link to <b>{email}</b>. Open it to finish signing up.</p>
        ) : (
          <>
            <button onClick={google} className="w-full rounded-xl border border-input bg-surface px-5 py-3 font-bold text-primary hover:bg-muted">Continue with Google</button>
            <div className="text-center text-xs text-muted-foreground">or</div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setTab("email")} className={tabBtn(tab === "email")}>Email</button>
              <button type="button" onClick={() => setTab("mobile")} className={tabBtn(tab === "mobile")}>Mobile</button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              {tab === "email" ? (
                <>
                  <input className={field} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input className={field} type="password" required minLength={6} placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
                </>
              ) : (
                <>
                  <PhoneField
                    country={phone.country}
                    number={phone.number}
                    onCountryChange={(country) => setPhone({ ...phone, country })}
                    onNumberChange={(number) => setPhone({ ...phone, number })}
                  />
                  <input
                    className={field}
                    type="password"
                    inputMode="numeric"
                    autoComplete={mode === "up" ? "new-password" : "current-password"}
                    required
                    minLength={6}
                    maxLength={6}
                    pattern="\d{6}"
                    placeholder="6-digit PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </>
              )}
              <button disabled={busy} className={btnPrimary}>{mode === "in" ? "Sign in" : "Sign up"}</button>
            </form>
            {mode === "in" && tab === "email" && <button onClick={forgot} className="text-sm font-semibold text-primary">Forgot password?</button>}
            {tab === "mobile" && <p className="text-xs text-muted-foreground">Your mobile number and 6-digit PIN are your sign-in. Keep your PIN private.</p>}
          </>
        )}
        <p className="text-center text-sm">
          {mode === "in" ? "New to ZatuHealth? " : "Already have an account? "}
          <button className="font-bold text-primary" onClick={() => { setMode(mode === "in" ? "up" : "in"); setSent(false); }}>{mode === "in" ? "Sign up" : "Sign in"}</button>
        </p>
      </div>
    </div>
  );
}
