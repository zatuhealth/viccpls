import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import { Home, Layers, Wallet, Users, User } from "lucide-react";
import { Logo } from "@/components/zatu";

export const Route = createFileRoute("/app")({
  staticData: { sitemap: "exclude-subtree" },
  head: () => ({ meta: [{ title: "ZatuHealth App" }, { property: "og:title", content: "ZatuHealth App" }, { property: "og:description", content: "Your family's vaccinations, appointments and wallet." }, { name: "description", content: "Your family's vaccinations, appointments and wallet." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: AppShell,
});

const nav = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/services", label: "Services", icon: Layers },
  { to: "/app/wallet", label: "Wallet", icon: Wallet },
  { to: "/app/family", label: "Family", icon: Users },
  { to: "/app/profile", label: "Profile", icon: User },
] as const;

function AppShell() {
  const { pathname } = useLocation();
  const { loading } = useStore();
  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading your family…</div>;
  return (
    <div className="min-h-screen md:flex">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col gap-1 border-r bg-surface p-5 md:flex">
        <Link to="/" className="mb-6"><Logo className="h-8" /></Link>
        {nav.map((n) => {
          const on = n.to === "/app" ? pathname === "/app" || pathname === "/app/" : pathname.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold ${on ? "bg-accent text-accent-foreground" : "text-primary hover:bg-muted"}`}>
              <n.icon className="h-5 w-5" /> {n.label}
            </Link>
          );
        })}
        <div className="mt-auto space-y-1 text-sm">
          <Link to="/app/vaccination" className="block rounded-lg px-4 py-2 text-muted-foreground hover:bg-muted">Vaccinations</Link>
          <Link to="/app/appointments" className="block rounded-lg px-4 py-2 text-muted-foreground hover:bg-muted">Appointments</Link>
          <Link to="/clinic" className="block rounded-lg px-4 py-2 text-muted-foreground hover:bg-muted">Clinic dashboard</Link>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-5 md:pb-10 md:pt-8">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t bg-surface px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 md:hidden">
        {nav.map((n) => {
          const on = n.to === "/app" ? pathname === "/app" || pathname === "/app/" : pathname.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-[11px] font-semibold ${on ? "bg-accent text-accent-foreground" : "text-primary"}`}>
              <n.icon className="h-5 w-5" /> {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
