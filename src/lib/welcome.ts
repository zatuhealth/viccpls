export const welcomeText = "Welcome to ZatuHealth! Your family account is ready. Manage family vaccine records and clinic visits at https://zatuhealth.com/app";

export function welcomeChannels(profile: { phone?: string; email?: string }) {
  return {
    sms: /^\+[1-9]\d{6,14}$/.test(profile.phone ?? ""),
    email: /^\S+@\S+\.\S+$/.test(profile.email ?? "") && !profile.email?.endsWith("@phone.zatuhealth.com"),
  };
}