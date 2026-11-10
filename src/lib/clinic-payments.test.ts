import { describe, expect, it } from 'vitest';
import { paymentInput } from './clinic-admin.functions';

const base = { householdId: '7d0f7a0e-1b2c-4d3e-8f90-123456789abc', method: 'Cash', reference: '' };
describe('clinic payment rules', () => {
  it('accepts a positive payment', () => expect(paymentInput.safeParse({ ...base, amount: 50000 }).success).toBe(true));
  it('rejects zero or negative amounts so wallets only rise from real payments', () => {
    expect(paymentInput.safeParse({ ...base, amount: 0 }).success).toBe(false);
    expect(paymentInput.safeParse({ ...base, amount: -100 }).success).toBe(false);
  });
});

import { mergeWallet } from './store';
describe('wallet merge on family save', () => {
  it('keeps a clinic payment when the family saves with a stale balance', () => expect(mergeWallet(60000, 10000, 10000)).toBe(60000));
  it('applies family spending on top of the latest balance', () => expect(mergeWallet(60000, 10000, 4000)).toBe(54000));
});
