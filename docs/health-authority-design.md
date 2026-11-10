# Health authority expansion

Based on the two backend design documents supplied on 2026-10-29.

## Current delivery
- Extend the existing private family portal with doses, confirmed overdue dates and upcoming reminder status.
- Retain parent-entered child registration, administrator-entered clinic contacts and explicit text consent.
- Do not imply SMS acceptance proves handset delivery.

## Backend expansion after authorized resume
1. Add an organization tree: country → Ministry-defined region → district → facility. Keep access role separate from geography, and enforce both in database policies and server handlers.
2. Add idempotent clinic dose/test events while preserving existing household records. Build aggregate reporting for national/regional users; identifiable lists require explicit, audited permission.
3. Add authoritative, versioned vaccine schedule rules only after checking UNEPI guidance. Keep clinician confirmation requirements until a medically approved ruleset is available.
4. Add aggregate vaccination/testing dashboards and basic targeted government alerts. Do not invent coverage denominators, facility data, official feeds or government affiliation.
5. Add stock/batch/expiry tracking, AEFI, consent-aware tracing and DHIS2/FHIR exchange when integration credentials and reporting agreements exist.
6. Add Ministry-approved severe-alert workflows, acknowledgement reporting and pandemic reporting.

## Security prerequisites
- Admin MFA enrollment and enforcement must ship together, avoiding administrator lockout.
- Use immutable audit records, restricted document storage and explicit line-list permissions.
- Decide small-cell suppression thresholds and data residency with authorized health authorities; do not claim legal compliance without review.
- Offline health-data capture conflicts with the current no-cache installation policy: design encrypted, user-scoped storage and deletion before enabling offline records.

## Decisions still required
- Authoritative country/region/district list and authorized scope administrators.
- DHIS2 complement versus replacement and government integration access.
- Approved schedule source, suppression threshold, MFA rollout and residency requirements.
- Whether identity verification is necessary; do not collect KYC images or connect Shufti Pro by default.

Cloud is paused at the owner's request. No new authority roles, migrations, feeds or clinical records were applied.