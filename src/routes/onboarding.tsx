import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Logo, btnPrimary, field } from "@/components/zatu";
import { useStore, type Profile } from "@/lib/store";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import { CountrySelect, PhoneField } from "@/components/country-fields";
import { countryCodeForName, internationalPhone, phoneParts } from "@/lib/countries";
import { Button } from "@/components/ui/button";
import { useServerFn } from '@tanstack/react-start';
import { deliverFamilyWelcome } from '@/lib/welcome.functions';

export const Route = createFileRoute("/onboarding")({
  staticData: { sitemap: "exclude-subtree" },
  head: () => ({ meta: [{ title: "Sign up – ZatuHealth" }, { name: "description", content: "Register and complete your ZatuHealth profile." }, { property: "og:title", content: "Sign up – ZatuHealth" }, { property: "og:description", content: "Join ZatuHealth." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Onboarding,
});

function Onboarding() {
  const { s, save, loading } = useStore();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  return <OnboardingForm s={s} save={save} nav={nav} step={step} setStep={setStep} />;
}

function OnboardingForm({ s, save, nav, step, setStep }: { s: ReturnType<typeof useStore>["s"]; save: ReturnType<typeof useStore>["save"]; nav: ReturnType<typeof useNavigate>; step: number; setStep: (n: number) => void }) {
  const deliverWelcome = useServerFn(deliverFamilyWelcome);
  const [busy, setBusy] = useState(false);
  const [p, setP] = useState<Profile>(s.profile ?? { phone: "", email: "", firstName: "", lastName: "", gender: "Male", dob: "", blood: "O+", nationality: "", country: "Uganda", state: "", marital: "Single" });
  const [phone, setPhone] = useState(() => phoneParts(p.phone, countryCodeForName(p.country)));
  const u = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setP({ ...p, [k]: e.target.value });

  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      const number = internationalPhone(phone.number, phone.country);
      if (!isPossiblePhoneNumber(number) || (p.email && !/^\S+@\S+\.\S+$/.test(p.email))) { toast.error("Enter a valid mobile number and email"); return; }
      setP({ ...p, phone: number });
      return setStep(1);
    }
    if (!p.firstName || !p.lastName || !p.dob) { toast.error("Please complete your name and date of birth"); return; }
    setBusy(true);
    try {
      await save((x) => ({ ...x, profile: p, members: x.members.map((m) => (m.id === "self" ? { ...m, name: `${p.firstName} ${p.lastName}`, dob: p.dob, gender: p.gender } : m)) }));
      void deliverWelcome().catch(() => { /* Scheduled delivery handles pending welcomes. */ });
      toast.success("Welcome to ZatuHealth!");
      nav({ to: '/family/onboarding' });
    } catch { toast.error('Could not save your profile. Please try again.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <form onSubmit={next} className="w-full max-w-md space-y-3 rounded-3xl bg-surface p-6 shadow-card">
        <Logo className="mb-2 h-9" />
        <div className="text-sm text-muted-foreground">Step {step + 1} of 2</div>
        <h1 className="text-2xl font-bold">{step === 0 ? "Register" : "Complete your profile"}</h1>
        {step === 0 ? (
          <>
            <PhoneField country={phone.country} number={phone.number} onCountryChange={(country) => setPhone({ ...phone, country })} onNumberChange={(number) => setPhone(number.trim().startsWith("+") ? phoneParts(number, phone.country) : { ...phone, number })} />
            <input type="email" placeholder="Email address (optional)" value={p.email} onChange={u("email")} className={field} />
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="First name" value={p.firstName} onChange={u("firstName")} className={field} />
            <input placeholder="Last name" value={p.lastName} onChange={u("lastName")} className={field} />
            <select value={p.gender} onChange={u("gender")} className={field}><option>Male</option><option>Female</option></select>
            <input type="date" value={p.dob} onChange={u("dob")} className={field} />
            <select value={p.blood} onChange={u("blood")} className={field}>{["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((b) => <option key={b}>{b}</option>)}</select>
            <input placeholder="Nationality" value={p.nationality} onChange={u("nationality")} className={field} />
            <CountrySelect label="Residence country" value={p.country} onChange={(country) => setP({ ...p, country })} />
            <input placeholder="State / Province" value={p.state} onChange={u("state")} className={field} />
            <select value={p.marital} onChange={u("marital")} className={`${field} col-span-2`}>{["Single", "Married", "Divorced", "Widowed"].map((b) => <option key={b}>{b}</option>)}</select>
          </div>
        )}
        <Button type="submit" disabled={busy} className={`${btnPrimary} h-auto`}>{step === 0 ? "NEXT" : "SAVE"}</Button>
      </form>
    </div>
  );
}
