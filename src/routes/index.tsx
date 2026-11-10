import { createFileRoute, Link } from "@tanstack/react-router";
import { Syringe, Users, CalendarClock, Wallet, Bell, Repeat, Plane, Baby, HeartPulse, PawPrint } from "lucide-react";
import { Logo } from "@/components/zatu";
import ali from "@/assets/av-ali.jpg";
import mrs from "@/assets/av-mrs.jpg";
import jr from "@/assets/av-jr.jpg";
import cat from "@/assets/av-cat.jpg";
import dog from "@/assets/av-dog.jpg";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "ZatuHealth – care for your whole family" },
      { name: "description", content: "Vaccination records, reminders and one-tap booking for you, your children, parents and pets." },
      { property: "og:title", content: "ZatuHealth – care for your whole family" },
      { property: "og:description", content: "Vaccinations, appointments and payments in one app." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Landing,
});

const stats = [["1 in 10", "children worldwide miss lifesaving vaccines"], ["Every 20 sec", "a child dies from a vaccine-preventable disease"], ["2–3 million", "lives saved by immunization each year"]];
const cats = [[Syringe, "Immunity", "Store dependents' records and get reminders when it's time to vaccinate."], [Plane, "Travel", "Know the vaccines you need for your destination."], [Baby, "Pregnancy", "Stay up to date before and during pregnancy."], [HeartPulse, "High risk", "Recommended doses for chronic conditions."], [PawPrint, "Pet", "Timelines for your pets and diseases they can spread."]] as const;
const feats = [[Users, "Book for family", "Add dependents once. Pick who the visit is for each time."], [CalendarClock, "Online, clinic or home", "Choose how you're seen, then only see times that fit."], [Wallet, "Pay your way", "Wallet, card, mobile money or insurance. Deposit now, balance later."], [Bell, "Reminders that arrive", "SMS, WhatsApp, email and in-app before every visit."], [Repeat, "Repeat visits", "Weekly, monthly or quarterly with the same specialist."]] as const;

function Landing() {
  return (
    <div>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo className="h-8" />
        <div className="flex gap-2"><Link to="/auth" className="hidden rounded-xl px-4 py-2.5 font-bold text-primary sm:block">Sign up</Link><Link to="/app" className="rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground">Open the app</Link></div>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 md:grid-cols-2 md:py-16">
        <div>
          <div className="mb-4 inline-block rounded-full bg-accent/25 px-3 py-1 text-sm font-bold text-accent-foreground">Saves lives at every stage of life</div>
          <h1 className="text-5xl font-extrabold leading-[1.02] md:text-6xl">One app for the whole family's care.</h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">Track vaccinations, book a doctor, pay a deposit and get reminders — for yourself, your children, your parents and even your pets.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link to="/app/book" className="rounded-xl bg-primary px-6 py-3.5 font-bold text-primary-foreground shadow-card">Book a visit</Link><Link to="/app/vaccination" className="rounded-xl bg-accent px-6 py-3.5 font-bold text-accent-foreground">Vaccine records</Link></div>
        </div>
        <div className="rounded-[2.5rem] bg-primary p-6 text-primary-foreground shadow-card">
          <div className="mb-4 text-sm font-bold tracking-wider opacity-80">MY RECORDS</div>
          <div className="grid grid-cols-5 gap-2">{[ali, mrs, jr, cat, dog].map((s, i) => <img key={i} src={s} alt="" className={`aspect-square w-full rounded-2xl object-cover ${i === 2 ? "ring-4 ring-accent" : ""}`} />)}</div>
          <div className="mt-5 rounded-2xl bg-surface p-4 text-foreground"><div className="text-xs font-bold text-muted-foreground">WITHIN 24 HRS OF BIRTH</div><div className="mt-1 flex items-center justify-between"><div><div className="font-bold">HBV · Hepatitis B</div><div className="text-sm text-muted-foreground">West Salmiyah Clinic</div></div><span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">✓ Taken</span></div></div>
          <div className="mt-3 rounded-2xl bg-primary-foreground/10 p-4"><div className="text-sm opacity-80">Next appointment</div><div className="font-bold">Dr. Grace Namuli · Paediatrics</div><div className="text-sm opacity-80">Wed 4 Nov · 10:00 · Nsambya</div></div>
        </div>
      </section>

      <section className="bg-primary py-12 text-primary-foreground"><div className="mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-3">{stats.map(([n, t]) => <div key={n}><div className="font-display text-4xl font-extrabold text-accent">{n}</div><div className="opacity-85">{t}</div></div>)}</div></section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="mb-8 text-3xl font-bold md:text-4xl">Vaccination for every stage</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cats.map(([I, h, p]) => <div key={h} className="rounded-3xl bg-surface p-5 shadow-card"><span className="tile mb-3 h-12 w-12 text-accent"><I className="h-6 w-6" /></span><h3 className="font-bold">{h}</h3><p className="mt-1 text-sm text-muted-foreground">{p}</p></div>)}</div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="mb-8 text-3xl font-bold md:text-4xl">From "I need a doctor" to "I'm booked"</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{feats.map(([I, h, p]) => <div key={h} className="rounded-3xl border bg-surface p-5"><I className="mb-3 h-7 w-7 text-primary" /><h3 className="font-bold">{h}</h3><p className="mt-1 text-sm text-muted-foreground">{p}</p></div>)}
          <Link to="/clinic" className="rounded-3xl bg-accent p-5 text-accent-foreground"><h3 className="text-lg font-bold">For clinics, salons, garages & schools →</h3><p className="mt-1 text-sm">See the day at a glance, invoice and collect, and know what's working.</p></Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© 2026 ZatuHealth · Names, prices and times are sample data.</footer>
    </div>
  );
}
