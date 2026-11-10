import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Info, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MemberPicker, ScreenHeader, field } from "@/components/zatu";
import { useStore, type VaxRecord } from "@/lib/store";
import { vaccines, travel, pregnancy, highRisk, pet } from "@/lib/data";

type Search = { member?: string; tab?: string };
export const Route = createFileRoute("/app/vaccination")({
  staticData: { sitemap: false },
  validateSearch: (s: Record<string, unknown>): Search => ({ ...(typeof s["member"] === "string" ? { member: s["member"] } : {}), ...(typeof s["tab"] === "string" ? { tab: s["tab"] } : {}) }),
  head: () => ({ meta: [{ title: "Vaccinations – ZatuHealth" }, { name: "description", content: "Immunity, travel, pregnancy, high-risk and pet vaccine records." }, { property: "og:title", content: "Vaccinations – ZatuHealth" }, { property: "og:description", content: "Manage your family's vaccine records." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Vaccination,
});

function Row({ k, title, sub, meta, info }: { k: string; title: string; sub: string; meta?: string | undefined; info?: string | undefined }) {
  const { s, set } = useStore();
  const rec: VaxRecord = s.records[k] ?? { taken: false, date: "", note: "" };
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(rec);
  const save = () => {
    set((x) => ({ ...x, records: { ...x.records, [k]: draft } }));
    setOpen(false);
    toast.success(`${title} saved`);
  };
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-card">
      <div className="flex items-start gap-3">
        <button onClick={() => { setDraft(rec); setOpen(!open); }} aria-label="Edit record" className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-md border-2 ${rec.taken ? "border-accent bg-accent text-accent-foreground" : "border-input"}`}>
          {rec.taken && <Check className="h-4 w-4" />}
        </button>
        <div className="min-w-0 flex-1" onClick={() => { setDraft(rec); setOpen(!open); }}>
          <div className="font-bold">{title}</div>
          <div className="text-sm text-muted-foreground">{sub}</div>
          {meta && <div className="text-xs text-muted-foreground">{meta}</div>}
          {rec.taken && <div className="mt-1 text-xs font-semibold text-primary">✓ Taken {rec.date && `· ${rec.date}`}</div>}
        </div>
        {info && <Link to="/app/vaccine/$id" params={{ id: info }} className="text-primary" aria-label="Vaccine info"><Info className="h-5 w-5" /></Link>}
      </div>
      {open && (
        <div className="mt-3 space-y-2 border-t pt-3">
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={draft.taken} onChange={(e) => setDraft({ ...draft, taken: e.target.checked })} className="h-4 w-4 accent-[var(--accent)]" /> Taken</label>
          <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className={field} />
          <input placeholder="Add Note" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} className={field} />
          <button onClick={save} className="w-full rounded-xl bg-primary py-2.5 font-bold text-primary-foreground">SAVE</button>
        </div>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4">
      <button onClick={() => setOpen(!open)} className="mb-2 flex w-full items-center justify-between text-left font-bold text-primary">
        {title} <ChevronRight className={`h-4 w-4 transition ${open ? "rotate-90" : ""}`} />
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}

function Vaccination() {
  const { member = "self", tab } = Route.useSearch();
  const nav = useNavigate({ from: "/app/vaccination" });
  const { s } = useStore();
  const m = s.members.find((x) => x.id === member) ?? s.members[0]!;
  const tabs = m.kind === "pet" ? ["pet"] : ["immunity", "travel", ...(m.gender === "Male" ? [] : ["pregnancy"]), "high-risk"];
  const t = tabs.includes(tab ?? "") ? tab! : tabs[0];
  const [disease, setDisease] = useState(0);
  const done = Object.entries(s.records).filter(([k, v]) => k.startsWith(m.id + ":") && v.taken).length;

  return (
    <div>
      <ScreenHeader title="Vaccinations" />
      <div className="mb-2 text-xs font-bold tracking-wider text-muted-foreground">MY RECORDS</div>
      <MemberPicker value={m.id} onChange={(id) => nav({ search: { member: id } })} />
      <div className="my-3 rounded-2xl bg-primary p-4 text-primary-foreground">
        <div className="text-sm opacity-80">{m.relationship} · {m.center}</div>
        <div className="text-lg font-bold">{m.name}</div>
        <div className="text-sm">{done} vaccine{done === 1 ? "" : "s"} recorded</div>
      </div>
      <div className="mb-4 flex gap-5 overflow-x-auto text-sm font-bold tracking-wide">
        {tabs.map((x) => (
          <button key={x} onClick={() => nav({ search: { member: m.id, tab: x } })} className={`whitespace-nowrap border-b-[3px] pb-1 uppercase ${x === t ? "border-accent text-primary" : "border-transparent text-muted-foreground"}`}>{x.replace("-", " ")}</button>
        ))}
      </div>

      {t === "immunity" && Object.entries(vaccines.reduce<Record<string, typeof vaccines>>((a, v) => ((a[v.when] ||= []).push(v), a), {})).map(([when, list]) => (
        <Group key={when} title={when}>{list.map((v) => <Row key={v.id} k={`${m.id}:${v.id}`} title={v.code} sub={v.name} meta={v.route} info={v.id} />)}</Group>
      ))}
      {t === "travel" && (
        <>
          <div className="mb-3 rounded-xl bg-surface px-4 py-3 font-semibold">Destination: {travel.country}</div>
          {travel.groups.map((g) => <Group key={g.name} title={g.name}>{g.items.map((i) => <Row key={i.id} k={`${m.id}:${i.id}`} title={i.name} sub={i.desc} />)}</Group>)}
        </>
      )}
      {t === "pregnancy" && ["Pre-pregnancy", "During pregnancy"].map((ph) => (
        <Group key={ph} title={ph}>{pregnancy.filter((p) => p.phase === ph).map((p) => <Row key={p.id} k={`${m.id}:${p.id}`} title={p.name} sub={p.desc} info={p.name === "MMR" ? "mmr" : undefined} />)}</Group>
      ))}
      {t === "high-risk" && highRisk.map((h) => (
        <Group key={h.condition} title={h.condition}>{h.items.map((i) => <Row key={i.id} k={`${m.id}:${i.id}`} title={i.name} sub={i.desc} />)}</Group>
      ))}
      {t === "pet" && (
        <>
          <Group title="Vaccination timeline">{pet.schedule.map((p) => <Row key={p.id} k={`${m.id}:${p.id}`} title={p.name} sub={p.when} />)}</Group>
          <Group title="Diseases that can be spread by pets">
            <div className="flex flex-wrap gap-2">{pet.diseases.map((d, i) => <button key={d.name} onClick={() => setDisease(i)} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${i === disease ? "bg-accent text-accent-foreground" : "bg-surface"}`}>{d.name}</button>)}</div>
            <p className="rounded-2xl bg-surface p-4 text-sm leading-relaxed">{pet.diseases[disease]?.info}</p>
          </Group>
        </>
      )}
    </div>
  );
}
