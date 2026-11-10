# Roadmap

- [x] Resume Cloud (2026-10-29 16:20 UTC request) — auth and database healthy; read query succeeds
- [ ] Walk administrator clinic save, owner-entered staff invites and linked-parent clinic-name check — walkthrough provided; read query confirms no saved clinic; administrator save and recipient actions pending
- [ ] After clinic save, record a genuine clinician-confirmed overdue dose, send opted-in text and obtain handset confirmation (2026-10-29 16:21 UTC) — saved clinic, clinician confirmation and eligible parent required

- [x] Review both uploaded backend design/control documents; incorporate family reminder/overdue view and record staged authority architecture in docs/health-authority-design.md
- [ ] Implement authority organization scopes, aggregate dashboards and alert delivery from uploaded design — Cloud paused; authoritative geography, approved schedule and governance decisions required

- [x] Resume Cloud after owner request — auth and database healthy on 2026-10-29; no purchase made
- [ ] Walk administrator through real clinic save and owner-entered staff invitations; guide parent signup and parent-entered child registration; verify clinic display (2026-10-29)
- [ ] After real clinic save, verify clinician-confirmed overdue dose and send opted-in text; recipient confirms handset arrival (2026-10-29)
- [x] Add upcoming reminders, per-dose status and overdue filtering to /family patient portal; 17 tests pass
- [ ] Verify updated patient portal signed in end to end — Cloud paused at owner request

- [x] Resume Lovable Cloud on 2026-10-29; auth and database health confirmed
- [ ] Verify signup and overdue texts after resume — hosted signup enabled, signed-in family dashboard reads saved records, 22 checks passed; new signup awaits chosen real parent email; no saved clinic or eligible overdue dose; handset arrival unverified

- [ ] Schedule actual clinician-confirmed overdue dose after clinic save and parent registration; send opted-in text and obtain recipient confirmation (19:21 UTC request) — real dose details and saved clinic required

- [ ] Disable and verify automatic credit top-up (19:21 UTC repeat request) — no write tool available; owner must change settings

- [x] Keep administrator-only clinic entry and parent-entered child records; add guardian Dependent registration and dashboard inclusion, tested; existing Share parent link supports inviting another parent to their own signup (19:14 UTC clarified requirements)
- [ ] Send owner-entered real staff invites after administrator clinic save; recipients confirm receipt and successful login (19:20 UTC request)

- [ ] Verify real parent signup, child registration and saved clinic display (19:11 UTC request) — login gates and seven parent rule tests passed; signed-in verification blocked on preview session, real clinic save and parent inputs

- [ ] Disable automatic credit top-up (19:10 UTC request) — available tool can only inspect; owner settings action required

- [x] Publishing requested for clinic editor; real-clinic save and staff email/occupation assignment walkthrough provided (19:09 UTC request)
- [ ] After clinic save, send genuine overdue text to an opted-in parent and confirm recipient arrival (19:10 UTC request) — read-only check found one opted-in household, no saved clinic or eligible overdue dose

- [x] Checked auto top-up: enabled, 50 credits below 25; told user to disable under Settings → Plans & credits; available tool is read-only

- [x] Add administrator-assigned staff occupations to invitations and staff list; permission rules tested
- [x] Add administrator overview of clinic-linked parents, children and overdue doses; unrelated households excluded by RLS
- [x] Provide parent account, child registration and clinic confirmation walkthrough; fixed post-profile navigation to child registration

- [x] Publishing scheduled for administrator-only editor, staff occupations, parent onboarding and linked-family overview; deployment completion not confirmed

- [x] Restrict clinic contact changes to clinic administrators, including direct household writes; trigger presence verified
- [x] Remove sample clinic names from displayed directory; administrators enter real details themselves
- [x] Add parent text-alert opt-in page with signup tracking; rules tested and signed-in page verified, no real consent changed
- [x] Add parent onboarding for child registration and read-only clinic confirmation; validation tested and signed-in form verified, no real child added
- [x] Administrator enters staff emails and occupations through Add & invite; no agent-selected recipients
- [ ] Administrator saves real clinic details themselves in the editor — no sample import or agent-entered names
- [ ] Send genuine overdue parent text after clinic save — awaiting opted-in eligible household and recipient arrival confirmation

- [x] Publishing requested for latest clinic editor and staff invites; parent dashboard still has no saved clinic, overdue emails now accept saved address as well as name/phone
- [x] Add owner-entered staff emails and email clinic login invitations through Add & invite; real recipient emails await owner entry
- [x] Build /clinic/profile editor with name/address/phone/hours and live parent preview; verified signed in without saving unconfirmed details
- [ ] Send real overdue EgoSMS reminder after publish — requires opted-in parent phone, saved clinic, overdue dose and recipient confirmation
- [x] After publishing request, EgoSMS accepted one clearly labelled test text to +256776886279; not a false overdue alert
- [ ] Recipient confirms test text arrival at +256776886279

- [x] Review Uganda workbook; expose its two clinic contacts in searchable directory, plus Maps search for other areas (no invented third clinic)
- [x] Implement overdue EgoSMS texts through daily job with parent opt-in and durable duplicate-send claims
- [ ] Confirm actual overdue text arrival — needs parent opt-in, saved clinic and eligible overdue dose; provider acceptance is not delivery confirmation
- [x] Keep staff emails and second-parent invite entry owner-managed via existing clinic forms, as requested
- [ ] Confirm actual invite arrival after owner opens the emailed button — requires owner to open the email; no emailed token was exercised here
- [x] Add clinic calendar with child vaccine dates and overdue alerts; signed-in calendar/search/default hours verified
- [x] Publishing requested for zatuhealth.com with calendar, workbook clinic search and opt-in overdue SMS; deployment completion not confirmed

- [x] Printable PDF export of each family member's saved health and school details
- [x] AI appointment summary and clinician questions from a caregiver's health concern
- [x] Save and print AI appointment summaries; verify the full signed-in concern-to-PDF flow
- [x] Family member visit records with date, clinic, doctor, results and printable PDF
- [x] Requested publishing of updated site for mobile PIN and email sign-in at zatuhealth.com; deployment completion not confirmed

- [x] Country dropdowns and international phone prefixes in profile and dependent forms

- [x] Accounts: email/password + Google sign-in
- [x] Family records saved online, shared with a partner via invite code
- [ ] Appointment confirmation email sending — templates and saved-appointment trigger ready; sender switched to notify.zatuhealth.com; blocked on DNS verification
- [x] Automated vaccine-due-soon emails (daily, clinician-confirmed dates)
- [x] Overdue SMS reminders via EgoSMS implemented; real delivery still awaits parent opt-in and eligible dose
- [ ] Phone-number sign-in code via EgoSMS — credentials verified; sign-in codes not yet implemented
- [x] Live walkthrough on zatuhealth.com: mobile PIN sign-in, Prepare visit, Export PDF, Visit record
- [x] Test reminder sent from notify.zatuhealth.com (inbox arrival needs user check)
- [x] Clinic dashboard: log/confirm each member's vaccine schedule so zatuhealth.com reminders send automatically
- [x] Clinic profile page (hours, contact, map) linked from member clinic details
- [x] Publish mobile sign-in fix
- [x] Welcome email on completed signup profile when a real email is saved; template and queued delivery implemented
- [x] Family onboarding page: add members by name, date of birth and clinic
- [x] Removed test mobile account and Amani Test
- [x] Welcome SMS for completed new family profiles; EgoSMS credentials securely saved and balance check accepted
- [x] Log vaccine doses given on the clinic dashboard
- [x] Security review: owner kept 6-digit PINs, leak check intentionally off; deep scan running
- [ ] Real vaccine reminder to a real family inbox; confirm arrival (user checks inbox)
- [x] EgoSMS setup: welcome text for all signup methods after phone/profile is saved
- [x] Phone-installable clinic dashboard; manifest and icons verified in preview, requires publication for live phone installation
- [ ] Replace sample clinic name/address/phone/hours with real clinic details — renewed request at 17:29 UTC; waiting on user's real info
- [ ] Security review: enable leaked-password check (HIBP), confirm deep scan results
- [x] Real vaccine reminder sent from notify.zatuhealth.com to zatupay@gmail.com at 16:02 UTC (user to confirm inbox arrival)
- [x] Security review: leaked-password check (HIBP) enabled; wallet self-funding finding fixed (top-ups now pending until confirmed); deep scan otherwise clean
- [x] Connect EgoSMS and queue one welcome text per new family, including email and Google sign-ups; actual new-family delivery awaits real signup
- [x] Add phone home-screen installation for the clinic dashboard
- [x] Send another requested Measles-Rubella 2 reminder to zatupay@gmail.com; accepted for sending
- [ ] Check Gmail inbox for Measles-Rubella 2 reminder — Gmail connection declined, inbox arrival unverified
- [ ] Verify real family signup, real clinic, welcome email and dose dashboard — needs user's real family/clinic details and inbox access
- [x] Publish zatuhealth.com so the clinic dashboard installs on phone (requested 16:55 UTC)
- [x] Checked inbox for Abas reminder: sends logged at 15:55/16:02/16:41 UTC; Gmail connected is alijjunju@gmail.com (no reminder there) — arrival at zatupay@gmail.com still needs that inbox connected or a manual check
- [ ] Standalone family app with real clinic details for parents to view schedules and mark doses — waiting on clinic details (questions skipped 3×)
- [ ] Connect zatupay@gmail.com Gmail to confirm Abas's reminder arrived, then send another — renewed request at 17:28 UTC; existing connection verified as alijjunju@gmail.com
- [x] Walked user through installing clinic dashboard on phone and marking a dose
- [ ] Collect real clinic details via form (name, address, hours), then build standalone family app
- [ ] Send welcome text to user's real mobile number and confirm arrival — renewed request at 17:28 UTC; number question skipped, no recipient supplied
- [x] Build /family parent-only view with household-protected schedules, dose logging, saved clinic-details form and phone installation — signed-in child schedule and dose form verified at desktop and phone sizes; real-dose submission intentionally not performed
- [ ] Walk through parent-dashboard signup, welcome text and marking a dose after real clinic details are added — waiting on real clinic details and mobile number
- [x] Re-sent Abas's Measles-Rubella 2 reminder at 17:26 UTC; 4 sends logged to zatupay@gmail.com; repaired member record malformed by earlier update
- [ ] Inbox arrival at zatupay@gmail.com still unverified — connected Gmail is alijjunju@gmail.com; user must add a new connection signed into zatupay@gmail.com or check manually
- [x] Sent another requested Abas Measles-Rubella 2 reminder for the 17:28 UTC request; sending accepted, inbox remains inaccessible because the same alijjunju@gmail.com connection was selected
- [x] Fix duplicate empty household selection hiding the completed family in parent view; household creation is serialized per user
- [x] Published /family parent dashboard and family manifest at zatuhealth.com (17:40 UTC); site, /family, /clinic and both manifests return 200
- [x] Publish parent dashboard — done 17:40 UTC; phone install walkthrough given to user
- [ ] Connect zatupay@gmail.com inbox and send welcome text to user's real mobile number, confirm arrival — requested 17:40 UTC; mobile number still not supplied
- [x] Walked parent dashboard end to end signed in: opened Abas's schedule, marked Measles-Rubella 2 dose given (2026-10-28), verified givenOn persisted and reminder job sent 0 — reminders stopped
- [ ] Short text-link parents open in phone browser showing child schedule and doses — /family view covers this; needs real clinic details
- [x] Publish clinic dashboard for phone install — done 17:40 UTC; clinic admin walkthrough given to user
- [x] Clinic admin view at /clinic: overdue dose alerts, edit due dates, resend reminders, log doses — separate from parent /family view (17:43 UTC request)
- [ ] Connect zatupay@gmail.com inbox + send welcome text to real mobile number — renewed 17:43 UTC; mobile number never supplied, Gmail connection still alijjunju@gmail.com
- [ ] Install parent view on phone + walk end to end with real clinic details — renewed 17:43 UTC; clinic details still not supplied (questions skipped 5×)
- [x] Clinic admin upgrades verified signed in (overdue alert, edit date, resend reminder, dose logging) and publish requested for zatuhealth.com (17:48 UTC)
- [ ] Gmail inbox check: connection opened alijjunju@gmail.com again — zatupay@gmail.com requires choosing "New connection" and signing into that account
- [x] Parent invite link: one-time emailed sign-in link from clinic dashboard (not sent to a real parent yet)
- [x] Clinic login at /clinic/login with staff allowlist (zatupay@gmail.com admin)
- [x] Overdue doses email parents once via daily job, branded with saved clinic
- [ ] Publish zatuhealth.com so overdue reminder emails and invites reach parents live (requested 18:03 UTC)
- [ ] Enter real clinic name/address/phone/hours in "Your clinic" — details still not supplied (skipped 5x)

- [ ] Add clinic staff emails to the clinic staff list — emails not yet supplied
- [x] Publish requested for zatuhealth.com at ~18:05 UTC (overdue reminder emails, parent invites, clinic login go live)
- [x] Real parent invite sent to zatupay@gmail.com at 18:05:14Z (email log: sent); /auth?next=%2Ffamily redirect lands on /family parent dashboard (verified signed in)
- [ ] Enter real clinic name/address/phone/hours — details still not supplied, user must send them
- [ ] Add clinic staff emails — user must list the addresses
- [x] Clinician dashboard: confirm dates + approve overdue texts
- [ ] Real overdue text: blocked on saved clinic, clinician-confirmed date and parent's opted-in number
- [x] Clinic admin: details, parent families, text approval
- [ ] Full run after owner clinic save: invite parent, parent confirms clinic, clinician-confirmed overdue dose, approve, send text to parent's own number
- [x] Publish clinic profile + approval changes (republish needed for text log)
- [x] Staff login: /clinic/login admits any listed staff
- [x] Clinic text-sent log with parent confirmation
- [x] Daily overdue text run: existing vaccine-reminders job sends approved texts
- [x] Staff emails: entered by clinic admin themselves (owner decision)
- [x] Clinic inbox: parents message the clinic about doses
- [x] One-page clinic overview: overdue, confirmed doses, text-sent dates
- [x] Security: fixed staff-email claim and wallet self-funding
- [ ] Real clinic profile, staff emails, parent invite — administrator enters them (owner decision)
- [x] Daily overdue run sends real texts via EgoSMS to parent's saved number (already built)
- [x] Parent messages emailed to clinic admin; reply-to parent
- [x] Tested approve button in preview (overview empty: no linked families yet)
- [x] Confirm daily overdue run sends approved texts to real parent numbers
- [ ] Send real parent message, confirm clinic email, reply to parent
- [x] Overdue texts page: each child's upcoming/overdue doses with text status
- [x] Test common PIN sign-up is blocked, then real password works
- [ ] Approve a real overdue dose (blocked: no linked parents/doses yet)
- [x] Clinic inbox page at /clinic/inbox with replies to parents
- [x] Clinic payments page: record family payment, raise wallet (server-side)
- [ ] Real clinic save, parent invite, child, approve dose (blocked: needs admin to enter real details)
- [x] Platform admin panel at /admin
- [x] Parent confirmation: existing "I got this text" button (user chose)

- [x] Multi-clinic separation: clinic_staff scoped per clinic household, per-clinic clinic_role(), policies and server functions scoped; 58 tests pass, verified in preview (18:03 UTC)
- [x] Clinic admin login at /admin/clinic; /clinic/login redirects; verified in preview (18:03 UTC)
- [x] Add second clinic owner from /admin verified in preview (add + activation email + remove); owner\u2019s own dashboard activation awaits a real owner opening their emailed link (18:03 UTC)
- [x] Clinic sign-in moved to /admin/clinic; dashboard pages unchanged, old address redirects (18:03 UTC)
