# HANDOFF: Deployment Blockers for Codex-Only Execution

## Blocker type
Credential-related + potential billing-related (provider-side setup).

## Exact blocker
Codex cannot complete real staging/production deployment from this environment because hosting/database provider accounts, project linkage, and deployment secrets are not available in-repo.

## Why Codex cannot finish alone
- No authenticated Vercel/Neon account context in this runtime.
- No project-level deployment tokens/secrets are available.
- Free-tier/billing safety must be confirmed via provider UI choices owned by the human.

## Human steps (exact)
1. Create/confirm free-tier projects:
   - Vercel Hobby project
   - Neon Free Postgres database
2. Copy connection string and auth/app secrets into Vercel env vars (Production + Preview):
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `AUTH_DEMO_EMAIL`
   - `AUTH_DEMO_PASSWORD`
   - `AUTH_ALLOW_DEMO_LOGIN=false`
   - `RESUME_STORAGE_PROVIDER=local` (or keep current safe setting)
   - `RESUME_STORAGE_BUCKET`
   - `RESUME_STORAGE_BASE_URL`
   - `RESUME_UPLOAD_URL_TTL_SECONDS`
   - `RESUME_STORAGE_SIGNING_SECRET`
   - optional: `OPENAI_API_KEY`, `OPENAI_MODEL`, `ERROR_MONITOR_DSN`
3. Trigger deploy from connected Git branch in Vercel.
4. Run DB migration in deployed environment:
   - `npm run prisma:generate`
   - `npx prisma migrate deploy`
5. Execute `docs/staging-smoke-test.md` against the deployed URL.

## Commands to run after human setup
```bash
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run lint
npm run typecheck
npm run build
```

## Notes
- If any provider step requires paid plan upgrade or billing opt-in beyond free-tier comfort, stop and keep deployment private/demo only.
