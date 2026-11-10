import { describe, it, expect } from 'vitest';
import { welcomeChannels } from '../lib/welcome';

describe('new family welcome channels', () => {
  it('welcomes email and Google families by SMS when a phone is saved', () => {
    expect(welcomeChannels({ phone: '+256772123456', email: 'parent@example.com' })).toEqual({ sms: true, email: true });
  });
  it('welcomes mobile-only families by SMS without emailing synthetic sign-in addresses', () => {
    expect(welcomeChannels({ phone: '+256772123456', email: '256772123456@phone.zatuhealth.com' })).toEqual({ sms: true, email: false });
  });
  it('does not send an SMS without a saved international phone number', () => {
    expect(welcomeChannels({ email: 'parent@example.com' }).sms).toBe(false);
  });
});