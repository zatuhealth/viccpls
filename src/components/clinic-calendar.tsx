import { useState } from 'react';
import { AlertTriangle, CalendarDays } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { field } from '@/components/zatu';
import { useStore } from '@/lib/store';
import { calendarDate, childVaccineEvents } from '@/lib/clinic-calendar';
import { childrenForParent } from '@/lib/parent-vaccines';

export function ClinicVaccineCalendar() {
  const { s } = useStore();
  const [date, setDate] = useState(new Date());
  const [month, setMonth] = useState(new Date());
  const [childId, setChildId] = useState('all');
  const events = childVaccineEvents(s.members, calendarDate(new Date())).filter((event) => childId === 'all' || event.memberId === childId);
  const selected = events.filter((event) => event.dose.dueDate === calendarDate(date));
  const overdue = events.filter((event) => event.overdue);
  const parse = (value: string) => new Date(`${value}T12:00:00`);
  return <section className="my-8 border-y py-6" aria-label="Clinic vaccine calendar">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-2xl font-bold"><CalendarDays />Vaccine calendar</h2><select aria-label="Calendar child" className={field} value={childId} onChange={(event) => setChildId(event.target.value)}><option value="all">All children</option>{childrenForParent(s.members).map((member) => <option value={member.id} key={member.id}>{member.name}</option>)}</select></div>
    <div className="grid gap-6 md:grid-cols-[auto_1fr]">
      <div><Calendar mode="single" required selected={date} onSelect={setDate} month={month} onMonthChange={setMonth} modifiers={{ scheduled: events.filter((event) => !event.dose.givenOn).map((event) => parse(event.dose.dueDate)), overdue: overdue.map((event) => parse(event.dose.dueDate)) }} modifiersClassNames={{ scheduled: 'font-bold underline decoration-primary', overdue: 'text-destructive' }} /><Button variant="outline" size="sm" onClick={() => { const now = new Date(); setDate(now); setMonth(now); }}>Today</Button></div>
      <div><h3 className="mb-3 font-bold">{date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3><ul className="divide-y">{selected.map((event) => <li key={`${event.memberId}-${event.dose.id}`} className="py-3"><b>{event.child}</b><p className="text-sm">{event.dose.vaccine}</p><span className={event.overdue ? 'text-sm font-semibold text-destructive' : 'text-sm text-muted-foreground'}>{event.dose.givenOn ? `Given ${event.dose.givenOn}` : event.overdue ? 'Overdue' : 'Scheduled'}</span></li>)}</ul>{selected.length === 0 && <p className="py-6 text-muted-foreground">No vaccine dates on this day.</p>}
      <div className="mt-5 border-t pt-4"><h3 className="flex items-center gap-2 font-bold text-destructive"><AlertTriangle className="size-4" />Overdue ({overdue.length})</h3><ul className="mt-2 divide-y">{overdue.map((event) => <li key={`${event.memberId}-${event.dose.id}`}><Button variant="ghost" className="h-auto w-full justify-start whitespace-normal py-3 text-left" onClick={() => { const due = parse(event.dose.dueDate); setDate(due); setMonth(due); }}>{event.child} · {event.dose.vaccine} · {event.dose.dueDate}</Button></li>)}</ul>{overdue.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No overdue doses.</p>}</div></div>
    </div>
  </section>;
}