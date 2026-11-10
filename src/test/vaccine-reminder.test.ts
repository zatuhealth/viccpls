import { describe, expect, it } from "vitest";
import { dueForReminder } from "@/lib/data";
const e = (dueDate: string, extra = {}) => ({ id: dueDate, vaccine: "MMR", dueDate, confirmedBy: "Dr. A", confirmedAt: "2026-10-01", ...extra });
describe("vaccine reminders", () => {
  it("sends for confirmed dates within 7 days", () => expect(dueForReminder([e("2026-11-04")], "2026-10-28")).toHaveLength(1));
  it("skips dates more than 7 days away", () => expect(dueForReminder([e("2026-11-05")], "2026-10-28")).toHaveLength(0));
  it("skips unconfirmed entries", () => expect(dueForReminder([e("2026-10-30", { confirmedBy: "" })], "2026-10-28")).toHaveLength(0));
  it("does not remind twice", () => expect(dueForReminder([e("2026-10-30", { remindedAt: "x" })], "2026-10-28")).toHaveLength(0));
});
describe("doses", () => {
  it("skips reminders once the dose is given", () => expect(dueForReminder([{ id: "a", vaccine: "MMR", dueDate: "2026-10-30", confirmedBy: "Dr. A", confirmedAt: "x", givenOn: "2026-10-28" }], "2026-10-28")).toHaveLength(0));
});
