import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo, btnPrimary, field } from "@/components/zatu";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [{ name: "robots", content: "noindex" },
      { title: "Reset password – ZatuHealth" },
      { name: "description", content: "Choose a new password for your ZatuHealth account." },
      { property: "og:title", content: "Reset password – ZatuHealth" },
      { property: "og:description", content: "Choose a new password for your ZatuHealth account." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reset,
});

function Reset() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");

  useEffect(() => {
    const hash = window.location.hash;
    // Recovery link bounced back with an error (expired, already used, bad token).
    if (/error/i.test(hash)) { setStatus("invalid"); return; }
    if (!hash.includes("type=recovery")) {
      // No hash at all: maybe the session was already picked up on a reload.
      supabase.auth.getSession().then(({ data }) => {
        setStatus(data.session ? "ready" : "invalid");
      });
      return;
    }
    // Waiting for the link's token to turn into a session.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") setStatus("ready");
    });
    const timer = setTimeout(() => setStatus((s) => (s === "checking" ? "invalid" : s)), 6000);
    return () => { sub.subscription.unsubscribe(); clearTimeout(timer); };
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    nav({ to: "/app" });
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md space-y-3 rounded-3xl bg-surface p-6 shadow-card">
        <Logo className="h-8" />
        {status === "checking" && <p className="text-sm text-muted-foreground">Checking your reset link…</p>}
        {status === "invalid" && (
          <>
            <h1 className="font-display text-2xl font-bold text-primary">Link no longer works</h1>
            <p className="text-sm text-muted-foreground">
              This password reset link is invalid or has expired. Go back to sign in, tap <b>Forgot password?</b> and we'll email you a fresh link.
            </p>
            <button onClick={() => nav({ to: "/auth" })} className={btnPrimary}>Back to sign in</button>
          </>
        )}
        {status === "ready" && (
          <form onSubmit={save} className="space-y-3">
            <h1 className="font-display text-2xl font-bold text-primary">Set a new password</h1>
            <input className={field} type="password" minLength={6} required placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
            <button className={btnPrimary}>Save password</button>
          </form>
        )}
      </div>
    </div>
  );
}
