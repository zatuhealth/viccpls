import { dueForReminder, isOverdue, type Member, type ScheduledVaccine } from './data';

export function parentReminderSummary(members: Member[], today: string) {
  const children = childrenForParent(members);
  return {
    overdue: children.flatMap((member) => (member.schedule ?? []).filter((dose) => isOverdue(dose, today))),
    upcoming: children.flatMap((member) => dueForReminder(member.schedule, today)),
  };
}

export function parentDoseStatus(dose: ScheduledVaccine, today: string) {
  if (dose.givenOn) return 'Dose recorded · reminders stopped';
  if (!dose.confirmedBy) return 'Awaiting clinician confirmation';
  if (isOverdue(dose, today)) return dose.overdueRemindedAt ? 'Overdue email processed' : 'Overdue email pending';
  if (dose.remindedAt) return 'Reminder email processed';
  if (dueForReminder([dose], today).length) return 'Reminder pending · next daily run';
  return 'Reminder window opens 7 days before due date';
}

export function childrenForParent(members: Member[]) {
  return members.filter((m) => m.kind === 'human' && ['child', 'son', 'daughter', 'dependent'].includes(m.relationship.toLowerCase()));
}

export function recordParentDose(member: Member, doseId: string, givenOn: string, today: string): Member {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(givenOn) || Number.isNaN(Date.parse(givenOn)) || givenOn > today) throw new Error('Choose a valid date that is not in the future.');
  if (!member.schedule?.some((dose) => dose.id === doseId && !dose.givenOn)) throw new Error('This dose is missing or already recorded.');
  return { ...member, schedule: member.schedule.map((dose) => dose.id === doseId ? { ...dose, givenOn } : dose) };
}