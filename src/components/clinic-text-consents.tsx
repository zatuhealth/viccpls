import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

type Consent = { id: string; household_id: string; phone: string; enabled: boolean; recorded_at: string };
export function ClinicTextConsents() {
  const [rows, setRows] = useState<Consent[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true); setError('');
    const result = await supabase.from('parent_text_consents').select('id, household_id, phone, enabled, recorded_at').order('recorded_at', { ascending: false });
    if (result.error) setError('Could not load parent text consent');
    else { const seen = new Set<string>(); setRows((result.data ?? []).filter((row) => { if (seen.has(row.household_id)) return false; seen.add(row.household_id); return true; })); }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  return <section className="border-t py-6" aria-label="Parent text signups"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Parent text signups</h2><Button variant="ghost" size="icon" title="Refresh text signups" aria-label="Refresh text signups" disabled={loading} onClick={() => void load()}><RefreshCw /></Button></div><p className="mb-4 text-sm text-muted-foreground">{rows.filter((row) => row.enabled).length} opted in · {rows.filter((row) => !row.enabled).length} withdrawn</p>{error && <p role="alert">{error}</p>}{loading ? <p>Loading…</p> : <ul className="divide-y">{rows.map((row) => <li key={row.id} className="flex flex-wrap justify-between gap-2 py-3"><span>{row.phone || 'No phone saved'}</span><span className="font-semibold">{row.enabled ? 'Opted in' : 'Withdrawn'}</span><time className="text-sm text-muted-foreground" dateTime={row.recorded_at}>{new Date(row.recorded_at).toLocaleString()}</time></li>)}{!error && rows.length === 0 && <li className="text-muted-foreground">No parent text signups recorded yet.</li>}</ul>}</section>;
}