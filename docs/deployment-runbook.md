# Deployment Runbook (Low-Cost / Legal-Safer MVP)

## Recommended provider path (first deploy)

- Hosting: **Vercel Hobby** (personal/private MVP usage)
- Database: **Neon Free Postgres**
- LLM: optional OpenAI API key (app works with fallbacks when unset)

If setup requires paid plan/billing opt-in beyond free-tier comfort, stop and use `HANDOFF.md`.

## Required environment variables

Set all required values from `.env.example`:

- `NODE_ENV`
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `AUTH_DEMO_EMAIL`
- `AUTH_DEMO_PASSWORD`
- `AUTH_ALLOW_DEMO_LOGIN`
- `RESUME_STORAGE_PROVIDER`
- `RESUME_STORAGE_BUCKET`
- `RESUME_STORAGE_BASE_URL`
- `RESUME_UPLOAD_URL_TTL_SECONDS`
- `RESUME_STORAGE_SIGNING_SECRET`
- `ERROR_MONITOR_DSN` (optional)
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional; default set)

Validation runs at startup in `lib/env.ts`.

## Managed Postgres expectations

- Use a managed Postgres instance.
- `DATABASE_URL` must be reachable from hosting.
- Keep schema in sync via Prisma migrations.

### Migration flow

```bash
npm run prisma:generate
npx prisma migrate deploy
```

## Storage expectations

Current abstraction: `lib/storage/resume-storage.ts`.

- `local` provider: development-friendly URL path.
- `s3` provider: placeholder signing path; replace with provider-native signed URL flow for public usage.

Ownership hardening:

- Storage keys are generated under `resumes/<userId>/...`.
- Resume creation validates key ownership before persistence.

## AI pipeline behavior

- If `OPENAI_API_KEY` is set:
  - job parsing can use LLM extraction
  - fit reasoning can use LLM explanation
  - packet section generation can use LLM prompts
  - resume text extraction can use LLM
- If key is unset or API fails:
  - deterministic fallbacks remain active for reliability and cost control

## Auth/session hardening

- Middleware protects all `/api/*` except `/api/auth/*`.
- Route handlers enforce user identity via `getRequiredUserId`.
- Repository queries remain ownership-scoped.
- Set `AUTH_ALLOW_DEMO_LOGIN=false` in production.

## Observability/logging

- Request-scoped structured logs in `lib/logging.ts`.
- `logError` includes monitoring hook placeholder controlled by `ERROR_MONITOR_DSN`.

## Pre-release validation checklist

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run prisma:generate`
- `npx prisma migrate deploy`
- Execute `docs/staging-smoke-test.md`

## Remaining placeholders before public launch

- Provider-native object-storage signed URL integration (`s3` path) if file uploads are mandatory.
- Full monitoring SDK integration (Sentry/Datadog/etc.).
- Optional: stronger eval harness for hallucination/grounding checks.
