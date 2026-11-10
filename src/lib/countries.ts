import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

const names = new Intl.DisplayNames(["en"], { type: "region" });

export const countries = getCountries().map((code) => ({
  code,
  name: names.of(code) ?? code,
  callingCode: `+${getCountryCallingCode(code)}`,
})).sort((a, b) => a.name.localeCompare(b.name, "en"));

export function countryCodeForName(name: string): CountryCode {
  return countries.find((country) => country.name === name)?.code ?? "UG";
}

export function phoneParts(value: string, fallback: CountryCode) {
  const parsed = value.trim().startsWith("+") ? parsePhoneNumberFromString(value) : undefined;
  return { country: parsed?.country ?? fallback, number: parsed?.nationalNumber.toString() ?? value };
}

export function internationalPhone(value: string, country: CountryCode): string {
  const parsed = parsePhoneNumberFromString(value, country);
  return parsed?.number ?? value;
}

// Mobile + PIN accounts sign in through a deterministic synthetic email derived
// from the international number; the PIN is the password.
export function phoneAuthEmail(value: string, country: CountryCode): string {
  const digits = internationalPhone(value, country).replace(/\D/g, "");
  return `${digits}@phone.zatuhealth.com`;
}