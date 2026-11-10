import ali from "@/assets/av-ali.jpg";
import mrs from "@/assets/av-mrs.jpg";
import jr from "@/assets/av-jr.jpg";
import cat from "@/assets/av-cat.jpg";
import dog from "@/assets/av-dog.jpg";
import type { VisitRecord } from './visit-record';

export type Kind = "human" | "pet";
export type Member = {
  id: string;
  name: string;
  relationship: string;
  kind: Kind;
  gender: string;
  dob: string;
  country: string;
  state: string;
  center: string;
  avatar?: string;
  hospital?: string; doctor?: string; doctorPhone?: string;
  blood?: string; weight?: string; height?: string;
  student?: boolean; school?: string; schoolCode?: string; studentId?: string;
  visitNote?: { concern: string; summary: string; questions: string[]; safetyNote: string; savedAt: string };
  visits?: VisitRecord[];
  schedule?: ScheduledVaccine[];
};

/** A vaccine due date confirmed by a clinician; reminders only send for confirmed entries. */
export type ScheduledVaccine = { id: string; vaccine: string; dueDate: string; confirmedBy: string; confirmedAt: string; remindedAt?: string; givenOn?: string; overdueRemindedAt?: string; textApprovedBy?: string; textApprovedFor?: string };

/** BMI from kg and cm, rounded to 1 decimal; null when inputs are missing/invalid. */
export function bmi(weightKg: string | number | undefined, heightCm: string | number | undefined): number | null {
  const w = Number(weightKg), h = Number(heightCm) / 100;
  if (!w || !h || w <= 0 || h <= 0) return null;
  return Math.round((w / (h * h)) * 10) / 10;
}
export function bmiLabel(v: number) {
  return v < 18.5 ? "Underweight" : v < 25 ? "Healthy" : v < 30 ? "Overweight" : "Obese";
}

export const seedMembers: Member[] = [
  { id: "self", name: "Ali Jjunju", relationship: "Self", kind: "human", gender: "Male", dob: "1988-04-12", country: "Uganda", state: "Kampala", center: "Mulago Clinic", avatar: ali },
  { id: "mrs", name: "Mrs Jjunju", relationship: "Spouse", kind: "human", gender: "Female", dob: "1991-02-03", country: "Uganda", state: "Kampala", center: "Mulago Clinic", avatar: mrs },
  { id: "jr", name: "Ali J Jr.", relationship: "Son", kind: "human", gender: "Male", dob: "2022-11-25", country: "Uganda", state: "Kampala", center: "West Salmiyah Clinic", avatar: jr },
  { id: "myaw", name: "Myaw (Cat)", relationship: "Pet – Cat", kind: "pet", gender: "Female", dob: "2025-06-01", country: "Uganda", state: "Kampala", center: "Kampala Vet Centre", avatar: cat },
  { id: "maguja", name: "Maguja (Dog)", relationship: "Pet – Dog", kind: "pet", gender: "Male", dob: "2024-01-15", country: "Uganda", state: "Kampala", center: "Kampala Vet Centre", avatar: dog },
];

export type Vaccine = {
  id: string; code: string; name: string; route: string; when: string;
  what: string; who: string; benefits: string; adverse: string; disease: string; spread: string; symptoms: string;
};

export const vaccines: Vaccine[] = [
  { id: "hbv", code: "HBV", name: "Hepatitis B vaccine", route: "I.M (Intramuscular)", when: "Within 24 hrs of birth",
    what: "A vaccine that protects against infection from the hepatitis B virus, which attacks the liver.",
    who: "All newborns, unvaccinated children and adults at risk of exposure.",
    benefits: "Prevents chronic liver infection, cirrhosis and liver cancer later in life.",
    adverse: "Common reactions may include soreness, swelling or redness where the vaccine was given. Some children may experience fever or fatigue.",
    disease: "Hepatitis B", spread: "Through blood and body fluids, and from mother to baby at birth.", symptoms: "Fatigue, jaundice, dark urine, abdominal pain." },
  { id: "bcg", code: "BCG", name: "Bacille Calmette-Guérin", route: "I.D (Intradermal)", when: "At birth",
    what: "A vaccine against tuberculosis.", who: "Newborns in countries with high TB rates.", benefits: "Protects children from severe forms of TB.",
    adverse: "A small sore at the injection site that heals into a scar.", disease: "Tuberculosis", spread: "Airborne droplets from coughing.", symptoms: "Persistent cough, fever, weight loss." },
  { id: "opv", code: "OPV", name: "Oral Polio vaccine", route: "Oral", when: "6 weeks",
    what: "Drops that protect against poliovirus.", who: "All infants.", benefits: "Prevents paralysis caused by polio.",
    adverse: "Very rarely, mild fever.", disease: "Poliomyelitis", spread: "Contaminated food and water.", symptoms: "Fever, weakness, paralysis." },
  { id: "dtp", code: "DTP-HepB-Hib", name: "Pentavalent vaccine", route: "I.M (Intramuscular)", when: "6 weeks",
    what: "Combined protection against 5 diseases.", who: "All infants, 3 doses.", benefits: "Fewer injections, broad protection.",
    adverse: "Fever, redness and fussiness for a day.", disease: "Diphtheria, Tetanus, Pertussis, Hep B, Hib", spread: "Droplets, wounds, blood.", symptoms: "Varies by disease." },
  { id: "mmr", code: "MMR", name: "Measles, Mumps and Rubella", route: "S.C (Subcutaneous)", when: "9 months",
    what: "A live vaccine against measles, mumps and rubella.", who: "Children, and women before pregnancy.",
    benefits: "The best protection against rubella, which can be very dangerous during pregnancy and cause miscarriage.",
    adverse: "Mild fever or rash 7–12 days after.", disease: "Measles, Mumps, Rubella", spread: "Airborne droplets.", symptoms: "Rash, fever, swollen glands." },
];

export const travel = {
  country: "Afghanistan",
  groups: [
    { name: "Routine Vaccines – All Travelers", items: [{ id: "t-mmr", name: "MMR", desc: "Make sure routine vaccines are up to date before every trip." }] },
    { name: "Most Travelers", items: [{ id: "t-hepa", name: "Hepatitis A", desc: "Protects against hepatitis A from contaminated food or water." }, { id: "t-typh", name: "Typhoid", desc: "Recommended for most travelers, especially to rural areas." }] },
    { name: "Some Travelers", items: [{ id: "t-hepb", name: "Hepatitis B", desc: "HB vaccine protects against infection from the hepatitis B virus." }, { id: "t-mal", name: "Malaria", desc: "Malaria vaccine provides sustained protection against severe malaria." }, { id: "t-rab", name: "Rabies", desc: "Rabies vaccine protects against the virus that causes rabies." }] },
  ],
};

export const pregnancy = [
  { id: "p-mmr", name: "MMR", desc: "Before pregnancy. Avoid becoming pregnant for one month after.", phase: "Pre-pregnancy" },
  { id: "p-tdap", name: "Tdap", desc: "Each pregnancy, weeks 27–36, protects baby from whooping cough.", phase: "During pregnancy" },
  { id: "p-flu", name: "Influenza", desc: "Safe in any trimester during flu season.", phase: "During pregnancy" },
];

export const highRisk = [
  { condition: "Diabetes Mellitus", items: [{ id: "h-pcv13", name: "Pneumococcal Conjugate (PCV13)", desc: "Single Dose" }, { id: "h-ppsv", name: "Pneumococcal (PPSV23)", desc: "1 Dose and revaccination after 5 years" }] },
  { condition: "Chronic Kidney Disease", items: [{ id: "h-hepb", name: "Hepatitis B", desc: "3 doses, higher strength" }] },
];

export const pet = {
  schedule: [
    { id: "pet-fd", when: "2 Months", name: "Feline Distemper Vaccine" },
    { id: "pet-rab", when: "3 Months", name: "Rabies Vaccine" },
    { id: "pet-dhpp", when: "6–8 Weeks", name: "DHPP (dogs)" },
  ],
  diseases: [
    { name: "Campylobacteriosis", info: "Campylobacter are bacteria that can make people and animals sick. Cats may appear healthy or have diarrhea that may be bloody." },
    { name: "Cat Scratch Disease", info: "A bacterial infection spread by scratches or bites, causing swollen lymph nodes." },
    { name: "Cat Tapeworm", info: "Spread when fleas carrying larvae are swallowed. Mostly harmless but treatable." },
  ],
};

export type Provider = { id: string; name: string; initials: string; specialty: string; business: string; type: string; lang: string; rating: number; price: number; branches: string[] };
export const providers: Provider[] = [
  { id: "p1", name: "Dr. Ahmad Mohamad", initials: "AM", specialty: "Psychology", business: "Mulago Clinic", type: "Clinic", lang: "English", rating: 4.5, price: 50000, branches: ["Kampala Central", "Ntinda"] },
  { id: "p2", name: "Dr. Grace Namuli", initials: "GN", specialty: "Paediatrics", business: "Nsambya Hospital", type: "Hospital", lang: "English · Luganda", rating: 4.8, price: 70000, branches: ["Nsambya", "Entebbe"] },
  { id: "p3", name: "Dr. Peter Okello", initials: "PO", specialty: "Radiology – MRI / X-ray", business: "Kampala Imaging", type: "Hospital", lang: "English", rating: 4.6, price: 250000, branches: ["Kololo"] },
  { id: "p4", name: "Dr. Sarah Achieng", initials: "SA", specialty: "Vaccination", business: "West Salmiyah Clinic", type: "Clinic", lang: "English · Swahili", rating: 4.9, price: 30000, branches: ["Kampala", "Mukono"] },
  { id: "p5", name: "Dr. Moses Kato", initials: "MK", specialty: "Veterinary", business: "Kampala Vet Centre", type: "Vet", lang: "English", rating: 4.7, price: 40000, branches: ["Bugolobi"] },
];

export const slots = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];
export const ugx = (n: number) => `UGX ${n.toLocaleString("en-US")}`;

export type Clinic = { slug: string; name: string; address: string; phone: string; email: string; hours: [string, string][] };
// Only confirmed clinic directory details belong here; caregivers can save their own clinic in the household.
export const clinics: Clinic[] = [];
export const clinicSlug = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const findClinic = (slug: string) => clinics.find((c) => c.slug === slug);

/** Confirmed, not-yet-reminded entries due within `days` days of `today` (YYYY-MM-DD). */
export function dueForReminder(entries: ScheduledVaccine[] | undefined, today: string, days = 7) {
  const t = Date.parse(today), end = t + days * 86400000;
  return (entries ?? []).filter((e) => e.confirmedBy && !e.remindedAt && !e.givenOn && Date.parse(e.dueDate) >= t && Date.parse(e.dueDate) <= end);
}

/** Confirmed entries whose due date passed without a recorded dose. */
export function isOverdue(e: ScheduledVaccine, today: string) {
  return Boolean(e.confirmedBy) && !e.givenOn && Date.parse(e.dueDate) < Date.parse(today);
}

/** Overdue entries that have not yet had an overdue email. One overdue email per dose. */
export function overdueForReminder(entries: ScheduledVaccine[] | undefined, today: string) {
  return (entries ?? []).filter((e) => isOverdue(e, today) && !e.overdueRemindedAt);
}
