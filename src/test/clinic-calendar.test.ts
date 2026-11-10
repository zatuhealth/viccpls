import { expect, it } from 'vitest';
import { childVaccineEvents } from '@/lib/clinic-calendar';
import { seedMembers } from '@/lib/data';
import { defaultClinicHours, suppliedClinics } from '@/lib/clinic-directory';

it('shows child vaccine dates and flags only pending overdue doses', () => {
  const child = seedMembers.find((member) => member.id === 'jr');
  if (!child) throw new Error('Missing child fixture');
  const dose = { id: 'd', vaccine: 'MR2', dueDate: '2026-10-20', confirmedBy: 'Nurse', confirmedAt: '2026-10-01' };
  const result = childVaccineEvents([{ ...child, schedule: [dose, { ...dose, id: 'given', givenOn: '2026-10-21' }] }], '2026-10-28');
  expect(result.map((event) => [event.dose.dueDate, event.overdue])).toEqual([['2026-10-20', true], ['2026-10-20', false]]);
});
it('defaults editable clinic hours to 24 hours seven days a week', () => { expect(defaultClinicHours).toBe('24 hours, 7 days a week'); });
it('does not import sample spreadsheets as real clinic contacts', () => { expect(suppliedClinics).toEqual([]); });