import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/zatu";
import { NutritionGuide } from "@/components/nutrition-guide";
import { createNutritionPdf, deliverReport, loadReportFonts } from "@/lib/member-pdf";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/family_/nutrition")({
  staticData: { sitemap: false },
  ssr: false,
  head: () => ({ meta: [
    { title: "Family nutrition guide – ZatuHealth" },
    { name: "description", content: "Food guidance for pregnant mothers, babies, toddlers and families." },
    { property: "og:title", content: "Family nutrition guide – ZatuHealth" },
    { property: "og:description", content: "Food guidance for pregnant mothers, babies, toddlers and families." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" },
  ] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", search: { next: "/family" } });
  },
  component: FamilyNutrition,
});

function FamilyNutrition() {
  const [downloading, setDownloading] = useState(false);
  const download = async () => {
    setDownloading(true);
    try {
      const fonts = await loadReportFonts();
      const blob = await createNutritionPdf(fonts);
      await deliverReport(blob, "zatuhealth-nutrition-guide.pdf");
    } catch {
      toast.error("Could not prepare the guide. Please try again.");
    } finally {
      setDownloading(false);
    }
  };
  return <div className="min-h-screen bg-background">
    <header className="border-b bg-surface"><div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4"><Logo className="h-8" /><Button asChild variant="ghost" size="sm"><Link to="/family"><ArrowLeft />Back to dashboard</Link></Button></div></header>
    <main className="mx-auto max-w-4xl px-4 py-6 pb-12">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Nutrition guide</h1>
        <Button onClick={download} disabled={downloading} size="sm"><Download />{downloading ? "Preparing…" : "Download PDF"}</Button>
      </div>
      <p className="mb-6 text-muted-foreground">Tap a topic to read more, or download the whole guide to keep or print.</p>
      <NutritionGuide />
    </main>
  </div>;
}
