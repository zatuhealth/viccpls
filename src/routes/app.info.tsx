import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Info as InfoIcon } from "lucide-react";
import { ScreenHeader } from "@/components/zatu";
import { vaccines } from "@/lib/data";

export const Route = createFileRoute("/app/info")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Info – ZatuHealth" }, { name: "description", content: "Learn about vaccines, the diseases they prevent and everyday prevention." }, { property: "og:title", content: "Info – ZatuHealth" }, { property: "og:description", content: "Vaccines, diseases and prevention." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Info,
});

const diseases = [
  { name: "Hepatitis B", vax: "hbv", spread: "Blood, body fluids and from mother to baby at birth.", risk: "Long-term liver damage, cirrhosis and liver cancer." },
  { name: "Tuberculosis (TB)", vax: "bcg", spread: "Airborne droplets when an infected person coughs.", risk: "Serious lung disease; severe forms in young children (TB meningitis)." },
  { name: "Polio", vax: "opv", spread: "Contaminated food, water and hands.", risk: "Permanent paralysis, most often in children under 5." },
  { name: "Whooping cough (Pertussis)", vax: "dtp", spread: "Cough droplets; very contagious.", risk: "Dangerous coughing fits and breathing pauses in babies under 1 year." },
  { name: "Measles", vax: "mmr", spread: "Airborne — one of the most contagious viruses known.", risk: "Pneumonia, brain swelling and death, especially in malnourished children." },
  { name: "Rubella", vax: "mmr", spread: "Airborne droplets.", risk: "Mild in children, but infection in early pregnancy causes serious birth defects." },
  { name: "Tetanus", vax: "dtp", spread: "Bacteria entering wounds or a newborn's umbilical stump.", risk: "Painful muscle spasms that can stop breathing; often fatal without care." },
  { name: "Diphtheria", vax: "dtp", spread: "Cough droplets and close contact.", risk: "A thick airway membrane that can block breathing; heart and nerve damage." },
];

const prevention = [
  { title: "Vaccinate on schedule", body: "Vaccines work best when given on time. If your child has missed a dose, it is not too late — ask your clinic to catch up. Adults need boosters too, especially before pregnancy and travel." },
  { title: "Wash hands well", body: "Wash with soap under running water for at least 20 seconds — before eating or cooking, after the toilet, after handling animals and after sneezing. Teach children the habit early." },
  { title: "Use safe water and food", body: "Drink boiled or treated water. Wash or cook vegetables and fruit; cook meat and eggs thoroughly. Cover food and keep flies away from it — many gut diseases spread through food." },
  { title: "Breastfeed and feed well", body: "Breast milk protects babies against many infections. Good nutrition — including the foods on the Nutrition screen — keeps the immune system strong at every age." },
  { title: "Prevent mosquito bites", body: "Sleep under a treated mosquito net, clear standing water around the home, and cover up at dusk. Mosquitoes spread malaria and dengue, which no vaccine covers fully." },
  { title: "Keep wounds clean", body: "Wash cuts and scrapes with soap and clean water, cover them, and watch for redness or pus. Deep or dirty wounds need a clinic visit — and tetanus protection is up to date." },
  { title: "Cover coughs and stay home when sick", body: "Cough or sneeze into your elbow, not your hand. Keep sick children home from school and avoid crowds during outbreaks to protect babies and elderly family members." },
];

function Info() {
  return (
    <div>
      <ScreenHeader title="Info" />
      <p className="mb-4 text-muted-foreground">Vaccines, the diseases they prevent, and everyday prevention.</p>

      <div className="mb-2 text-xs font-bold tracking-wider text-muted-foreground">VACCINES</div>
      <div className="mb-5 space-y-2">
        {vaccines.map((v) => (
          <Link key={v.id} to="/app/vaccine/$id" params={{ id: v.id }} className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-card">
            <InfoIcon className="h-5 w-5 flex-none text-accent" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="font-bold">{v.name}</div>
              <div className="text-sm text-muted-foreground">{v.disease}</div>
            </div>
            <ChevronRight className="h-4 w-4 flex-none text-muted-foreground" aria-hidden />
          </Link>
        ))}
      </div>

      <div className="mb-2 text-xs font-bold tracking-wider text-muted-foreground">DISEASES VACCINES PREVENT</div>
      <div className="mb-5 space-y-2">
        {diseases.map((d) => (
          <Link key={d.name} to="/app/vaccine/$id" params={{ id: d.vax }} className="block rounded-2xl bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1 font-bold">{d.name}</div>
              <ChevronRight className="h-4 w-4 flex-none text-muted-foreground" aria-hidden />
            </div>
            <p className="mt-1 text-sm text-muted-foreground"><span className="font-semibold text-foreground">How it spreads:</span> {d.spread}</p>
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Why it matters:</span> {d.risk}</p>
          </Link>
        ))}
      </div>

      <div className="mb-2 text-xs font-bold tracking-wider text-muted-foreground">EVERYDAY PREVENTION</div>
      <div className="space-y-2">
        {prevention.map((p) => (
          <details key={p.title} className="group rounded-2xl bg-surface p-4 shadow-card">
            <summary className="cursor-pointer font-bold text-primary group-open:mb-2 group-open:inline-block group-open:rounded-md group-open:bg-accent/30 group-open:px-1">{p.title}</summary>
            <p className="text-sm leading-relaxed">{p.body}</p>
          </details>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-surface p-4 shadow-card">
        <div className="font-bold">Not medical advice</div>
        <p className="mt-1 text-sm text-muted-foreground">This is general information. For symptoms, diagnosis or treatment, talk to your doctor or clinic nurse.</p>
      </div>
    </div>
  );
}
