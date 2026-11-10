import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/lib/store';
import { validateTextOptIn } from '@/lib/parent-consent';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export const Route = createFileRoute('/family_/alerts')({
  ssr: false, staticData: { sitemap: false },
  beforeLoad: async () => { const user = await supabase.auth.getUser(); if (!user.data.user) throw redirect({ to: '/auth', search: { next: '/family' } }); },
  head: () => ({ meta: [{ title: 'Parent text alert consent – ZatuHealth' }, { name: 'description', content: 'Manage your consent for overdue vaccine text alerts.' }, { property: 'og:title', content: 'ZatuHealth parent text alerts' }, { property: 'og:description', content: 'Private parent text reminder preferences.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: ParentAlerts,
});
function ParentAlerts() {
  const { s, save, loading } = useStore();
  const [busy, setBusy] = useState(false);
  if (loading) return <main className="p-6">Loading…</main>;
  return <main className="mx-auto max-w-xl space-y-6 px-4 py-8"><Link to="/family" className="text-primary">← Parent dashboard</Link><h1 className="text-3xl font-bold">Overdue text alerts</h1><p className="text-muted-foreground">{s.profile?.phone || 'No parent mobile number saved.'}</p><section className="space-y-4 border-y py-6"><div className="flex items-center justify-between gap-4"><label htmlFor="parent-text-opt-in" className="font-semibold">I agree to receive overdue vaccine texts</label><Switch id="parent-text-opt-in" checked={s.overdueSmsEnabled === true} disabled={busy || !s.profile?.phone} onCheckedChange={async (enabled) => { setBusy(true); try { validateTextOptIn(enabled, s.profile?.phone ?? ''); await save((state) => ({ ...state, overdueSmsEnabled: enabled })); toast.success(enabled ? 'Text consent recorded' : 'Text consent withdrawn'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save consent'); } finally { setBusy(false); } }} /></div><p className="text-sm text-muted-foreground">Texts go to this number when a confirmed vaccine dose is overdue. Your clinic can see your consent status. You may withdraw consent at any time.</p><p role="status" className="font-semibold">{s.overdueSmsEnabled ? 'Opted in' : 'Not opted in'}</p></section><Button asChild variant="outline"><Link to="/app/profile">Update parent phone</Link></Button></main>;
}