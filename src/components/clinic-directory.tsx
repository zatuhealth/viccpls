import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { field } from '@/components/zatu';
import { suppliedClinics } from '@/lib/clinic-directory';

export function ClinicDirectory() {
  const [query, setQuery] = useState('');
  const matches = suppliedClinics.filter((clinic) => `${clinic.name} ${clinic.address}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <section className="border-t py-6" aria-label="Find a clinic"><h2 className="mb-3 text-xl font-bold">Find a clinic</h2><label className="flex items-center gap-2"><Search className="size-4" /><input aria-label="Search clinic or area" placeholder="Clinic name or area" className={field} value={query} onChange={(event) => setQuery(event.target.value)} /></label><ul className="mt-3 divide-y">{matches.map((clinic) => <li key={clinic.phone} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><b>{clinic.name}</b><p className="text-sm text-muted-foreground">{clinic.address}</p><a href={`tel:${clinic.phone}`} className="text-sm text-primary">{clinic.phone}</a></div></li>)}</ul><Button asChild variant="ghost"><a href={`https://www.google.com/maps/search/${encodeURIComponent(`vaccination clinics ${query || 'near me'}`)}`} target="_blank" rel="noopener noreferrer"><MapPin />Search more clinics on Maps</a></Button></section>;
}