import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Star, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Chip, MemberPicker, ScreenHeader, btnPrimary, field } from "@/components/zatu";
import { uid, useStore } from "@/lib/store";
import { providers, slots, ugx } from "@/lib/data";
import { useServerFn } from "@tanstack/react-start";
import { sendAppointmentConfirmation } from "@/lib/appointment-email.functions";

export const Route = createFileRoute("/app/book")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Book a visit – ZatuHealth" }, { name: "description", content: "Book care for yourself, your children, parents or pets." }, { property: "og:title", content: "Book a visit – ZatuHealth" }, { property: "og:description", content: "Pick a specialist, time and payment." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Book,
});

const modes = ["Online", "At clinic", "At home", "Drive-through"];
const payments = ["Wallet", "Mobile money", "Card", "Insurance"];
const recurrences = ["None", "Weekly", "Monthly", "Quarterly"];
const days = Array.from({ length: 10 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d.toISOString().slice(0, 10); });
const STEPS = ["Specialist", "Visit", "Payment", "Review"];

function Book() {
  const { s, save } = useStore();
  const sendConfirmation = useServerFn(sendAppointmentConfirmation);
  const [booking, setBooking] = useState(false);
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [f, setF] = useState({ providerId: "", memberId: "self", mode: "At clinic", date: days[0] ?? "", time: "", branch: "", payment: "Wallet", deposit: true, recurring: "None", terms: false });
  const p = providers.find((x) => x.id === f.providerId);
  const list = useMemo(() => providers.filter((x) => (type === "All" || x.type === type) && `${x.name} ${x.specialty} ${x.business}`.toLowerCase().includes(q.toLowerCase())), [q, type]);
  const taken = (t: string) => s.appointments.some((a) => a.providerId === f.providerId && a.date === f.date && a.time === t && a.status !== "cancelled") || t === "12:00";
  const due = p ? (f.deposit ? Math.round(p.price * 0.3) : p.price) : 0;

  const can = [!!p, !!f.time && !!f.branch, !!f.payment, f.terms][step];

  const confirm = async () => {
    if (!p) return undefined;
    if (f.payment === "Wallet" && s.wallet < due) { toast.error("Not enough wallet balance – choose another payment method"); return; }
    setBooking(true);
    const appointmentId = uid();
    try {
    await save((x) => ({
      ...x,
      wallet: f.payment === "Wallet" ? x.wallet - due : x.wallet,
      appointments: [{ id: appointmentId, providerId: p.id, memberId: f.memberId, date: f.date, time: f.time, mode: f.mode, payment: f.payment, deposit: f.deposit, recurring: f.recurring, branch: f.branch, status: "confirmed", amount: p.price }, ...x.appointments],
    }));
    try { const result = await sendConfirmation({ data: { appointmentId } }); toast.success(result.message); }
    catch { toast.success("Appointment saved. Confirmation email could not be sent."); }
    nav({ to: "/app/appointments" });
    } catch { toast.error("Could not save the appointment. Please try again."); }
    finally { setBooking(false); }
  };

  return (
    <div>
      <ScreenHeader title="Book a visit" />
      <div className="mb-5 flex gap-1.5">{STEPS.map((x, i) => <div key={x} className="flex-1"><div className={`h-1.5 rounded-full ${i <= step ? "bg-accent" : "bg-input"}`} /><div className={`mt-1 text-[11px] font-semibold ${i === step ? "text-primary" : "text-muted-foreground"}`}>{x}</div></div>)}</div>

      {step === 0 && (
        <div className="space-y-3">
          <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search doctor, service (MRI, X-ray…) or business" className={`${field} pl-9`} /></div>
          <div className="flex flex-wrap gap-2">{["All", "Clinic", "Hospital", "Vet"].map((t) => <Chip key={t} on={type === t} onClick={() => setType(t)}>{t}</Chip>)}</div>
          {list.map((x) => (
            <button key={x.id} onClick={() => setF({ ...f, providerId: x.id, branch: x.branches[0] ?? "", time: "" })} className={`flex w-full items-center gap-3 rounded-2xl border-2 bg-surface p-4 text-left shadow-card ${f.providerId === x.id ? "border-accent" : "border-transparent"}`}>
              <div className="tile h-12 w-12 flex-none font-bold">{x.initials}</div>
              <div className="min-w-0 flex-1"><div className="font-bold">{x.name}</div><div className="text-sm text-muted-foreground">{x.specialty} · {x.business}</div><div className="flex items-center gap-1 text-xs text-muted-foreground">{x.lang} · <Star className="h-3 w-3 fill-accent text-accent" /> {x.rating}</div></div>
              <div className="text-right text-sm font-bold text-primary">{ugx(x.price)}</div>
            </button>
          ))}
          {list.length === 0 && <p className="text-center text-sm text-muted-foreground">No matches.</p>}
        </div>
      )}

      {step === 1 && p && (
        <div className="space-y-5">
          <div><div className="mb-2 text-sm font-bold">Who is this visit for?</div><MemberPicker value={f.memberId} onChange={(id) => setF({ ...f, memberId: id })} addLink={false} /></div>
          <div><div className="mb-2 text-sm font-bold">Service delivery</div><div className="flex flex-wrap gap-2">{modes.map((m) => <Chip key={m} on={f.mode === m} onClick={() => setF({ ...f, mode: m })}>{m}</Chip>)}</div></div>
          <div><div className="mb-2 text-sm font-bold">Branch</div><div className="flex flex-wrap gap-2">{p.branches.map((b) => <Chip key={b} on={f.branch === b} onClick={() => setF({ ...f, branch: b })}>{b}</Chip>)}</div></div>
          <div><div className="mb-2 text-sm font-bold">Date</div><div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">{days.map((d) => { const dt = new Date(d); return <button key={d} onClick={() => setF({ ...f, date: d, time: "" })} className={`w-16 flex-none rounded-2xl py-2 text-center ${f.date === d ? "bg-primary text-primary-foreground" : "bg-surface"}`}><div className="text-xs">{dt.toLocaleDateString("en", { weekday: "short" })}</div><div className="text-lg font-bold">{dt.getDate()}</div></button>; })}</div></div>
          <div><div className="mb-2 text-sm font-bold">Visiting hours</div><div className="flex flex-wrap gap-2">{slots.map((t) => <Chip key={t} on={f.time === t} disabled={taken(t)} onClick={() => setF({ ...f, time: t })}>{t}</Chip>)}</div></div>
          <div><div className="mb-2 text-sm font-bold">Repeat</div><div className="flex flex-wrap gap-2">{recurrences.map((r) => <Chip key={r} on={f.recurring === r} onClick={() => setF({ ...f, recurring: r })}>{r}</Chip>)}</div></div>
        </div>
      )}

      {step === 2 && p && (
        <div className="space-y-5">
          <div><div className="mb-2 text-sm font-bold">Payment method</div><div className="grid grid-cols-2 gap-2">{payments.map((m) => <Chip key={m} on={f.payment === m} onClick={() => setF({ ...f, payment: m })}>{m}{m === "Wallet" && ` (${ugx(s.wallet)})`}</Chip>)}</div></div>
          <div><div className="mb-2 text-sm font-bold">Amount</div><div className="flex gap-2"><Chip on={f.deposit} onClick={() => setF({ ...f, deposit: true })}>Booking fee 30%</Chip><Chip on={!f.deposit} onClick={() => setF({ ...f, deposit: false })}>Full amount</Chip></div></div>
          <div className="rounded-2xl bg-surface p-4 text-sm"><div className="flex justify-between"><span>Consultation</span><b>{ugx(p.price)}</b></div><div className="mt-2 flex justify-between text-lg"><span>Pay now</span><b className="text-primary">{ugx(due)}</b></div>{f.deposit && <div className="text-xs text-muted-foreground">Balance {ugx(p.price - due)} paid at the visit.</div>}</div>
        </div>
      )}

      {step === 3 && p && (
        <div className="space-y-3">
          <div className="space-y-2 rounded-2xl bg-surface p-4 text-sm shadow-card">
            {[["Specialist", p.name], ["Business", `${p.business} – ${f.branch}`], ["For", s.members.find((m) => m.id === f.memberId)?.name], ["When", `${f.date} at ${f.time}`], ["Delivery", f.mode], ["Repeat", f.recurring], ["Payment", `${f.payment} · ${ugx(due)} now`]].map(([k, v]) => <div key={k} className="flex justify-between gap-4"><span className="text-muted-foreground">{k}</span><b className="text-right">{v}</b></div>)}
          </div>
          <div className="rounded-2xl bg-muted p-4 text-xs leading-relaxed text-muted-foreground">Free cancellation up to 24 hours before. Later cancellations and no-shows forfeit the booking fee. Reminders are sent by SMS, WhatsApp, email and in-app.</div>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={f.terms} onChange={(e) => setF({ ...f, terms: e.target.checked })} className="h-4 w-4" /> I accept the terms & conditions</label>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        {step > 0 && <button onClick={() => setStep(step - 1)} className="rounded-xl border bg-surface px-5 font-bold">Back</button>}
        <button disabled={!can || booking} onClick={() => (step < 3 ? setStep(step + 1) : confirm())} className={btnPrimary}>{booking ? "Saving…" : step < 3 ? "Continue" : "Book now"}</button>
      </div>
    </div>
  );
}
