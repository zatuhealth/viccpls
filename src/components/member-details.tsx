import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { btnPrimary, field } from "@/components/zatu";
import { bmi, bmiLabel, clinicSlug, type Member } from "@/lib/data";
import { useStore } from "@/lib/store";
import { countries, countryCodeForName, internationalPhone, phoneParts } from "@/lib/countries";
import type { CountryCode } from "libphonenumber-js";
import { MemberExport } from "@/components/member-export";
import { AppointmentPreparation } from "@/components/appointment-prep";
import { VisitRecords } from "@/components/visit-records";

const bloods = ["", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

export function MemberDetails({ m }: { m: Member }) {
  const { s, set } = useStore();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Member>(m);
  const [ph, setPh] = useState(() => phoneParts(m.doctorPhone ?? "", countryCodeForName(m.country || s.profile?.country || "Uganda")));
  const u = (k: keyof Member) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const isDependent = m.id !== "self";
  const v = bmi(m.weight, m.height);
  const fv = bmi(f.weight, f.height);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const next = { ...f, doctorPhone: ph.number ? internationalPhone(ph.number, ph.country) : "" };
    set((x) => ({ ...x, members: x.members.map((y) => (y.id === m.id ? next : y)) }));
    setOpen(false);
    toast.success("Details saved");
  };

  if (!open) return (
    <div className="mt-2 border-t pt-2 text-xs text-muted-foreground">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {(m.hospital || m.center) && <Link to="/app/clinic/$slug" params={{ slug: clinicSlug(m.hospital || m.center) }} className="font-semibold text-primary underline-offset-2 hover:underline">🏥 {m.hospital || m.center}</Link>}
        {m.doctor && <span>👩‍⚕️ {m.doctor}{m.doctorPhone ? ` · ${m.doctorPhone}` : ""}</span>}
        {m.blood && <span>Blood {m.blood}</span>}
        {v && <span>BMI {v} ({bmiLabel(v)})</span>}
        {m.student && m.school && <span>🎓 {m.school}{m.studentId ? ` · ID ${m.studentId}` : ""}</span>}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button onClick={() => { setF(m); setOpen(true); }} className="font-bold text-primary">Health & school details</button>
        <MemberExport member={m} />
        <AppointmentPreparation member={m} />
        <VisitRecords member={m} />
      </div>
    </div>
  );

  return (
    <form onSubmit={save} className="mt-3 space-y-3 border-t pt-3">
      <div className="text-sm font-bold text-primary">Hospital / Clinic</div>
      <input placeholder="Hospital / Clinic name" value={f.hospital ?? ""} onChange={u("hospital")} className={field} />
      <input placeholder="Doctor's / Nurse's name" value={f.doctor ?? ""} onChange={u("doctor")} className={field} />
      <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-2">
        <select aria-label="Doctor phone country code" value={ph.country} onChange={(e) => setPh({ ...ph, country: e.target.value as CountryCode })} className={field}>
          {countries.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.callingCode})</option>)}
        </select>
        <input type="tel" placeholder="Doctor's / Nurse's phone" value={ph.number} onChange={(e) => setPh({ ...ph, number: e.target.value })} className={field} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="text-xs font-semibold text-muted-foreground">Blood type<select value={f.blood ?? ""} onChange={u("blood")} className={`${field} mt-1`}>{bloods.map((b) => <option key={b} value={b}>{b || "—"}</option>)}</select></label>
        <label className="text-xs font-semibold text-muted-foreground">Weight (kg)<input type="number" step="0.1" min="0" value={f.weight ?? ""} onChange={u("weight")} className={`${field} mt-1`} /></label>
        <label className="text-xs font-semibold text-muted-foreground">Height (cm)<input type="number" step="0.1" min="0" value={f.height ?? ""} onChange={u("height")} className={`${field} mt-1`} /></label>
      </div>
      <div className="rounded-xl bg-muted p-3 text-sm">BMI: <b>{fv ? `${fv} – ${bmiLabel(fv)}` : "enter weight and height"}</b></div>
      {isDependent && (
        <>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={!!f.student} onChange={(e) => setF({ ...f, student: e.target.checked })} /> This dependent is a student</label>
          {f.student && (
            <>
              <div className="text-sm font-bold text-primary">School</div>
              <input placeholder="School name" value={f.school ?? ""} onChange={u("school")} className={field} />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="School code" value={f.schoolCode ?? ""} onChange={u("schoolCode")} className={field} />
                <input placeholder="Student ID / No." value={f.studentId ?? ""} onChange={u("studentId")} className={field} />
              </div>
            </>
          )}
        </>
      )}
      <div className="flex gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-xl border px-5 font-bold">Cancel</button><button className={btnPrimary}>Save</button></div>
    </form>
  );
}
