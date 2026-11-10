import { createFileRoute, Link } from "@tanstack/react-router";
import { Syringe, Apple, BookOpen } from "lucide-react";
import { ScreenHeader } from "@/components/zatu";

export const Route = createFileRoute("/app/services")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Services – ZatuHealth" }, { name: "description", content: "Vaccination, nutrition and health info." }, { property: "og:title", content: "Services – ZatuHealth" }, { property: "og:description", content: "All ZatuHealth services." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Services,
});

type Item = { icon: typeof Syringe; name: string; desc: string; to?: "/app/vaccination" | "/app/nutrition" | "/app/info" };

const items: Item[] = [
  { icon: Syringe, name: "Vaccination", desc: "Immunity, travel, pregnancy, high risk and pet records", to: "/app/vaccination" },
  { icon: Apple, name: "Nutrition", desc: "Guidance for pregnant mothers and babies", to: "/app/nutrition" },
  { icon: BookOpen, name: "Info", desc: "Vaccines, diseases and prevention", to: "/app/info" },
];

function Services() {
  return (
    <div>
      <ScreenHeader title="Services" />
      <p className="mb-4 text-muted-foreground">Saves lives at every stage of life.</p>
      <div className="grid grid-cols-2 gap-3">
        {items.map((i) => {
          const body = (<><span className="tile mb-3 h-12 w-12 text-accent"><i.icon className="h-6 w-6" /></span><div className="font-bold">{i.name}</div><div className="text-xs text-muted-foreground">{i.desc}</div>{!i.to && <div className="mt-2 text-[11px] font-bold uppercase text-primary">Coming soon</div>}</>);
          return i.to ? <Link key={i.name} to={i.to} className="rounded-2xl bg-surface p-4 shadow-card">{body}</Link> : <div key={i.name} className="rounded-2xl bg-surface p-4 opacity-80">{body}</div>;
        })}
      </div>
      <Link to="/app/book" className="mt-4 block rounded-2xl bg-primary p-5 text-primary-foreground shadow-card"><div className="text-lg font-bold">Book an appointment</div><div className="text-sm opacity-80">Clinics, hospitals, imaging and vets</div></Link>
    </div>
  );
}
