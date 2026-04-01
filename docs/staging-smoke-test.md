# Staging Smoke Test Checklist (Pre-Public Release)

Run these checks in order against staging.

## A. Environment and startup

- [ ] Confirm all required env vars are set from `.env.example`.
- [ ] Open app root and verify it loads without runtime env validation errors.
- [ ] Verify `AUTH_ALLOW_DEMO_LOGIN=false` behavior (demo login should fail when disabled).

## B. Auth/session boundaries

- [ ] Unauthenticated visit to `/dashboard` redirects to `/login`.
- [ ] Unauthenticated call to `/api/jobs` returns `401` JSON.
- [ ] Authenticated login succeeds and session persists across page refresh.
- [ ] Sign-out invalidates session and protected routes re-block access.

## C. Onboarding + resume upload path

- [ ] Request `POST /api/resumes/upload-url` with PDF mime type succeeds.
- [ ] Verify returned `storageKey` starts with `resumes/<userId>/`.
- [ ] Complete upload + `POST /api/resumes` and ensure resume record is created.
- [ ] Attempt to create resume with another user's key returns `403`.
- [ ] Resume parse status progresses and onboarding page remains usable.

## D. Profile flow

- [ ] `GET /api/profile` returns/create profile.
- [ ] Save profile updates (top-level fields + skills/experience/projects/preferences).
- [ ] Refresh page and verify persisted data is shown.

## E. Job intake + parse + save

- [ ] Create job from URL/text in `/jobs/new`.
- [ ] Parse job (`/api/jobs/:jobId/parse`) succeeds.
- [ ] Edit requirements/responsibilities/skills/keywords and save.
- [ ] Re-open `/jobs/:jobId` and verify edits persist.

## F. Fit analysis

- [ ] Open `/jobs/:jobId/analysis`.
- [ ] Run analysis once (creates latest analysis).
- [ ] Re-run analysis and verify updated payload renders.
- [ ] Validate loading/error states display properly on failure simulation.

## G. Application generation + review

- [ ] Generate packet from `/jobs/:jobId/application`.
- [ ] Edit section text and confirm PATCH persistence.
- [ ] Regenerate one section and verify only target section changes.
- [ ] Open `/jobs/:jobId/review` and validate same packet appears.
- [ ] Approve packet and verify status updates.

## H. Saved applications workflow

- [ ] Open `/applications` and verify list loads.
- [ ] Test filters (status, company, date range).
- [ ] Open `/applications/:applicationId` and verify detail payload.
- [ ] Edit/regenerate from details page and verify updates.

## I. Ownership and cross-user isolation

- [ ] With User A session, create records across resume/job/application.
- [ ] With User B session, attempt to access User A IDs via APIs (should return not-found/forbidden).
- [ ] Verify no cross-user data leakage in list endpoints.

## J. Observability and diagnostics

- [ ] Confirm failed API calls include request-id response header or error payload requestId.
- [ ] Confirm server logs include structured requestId for success/failure paths.
- [ ] If `ERROR_MONITOR_DSN` is configured, verify monitoring hook emits error payloads.

## K. Final release gate commands

Run before promoting staging to production:

```bash
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run lint
npm run typecheck
npm run build
```
