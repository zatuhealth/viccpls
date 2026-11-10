import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import type { Member } from "@/lib/data";

export function Logo({ className = "h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 680 150" className={`${className} text-primary`} aria-label="ZatuHealth">
      <text x="5" y="119" fill="currentColor" fontFamily="Georgia, 'Times New Roman', serif" fontSize="120" fontWeight="700" letterSpacing="-4">ZatuHealth</text>
      <circle cx="181" cy="29" r="14" className="fill-accent" />
    </svg>
  );
}

export function ScreenHeader({ title, back = "/app" }: { title: string; back?: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Link to={back} className="grid h-10 w-10 place-items-center rounded-full bg-surface text-primary shadow-card" aria-label="Back">
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between">
      <h2 className="text-xl font-bold">{children}</h2>
      {action}
    </div>
  );
}

export function MemberAvatar({ m, size = "h-16 w-16" }: { m: Member; size?: string }) {
  return m.avatar ? (
    <img src={m.avatar} alt={m.name} className={`${size} rounded-2xl object-cover`} />
  ) : (
    <div className={`${size} grid place-items-center rounded-2xl bg-secondary text-xl font-bold text-primary`}>{m.name[0]}</div>
  );
}

export function MemberPicker({ value, onChange, addLink = true }: { value: string; onChange: (id: string) => void; addLink?: boolean }) {
  const { s } = useStore();
  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
      {s.members.map((m) => {
        const on = m.id === value;
        return (
          <button key={m.id} onClick={() => onChange(m.id)} aria-pressed={on} className="w-[72px] flex-none text-center">
            <div className={`rounded-2xl border-[3px] ${on ? "border-accent" : "border-transparent"}`}>
              <MemberAvatar m={m} size="h-[62px] w-full" />
            </div>
            <div className={`mt-1 truncate text-xs ${on ? "font-bold text-primary" : "text-muted-foreground"}`}>{m.name}</div>
            {on && <div className="mx-auto mt-1 h-1 w-10 rounded-full bg-accent" />}
          </button>
        );
      })}
      {addLink && (
        <Link to="/app/family" className="w-[72px] flex-none text-center">
          <div className="grid h-[68px] place-items-center rounded-2xl border-2 border-dashed border-primary/40 text-2xl text-primary">+</div>
          <div className="mt-1 text-xs text-muted-foreground">Add new</div>
        </Link>
      )}
    </div>
  );
}

export function Chip({ on, children, ...p }: { on?: boolean; children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} aria-pressed={on} className={`rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-40 ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground hover:border-primary"}`}>
      {children}
    </button>
  );
}

export const field = "w-full rounded-xl border border-input bg-surface px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/30";
export const btnPrimary = "w-full rounded-xl bg-primary px-5 py-3.5 font-bold text-primary-foreground shadow-card transition hover:opacity-90 disabled:opacity-50";
export const btnAccent = "rounded-xl bg-accent px-5 py-2.5 font-bold text-accent-foreground transition hover:opacity-90";
