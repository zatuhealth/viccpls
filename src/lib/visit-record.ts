import { z } from 'zod';
export const visitRecordSchema = z.object({
  id: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value, 'Enter a valid date'),
  clinic: z.string().trim().min(1).max(150),
  doctor: z.string().trim().min(1).max(150),
  results: z.string().trim().min(1).max(4000),
  preparation: z.object({ summary: z.string().max(10000), questions: z.array(z.string().max(2000)).max(10), safetyNote: z.string().max(4000) }).optional(),
});
export type VisitRecord = z.infer<typeof visitRecordSchema>;