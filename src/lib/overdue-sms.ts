import { isOverdue, type ScheduledVaccine } from './data';
export function overdueSmsEligible(dose: ScheduledVaccine, today: string, enabled: boolean, phone: string, clinicName: string) {
  return enabled === true && /^\+[1-9]\d{7,14}$/.test(phone) && clinicName.trim().length > 0 && isOverdue(dose, today) && Boolean(dose.textApprovedBy) && dose.textApprovedFor === dose.dueDate;
}
export function overdueSmsText(clinic: { name: string; phone?: string }) {
  // Keep child names and vaccine details out of SMS lock-screen previews.
  return `${clinic.name.slice(0, 80)}: A vaccine visit is overdue. View your private schedule: https://zatuhealth.com/family${clinic.phone ? `. Contact: ${clinic.phone}` : ''}`;
}