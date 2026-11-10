import { describe, expect, it } from 'vitest';
import { visitRecordSchema } from '@/lib/visit-record';
describe('visit records', () => {
  const record = { id: 'test', date: '2026-10-28', clinic: 'Mulago', doctor: 'Dr A', results: 'Follow-up requested' };
  it('stores the date, clinic, doctor and results together', () => { expect(visitRecordSchema.parse(record)).toEqual(record); });
  it('rejects an impossible visit date', () => { expect(visitRecordSchema.safeParse({ ...record, date: '2026-02-30' }).success).toBe(false); });
});