<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# AGENTS.md

- Family data (profile, members, vaccine records, appointments, wallet) is stored as one JSON document per household in `public.households.data`, loaded/saved by `src/lib/store.tsx`. Why: keeps screens unchanged while letting partners share records via `household_members`.
- Partner sharing uses one-time invite codes (`household_invites`) redeemed through the `accept_invite` database function. Why: joining needs privileged writes that RLS alone can't allow safely.
- `/app` and `/onboarding` are client-only routes gated by a `beforeLoad` sign-in check redirecting to `/auth`. Why: session lives in browser storage.
- Country and phone forms share `src/components/country-fields.tsx` and `src/lib/countries.ts`; phones stay international-format. Why: consistent choices, unchanged storage.
- Member PDFs are built in the browser with embedded Unicode fonts, prepared before download. Why: privacy and mobile download activation.
- AI appointment preparation runs in an authenticated, household-scoped server function with caregiver consent and minimal member context; AI calls stay server-side, streamed, no automatic retries. Why: protects family data; notes, not medical advice.
- Visit preparation and server-validated visit records are stored on the household member; PDFs are local. Why: partners reopen notes; no private documents at public URLs.
- The sitemap uses required route-level staticData.sitemap flags, excluding private subtrees. Why: pages opt in explicitly; household records stay unlisted.
- Vaccine due dates live on each household member's `schedule`; only clinician-confirmed entries are emailed, by a daily managed cron route that marks `remindedAt`. Why: reminders must never go out for unconfirmed dates or twice.
- Clinic profiles use saved household clinic details matched by name slug, then the confirmed local directory, with unknown clinics falling back to a name-only map page. Why: every named clinic has a page without invented contacts or hours.
- Family welcome deliveries are queued by the first completed profile and claimed server-side once per household/channel, kicked by onboarding and drained by cron. Why: every signup method gets one welcome.
- Clinic phone install uses a manifest and local icons from /clinic, no service workers. Why: live records, no stale caches.
- /family is the private patient portal with its own manifest and post-sign-in destination; overdue and reminder status use shared schedule helpers, and share links grant no access. Why: preserves household privacy and reminder consistency.
- Family clinic contact details are administrator-managed household data, guarded on insert/update by a trigger checking clinic_role_for(household); parents and non-admin staff can only read. Why: direct household JSON writes must not bypass clinic edit permissions.
- Household selection prefers a completed profile and serializes creation per user. Why: no duplicate empty households hiding records.
- Clinic access uses clinic_staff bound by user_id (claimed via claim_clinic_staff only after email-link or Google sign-in), with role separate from occupation. Why: auto-confirmed signups must not claim staff emails; job titles never grant admin.
- Parent invites are one-time sign-in links generated server-side for clinic staff only and emailed, landing on /auth?next=/family so each parent gets their own household. Why: a reusable link would be a shareable credential.
- Overdue confirmed doses get one overdue email per dose (marked `overdueRemindedAt`, cleared on date edits) from the daily vaccine reminder job, branded with the household's saved clinic. Why: avoids repeat emails while keeping one reminder pipeline.
- Overdue SMS uses the existing daily job, explicit household opt-in, a clinician approval tied to the current due date, the approved EgoSMS sender and a unique durable delivery claim per dose/date; ambiguous sends are never retried automatically. Why: protects family privacy and prevents duplicate paid texts.
- Clinic calendar dates/overdue state derive from saved schedules; clinic search links to Maps, no sample rows. Why: sample names must not become real contacts.
- The clinic profile editor validates owner-only saves; staff invites check admin access and derive the recipient server-side. Why: no implied clinic-wide propagation.
- Parent overdue text consent is audited by a household update trigger into parent_text_consents; clinic staff can read signup status, and child onboarding records confirmation without editing clinic contacts. Why: consent withdrawals and phone changes remain traceable across every write path.
- Clinic parent overviews use explicit invite links in clinic_parent_links and admin-scoped RLS; parent contact reads project only linked clinic contacts. Why: unrelated household records must never appear in clinic dashboards.
- Text history: vaccine_sms_deliveries (admins via clinic_parent_links); parents confirm only via confirm_vaccine_text. Why: send receipts are not delivery proof.
- Parent messages (clinic_messages) are inserted by household members; linked admins read, mark read (mark_clinic_message_read) and reply server-side (emailed to parent). Why: scoped to invited families; parents can't edit rows.
- Household wallet balances only rise from server code (guard trigger), e.g. admin-recorded clinic_payments. Why: clients must not self-fund.
- Platform owners (platform_admins, is_platform_admin()) manage clinics, parents and staff at /admin; server functions check the caller before the admin client. Why: platform access never derives from clinic_role.
- Each clinic is its own space: clinic_staff.clinic_household_id binds staff to one clinic; clinic_role_for(hid)/my_clinic() scope every clinic policy, profile save and server function. Why: clinics never see each other's parents, staff, texts or payments.
- Clinic owners and staff sign in at /admin/clinic (/clinic/login redirects); platform-added owners get an emailed activation link and first sign-in adopts their own household as the clinic. Why: one entry point, mailbox proof before access binds.
