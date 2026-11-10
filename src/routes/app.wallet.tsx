import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Chip, ScreenHeader, btnPrimary, field } from "@/components/zatu";
import { useStore, uid } from "@/lib/store";
import { providers, ugx } from "@/lib/data";

export const Route = createFileRoute("/app/wallet")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Wallet – ZatuHealth" }, { name: "description", content: "Add funds, transfer and pay for care." }, { property: "og:title", content: "Wallet – ZatuHealth" }, { property: "og:description", content: "Your ZatuHealth wallet." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: WalletScreen,
});

function WalletScreen() {
  const { s, set } = useStore();
  const [amt, setAmt] = useState("");
  const [mode, setMode] = useState<"add" | "transfer">("add");
  const n = Number(amt);
  const go = () => {
    if (!n || n <= 0) { toast.error("Enter an amount"); return; }
    if (mode === "transfer" && n > s.wallet) { toast.error("Not enough balance"); return; }
    if (mode === "add") {
      // Funds only become spendable after the payment is confirmed; a request alone never raises the balance.
      set((x) => ({ ...x, pendingTopUps: [{ id: uid(), amount: n, requestedAt: new Date().toISOString() }, ...(x.pendingTopUps ?? [])] }));
      toast.success(`${ugx(n)} top-up requested — it appears in your balance once the payment is confirmed`);
    } else {
      set((x) => ({ ...x, wallet: x.wallet - n }));
      toast.success(`${ugx(n)} transferred`);
    }
    setAmt("");
  };
  return (
    <div>
      <ScreenHeader title="Wallet" />
      <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-card"><div className="text-sm opacity-80">Available balance</div><div className="font-display text-4xl font-bold">{ugx(s.wallet)}</div></div>
      <div className="my-4 flex gap-2"><Chip on={mode === "add"} onClick={() => setMode("add")}>Add Fund</Chip><Chip on={mode === "transfer"} onClick={() => setMode("transfer")}>Transfer</Chip></div>
      <input inputMode="numeric" placeholder="Amount (UGX)" value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} className={field} />
      <button onClick={go} className={`${btnPrimary} mt-3`}>{mode === "add" ? "Add funds" : "Send"}</button>
      {(s.pendingTopUps?.length ?? 0) > 0 && (
        <>
          <h2 className="mb-2 mt-6 text-lg font-bold">Pending top-ups</h2>
          <div className="space-y-2">{s.pendingTopUps!.map((t) => <div key={t.id} className="flex justify-between rounded-xl bg-surface px-4 py-3 text-sm"><span>Awaiting payment confirmation</span><b>{ugx(t.amount)}</b></div>)}</div>
        </>
      )}
      <h2 className="mb-2 mt-6 text-lg font-bold">Payments</h2>
      <div className="space-y-2">{s.appointments.map((a) => <div key={a.id} className="flex justify-between rounded-xl bg-surface px-4 py-3 text-sm"><span>{providers.find((p) => p.id === a.providerId)?.business} · {a.date}</span><b>{ugx(a.amount)}</b></div>)}</div>
    </div>
  );
}
