import { isOverdue, type Member } from './data';
import { childrenForParent } from './parent-vaccines';

export function childVaccineEvents(members: Member[], today: string) {
  return childrenForParent(members).flatMap((member) => (member.schedule ?? [])
    .filter((dose) => dose.confirmedBy && /^\d{4}-\d{2}-\d{2}$/.test(dose.dueDate) && !Number.isNaN(Date.parse(dose.dueDate)))
    .map((dose) => ({ memberId: member.id, child: member.name, dose, overdue: isOverdue(dose, today) })))
    .sort((a, b) => a.dose.dueDate.localeCompare(b.dose.dueDate));
}

export const calendarDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;