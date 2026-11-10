import { Clock, MapPin, Phone } from 'lucide-react';
import type { ClinicProfile } from '@/lib/clinic-profile';
export function ClinicContact({ clinic }: { clinic: ClinicProfile }) {
  return <div className="space-y-3 break-words"><h3 className="text-xl font-bold">{clinic.name || 'Clinic name'}</h3><p className="flex items-start gap-2"><MapPin className="mt-1 size-4 shrink-0" />{clinic.address || 'Clinic address'}</p><a className="flex items-center gap-2 font-semibold text-primary" href={`tel:${clinic.phone}`}><Phone className="size-4 shrink-0" />{clinic.phone || 'Clinic phone'}</a><p className="flex items-start gap-2 whitespace-pre-line"><Clock className="mt-1 size-4 shrink-0" />{clinic.hours}</p></div>;
}