import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo, btnPrimary, field } from "@/components/zatu";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/admin_/clinic")({
  ssr: false,
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Clinic owner sign-in – ZatuHealth" }, { name: "description", content: "Sign in for clinic owners and staff to manage their own clinic, parents and reminders." }, { property: "og:title", content: "Clinic owner sign-in – ZatuHealth" }, { property: "og:description", content: "Clinic owner and staff sign-in for ZatuHealth." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: ClinicAdminLogin,
});

function ClinicAdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  const enter = async () => {
    const { data: role } = await supabase.rpc("claim_clinic_staff");
    if (!role) { await supabase.auth.signOut(); toast.error("This account isn't active clinic staff. Open the activation link in your invitation email first."); return; }
    nav({ to: "/clinic", replace: true });
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: pw });
    if (error) toast.error(error.message); else await enter();
    setBusy(false);
  };
  const google = async () => {
    sessionStorage.setItem("zatu-clinic-next", "1");
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/admin/clinic" });
    if (r.error) toast.error("Google sign-in failed");
  };
  // Returning from Google or an activation link: finish the staff check.
  useEffect(() => {
    const fromLink = /access_token|code=/.test(window.location.hash + window.location.search);
    if (!fromLink && !sessionStorage.getItem("zatu-clinic-next")) return;
    const finish = () => supabase.auth.getSession().then(({ data }) => { if (data.session) { sessionStorage.removeItem("zatu-clinic-next"); void enter(); } });
    if (fromLink) setTimeout(finish, 800); else void finish();
  }, []);

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <Logo className="mb-6 h-8" />
      <h1 className="mb-1 text-2xl font-bold">Clinic sign-in</h1>
      <p className="mb-6 text-sm text-muted-foreground">For clinic owners and staff only. Each clinic opens its own dashboard. Parents sign in from the family dashboard.</p>
      <form onSubmit={submit} className="grid gap-3">
        <input className={field} type="email" required placeholder="Staff email" aria-label="Staff email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={field} type="password" required placeholder="Password" aria-label="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <button className={btnPrimary} disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <button onClick={google} className="mt-3 w-full rounded-xl border p-3 font-bold">Continue with Google</button>
    </div>
  );
}
