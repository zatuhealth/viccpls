import { describe, expect, it } from "vitest";
import { isOverdue, type ScheduledVaccine } from "@/lib/data";

const base: ScheduledVaccine = { id: "1", vaccine: "Measles-Rubella 2", dueDate: "2026-10-20", confirmedBy: "Dr. A", confirmedAt: "2026-10-01T00:00:00Z" };

describe("isOverdue", () => {
  it("flags a confirmed entry whose due date passed without a dose", () => {
    expect(isOverdue(base, "2026-10-28")).toBe(true);
  });
  it("does not flag an entry due today or later", () => {
    expect(isOverdue(base, "2026-10-20")).toBe(false);
    expect(isOverdue(base, "2026-10-01")).toBe(false);
  });
  it("does not flag an entry whose dose was given", () => {
    expect(isOverdue({ ...base, givenOn: "2026-10-19" }, "2026-10-28")).toBe(false);
  });
  it("does not flag an unconfirmed entry", () => {
    expect(isOverdue({ ...base, confirmedBy: "" }, "2026-10-28")).toBe(false);
  });
});

import { overdueForReminder } from '@/lib/data';
describe('overdue reminder emails', () => {
  const base = { id: 'x', vaccine: 'MR2', dueDate: '2026-10-01', confirmedBy: 'Dr A', confirmedAt: '2026-09-01' };
  it('emails an overdue confirmed dose once', () => {
    expect(overdueForReminder([base], '2026-10-28')).toHaveLength(1);
    expect(overdueForReminder([{ ...base, overdueRemindedAt: '2026-10-02' }], '2026-10-28')).toHaveLength(0);
  });
  it('never emails given or unconfirmed doses', () => {
    expect(overdueForReminder([{ ...base, givenOn: '2026-10-05' }, { ...base, confirmedBy: '' }], '2026-10-28')).toHaveLength(0);
  });
});
