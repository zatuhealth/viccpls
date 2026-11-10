import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, ArrowLeftRight, CreditCard, QrCode, CalendarPlus, CalendarCheck, RefreshCw, XCircle, History, Bell, Leaf, Menu } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MemberPicker, SectionTitle } from "@/components/zatu";
import { useStore } from "@/lib/store";
import { ugx } from "@/lib/data";

export const Route = createFileRoute("/app/")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Home – ZatuHealth" }, { name: "description", content: "Your ZatuHealth home: vaccinations, appointments and invoices." }, { property: "og:title", content: "Home – ZatuHealth" }, { property: "og:description", content: "Your ZatuHealth home." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: HomeScreen,
});

function HomeScreen() {
  const { s, set } = useStore();
  const nav = useNavigate();
  const [sel, setSel] = useState("self");
  const [invoicePaid, setPaid] = useState(false);
  const name = s.profile ? `${s.profile.firstName} ${s.profile.lastName}` : "Guest";
  const upcoming = s.appointments.filter((a) => a.status === "confirmed" || a.status === "rescheduled").length;

  const appts = [
    { icon: CalendarPlus, label: "Book Visit", to: "/app/book", green: true },
    { icon: CalendarCheck, label: "Upcoming", to: "/app/appointments" },
    { icon: RefreshCw, label: "Reschedule", to: "/app/appointments" },
    { icon: XCircle, label: "Cancel", to: "/app/appointments" },
    { icon: History, label: "Past Visits", to: "/app/appointments" },
    { icon: Bell, label: "Reminders", to: "/app/appointments" },
  ] as const;

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Link to="/app/services" aria-label="Menu" className="text-ink"><Menu className="h-7 w-7" /></Link>
        <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{name[0]}</div>
        <div><div className="text-sm text-muted-foreground">Welcome to ZatuHealth</div><div className="text-xl font-bold">{name}</div></div>
      </div>

      <div className="grid grid-cols-4 rounded-3xl bg-primary px-2 py-4 text-center text-xs text-primary-foreground shadow-card">
        {[[Plus, "Add Fund"], [ArrowLeftRight, "Transfer"], [CreditCard, "Pay Me"], [QrCode, "Scan QR"]].map(([I, l]) => {
          const Icon = I as typeof Plus;
          return (
            <Link key={l as string} to="/app/wallet" className="flex flex-col items-center gap-1.5">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-foreground/15"><Icon className="h-6 w-6" /></span>{l as string}
            </Link>
          );
        })}
      </div>

      <SectionTitle action={<Link to="/app/family" aria-label="Add record" className="text-primary"><Plus /></Link>}>Vaccinations</SectionTitle>
      <div className="mb-3 flex justify-between text-xs font-bold tracking-wider">
        <span className="text-muted-foreground">MY RECORDS</span>
        <Link to="/app/vaccination" className="text-primary">VACCINE REGISTRY &gt;</Link>
      </div>
      <MemberPicker value={sel} onChange={setSel} addLink={false} />
      <div className="mt-3 flex gap-6 text-sm font-bold tracking-wide">
        {["immunity", "travel", "pregnancy", "high-risk"].map((t) => (
          <button key={t} onClick={() => nav({ to: "/app/vaccination", search: { member: sel, tab: t } })} className="border-b-[3px] border-transparent pb-1 uppercase text-muted-foreground hover:border-accent hover:text-primary">
            {t.replace("-", " ")}
          </button>
        ))}
      </div>

      <SectionTitle>Manage Appointments {upcoming > 0 && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 align-middle text-xs text-accent-foreground">{upcoming} upcoming</span>}</SectionTitle>
      <div className="grid grid-cols-4 gap-x-2 gap-y-4">
        {appts.map((a) => (
          <Link key={a.label} to={a.to} className="text-center text-xs font-medium text-ink">
            <span className={`tile mx-auto mb-1.5 h-16 w-16 ${"green" in a ? "text-accent" : ""}`}><a.icon className="h-7 w-7" /></span>
            {a.label}
          </Link>
        ))}
      </div>

      <SectionTitle action={<Link to="/app/wallet" className="text-sm text-muted-foreground">See All &gt;</Link>}>Pay Invoice</SectionTitle>
      <div className="rounded-3xl bg-primary p-4 text-primary-foreground shadow-card">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-surface text-accent"><Leaf className="h-8 w-8 fill-accent" /></div>
          <div className="min-w-0 flex-1"><div className="font-bold">Mulago Clinic</div><div className="text-sm opacity-80">Consultation</div><div className="text-sm opacity-80">2026-09-12</div></div>
          <div className="text-right">
            <div className="text-lg font-bold">{ugx(55000)}</div>
            <button
              disabled={invoicePaid}
              onClick={() => {
                if (s.wallet < 55000) { toast.error("Not enough funds in your wallet"); return; }
                set((x) => ({ ...x, wallet: x.wallet - 55000 }));
                setPaid(true);
                toast.success("Invoice paid from wallet");
              }}
              className="mt-1 rounded-xl bg-accent px-6 py-1.5 font-bold text-accent-foreground disabled:opacity-60"
            >{invoicePaid ? "Paid" : "Pay"}</button>
          </div>
        </div>
        <div className="mt-4 flex justify-between border-t border-primary-foreground/20 pt-3 text-sm"><span>Order Reference</span><b>7710676592682845</b></div>
      </div>
    </div>
  );
}
