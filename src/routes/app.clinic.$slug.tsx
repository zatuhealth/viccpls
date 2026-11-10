import { createFileRoute, Link } from "@tanstack/react-router";
import { clinicSlug, findClinic, type Clinic } from "@/lib/data";
import { useStore } from '@/lib/store';

export const Route = createFileRoute("/app/clinic/$slug")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Clinic profile – ZatuHealth" }, { name: "description", content: "Clinic opening hours, contact details and location." }, { property: "og:title", content: "Clinic profile – ZatuHealth" }, { property: "og:description", content: "Hours, contacts and map for your family's clinic." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ClinicProfile,
});

function ClinicProfile() {
  const { slug } = Route.useParams();
  const { s } = useStore();
  const saved = s.familyClinic;
  const known: Clinic | undefined = saved && clinicSlug(saved.name) === slug ? { slug, ...saved, email: '', hours: [['Opening hours', saved.hours]] } : findClinic(slug);
  const name = known?.name ?? slug.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
  const place = known?.address ?? name;
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <Link to="/app/family" className="text-sm font-bold text-primary">← Family</Link>
      <h1 className="text-3xl font-bold">{name}</h1>
      <p className="text-muted-foreground">{place}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl bg-surface p-4 shadow-card">
          <h2 className="mb-2 font-bold">Opening hours</h2>
          {known ? <dl className="space-y-1 text-sm">{known.hours.map(([d, h]) => <div key={d} className="flex justify-between"><dt>{d}</dt><dd className="font-semibold">{h}</dd></div>)}</dl> : <p className="text-sm text-muted-foreground">Hours not listed yet — call the clinic to confirm.</p>}
        </section>
        <section className="rounded-2xl bg-surface p-4 shadow-card">
          <h2 className="mb-2 font-bold">Contact</h2>
          {known ? <ul className="space-y-1 text-sm"><li><a className="font-semibold text-primary" href={`tel:${known.phone.replace(/\s/g, "")}`}>{known.phone}</a></li>{known.email && <li><a className="font-semibold text-primary" href={`mailto:${known.email}`}>{known.email}</a></li>}</ul> : <p className="text-sm text-muted-foreground">Contact details have not been provided by the clinic administrator.</p>}
        </section>
      </div>
      <iframe title={`Map of ${name}`} className="h-80 w-full rounded-2xl border shadow-card" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=${encodeURIComponent(place)}&z=15&output=embed`} />
    </div>
  );
}
