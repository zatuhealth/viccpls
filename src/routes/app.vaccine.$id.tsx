import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/zatu";
import { vaccines } from "@/lib/data";

export const Route = createFileRoute("/app/vaccine/$id")({
  staticData: { sitemap: false },
  loader: ({ params }) => {
    const v = vaccines.find((x) => x.id === params.id);
    if (!v) throw notFound();
    return v;
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.name ?? "Vaccine"} – ZatuHealth` }, { name: "description", content: loaderData?.what ?? "Vaccine information" }, { property: "og:title", content: `${loaderData?.name ?? "Vaccine"} – ZatuHealth` }, { property: "og:description", content: loaderData?.what ?? "" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  notFoundComponent: () => <div className="p-6">Vaccine not found. <Link to="/app/vaccination" className="text-primary underline">Back</Link></div>,
  component: VaccineInfo,
});

function VaccineInfo() {
  const v = Route.useLoaderData();
  const sections = [
    ["What is this vaccine?", v.what], ["Who should get this vaccine?", v.who], ["The benefits of this vaccine", v.benefits],
    ["Adverse events", v.adverse], ["Associated disease", v.disease], ["Spread of the disease", v.spread], ["Symptoms of the disease", v.symptoms],
  ];
  return (
    <div>
      <ScreenHeader title={v.name} back="/app/vaccination" />
      <div className="mb-4 flex gap-2 text-xs font-bold"><span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">{v.code}</span><span className="rounded-full bg-surface px-3 py-1">{v.route}</span><span className="rounded-full bg-surface px-3 py-1">{v.when}</span></div>
      <div className="space-y-2">
        {sections.map(([h, b], i) => (
          <details key={h} open={i === 3} className="group rounded-2xl bg-surface p-4 shadow-card">
            <summary className="cursor-pointer font-bold text-primary group-open:mb-2 group-open:inline-block group-open:rounded-md group-open:bg-accent/30 group-open:px-1">{h}</summary>
            <p className="text-sm leading-relaxed">{b}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
