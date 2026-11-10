import { createFileRoute, Link } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/zatu";
import { useStore } from "@/lib/store";
import { PartnerInvite, SignOutButton } from "@/components/account";

export const Route = createFileRoute("/app/profile")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Profile – ZatuHealth" }, { name: "description", content: "Your personal information." }, { property: "og:title", content: "Profile – ZatuHealth" }, { property: "og:description", content: "Your ZatuHealth profile." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Profile,
});

function Profile() {
  const { s } = useStore();
  const p = s.profile;
  if (!p) return <div><ScreenHeader title="Profile" /><Link to="/onboarding" className="font-bold text-primary">Create your profile</Link></div>;
  const rows = [["Mobile", p.phone], ["Email", p.email], ["Gender", p.gender], ["Date of birth", p.dob], ["Blood type", p.blood], ["Nationality", p.nationality], ["Residence", `${p.state}, ${p.country}`], ["Marital status", p.marital]];
  return (
    <div>
      <ScreenHeader title="Profile" />
      <div className="mb-4 flex items-center gap-4 rounded-3xl bg-primary p-5 text-primary-foreground"><div className="grid h-16 w-16 place-items-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">{p.firstName[0]}</div><div><div className="text-xl font-bold">{p.firstName} {p.lastName}</div><div className="text-sm opacity-80">{s.members.length - 1} dependents</div></div></div>
      <div className="divide-y rounded-2xl bg-surface shadow-card">{rows.map(([k, v]) => <div key={k} className="flex justify-between px-4 py-3 text-sm"><span className="text-muted-foreground">{k}</span><b>{v}</b></div>)}</div>
      <Link to="/onboarding" className="mt-4 block text-center font-bold text-primary">Edit profile</Link>
      <PartnerInvite />
      <SignOutButton />
    </div>
  );
}
