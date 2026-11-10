import { describe, expect, it } from 'vitest';
import { childrenForParent, recordParentDose, parentReminderSummary, parentDoseStatus } from '../lib/parent-vaccines';
import type { Member } from '../lib/data';
const child: Member = { id: 'child', name: 'Child', relationship: 'Child', kind: 'human', gender: 'Male', dob: '', country: '', state: '', center: '', schedule: [{ id: 'mr2', vaccine: 'Measles-Rubella 2', dueDate: '2026-10-30', confirmedBy: 'Clinician', confirmedAt: '2026-10-28' }] };
describe('parent vaccine view', () => {
  it('lists confirmed overdue dates and upcoming reminders from children only', () => {
    const overdue = { id: 'late', vaccine: 'Polio', dueDate: '2026-10-20', confirmedBy: 'Nurse', confirmedAt: '2026-10-01' };
    const result = parentReminderSummary([{ ...child, schedule: [...(child.schedule ?? []), overdue, { ...overdue, id: 'given', givenOn: '2026-10-21' }, { ...overdue, id: 'draft', confirmedBy: '' }] }, { ...child, relationship: 'Self', schedule: [overdue] }], '2026-10-29');
    expect(result.overdue.map((dose) => dose.dueDate)).toEqual(['2026-10-20']);
    expect(result.upcoming.map((dose) => dose.dueDate)).toEqual(['2026-10-30']);
  });
  it('stops parent reminder status when a dose is recorded', () => {
    const dose = child.schedule?.[0];
    if (!dose) throw new Error('Missing fixture');
    expect(parentDoseStatus({ ...dose, givenOn: '2026-10-28' }, '2026-10-29')).toBe('Dose recorded · reminders stopped');
    expect(parentDoseStatus(dose, '2026-10-29')).toBe('Reminder pending · next daily run');
  });
  it('shows children, not parents or pets', () => {
    expect(childrenForParent([child, { ...child, id: 'self', relationship: 'Self' }, { ...child, id: 'pet', kind: 'pet' }]).map((m) => m.id)).toEqual(['child']);
  });
  it('includes a guardian’s dependent without requiring another parent', () => {
    expect(childrenForParent([{ ...child, id: 'dependent', relationship: 'Dependent' }]).map((m) => m.id)).toEqual(['dependent']);
  });
  it('records the selected child dose date without altering the confirmed due date', () => {
    const result = recordParentDose(child, 'mr2', '2026-10-28', '2026-10-28');
    expect(result.schedule?.[0]?.givenOn).toBe('2026-10-28');
    expect(result.schedule?.[0]?.dueDate).toBe('2026-10-30');
    expect(child.schedule?.[0]?.givenOn).toBeUndefined();
  });
  it('rejects a future dose date', () => { expect(() => recordParentDose(child, 'mr2', '2026-10-29', '2026-10-28')).toThrow(); });
  it('does not overwrite a dose already given', () => { expect(() => recordParentDose({ ...child, schedule: (child.schedule ?? []).map((d) => ({ ...d, givenOn: '2026-10-27' })) }, 'mr2', '2026-10-28', '2026-10-28')).toThrow(); });
});