import type { ComponentType } from 'react'
import { template as appointmentConfirmation } from './appointment-confirmation'
import { template as vaccineDueSoon } from './vaccine-due-soon'
import { template as welcome } from './welcome'
import { template as vaccineOverdue } from './vaccine-overdue'
import { template as parentInvite } from './parent-invite'
import { template as clinicMessage } from './clinic-message'
import { template as clinicStaffInvite } from './clinic-staff-invite'
import { template as clinicReply } from './clinic-reply'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome': welcome,
  'clinic-reply': clinicReply,
  'appointment-confirmation': appointmentConfirmation,
  'vaccine-due-soon': vaccineDueSoon,
  'vaccine-overdue': vaccineOverdue,
  'parent-invite': parentInvite,
  'clinic-message': clinicMessage,
  'clinic-staff-invite': clinicStaffInvite,
}
