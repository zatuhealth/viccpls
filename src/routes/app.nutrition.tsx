import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/zatu";
import { NutritionGuide } from "@/components/nutrition-guide";

export const Route = createFileRoute("/app/nutrition")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Nutrition – ZatuHealth" }, { name: "description", content: "Nutrition guidance for mothers, babies and toddlers." }, { property: "og:title", content: "Nutrition – ZatuHealth" }, { property: "og:description", content: "Nutrition guidance for mothers, babies and toddlers." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Nutrition,
});

function Nutrition() {
  return (
    <div>
      <ScreenHeader title="Nutrition" />
      <p className="mb-4 text-muted-foreground">Food guidance for pregnant mothers, babies, toddlers and the whole family.</p>
      <NutritionGuide />
    </div>
  );
}
