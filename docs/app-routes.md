# App Routes (MVP)

## Route groups

```txt
app/
  (marketing)/
    page.tsx                              # /
  (auth)/
    login/page.tsx                        # /login
    signup/page.tsx                       # /signup
  (app)/
    layout.tsx                            # authenticated shell
    dashboard/page.tsx                    # /dashboard
    onboarding/page.tsx                   # /onboarding
    profile/page.tsx                      # /profile
    jobs/new/page.tsx                     # /jobs/new
    jobs/[jobId]/page.tsx                 # /jobs/:jobId
    jobs/[jobId]/analysis/page.tsx        # /jobs/:jobId/analysis
    jobs/[jobId]/application/page.tsx     # /jobs/:jobId/application
    jobs/[jobId]/review/page.tsx          # /jobs/:jobId/review
    applications/page.tsx                 # /applications
    applications/[applicationId]/page.tsx # /applications/:applicationId
    settings/page.tsx                     # /settings
```

## Access policy

- Public: `/`, `/login`, `/signup`.
- Auth required: all routes in `(app)` group.
- Ownership check required on all `[jobId]` and `[applicationId]` routes.

## Route purpose

- `/onboarding`: upload resume, parse, then review + complete missing profile fields.
- `/jobs/new`: job URL/text input and save.
- `/jobs/[jobId]`: parsed JD inspection and correction.
- `/jobs/[jobId]/analysis`: explainable fit score and recommendation.
- `/jobs/[jobId]/application`: packet generation controls.
- `/jobs/[jobId]/review`: full editable workspace + section regeneration.
- `/applications/[applicationId]`: revisit prior packet + draft history.

## Deferred routes (post-MVP)

- `/watchlist`: target company monitoring.
- `/assistant`: browser companion integration surface.
