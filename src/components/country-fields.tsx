import type { CountryCode } from "libphonenumber-js";
import { countries } from "@/lib/countries";
import { field } from "@/components/zatu";

export function CountrySelect({ value, onChange, label = "Country" }: { value: string; onChange: (value: string) => void; label?: string }) {
  const legacy = value && !countries.some((country) => country.name === value);
  return <label className="block min-w-0 text-xs font-semibold text-muted-foreground">
    {label}
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={`${field} mt-1`} required>
      <option value="" disabled>Select country</option>
      {legacy && <option value={value}>{value}</option>}
      {countries.map((country) => <option key={country.code} value={country.name}>{country.name}</option>)}
    </select>
  </label>;
}

export function PhoneField({ country, number, onCountryChange, onNumberChange, label = 'Mobile number' }: {
  country: CountryCode; number: string; onCountryChange: (value: CountryCode) => void; onNumberChange: (value: string) => void;
  label?: string;
}) {
  return <div className="space-y-1">
    <label htmlFor="mobile-number" className="text-xs font-semibold text-muted-foreground">{label}</label>
    <div className="grid min-w-0 grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-2">
      <select aria-label="Phone country code" value={country} onChange={(event) => {
        const selected = countries.find((item) => item.code === event.target.value);
        if (selected) onCountryChange(selected.code);
      }} className={field} autoComplete="tel-country-code">
        {countries.map((item) => <option key={item.code} value={item.code}>{item.name} ({item.callingCode})</option>)}
      </select>
      <input id="mobile-number" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="Mobile number" value={number} onChange={(event) => onNumberChange(event.target.value)} className={field} required />
    </div>
  </div>;
}