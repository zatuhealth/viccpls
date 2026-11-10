import { useState } from 'react';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getClinicInbox, replyToParent } from '@/lib/clinic-admin.functions';
import { Button } from '@/components/ui/button';

const inboxQuery = queryOptions({ queryKey: ['clinic-inbox'], queryFn: () => getClinicInbox() });
export const Route = createFileRoute('/clinic_/inbox')({
  ssr: false, staticData: { sitemap: false },
  beforeLoad: async () => { const role = await supabase.rpc('clinic_role'); if (role.data !== 'admin') throw redirect({ to: '/clinic/login' }); },
  loader: ({ context }) => context.queryClient.ensureQueryData(inboxQuery),
  errorComponent: () => <main className="p-6">The inbox could not be loaded. <Link to="/clinic">Back to dashboard</Link></main>,
  head: () => ({ meta: [{ title: 'Parent inbox – ZatuHealth clinic' }, { name: 'description', content: 'Read and reply to messages from parents linked to your clinic.' }, { property: 'og:title', content: 'ZatuHealth parent inbox' }, { property: 'og:description', content: 'Private clinic inbox for parent messages.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: Inbox,
});

function Inbox() {
  const { data } = useSuspenseQuery(inboxQuery);
  const unread = data.messages.filter((m) => !m.readAt).length;
  return <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
    <Link to="/clinic" className="text-primary">← Clinic dashboard</Link>
    <h1 className="text-3xl font-bold">Parent inbox {unread > 0 && <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-base text-destructive">{unread} new</span>}</h1>
    {data.messages.length === 0 ? <p className="text-muted-foreground">No messages yet. Parents linked to your clinic can write from their family dashboard.</p> :
      <ul className="space-y-4">{data.messages.map((m) => <Message key={m.id} m={m} />)}</ul>}
  </main>;
}

function Message({ m }: { m: { id: string; from: string; childName: string; body: string; readAt: string | null; createdAt: string; reply: string | null; repliedAt: string | null } }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const reply = useServerFn(replyToParent);
  const send = async (e: React.FormEvent) => {
    e.preventDefault(); if (!text.trim()) return;
    setBusy(true);
    try { const r = await reply({ data: { id: m.id, body: text.trim() } }); toast.success(r.emailed ? 'Reply sent and emailed to the parent' : 'Reply saved — the parent will see it on their dashboard'); setText(''); await qc.invalidateQueries({ queryKey: inboxQuery.queryKey }); }
    catch { toast.error('Reply could not be sent'); }
    setBusy(false);
  };
  return <li className="space-y-2 rounded-2xl bg-surface p-4 shadow-card">
    <div className="flex flex-wrap justify-between gap-2 text-sm"><b>{m.from}{m.childName ? ` · about ${m.childName}` : ''}</b><span className="text-muted-foreground">{m.createdAt.slice(0, 16).replace('T', ' ')}{!m.readAt && ' · new'}</span></div>
    <p className="whitespace-pre-wrap break-words">{m.body}</p>
    {m.reply && <div className="border-l-2 border-primary pl-3 text-sm"><p className="text-muted-foreground">Your reply · {m.repliedAt?.slice(0, 16).replace('T', ' ')}</p><p className="whitespace-pre-wrap break-words">{m.reply}</p></div>}
    <form onSubmit={send} className="space-y-2">
      <textarea aria-label="Reply" required maxLength={2000} rows={2} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder={m.reply ? 'Send another reply' : 'Write a reply'} value={text} onChange={(e) => setText(e.target.value)} />
      <Button size="sm" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send reply'}</Button>
    </form>
  </li>;
}
